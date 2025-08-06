const express = require("express");
const router = express.Router();
const {
    getUserNotifications,
    markAsSeen,
    deleteNotification
}=require("../controllers/notificationController")
const { protectRoute } = require("../middlewares/authMiddleware");
router.get("/get-notifications",protectRoute,getUserNotifications);
router.put("/mark-seen",protectRoute,markAsSeen);
router.delete("/delete-notification",protectRoute,deleteNotification)