const express = require('express');
const router =  express.Router();
const userController = require('../app/controllers/userController')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('264589417572-tq2bbpbpa8u17ird19imaa5claui2djp.apps.googleusercontent.com');
const User = require('../app/models/users');

// Đăng kí tài khoản cho user
router.post('/create', userController.store)
// Đăng nhập
router.post('/login', userController.login)
// Đăng xuất
router.post('/logout', userController.logout)

router.post('/google/callback', userController.gglogin);



module.exports = router;