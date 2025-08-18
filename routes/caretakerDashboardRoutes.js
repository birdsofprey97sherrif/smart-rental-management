// routes/caretakerDashboardRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const caretakerDashboardController = require("../controllers/caretakerDashboardController");

// Summary stats
router.get("/dashboard", authMiddleware, caretakerDashboardController.getDashboardStats);

// Activity logs with filters & pagination
router.get("/dashboard/activity", authMiddleware, caretakerDashboardController.getActivityLogs);

module.exports = router;
