// backend/src/models/Order.js
const mongoose = require('mongoose');

const UserAttachmentSchema = new mongoose.Schema({
  filename: String,
  url: String,
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const OrderItemSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  length: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  guidelines: {
    type: String,
    default: ''
  }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [OrderItemSchema],  
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['oczekujące', 'w trakcie', 'zakończone', 'anulowane'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  deliveryDate: {
    type: Date
  },
  completedStatusFiles: [{
    filename: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  userAttachments: [UserAttachmentSchema],
  attachments: {
    pdf: {
      filename: String,
      url: String,
      uploadDate: Date
    },
    docx: {
      filename: String,
      url: String,
      uploadDate: Date
    },
    image: {
      filename: String,
      url: String,
      uploadDate: Date
    },
    other: [{
      filename: String,
      url: String,
      uploadDate: Date
    }]
  },
  declaredDeliveryDate: {
    type: Date,
    required: true
  },
  actualDeliveryDate: {
    type: Date
  },
  stripeInvoiceId: String,
}, {
  timestamps: true
});

OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const lastOrder = await this.constructor.findOne({}, {}, { sort: { 'orderNumber': -1 } });
    this.orderNumber = lastOrder && lastOrder.orderNumber ? lastOrder.orderNumber + 1 : 1;
  }
  next();
});


module.exports = mongoose.model('Order', OrderSchema);