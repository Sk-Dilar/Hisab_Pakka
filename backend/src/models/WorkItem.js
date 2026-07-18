import mongoose from 'mongoose';

const workItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Work item title is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [0.01, 'Quantity must be greater than 0']
  },
  rate: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Rate cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  billed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('WorkItem', workItemSchema);
