const express = require("express");
const router = express.Router();
const { sendMessage, getHouseMessages } = require("../controllers/messageController");
const { protectRoute } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");

router.post("/send", protectRoute,isAdmin, sendMessage); // tenant or caretaker
router.get("/:houseId", protectRoute,isAdmin,  getHouseMessages); // get conversation

module.exports = router;
