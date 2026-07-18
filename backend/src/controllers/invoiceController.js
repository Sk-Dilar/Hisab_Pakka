import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import WorkItem from '../models/WorkItem.js';
import Client from '../models/Client.js';
import User from '../models/User.js';
import Project from '../models/Project.js';

// Get all invoices with pagination
export const getInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, clientId, status, search } = req.query;

    const query = { userId };
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;

    if (search) {
      const matchingClients = await Client.find({
        userId,
        name: { $regex: search, $options: 'i' }
      }).select('_id');

      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { clientId: { $in: matchingClients.map((c) => c._id) } }
      ];
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('clientId', 'name companyName email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      invoices,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invoices', error: error.message });
  }
};

// Get single invoice
export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findOne({ _id: id, userId: req.user.id })
      .populate('clientId', 'name companyName email phone');
      
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invoice', error: error.message });
  }
};

// Generate Invoice (Intelligent)
export const generateInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required' });
    }

    // 1. Fetch unbilled WorkItems
    const unbilledItems = await WorkItem.find({ clientId, userId, billed: false }).session(session);
    
    if (unbilledItems.length === 0) {
      return res.status(400).json({ message: 'No unbilled work items found for this client' });
    }

    // Work items may span multiple projects for the same client — snapshot
    // each item's project name so a bundled invoice stays traceable to source.
    const projectIds = [...new Set(unbilledItems.map(item => String(item.projectId)))];
    const projects = await Project.find({ _id: { $in: projectIds }, userId })
      .select('title')
      .session(session);
    const projectTitleById = new Map(projects.map(p => [String(p._id), p.title]));

    const itemsToAppend = unbilledItems.map(item => ({
      workItemId: item._id,
      projectId: item.projectId,
      projectTitle: projectTitleById.get(String(item.projectId)) || '',
      title: item.title,
      quantity: item.quantity,
      rate: item.rate,
      totalAmount: item.totalAmount
    }));

    const additionalTotalAmount = itemsToAppend.reduce((sum, item) => sum + item.totalAmount, 0);

    // 2. Retrieve most recent invoice for client
    const lastInvoice = await Invoice.findOne({ clientId, userId })
      .sort({ createdAt: -1 })
      .session(session);

    let invoice;

    // 3. Check condition to append or create new
    if (lastInvoice && lastInvoice.paidAmount === 0) {
      // Append to existing
      lastInvoice.items.push(...itemsToAppend);
      lastInvoice.totalAmount += additionalTotalAmount;
      // pre-save hook handles finalAmount and dueAmount
      await lastInvoice.save({ session });
      invoice = lastInvoice;
    } else {
      // Create NEW invoice
      const user = await User.findById(userId).session(session);
      user.invoiceCounter += 1;
      await user.save({ session });

      const invoiceNumber = `INV-${String(user.invoiceCounter).padStart(4, '0')}`;

      invoice = new Invoice({
        userId,
        clientId,
        invoiceNumber,
        items: itemsToAppend,
        totalAmount: additionalTotalAmount,
        discount: 0
      });
      await invoice.save({ session });
    }

    // 4. Mark items as billed
    const workItemIds = unbilledItems.map(item => item._id);
    await WorkItem.updateMany(
      { _id: { $in: workItemIds }, userId },
      { $set: { billed: true } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(invoice);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Generate Invoice Error:', error);
    res.status(500).json({ message: 'Failed to generate invoice', error: error.message });
  }
};

// Update discount
export const updateDiscount = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { discount } = req.body;

    if (discount < 0) {
      return res.status(400).json({ message: 'Discount cannot be negative' });
    }

    const invoice = await Invoice.findOne({ _id: id, userId }).session(session);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.paidAmount > 0) {
      return res.status(400).json({ message: 'Cannot edit discount for partially or fully paid invoice' });
    }

    const difference = discount - invoice.discount;

    if (invoice.totalAmount - discount < 0) {
      return res.status(400).json({ message: 'Discount cannot exceed total amount' });
    }

    invoice.discount = discount;
    await invoice.save({ session }); // pre-save calculates dueAmount

    // Update Client Balance by subtracting the difference
    if (difference !== 0) {
      await Client.findOneAndUpdate(
        { _id: invoice.clientId, userId },
        { $inc: { currentBalance: -difference } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(invoice);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Failed to update discount', error: error.message });
  }
};
