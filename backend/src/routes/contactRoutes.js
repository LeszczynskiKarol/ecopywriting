// backend/src/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  scheduleMeeting,
  getContacts,
  getMeetings,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middlewares/auth');

// Publiczne trasy
router.post('/submit', submitContactForm);
router.post('/schedule-meeting', scheduleMeeting);

// Trasy wymagające autoryzacji
router.use(protect);
router.use(authorize('admin'));
router.get('/contacts', getContacts);
router.get('/meetings', getMeetings);

module.exports = router;