const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middlewares/authMiddleware");
const { isAdmin, isLandlord } = require("../middlewares/roleMiddleware");

const activityLogController = require("../controllers/activityLogController");

// 📝 Create log (called internally after actions)
router.post("/", protectRoute, activityLogController.createLog);

// 🔎 View all logs (admin + landlord only)
router.get("/", protectRoute, isAdmin, activityLogController.getLogs);
router.get("/landlord", protectRoute, isLandlord, activityLogController.getLogs);

// 🔎 View logs for a specific user
router.get("/user/:userId", protectRoute, activityLogController.getUserLogs);

module.exports = router;
