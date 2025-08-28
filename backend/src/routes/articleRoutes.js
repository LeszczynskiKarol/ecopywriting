// backend/src/routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  getArticleBySlug,
  getRecentArticles,
  getArticlesByCategorySlug,
} = require('../controllers/articleController');
const { protect, authorize } = require('../middlewares/auth');

// Publiczne trasy
router.get('/', getArticles);
router.get('/recent', getRecentArticles);
router.get('/all', getArticles);
router.get('/category/:categorySlug', getArticlesByCategorySlug);
router.get('/:id', getArticle);
router.get('/:categorySlug/:slug', getArticleBySlug);

// Trasy wymagające autoryzacji
router.use(protect);
router.post('/', authorize('admin'), createArticle);
router.put('/:id', authorize('admin'), updateArticle);
router.delete('/:id', authorize('admin'), deleteArticle);

module.exports = router;
