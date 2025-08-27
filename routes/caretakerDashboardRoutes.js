// routes/caretakerDashboardRoutes.js
const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middlewares/authMiddleware");
const caretakerDashboardController = require("../controllers/caretakerDashboardController");

// Summary stats
router.get("/dashboard", protectRoute, caretakerDashboardController.getDashboardStats);

// Activity logs with filters & pagination
router.get("/dashboard/activity", protectRoute, caretakerDashboardController.getActivityLogs);

// Houses managed by the caretaker
router.get("/houses-managed", protectRoute, caretakerDashboardController.getHousesManaged);

module.exports = router;
