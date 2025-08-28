// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface INewsletterPreferences {
  categories: string[];
}

interface ICompanyDetails {
  companyName: string;
  nip: string;
  address: string;
  postalCode: string;
  city: string;
  buildingNumber: string;
}

interface INotificationPermissions {
  browser: boolean;
  sound: boolean;
}

interface IUser extends Document {
  name: string;
  email: string;
  role: 'client' | 'admin';
  password: string;
  companyDetails: ICompanyDetails;
  notificationPermissions: INotificationPermissions;
  verificationCode?: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  accountBalance: number;
  totalSpent: number;
  stripeCustomerId?: string;
  orders: mongoose.Types.ObjectId[];
  getSignedJwtToken: () => string;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
  newsletterPreferences: INewsletterPreferences;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  notificationPermissions: {
    browser: { type: Boolean, default: false },
    sound: { type: Boolean, default: false }
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  accountBalance: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  companyDetails: {
    companyName: { type: String, default: '' },
    nip: { type: String, default: '' },
    address: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    city: { type: String, default: '' },
    buildingNumber: { type: String, default: '' }
  },  
  verificationCode: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,  
  totalSpent: {
    type: Number,
    default: 0
  },
  stripeCustomerId: {
    type: String,
    unique: true,
    sparse: true
  },
  newsletterPreferences: {
    categories: [{ type: String }],
  },
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, {
  timestamps: true,
});

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;