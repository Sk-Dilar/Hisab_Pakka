const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  companyName: {
    type: String,
    trim: true,
    maxlength: [150, 'Company name cannot exceed 150 characters']
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index: userId + email (email can be null but if provided must be unique per user)
clientSchema.index({ userId: 1, email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Client', clientSchema);
