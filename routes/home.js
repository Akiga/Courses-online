const express = require('express');
const router =  express.Router();
const homeController = require('../app/controllers/homeController');

// Render trang chủ
router.get('/', homeController.index);

// Render trang thông tin cá nhân
router.get('/home/information', homeController.infor)

// Cập nhật User
router.post('/home/update-user', homeController.updateUser);

// Render trang chi tiết khóa học
router.get('/home/:slug' , homeController.detail);

// Render trang video dựa theo khóa hoc
router.get('/home/:slug/videos/:index', homeController.courseVideo);

// Chức năng mua khóa học
router.post('/home/buy/:slug', homeController.buyCourse);



module.exports = router;