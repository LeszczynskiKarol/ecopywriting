// backend/src/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: function() {
      return this.type !== 'thread_status_change' && this.type !== 'new_message';
    }
  },
  type: {
    type: String,
    enum: ['status_change', 'file_added', 'thread_status_change', 'new_message', 'order_status_change', 'new_admin_comment'],
    required: true
  },
  message: {
    type: String
    
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  file: {
    filename: String,
    url: String
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread'
  },
  newStatus: {
    type: String,
    required: function() {
      return this.type === 'order_status_change';
    }
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);