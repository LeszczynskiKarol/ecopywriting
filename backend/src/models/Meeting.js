// backend/src/models/Meeting.js
const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  date: Date,
  time: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
}, {
  timestamps: true,
});

const Meeting = mongoose.model('Meeting', MeetingSchema);
module.exports = Meeting;