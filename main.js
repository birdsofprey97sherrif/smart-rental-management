const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
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
const notificationRoutes = require("./routes/notificationRoutes")
// const landlordDashboardRoutes = require("./routes/landlordDashboardRoutes");
// app.use("/api/landlord", landlordDashboardRoutes);
const caretakerDashboardRoutes = require("./routes/caretakerDashboardRoutes");
app.use("/api/caretaker", caretakerDashboardRoutes);



// Route Mounting
app.get("/", (req, res) => res.send("API is running"));

// Public Routes
app.use("/api/auth", authRoutes);

// Protected Routes (middleware applied per route inside)
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
app.use("/api/notifications",notificationRoutes)

// Optional Global Error Handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something went wrong!" });
// });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
