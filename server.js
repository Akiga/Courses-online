const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const route = require('./routes');
const db = require('./config/db');
const LoginMiddlewares = require('./app/middlewares/auth');
require('dotenv').config();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const cors = require('cors');

// 1. CORS
app.use(cors());


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
require('./socketServer')(io);

// 13. Khởi động server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server chạy trên cổng ${PORT}`);
});
