// backend/src/routes/adminMessageRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getAllMessages,
  getMessage,
  deleteMessage
} = require('../controllers/adminMessageController');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllMessages);
router.get('/:id', getMessage);
router.delete('/:id', deleteMessage);

module.exports = router;