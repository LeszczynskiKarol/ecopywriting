// backend/src/routes/userRoutes.js
const express = require('express');
const {
  register,
  login,
  logout,
  verifyAccount,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  getRegistrationStatus,
  changePassword,
  updateNotificationPermissions,
  topUpAccount,
  refreshSession,
  getLatestTopUp,
  getUserStats,
} = require('../controllers/userController');

const { protect, checkVerification } = require('../middlewares/auth'); // Dodajemy import checkVerification z middleware

const router = express.Router();

// Publiczne trasy
router.post('/register', register);
router.post('/login', login);
router.post('/verify-account', verifyAccount);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-verification', register);
router.get('/check-registration-status/:email', getRegistrationStatus);

// Chronione trasy
router.get('/me', protect, checkVerification, getMe);
router.put('/change-password', protect, checkVerification, changePassword);
router.put('/update-profile', protect, checkVerification, updateProfile);
router.put(
  '/update-notification-permissions',
  protect,
  checkVerification, // Dodajemy również tutaj
  updateNotificationPermissions
);
router.get('/refresh-session', protect, checkVerification, refreshSession);
router.post('/top-up', protect, checkVerification, topUpAccount);
router.get('/latest-top-up', protect, checkVerification, getLatestTopUp);
router.get('/stats', protect, checkVerification, getUserStats);
router.post('/logout', protect, logout);

module.exports = router;
