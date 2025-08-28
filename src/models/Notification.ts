// src/models/Notification.js
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    order?: mongoose.Types.ObjectId;
    type: 'status_change' | 'file_added' | 'thread_status_change' | 'new_message' | 'order_status_change' | 'new_admin_comment';
    message: string;
    isRead: boolean;
    createdAt: Date;
    file?: {
      filename: string;
      url: string;
    };
    thread?: mongoose.Types.ObjectId;
    newStatus?: string;
}

const NotificationSchema = new Schema<INotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: function(this: INotification) {
      return this.type !== 'thread_status_change' && this.type !== 'new_message';
    }
  },
  type: {
    type: String,
    enum: ['status_change', 'file_added', 'thread_status_change', 'new_message', 'order_status_change', 'new_admin_comment'],
    required: true
  },
  message: {
    type: String,
    required: true
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
    type: Schema.Types.ObjectId,
    ref: 'Thread'
  },
  newStatus: {
    type: String,
    required: function(this: INotification) {
      return this.type === 'order_status_change';
    }
  }
});

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;