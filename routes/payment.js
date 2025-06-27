const express = require('express');
const router = express.Router();
const paymentController = require('../app/controllers/paymentController')


  // Route tạo giao dịch thanh toán bằng thẻ ATM
  router.post('/create/:slug', paymentController.create);


  // Route xử lý returnUrl
  router.get('/return', paymentController.return);

  // Route xử lý notifyUrl
  router.post('/notify', paymentController.notify);


module.exports = router;