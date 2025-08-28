// backend/src/routes/stripeWebhookRoutes.js
const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controllers/stripeWebhookController');

router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhookController.handleStripeWebhook);
router.get('/session/:sessionId', stripeWebhookController.getSessionDetails);
router.get('/session-token/:sessionId', stripeWebhookController.getSessionToken);

module.exports = router;