// backend/src/routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { 
  getUserNotifications, 
  toggleNotificationStatus, 
  markAllNotificationsAsRead,
  markNotificationsAsReadForOrder,
  getUnreadNotificationsCount
} = require('../controllers/notificationController');

router.get('/', protect, getUserNotifications);
router.put('/:id/toggle', protect, toggleNotificationStatus);
router.put('/read-all', protect, markAllNotificationsAsRead);
router.put('/mark-read-for-order/:orderId', protect, markNotificationsAsReadForOrder);
router.get('/unread-count', protect, getUnreadNotificationsCount);

module.exports = router;