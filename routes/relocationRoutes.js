const express = require("express");
const router = express.Router();

const {
  requestRelocation,
  getMyRelocationRequests,
  getRelocationRequestById,
  getAllRelocationRequests,
  updateRelocationStatus,
  completeRelocation,
  notifyTenantRelocation,
  getFilteredRelocations,
  deleteRelocationRequest,
  assignDriver,
  rateRelocation,
} = require("../controllers/relocationController");

const { getUserNotifications, markAsSeen } = require("../controllers/notificationController");
const { protectRoute } = require("../middlewares/authMiddleware");
const { isTenant, isAdminOrCaretaker } = require("../middlewares/roleMiddleware");

// Tenant requests relocation
router.post("/request", protectRoute, isTenant, requestRelocation);
router.patch("/complete/:requestId", protectRoute, isAdminOrCaretaker, completeRelocation);

// Tenant views their relocation requests
router.get("/mine", protectRoute, isTenant, getMyRelocationRequests);
router.get("/admin", protectRoute, isAdminOrCaretaker, getFilteredRelocations);

// admin or caretaker views relocation requests by id
router.get("/requests/:id", protectRoute, isAdminOrCaretaker,getRelocationRequestById);
router.post("/notify/:requestId", protectRoute, isAdminOrCaretaker, notifyTenantRelocation);


// Admin or caretaker views all relocation requests
router.get("/all", protectRoute, isAdminOrCaretaker, getAllRelocationRequests);
router.delete("/:requestId", protectRoute, isAdminOrCaretaker, deleteRelocationRequest);

// Admin or caretaker updates relocation status
router.patch("/update/:requestId", protectRoute, isAdminOrCaretaker, updateRelocationStatus);

// Assign driver to relocation (admin/caretaker)
router.patch("/assign-driver", protectRoute, isAdminOrCaretaker, assignDriver);

// Tenant rates relocation
router.post("/rate", protectRoute, isTenant, rateRelocation);

// Notifications related to relocation
router.get("/notifications", protectRoute, getUserNotifications);
router.patch("/notifications/mark-seen", protectRoute, markAsSeen);


// routes/relocationRoutes.js
router.get("/my-houses", protectRoute, isCaretaker, async (req, res) => {
  try {
    const caretakerId = req.user.id;
    const relocations = await Relocation.find({ caretaker: caretakerId })
      .populate("houseId tenantId")
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 5);

    res.json({ relocations });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;