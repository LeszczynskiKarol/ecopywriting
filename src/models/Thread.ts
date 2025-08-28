// src/models/Thread.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IThread extends Document {
  subject: string;
  participants: mongoose.Types.ObjectId[];
  lastMessage: Date;
  isOpen: boolean;
  lastMessageDate: Date;
  createdAt: Date;
  department: string;
}

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
    required: true,
    enum: ['tech', 'payment', 'complaint', 'other']
  }
});

const Thread = mongoose.models.Thread || mongoose.model<IThread>('Thread', ThreadSchema);
export default Thread;