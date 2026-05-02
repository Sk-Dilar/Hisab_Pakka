import mongoose from 'mongoose';
import WorkItem from '../models/WorkItem.js';
import Client from '../models/Client.js';

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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { clientId, projectId, title, quantity, rate } = req.body;

    const totalAmount = quantity * rate;

    // 1. Create WorkItem
    const workItem = new WorkItem({
      userId,
      clientId,
      projectId,
      title,
      quantity,
      rate,
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
      throw new Error('Client not found');
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(workItem);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Add WorkItem Error:', error);
    res.status(500).json({ message: 'Failed to add work item', error: error.message });
  }
};

// Delete Work Item (Transactional - revert balance)
export const deleteWorkItem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const workItem = await WorkItem.findOne({ _id: id, userId });
    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    if (workItem.billed) {
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
    session.endSession();

    res.status(200).json({ message: 'Work item deleted and balance reverted' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Failed to delete work item' });
  }
};
