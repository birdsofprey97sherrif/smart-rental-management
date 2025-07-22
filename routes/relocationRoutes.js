const express = require("express");
const router = express.Router();

const {
  requestRelocation,
  getMyRelocationRequests,
  getRelocationRequestById,
  getAllRelocationRequests,
  updateRelocationStatus,
  assignDriver,
  rateRelocation,
} = require("../controllers/relocationController");

const { getUserNotifications, markAsSeen } = require("../controllers/notificationController");
const { protectRoute } = require("../middlewares/authMiddleware");
const { isTenant, isAdminOrCaretaker } = require("../middlewares/roleMiddleware");

// Tenant requests relocation
router.post("/request", protectRoute, isTenant, requestRelocation);

// Tenant views their relocation requests
router.get("/mine", protectRoute, isTenant, getMyRelocationRequests);

// admin or caretaker views relocation requests by id
router.get("/requests/:id", protectRoute, isAdminOrCaretaker,getRelocationRequestById);

// Admin or caretaker views all relocation requests
router.get("/all", protectRoute, isAdminOrCaretaker, getAllRelocationRequests);

// Admin or caretaker updates relocation status
router.patch("/update/:requestId", protectRoute, isAdminOrCaretaker, updateRelocationStatus);

// Assign driver to relocation (admin/caretaker)
router.patch("/assign-driver", protectRoute, isAdminOrCaretaker, assignDriver);

// Tenant rates relocation
router.post("/rate", protectRoute, isTenant, rateRelocation);

// Notifications related to relocation
router.get("/notifications", protectRoute, getUserNotifications);
router.patch("/notifications/mark-seen", protectRoute, markAsSeen);

module.exports = router;