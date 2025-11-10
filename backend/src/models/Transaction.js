const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payee: {
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
  platformFee: {
    type: Number,
    default: 0
  },
  payeeAmount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['escrow', 'release', 'refund'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'held', 'released', 'refunded', 'partial_refund', 'failed'],
    default: 'pending'
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  adjustedPayeeAmount: {
    type: Number
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'wallet', 'cash'],
    default: 'wallet'
  },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'momo', 'zalopay', 'vnpay', 'internal'],
    default: 'internal'
  },
  providerTransactionId: {
    type: String
  },
  metadata: {
    cardLast4: String,
    bankName: String,
    walletType: String
  },
  escrowHeldAt: {
    type: Date
  },
  releasedAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 500
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ task: 1 });
transactionSchema.index({ payer: 1, status: 1 });
transactionSchema.index({ payee: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });

// Calculate platform fee before saving
transactionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('amount')) {
    // 10% platform fee
    const feePercentage = 0.10;
    this.platformFee = Math.round(this.amount * feePercentage);
    this.payeeAmount = this.amount - this.platformFee;
  }
  next();
});

// Add timeline entry on status change
transactionSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`
    });

    // Set specific timestamps
    if (this.status === 'held') {
      this.escrowHeldAt = new Date();
    } else if (this.status === 'released') {
      this.releasedAt = new Date();
    } else if (this.status === 'refunded') {
      this.refundedAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
