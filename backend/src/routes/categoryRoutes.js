// backend/src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategory,
  getCategoryBySlug,
  updateCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/slug/:slug', getCategoryBySlug);

router
  .route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategory);

router
  .route('/:id')
  .get(getCategory)
  .put(protect, authorize('admin'), updateCategory);

module.exports = router;
