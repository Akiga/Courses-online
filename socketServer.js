module.exports = function(io) {
    const users = new Map(); // socket.id -> username
    let adminSocket = null;
    const pendingMessages = [];

    io.on('connection', (socket) => {
        console.log(`[Socket] Connected: ${socket.id}`);

        socket.on('register-admin', () => {
            adminSocket = socket;
            console.log(`[Socket] Admin connected: ${socket.id}`);
            adminSocket.emit('user-list', Array.from(users.entries()));
            const delivered = [];
            pendingMessages.forEach(msg => {
                adminSocket.emit('user-message', msg);
                delivered.push(msg);
            });
            pendingMessages.splice(0, pendingMessages.length, ...pendingMessages.filter(msg => !delivered.includes(msg)));
        });

        socket.on('register-user', (username) => {
            if (!username?.trim()) return;
            users.set(socket.id, username.trim());
            console.log(`[Socket] User registered: ${username} (${socket.id})`);
            if (adminSocket) adminSocket.emit('user-list', Array.from(users.entries()));
        });

        socket.on('user-message', (msg) => {
            if (!users.has(socket.id) || !msg?.trim()) return;
            const messageData = {
                userId: socket.id,
                username: users.get(socket.id),
                message: msg.trim(),
                timestamp: new Date().toISOString()
            };
            if (adminSocket) {
                adminSocket.emit('user-message', messageData);
            } else {
                pendingMessages.push(messageData);
            }
            socket.emit('user-message-confirmation', messageData);
        });

        socket.on('admin-message', ({ userId, message }) => {
            if (!users.has(userId) || !message?.trim()) return;
            const userSocket = io.sockets.sockets.get(userId);
            if (userSocket) {
                userSocket.emit('admin-message', message);
            }
        });

        socket.on('request-user-messages', (userId) => {
            if (adminSocket && users.has(userId)) {
                const userMessages = pendingMessages.filter(msg => msg.userId === userId);
                adminSocket.emit('send-user-messages', { userId, messages: userMessages });
                pendingMessages.splice(0, pendingMessages.length, ...pendingMessages.filter(msg => msg.userId !== userId));
            }
        });

        socket.on('disconnect', () => {
            if (socket.id === adminSocket?.id) {
                console.log(`[Socket] Admin disconnected`);
                adminSocket = null;
            } else if (users.has(socket.id)) {
                console.log(`[Socket] User disconnected: ${users.get(socket.id)} (${socket.id})`);
                users.delete(socket.id);
                if (adminSocket) {
                    adminSocket.emit('user-list', Array.from(users.entries()));
                }
            }
        });
    });
};
