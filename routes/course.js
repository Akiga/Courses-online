const express = require('express');
const router =  express.Router();
const { requireAdmin } = require('../app/middlewares/auth');
const courseController = require('../app/controllers/courseController');
router.use(requireAdmin);
// Route to get all courses
router.get('/me', courseController.getAllCourses);
// vào trang tạo khóa học
router.get('/create', courseController.createCourseForm);
// Tạo khóa học
router.post('/store', courseController.storeCourseForm);
// Quản lý video
router.get('/manage-videos', courseController.manageVideos);
// Vào trang quản lý video
router.get('/create-video', courseController.createVideoCourse);
// Tạo video cho khóa học
router.post('/store-video', courseController.storeVideoCourse);
// Vào trang update dựa trên slug của khóa học
router.get('/update/:slug', courseController.updateCourseForm);
// Update khóa học dựa vào id
router.put('/:id', courseController.updateCourse)
// Xóa khóa học dựa theo slug
router.delete('/:slug', courseController.deleteCourse)
// Vào trang chỉnh sửa video của khóa học
router.get('/update-video/:id', courseController.updateVideoCourseForm);
// Update video
router.put('/update-video/:id', courseController.updateVideo)
// Xóa video
router.delete('/video/:id', courseController.deleteVideo)

module.exports = router;