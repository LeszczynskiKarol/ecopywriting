// backend/src/routes/adminThreadRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { getThreadById, addMessage, toggleThreadStatus } = require('../controllers/adminThreadController');
const { upload } = require('../utils/s3Upload');

router.get('/:id', protect, authorize('admin'), getThreadById);
router.post('/:id/messages', protect, authorize('admin'), upload.array('attachments', 5), addMessage);
router.put('/:id/toggle-status', protect, authorize('admin'), (req, res, next) => {
  toggleThreadStatus(req, res, next, req.io);
});

module.exports = router;