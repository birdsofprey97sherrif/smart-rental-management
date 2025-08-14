const express = require("express");
const router = express.Router();
const { sendMessage, getHouseMessages,getmessageHistory } = require("../controllers/messageController");
const { protectRoute } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");

router.post("/send", protectRoute,isAdmin, sendMessage); // tenant or caretaker
router.get("/:houseId", protectRoute,isAdmin,  getHouseMessages); // get conversation
router.get("/history", protectRoute,isAdmin, getmessageHistory); // get conversation history
module.exports = router;
