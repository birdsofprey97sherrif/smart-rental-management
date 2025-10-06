const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables
dotenv.config();

// Check environment variables (optional but helpful)
const checkEnvironment = require('./utils/envChecker');
checkEnvironment();

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Security Middleware
app.use(helmet());
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized key: ${key}`);
  }
}));

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));

app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));

app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.xssFilter());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Route Imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const houseRoutes = require("./routes/houseRoutes");
const messageRoutes = require("./routes/messageRoutes");
const visitRoutes = require("./routes/visitRoutes");
const rentAgreementRoutes = require("./routes/rentAgreementRoutes");
const adminRoutes = require("./routes/adminRoutes");
const MaintenanceRoute = require("./routes/MaintenanceRoute");
const rentRoute = require("./routes/rentPaymentRoutes");
const relocationRoutes = require("./routes/relocationRoutes");
const defaulterRoutes = require("./routes/defaulterRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const landlordDashboardRoutes = require("./routes/landlordDashboardRoutes");
const caretakerDashboardRoutes = require("./routes/caretakerDashboardRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes'
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});

app.use('/api/', apiLimiter);

// Root route
app.get("/", (req, res) => res.send("🏠 Smart Rental Management API is running"));

// Public Routes
app.use("/api/auth", authRoutes);

// Protected Routes
app.use("/api/users", userRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/rental-agreements", rentAgreementRoutes);
app.use("/api/maintenance", MaintenanceRoute);
app.use("/api/rents", rentRoute);
app.use("/api/relocations", relocationRoutes);
app.use("/api/defaulters", defaulterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/landlord", landlordDashboardRoutes);
app.use("/api/caretaker", caretakerDashboardRoutes);
app.use("/api/activity-logs", activityLogRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Create HTTP server ONCE with Socket.io
const server = require('http').createServer(app);
const io = socketIo(server, {
  cors: { origin: process.env.FRONTEND_URL || '*' }
});

// Socket authentication
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  socket.join(`user_${socket.userId}`);

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Export sendNotification function
exports.sendNotification = async (userId, notification) => {
  const Notification = require('./models/Notification');
  await Notification.create({ userId, ...notification });
  io.to(`user_${userId}`).emit('notification', notification);
};

// ✅ Start Server ONCE - Use server.listen() not app.listen()
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('💤 MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('💤 MongoDB connection closed');
      process.exit(0);
    });
  });
});