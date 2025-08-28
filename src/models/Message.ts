// src/models/Message.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  threadId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  attachments: Array<{ filename: string; url: string }>;
  isRead: boolean;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  threadId: {
    type: Schema.Types.ObjectId,
    ref: 'Thread',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    url: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;