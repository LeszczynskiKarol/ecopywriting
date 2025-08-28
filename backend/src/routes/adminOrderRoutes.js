// backend/src/routes/adminOrderRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  attachFileToOrder,
  getOrderAttachments,
  deleteAttachment,
  addAdminNote
} = require('../controllers/adminOrderController');
const {
  getOrderComments,
  addOrderComment
} = require('../controllers/adminOrderCommentController');
const { upload } = require('../utils/s3Upload');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', upload.array('files'), updateOrderStatus);
router.post('/:id/note', addAdminNote);
router.get('/:id/attachments', getOrderAttachments);
router.post('/:id/attach', upload.single('file'), attachFileToOrder);
router.delete('/:orderId/attachments/:fileType/:fileIndex', deleteAttachment);
router.get('/:orderId/comments', getOrderComments);
router.post('/:orderId/comments', upload.array('attachments', 5), addOrderComment);

module.exports = router;