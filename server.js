const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const route = require('./routes');
const db = require('./config/db');
const LoginMiddlewares = require('./app/middlewares/auth');
require('dotenv').config();

// 1. Tạo HTTP server từ Express
const server = http.createServer(app);

// 2. Tạo đối tượng io
const io = socketIo(server);

// 3. Lưu io vào app.locals để dùng ở các route nếu cần
app.locals.io = io;

// 4. Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true
}));

// 5. Middleware login
app.use(LoginMiddlewares);

// 6. Kết nối DB
db.connect();

// 7. Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 8. Template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 9. File tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// 10. Override
app.use(methodOverride('_method'));

// 11. Route
route(app);

// 12. Socket.IO xử lý kết nối
// io.on('connection', socket => {
//     console.log('🟢 Client connected: ', socket.id);

//     socket.on('chat-message', (data) => {
//         // Gửi lại cho tất cả (admin + người dùng)
//         io.emit('chat-message', data);
//     });

//     socket.on('disconnect', () => {
//         console.log('🔴 Client disconnected:', socket.id);
//     });
// });

// 13. Khởi động server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server chạy trên cổng ${PORT}`);
});
