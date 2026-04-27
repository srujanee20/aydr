const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const uploadController = require('../controllers/rest/upload.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.post('/single', requireAuth, upload.single('image'), uploadController.uploadSingleImage);

module.exports = router;
