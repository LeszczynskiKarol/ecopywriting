// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { updateStripeCustomer } = require('../utils/stripeUtils');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    notificationPermissions: {
      browser: { type: Boolean, default: false },
      sound: { type: Boolean, default: false },
    },
    newsletterPreferences: {
      categories: [{ type: String }],
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
    role: {
      type: String,
      enum: ['client', 'admin'],
      default: 'client',
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
      buildingNumber: { type: String, default: '' },
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
    accountBalance: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    stripeCustomerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    accountBalance: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (
    this.isModified('name') ||
    this.isModified('email') ||
    this.isModified('companyDetails')
  ) {
    await updateStripeCustomer(this);
  }

  next();
});

UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (
    update.$set &&
    (update.$set.name || update.$set.email || update.$set.companyDetails)
  ) {
    const user = await this.model.findOne(this.getQuery());
    if (user) {
      await updateStripeCustomer(user);
    }
  }
  next();
});

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
