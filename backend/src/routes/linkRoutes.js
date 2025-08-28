// backend/src/routes/linkRoutes.js
const express = require('express');
const router = express.Router();
const {
  generateSuggestions,
  insertLinks,
  handleLinkError,
} = require('../controllers/linkSuggesterController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.use(authorize('admin'));

router.post('/suggest', generateSuggestions);
router.post('/insert', insertLinks);

// Error handler
router.use(handleLinkError);

module.exports = router;
