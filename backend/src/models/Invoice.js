// backend/src/models/Invoice.js
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'    
  },
  seller: {
    companyName: String,
    nip: String,
    address: String,
    postalCode: String,
    city: String
  },
  buyer: {
    companyName: String,
    nip: String,
    address: String,
    postalCode: String,
    city: String
  },
  items: [{
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  amount: Number,
  paidAmount: Number,
  totalAmount: Number,
  pdfUrl: String,
  stripeInvoiceId: String,
  issueDate: Date,
  dueDate: Date,
  paidDate: Date,
  status: {
    type: String,
    enum: ['draft', 'issued', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', InvoiceSchema);