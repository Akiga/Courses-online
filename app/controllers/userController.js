const User = require('../models/users')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('264589417572-tq2bbpbpa8u17ird19imaa5claui2djp.apps.googleusercontent.com');
class userController{
    async store(req, res, next) {
    const userData = req.body;
    const user = new User(userData);

    try {
        await user.save();
        req.session.successMessage = 'Đăng ký thành công! Hãy đăng nhập';
        res.redirect('/');
    } catch (err) {
        next(err);
    }
}


    async login(req, res, next){
        const format = req.body;
        try{
            const account = await User.findOne({email: format.email, password: format.password})
            if(!account)
            {
                return res.json('Lỗi đăng nhập')
            }
            req.session.account = account
            // res.json('Đăng nhập thành công')
            res.redirect('/');
        }catch(err){
            console.log('Có lỗi:' + err)
        }
    }
    
    logout(req, res, next) {
        req.session.destroy((err) => {
            if (err) {
            return next(err);
            }
            res.redirect('/'); // Quay lại trang chủ sau khi logout
        });
    }

    async gglogin(req, res, next){
        const token = req.body.token;
        
        try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '264589417572-tq2bbpbpa8u17ird19imaa5claui2djp.apps.googleusercontent.com'
        });
    
        const payload = ticket.getPayload();
    
        // 1. Tìm theo googleId
        let user = await User.findOne({ googleId: payload.sub });
    
        // 2. Nếu chưa có, tìm theo email (người dùng có thể đã đăng ký bằng tay)
        if (!user) {
            user = await User.findOne({ email: payload.email });
    
            // 3. Nếu đã có tài khoản theo email, cập nhật thêm googleId
            if (user) {
            user.googleId = payload.sub;
            await user.save();
            } else {
            // 4. Nếu hoàn toàn chưa có, tạo mới
            user = await User.create({
                fullname: payload.name,
                email: payload.email,
                googleId: payload.sub,
                avt: payload.picture,
                role: 'user'
            });
            }
        }
    
        // 5. Lưu session và redirect
        req.session.account = user;
        res.redirect('/');
        } catch (err) {
        console.error('Google login failed:', err);
        res.json({ success: false });
        }
    }

}

module.exports = new userController()