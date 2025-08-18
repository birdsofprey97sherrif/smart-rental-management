const express = require("express");
const router = express.Router();

const { 
    createMaintenanceRequest, 
    getAllRequestsForCaretaker, 
    updateMaintenanceStatus,
    deleteMaintenanceRequest,
    getRequestsForTenant,
    getRequestById
} = require("../controllers/maintenanceController");
const { protectRoute } = require("../middlewares/authMiddleware");
const { isTenant, isCaretaker, isTenantOrLandlordOrCaretaker, isTenantOrCaretaker } = require("../middlewares/roleMiddleware");

router.post("/maintenance", protectRoute, isTenantOrCaretaker, createMaintenanceRequest);
router.get("/maintenance", protectRoute, isCaretaker, getAllRequestsForCaretaker);
router.patch("/maintenance/:id", protectRoute, isCaretaker, updateMaintenanceStatus);
router.delete("/maintenance",protectRoute, isTenantOrLandlordOrCaretaker,  deleteMaintenanceRequest)
router.get("/maintenance/",protectRoute, isTenant, getRequestsForTenant)
router.get("/maintenance/:id", protectRoute, isCaretaker, getRequestById)
// routes/maintenanceRoutes.js
router.get("/my-houses", protectRoute, isCaretaker, async (req, res) => {
  try {
    const caretakerId = req.user.id;
    const requests = await Maintenance.find({ caretaker: caretakerId })
      .populate("houseId tenantId")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
