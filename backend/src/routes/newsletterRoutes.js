// backend/src/routes/newsletterRoutes.js
const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');
const newsletterController = require('../controllers/newsletterController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/status', newsletterController.getSubscriptionStatus);
router.post('/manage', newsletterController.manageSubscription);
router.get('/preferences', protect, (req, res, next) => {
    console.log('Preferences route hit');
    next();
  }, subscriberController.getPreferences);  
router.put('/preferences', protect, subscriberController.updatePreferences);
router.post('/subscription', protect, subscriberController.toggleSubscription);
router.get('/history', protect, (req, res, next) => {
    console.log('History route hit');
    next();
  }, newsletterController.getNewsletterHistory);
router.get('/subscription-status', protect, subscriberController.checkSubscriptionStatus);
  
// Dodaj te trasy dla administratora
router.post('/', protect, authorize('admin'), newsletterController.createNewsletter);
router.get('/', protect, authorize('admin'), newsletterController.getNewsletters);
router.post('/:id/send', protect, authorize('admin'), newsletterController.sendNewsletter);
router.get('/confirm/:token', newsletterController.confirmSubscription);

module.exports = router;