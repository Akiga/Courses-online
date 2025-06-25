const User = require('../models/users')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('264589417572-tq2bbpbpa8u17ird19imaa5claui2djp.apps.googleusercontent.com');
class userController{
    // Chức năng đăng kí
    async store(req, res, next) {
        const userData = req.body;
        const user = new User(userData);

        try {
            await user.save();
            req.session.successMessage = 'Đăng ký thành công! Hãy đăng nhập';
            req.session.openLoginModal = true;
            res.redirect('/');
        } catch (err) {
            if (err.code === 11000) {
                let field = Object.keys(err.keyPattern)[0];
                let message = `Đã tồn tại email này`;
                req.session.errorMessage = message;
                req.session.openRegisterModal = true;
                return res.redirect('/');
        }

        next(err);
        }
    }

    // Chức năng login
    async login(req, res, next){
        const format = req.body;
        try{
            const account = await User.findOne({email: format.email, password: format.password})
            if(!account)
            {
                req.session.openLoginModal = true;
                return res.redirect('/?error=loginFailed&message=Đăng nhập thất bại! Vui lòng kiểm tra email hoặc mật khẩu.');
            }
            req.session.account = account
            res.redirect('/');
        }catch(err){
            console.log('Có lỗi:' + err)
        }
    }
    
    // Chức năng đăng xuất
    logout(req, res, next) {
        req.session.destroy((err) => {
            if (err) {
            return next(err);
            }
            res.redirect('/'); // Quay lại trang chủ sau khi logout
        });
    }

    // Chức năng đăng nhập bằng google
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