const axios = require('axios');
const crypto = require('crypto');
const Course = require('../models/courses');
const Enrollment = require('../models/enrollments');
require('dotenv').config();
  // Thông tin cấu hình MoMo
  const config = {
      partnerCode: process.env.partnerCode,
      accessKey: process.env.accessKey,
      secretKey: process.env.secretKey,
      endpoint: process.env.endpoint,
      returnUrl: process.env.returnUrl,
      notifyUrl: process.env.notifyUrl,
  };
  // Hàm tạo chữ ký (signature)
    function createSignature(rawSignature, secretKey) {
        return crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');
    }

class paymentController{
    create(req, res){
        const { slug } = req.params;
        const { orderId, amount, orderInfo } = req.body;
        const user = req.session.account;

        if (!orderId || !amount || !orderInfo || !slug || !user) {
            return res.status(400).send('Missing required fields');
        }

        const requestId = Date.now().toString();
        const requestType = 'payWithCC';
        const extraData = Buffer.from(JSON.stringify({ slug, userId: user._id })).toString('base64');

        const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${config.notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${config.returnUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = createSignature(rawSignature, config.secretKey);

        const requestBody = {
            partnerCode: config.partnerCode,
            accessKey: config.accessKey,
            requestId: requestId,
            amount: amount.toString(),
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: config.returnUrl,
            ipnUrl: config.notifyUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'vi',
        };
        axios.post(config.endpoint, requestBody)
            .then(response => {
                const body = response.data;
                if (body.resultCode === 0) {
                    res.redirect(body.payUrl);
                } else {
                    res.status(400).send(body.message);
                }
            })
            .catch(error => {
                console.error('MoMo API Error:', error.message);
                res.status(500).send('Error connecting to MoMo');
            });
    }

    return(req, res){
        const { resultCode, orderId, message, extraData } = req.query;

        console.log('Return URL received:', { resultCode, orderId, message });

        if (resultCode === '0') {
            try {
                // Giải mã extraData
                const decodedData = Buffer.from(extraData, 'base64').toString('utf-8');
                const { slug } = JSON.parse(decodedData);

                // ✅ Redirect về trang khóa học
                return res.redirect(`/home/${slug}`);
            } catch (err) {
                console.error('Lỗi giải mã extraData:', err);
                return res.status(500).send('Thanh toán thành công, nhưng không thể chuyển hướng đến khóa học.');
            }
        } else {
            res.send('Thanh toán thất bại: ' + message);
        }
    }
    // Xử lý thông báo IPN từ MoMo
    // Đây là endpoint mà MoMo sẽ gọi để thông báo kết quả thanh toán
    async notify(req, res) {
    console.log('IPN Request Received:', req.body);

    const { orderId, resultCode, message, extraData, amount, orderInfo, orderType, partnerCode, payType, requestId, responseTime, transId, signature: receivedSignature } = req.body;

    const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const signature = createSignature(rawSignature, config.secretKey);
    console.log('Generated Signature:', signature);
    console.log('Received Signature:', receivedSignature);

    if (signature !== receivedSignature) {
        console.error('Invalid signature. Raw Signature:', rawSignature);
        return res.status(400).json({ message: 'Invalid signature' });
    }

    if (parseInt(resultCode) === 0) {
        try {
            console.log('Decoding extraData:', extraData);
            const decodedData = Buffer.from(extraData, 'base64').toString('utf-8');
            const { slug, userId } = JSON.parse(decodedData);
            console.log('Decoded Data:', { slug, userId });

            const course = await Course.findOne({ slug });
            console.log('Course Found:', course);

            if (!course) {
                console.error('Course not found for slug:', slug);
                return res.status(404).json({ message: 'Course not found' });
            }

            const enrolled = await Enrollment.findOne({ userId, courseSlug: course.slug });
            console.log('Enrollment Check:', enrolled);

            if (enrolled) {
                console.log('Already enrolled:', userId, course.slug);
                return res.json({ message: 'IPN received, already enrolled' });
            }

            const enrollment = await Enrollment.create({ userId, courseSlug: course.slug });
            console.log('Enrollment Created:', enrollment);
        } catch (err) {
            console.error('Error processing payment notification:', err);
            return res.status(500).json({ message: 'Error processing payment' });
        }
    } else {
        console.log(`Order ${orderId} payment failed: ${message}`);
    }

    res.json({ message: 'IPN received' });
}
}

module.exports = new paymentController()