// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  updateArticle,
  getArticle,
} = require('../controllers/articleController');

// Zabezpiecz trasy middleware'em auth
router.use(protect);
router.use(authorize('admin'));

// Dodaj trasy dla operacji na artykułach
router
  .route('/articles/:id')
  .get((req, res, next) => {
    console.log('Admin GET request received:', req.params.id);
    console.log('User:', req.user);
    console.log('Headers:', req.headers);
    next();
  }, getArticle)
  .put((req, res, next) => {
    console.log('Admin PUT request received:', req.params.id);
    console.log('Request body:', req.body);
    next();
  }, updateArticle);

module.exports = router;
