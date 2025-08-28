const express = require('express');
const { upload } = require('../utils/s3Upload');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const orderController = require('../controllers/orderController');

const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  getOrderInvoice,
  resumePayment,
  deleteOrder,
  getLatestOrder,
  updateActualDeliveryDate,
  addComment,
  getComments,
  getRecentOrders,
  getOrderBySessionId
} = orderController;

router.get('/recent', protect, getRecentOrders);
router.get('/latest', protect, getLatestOrder);
router.get('/user', protect, getUserOrders);
router.post('/', protect, createOrder);
router.get('/:id', protect, getOrderDetails);
router.get('/:id/invoice', protect, getOrderInvoice);
router.post('/:id/resume-payment', protect, resumePayment);
router.delete('/:id', protect, deleteOrder);
router.put('/:orderId/actual-delivery', protect, updateActualDeliveryDate);
router.post('/:orderId/comments', protect, upload.array('attachments', 5), addComment);
router.get('/:orderId/comments', protect, getComments);
router.get('/session/:sessionId', protect, getOrderBySessionId);

module.exports = router;