import mongoose from 'mongoose';
import WorkItem from '../models/WorkItem.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';

// Validate a work item's numeric inputs. Returns an error message, or null if OK.
// Guards against NaN/undefined/negative/zero values that would otherwise be
// multiplied into totalAmount and $inc'd straight into Client.currentBalance.
const validateAmounts = (quantity, rate) => {
  const q = Number(quantity);
  const r = Number(rate);
  if (!Number.isFinite(q) || q <= 0) return 'Quantity must be a number greater than 0';
  if (!Number.isFinite(r) || r < 0) return 'Rate must be a number of 0 or greater';
  return null;
};

// Get work items (with filters for client or project)
export const getWorkItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, clientId, projectId, billed } = req.query;

    const query = { userId };
    if (clientId) query.clientId = clientId;
    if (projectId) query.projectId = projectId;
    if (billed !== undefined) query.billed = billed === 'true';

    const total = await WorkItem.countDocuments(query);
    const workItems = await WorkItem.find(query)
      .populate('clientId', 'name')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({ workItems, total });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch work items' });
  }
};

// Add Work Item (Transactional)
export const addWorkItem = async (req, res) => {
  const userId = req.user.id;
  const { clientId, projectId, title, quantity, rate } = req.body;

  // Pure-input validation runs BEFORE the session opens, so its early returns
  // can never leak a transaction.
  if (!clientId || !projectId || !title || !title.trim()) {
    return res.status(400).json({ message: 'Client, project, and title are required' });
  }
  const amtErr = validateAmounts(quantity, rate);
  if (amtErr) return res.status(400).json({ message: amtErr });

  const qty = Number(quantity);
  const rt = Number(rate);
  const totalAmount = qty * rt;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Ownership/IDOR guard: the project must belong to this client AND this user.
    const project = await Project.findOne({ _id: projectId, clientId, userId }).session(session);
    if (!project) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Project not found for this client' });
    }

    // 1. Create WorkItem
    const workItem = new WorkItem({
      userId,
      clientId,
      projectId,
      title: title.trim(),
      quantity: qty,
      rate: rt,
      totalAmount,
      billed: false
    });
    await workItem.save({ session });

    // 2. Increment Client Balance
    const client = await Client.findOneAndUpdate(
      { _id: clientId, userId },
      { $inc: { currentBalance: totalAmount } },
      { session, new: true }
    );
    if (!client) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Client not found' });
    }

    await session.commitTransaction();
    res.status(201).json(workItem);
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error('Add WorkItem Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: 'Failed to add work item', error: error.message });
  } finally {
    session.endSession();
  }
};

// Delete Work Item (Transactional - revert balance)
export const deleteWorkItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const workItem = await WorkItem.findOne({ _id: id, userId }).session(session);
    if (!workItem) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Work item not found' });
    }

    if (workItem.billed) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot delete a billed work item' });
    }

    // 1. Decrease Client Balance
    await Client.findOneAndUpdate(
      { _id: workItem.clientId, userId },
      { $inc: { currentBalance: -workItem.totalAmount } },
      { session }
    );

    // 2. Delete WorkItem
    await WorkItem.findOneAndDelete({ _id: id, userId }, { session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Work item deleted and balance reverted' });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    res.status(500).json({ message: 'Failed to delete work item' });
  } finally {
    session.endSession();
  }
};

// Update Work Item (Transactional - adjust balance)
export const updateWorkItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, quantity, rate } = req.body;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const workItem = await WorkItem.findOne({ _id: id, userId }).session(session);
    if (!workItem) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Work item not found' });
    }

    if (workItem.billed) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot edit a billed work item' });
    }

    // Partial update: keep existing values for any field the caller omitted, so a
    // title-only PATCH can't null out quantity/rate and corrupt totalAmount → NaN.
    const newQuantity = quantity ?? workItem.quantity;
    const newRate = rate ?? workItem.rate;
    const amtErr = validateAmounts(newQuantity, newRate);
    if (amtErr) {
      await session.abortTransaction();
      return res.status(400).json({ message: amtErr });
    }

    const oldTotalAmount = workItem.totalAmount;
    const newTotalAmount = Number(newQuantity) * Number(newRate);
    const difference = newTotalAmount - oldTotalAmount;

    // 1. Update WorkItem
    workItem.title = title || workItem.title;
    workItem.quantity = Number(newQuantity);
    workItem.rate = Number(newRate);
    workItem.totalAmount = newTotalAmount;
    await workItem.save({ session });

    // 2. Adjust Client Balance
    if (difference !== 0) {
      await Client.findOneAndUpdate(
        { _id: workItem.clientId, userId },
        { $inc: { currentBalance: difference } },
        { session }
      );
    }

    await session.commitTransaction();
    res.status(200).json(workItem);
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: 'Failed to update work item', error: error.message });
  } finally {
    session.endSession();
  }
};
