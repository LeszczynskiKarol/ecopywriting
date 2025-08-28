// backend/src/models/Subscriber.js

const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Proszę podać adres email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Proszę podać prawidłowy adres email']
  },
  name: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subscriptionDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: false
  },
  preferences: {
    categories: [{
      type: String,
      enum: ['Nowości', 'Promocje', 'Porady', 'Branżowe', 'Technologia']
    }]
  },
  lastEmailSent: Date,
  newsletterHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newsletter'
  }],
  confirmToken: String,
  confirmTokenExpire: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);