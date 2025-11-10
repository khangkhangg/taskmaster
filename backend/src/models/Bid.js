const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'VND'
  },
  proposedTimeline: {
    type: String,
    required: true
  },
  message: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
bidSchema.index({ task: 1, bidder: 1 }, { unique: true }); // One bid per user per task
bidSchema.index({ task: 1, status: 1 });
bidSchema.index({ bidder: 1 });

module.exports = mongoose.model('Bid', bidSchema);
