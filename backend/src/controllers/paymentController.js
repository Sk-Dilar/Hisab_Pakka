import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Client from '../models/Client.js';
import Invoice from '../models/Invoice.js';

// Get all payments with pagination
export const getPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, clientId } = req.query;

    const query = { userId };
    if (clientId) query.clientId = clientId;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('clientId', 'name companyName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      payments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
};

// Add Payment (FIFO Allocation)
export const addPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { clientId, amount, method, note } = req.body;

    if (!clientId || !amount || !method) {
      return res.status(400).json({ message: 'Client ID, amount, and method are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // 1. Decrease client.currentBalance by the payment amount
    const client = await Client.findOneAndUpdate(
      { _id: clientId, userId },
      { $inc: { currentBalance: -amount } },
      { session, new: true }
    );

    if (!client) {
      throw new Error('Client not found');
    }

    // 2. Fetch all unpaid/partial invoices sorted by createdAt ASC (FIFO)
    const invoices = await Invoice.find({
      clientId,
      userId,
      status: { $in: ['Unpaid', 'Partial'] }
    })
    .sort({ createdAt: 1 })
    .session(session);

    let remainingPayment = amount;
    const allocations = [];

    // 3. Loop through invoices and distribute payment
    for (const invoice of invoices) {
      if (remainingPayment <= 0) break;

      const dueAmount = invoice.dueAmount;
      const appliedAmount = Math.min(dueAmount, remainingPayment);

      // Update invoice amounts
      invoice.paidAmount += appliedAmount;
      // Note: dueAmount is calculated by pre-save hook based on finalAmount - paidAmount
      // Status is also updated by pre-save hook based on paidAmount and finalAmount
      await invoice.save({ session });

      allocations.push({
        invoiceId: invoice._id,
        appliedAmount
      });

      remainingPayment -= appliedAmount;
    }

    // 4. Create the Payment record
    const payment = new Payment({
      userId,
      clientId,
      amount,
      method,
      note,
      allocations
    });

    await payment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(payment);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Add Payment Error:', error);
    res.status(500).json({ message: 'Failed to record payment', error: error.message });
  }
};
