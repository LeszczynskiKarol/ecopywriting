// backend/src/routes/uploadRoutes.js
const express = require('express');
const { upload } = require('../utils/s3Upload');
const router = express.Router();
const { protect } = require('../middlewares/auth');

router.post('/', protect, upload.single('file'), (req, res) => {
  if (req.file) {
    res.status(200).json({
      success: true,
      url: req.file.location,
      originalname: req.file.originalname
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
});

module.exports = router;