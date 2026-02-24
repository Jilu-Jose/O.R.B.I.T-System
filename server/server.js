require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const port = process.env.PORT || 5000;

connectDB();

const app = express();
const server = http.createServer(app);

// Global Socket.io attachment to use in controllers for Real-time Notifications
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    }
});
app.set('io', io);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Security & Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Default route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware (must be at the end)
app.use(errorHandler);

server.listen(port, () => console.log(`Server started on port ${port}`));
