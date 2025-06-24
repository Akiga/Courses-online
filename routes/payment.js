// routes/vnpay.js
const express = require('express');
const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');
require('dotenv').config();

const router = express.Router();

router.get('/create_payment', (req, res) => {
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    const orderId = moment(date).format('HHmmss');
    const amount = req.query.amount; // Ví dụ: 100000 (100,000 VND)
    const bankCode = req.query.bankCode || '';

    const locale = req.query.language || 'vn';
    const currCode = 'VND';

    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: 'Thanh toan khoa hoc',
        vnp_OrderType: 'other',
        vnp_Amount:  10000000,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr.replace('::1', '127.0.0.1'),
        vnp_CreateDate: createDate
    };

    if (bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params); // sort trước
    const signData = qs.stringify(vnp_Params, { encode: false }); // KHÔNG có vnp_SecureHashType ở đây
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed; // Thêm chữ ký
    vnp_Params['vnp_SecureHashType'] = 'SHA512'; // Chỉ thêm sau khi ký!


    const paymentUrl = `${vnpUrl}?${qs.stringify(vnp_Params, { encode: true })}`;

    res.redirect(paymentUrl);
});

router.get('/vnpay_return', (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', process.env.VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
        // ✅ Thành công
        res.send('Thanh toán thành công! Mã GD: ' + vnp_Params['vnp_TxnRef']);
        // Cập nhật trạng thái đơn hàng tại đây
    } else {
        // ❌ Sai checksum
        res.send('Xác minh thất bại');
    }
});


// Hàm sắp xếp object theo thứ tự alphabet
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

module.exports = router;