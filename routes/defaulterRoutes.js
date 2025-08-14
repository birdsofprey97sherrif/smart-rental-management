const express = require("express");
const router = express.Router();

const { 
  getDefaulters, 
  sendDefaulterReminders, 
  getDefaulterList,
  notifyDefaulters
} = require("../controllers/defaulterController");
const { protectRoute } = require("../middlewares/authMiddleware");
const { isLandlord } = require("../middlewares/roleMiddleware");

router.get("/rent-defaulters", protectRoute, isLandlord, getDefaulters);
router.post("/send-defaulter-sms", protectRoute, isLandlord, sendDefaulterReminders);
router.get("/get-defaulter-list", protectRoute, isLandlord, getDefaulterList);
router.post("/notify-defaulters", protectRoute, isLandlord, notifyDefaulters);


module.exports = router;
