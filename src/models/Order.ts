import mongoose, { Schema, Document } from 'mongoose';

interface IOrderItem {
  topic: string;
  length: number;
  price: number;
  contentType: string;
  language: string;
  orderNumber: number;
}

interface IAttachment {
  filename: string;
  url: string;
  uploadDate: Date;
}

interface IUserAttachment {
  filename: string;
  url: string;
  uploadDate: Date;
}

interface IUserAttachment {
  filename: string;
  url: string;
  uploadDate: Date;
}

interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderNumber: number;
  items: IOrderItem[];
  totalPrice: number;
  status: 'oczekujące' | 'w trakcie' | 'zakończone' | 'anulowane';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryDate?: Date;
  files: string[];
  attachments: {
    pdf?: IAttachment;
    docx?: IAttachment;
    image?: IAttachment;
    other?: IAttachment[];
  };
  userAttachments: IUserAttachment[];
  stripeInvoiceId?: string;
  contentType: string;
  language: string;
  declaredDeliveryDate: Date;
  actualDeliveryDate?: Date;
}

const OrderItemSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    unique: true
  },
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

const UserAttachmentSchema = new mongoose.Schema({
  filename: String,
  url: String,
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const OrderSchema = new mongoose.Schema({
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
    enum: ['pending', 'w trakcie', 'zakończone', 'anulowane'],
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
  files: [{
    type: String
  }],
  completedStatusFiles: [{
    filename: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
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
  userAttachments: [UserAttachmentSchema],
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

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);