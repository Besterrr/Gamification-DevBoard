require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const { checkDeadlines } = require('./services/notificationService');
const PORT = process.env.PORT || 5000;
const app = express();

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://127.0.0.1:5173',
        methods: ['GET', 'POST']
    }
});


app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api/achievements', achievementRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Ты внутри!', user: req.user });
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected:', res.rows[0].now);
    }
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

const userSockets = new Map();

io.on('connection', (socket) => {
    console.log('Пользователь подключился:', socket.id);

    socket.on('register', (userId) => {
        userSockets.set(userId, socket.id);
        checkDeadlines(io, userSockets);
    });

    socket.on('disconnect', () => {
        console.log('Пользователь отключился:', socket.id);
        userSockets.forEach((socketId, userId) => {
            if(socketId === socket.id) {
                userSockets.delete(userId);
            }
        });
    });
});

setInterval(() => checkDeadlines(io, userSockets), 10 * 60 * 1000);

