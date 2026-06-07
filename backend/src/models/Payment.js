import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    method: {
      type: String,
      required: true,
      enum: ['Bank Transfer', 'UPI', 'Cash', 'Credit Card', 'Other']
    },
    note: {
      type: String,
      default: ''
    },
    allocations: [
      {
        invoiceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Invoice',
          required: true
        },
        appliedAmount: {
          type: Number,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
