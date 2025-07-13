// app.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { protectRoute } = require("./middlewares/authMiddleware");

// Load environment variables
dotenv.config();

// Connect to MongoDB directly here (no separate db.js)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();

// Body parser
app.use(express.json());

// Static files
app.use("/uploads", express.static("uploads"));

// Routes
const authRoutes = require("./routes/authRoutes");
const houseRoutes = require("./routes/houseRoutes");
const messageRoutes = require("./routes/messageRoutes");
const visitRoutes = require("./routes/visitRoutes");

// Route Middlewares
app.use("/api/auth", authRoutes);
app.use("/api/houses", protectRoute, houseRoutes);
app.use("/api/messages", protectRoute, messageRoutes);
app.use("/api/visits", protectRoute, visitRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
