const express = require('express');
const router = express.Router();
const commentController = require('../app/controllers/commentController')

// Gửi bình luận
router.post('/add', commentController.add);

// Lấy bình luận theo video
router.get('/video/:videoId', commentController.view);

module.exports = router;
