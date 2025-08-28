// backend/server.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const errorHandler = require('./src/middlewares/errorHandler');
const userRoutes = require('./src/routes/userRoutes');
const adminThreadRoutes = require('./src/routes/adminThreadRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
//const linkRoutes = require('./src/routes/linkRoutes');
const adminOrderRoutes = require('./src/routes/adminOrderRoutes');
const newsletterRoutes = require('./src/routes/newsletterRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

const app = express();
const server = http.createServer(app);
app.use(cookieParser());

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware dla webhooka Stripe (musi być przed parsowaniem JSON)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Parsowanie JSON dla wszystkich tras oprócz webhooka Stripe
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/users', userRoutes);
app.use('/api/admin/threads', adminThreadRoutes);
app.use('/api/articles', require('./src/routes/articleRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/stripe', require('./src/routes/stripeWebhookRoutes'));
app.use('/api/admin/orders', require('./src/routes/adminOrderRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api/payments', paymentRoutes);
app.use('/api/adminOrderRoutes', adminOrderRoutes);
//app.use('/api/linkRoutes', linkRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/threads', require('./src/routes/threadRoutes'));
app.use('*', (req, res) => {
  console.log('404 - Not Found:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
