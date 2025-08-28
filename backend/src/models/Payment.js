// backend/src/models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['top_up', 'order_payment'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  stripeSessionId: {
    type: String
  },
  stripeInvoiceId: {
    type: String
  },
  appliedDiscount: {
    type: Number,
    default: 0
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);