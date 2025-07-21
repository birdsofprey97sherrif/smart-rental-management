const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { protectRoute } = require("./middlewares/authMiddleware"); // renamed to match your final merged middleware

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
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const houseRoutes = require("./routes/houseRoutes");
const messageRoutes = require("./routes/messageRoutes");
const visitRoutes = require("./routes/visitRoutes");
const agreementRoutes = require("./routes/agreementRoutes");
const adminRoutes = require("./routes/adminRoutes"); // Ensure adminRoutes is defined and exported
const maintenanceRoutes = require("./routes/maintenanceRoutes"); // Ensure maintenanceRoutes is defined and exported
const rentRoutes = require("./routes/rentRoutes"); // Ensure rentRoutes is defined and exported
const relocationRoutes = require("./routes/relocationRoutes"); // Ensure relocationRoutes is defined and exported
const defaulterRoutes = require("./routes/defaulterRoutes"); // Ensure defaulterRoutes is defined and exported

// Route mounting
app.get("/", (req, res) => res.send("API is running"));

app.use("/api/auth", authRoutes); // public
app.use("/api/users", protectRoute, userRoutes); // protected
app.use("/api/houses", protectRoute, houseRoutes); // protected
app.use("/api/messages", protectRoute, messageRoutes); // protected
app.use("/api/visits", protectRoute, visitRoutes); // protected
app.use("/api/agreements", agreementRoutes); // protected
app.use("/api/maintenance", protectRoute, maintenanceRoutes); // protected
app.use("/api/rents", protectRoute, rentRoutes); // protected
app.use("/api/relocations", protectRoute, relocationRoutes); // protected
app.use("/api/defaulters", protectRoute, defaulterRoutes); // protected
app.use("/api/admin", protectRoute, adminRoutes); // protected

// Optional: Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something went wrong!" });
// });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
