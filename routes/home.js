const express = require('express');
const router =  express.Router();
const homeController = require('../app/controllers/homeController');


router.get('/', homeController.index);

router.get('/home/information', homeController.infor)

router.get('/home/:slug' , homeController.detail);

router.get('/home/:slug/videos/:index', homeController.courseVideo);

router.post('/home/buy/:slug', homeController.buyCourse);

module.exports = router;