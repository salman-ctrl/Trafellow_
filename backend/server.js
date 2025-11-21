const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('public/uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/friendships', require('./routes/friendshipRoutes'));
app.use('/api/regions', require('./routes/regionRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/destination-categories', require('./routes/destinationCategoryRoutes.js'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/dm', require('./routes/dmRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));  // ← TAMBAH INI


// Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Sumbar Tourism API is running',
    version: '1.0.0'
  });
});

// Socket.io
require('./socket/chatHandler')(io);

// Error handlers
const { errorHandler, notFound } = require('./middlewares/errorHandler');
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`💬 Socket.io ready`);
});