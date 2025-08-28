// backend/src/models/Thread.js
const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageDate: {
    type: Date,
    default: Date.now
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  department: {
    type: String,
    required: [true, 'Dział jest wymagany'],
    enum: {
      values: ['tech', 'payment', 'complaint', 'other'],
      message: '{VALUE} nie jest poprawnym działem'
    }
  }
});

ThreadSchema.pre('save', function(next) {
  console.log('Saving thread:', this);
  next();
});

module.exports = mongoose.model('Thread', ThreadSchema);