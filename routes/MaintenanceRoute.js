const express = require("express");
const router = express.Router();

const { createMaintenanceRequest, getAllRequestsForCaretaker, updateMaintenanceStatus } = require("../controllers/maintenanceController");
const { protectRoute } = require("../middlewares/authMiddleware");
const { isTenant, isCaretaker } = require("../middlewares/roleMiddleware");

router.post("/maintenance", protectRoute, isTenant, createMaintenanceRequest);
router.get("/maintenance", protectRoute, isCaretaker, getAllRequestsForCaretaker);
router.patch("/maintenance/:id", protectRoute, isCaretaker, updateMaintenanceStatus);

module.exports = router;
