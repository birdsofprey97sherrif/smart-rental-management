const express = require("express");
const router = express.Router();
const { sendMessage, getHouseMessages } = require("../controllers/messageController");
const { protectRoute } = require("../middlewares/authMiddleware");

router.post("/send", protectRoute, sendMessage); // tenant or caretaker
router.get("/:houseId", protectRoute, getHouseMessages); // get conversation

module.exports = router;
