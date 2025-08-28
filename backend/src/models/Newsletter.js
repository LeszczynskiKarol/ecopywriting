// backend/src/models/Newsletter.js
const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Proszę podać tytuł newslettera']
  },
  content: {
    type: String,
    required: [true, 'Proszę podać treść newslettera']
  },
  summary: {
    type: String,
    required: [true, 'Proszę podać krótkie podsumowanie newslettera']
  },
  category: {
    type: String,
    enum: ['Nowości', 'Promocje', 'Porady', 'Branżowe', 'Technologia'],
    required: [true, 'Proszę wybrać kategorię newslettera']
  },
  sentDate: {
    type: Date,
    default: Date.now
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscriber'
  }],
  hasImages: {
    type: Boolean,
    default: false
  },
  hasVideos: {
    type: Boolean,
    default: false
  },
  topics: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Newsletter', NewsletterSchema);