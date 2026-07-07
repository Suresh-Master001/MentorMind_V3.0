import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import organizationRoutes from './routes/organizationRoutes.js';
import reportRoutes from './routes/reports.js';
import { initCronJobs } from './services/cronService.js';

dotenv.config();

const app = express();

// HTTP server for Socket.io
const httpServer = createServer(app);

// CORS configuration - handles multiple origins and trailing slashes
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://mentormind-v3.vercel.app',
  'https://mentormind-v3-0-s.onrender.com'
];

// Add FRONTEND_URL from env if set and not already in list
if (process.env.FRONTEND_URL) {
  const cleanUrl = process.env.FRONTEND_URL.replace(/\/+$/, ''); // strip trailing slash
  if (!allowedOrigins.includes(cleanUrl)) {
    allowedOrigins.push(cleanUrl);
  }
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Check if origin is allowed (exact match or matches with/without trailing slash)
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || origin === allowed + '/'
    );
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Still allow in dev, but log warning
    }
  },
  credentials: true
};

// Socket.io setup
const io = new Server(httpServer, {
  cors: corsOptions
});

// Make io available in routes/controllers
app.set('io', io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MentorMind API is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user-specific room for targeted notifications
  const userId = socket.handshake.auth?.userId;
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined room user:${userId}`);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation error', errors: messages });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource ID' });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `Duplicate value for ${field}` });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`MentorMind server running on port ${PORT}`);
    initCronJobs(io);
  });
});

export { io };