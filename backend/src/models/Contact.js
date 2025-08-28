// backend/src/models/Contact.js
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Proszę podać imię'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Proszę podać adres email'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Proszę podać prawidłowy adres email'],
  },
  message: {
    type: String,
    required: [true, 'Proszę podać treść wiadomości'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Contact', ContactSchema);

