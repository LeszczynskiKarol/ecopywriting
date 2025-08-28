// backend/src/routes/threadRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { 
  getThreads, 
  getThreadById, 
  createThread, 
  addMessageToThread,
  toggleThreadStatus
} = require('../controllers/threadController');

router.use(protect);

router.route('/')
  .get(getThreads)
  .post(createThread);

router.route('/:id')
  .get(getThreadById)
  .post(addMessageToThread);

router.route('/:id/toggle-status')
  .put(authorize('admin'), toggleThreadStatus);

module.exports = router;