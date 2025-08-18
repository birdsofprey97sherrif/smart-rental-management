// routes/caretakerDashboardRoutes.js
const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middlewares/authMiddleware");
const caretakerDashboardController = require("../controllers/caretakerDashboardController");

// Summary stats
router.get("/dashboard", protectRoute, caretakerDashboardController.getDashboardStats);

// Activity logs with filters & pagination
router.get("/dashboard/activity", protectRoute, caretakerDashboardController.getActivityLogs);

module.exports = router;
