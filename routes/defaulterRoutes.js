const express = require("express");
const router = express.Router();

const { 
  getDefaulters, 
  sendDefaulterReminders, 
  getDefaulterList 
} = require("../controllers/defaulterController");
const { protectRoute } = require("../middlewares/authMiddleware");
const { isLandlord } = require("../middlewares/roleMiddleware");

router.get("/rent-defaulters", protectRoute, isLandlord, getDefaulters);
router.get("/send-defaulter-sms", protectRoute, isLandlord, sendDefaulterReminders);

module.exports = router;
