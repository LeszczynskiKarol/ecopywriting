// backend/src/routes/paymentRoutes.js
const express = require('express');
const { getRecentInvoices, getPaymentHistory, getPaymentDetails, createPaymentIntent, getPaymentInvoice } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Przenieś tę trasę na początek
router.get('/recent-invoices', protect, getRecentInvoices);

router.get('/history', protect, getPaymentHistory);
router.post('/create-payment-intent', protect, createPaymentIntent);
router.get('/:id', protect, getPaymentDetails);
router.get('/:id/invoice', protect, getPaymentInvoice);

module.exports = router;