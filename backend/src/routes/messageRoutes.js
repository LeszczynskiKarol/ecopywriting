// backend/src/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { 
  sendMessage, 
  getMessages, 
  getMessage, 
  addMessageToThread 
} = require('../controllers/messageController');
const { getThread, createThread } = require('../controllers/threadController');
const { upload } = require('../utils/s3Upload');

router.use(protect);

router.get('/', getMessages);
router.post('/', sendMessage);
router.get('/:id', getMessage);
router.post('/thread', createThread);
router.post('/:id/reply', upload.array('attachments', 5), addMessageToThread);
router.get('/all', authorize('admin'), async (req, res) => {
  try {
    const Message = require('../models/Message');
    const messages = await Message.find({})
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .populate('threadId', 'subject')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;