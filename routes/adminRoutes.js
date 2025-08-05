const express = require("express");
const router = express.Router();

const { protectRoute } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");

const {
  getHouseReport,
  getEstateReport
} = require("../controllers/adminReportController");

const {
  registerStaff,
  toggleUserSuspension,
  getStaffList,
  sendMassNotification,
  getUserProfile,
  editUserProfile,
  editStaffById,
  getStaffById
} = require("../controllers/adminController");

const {
  getDefaulters,
  notifyDefaulters
} = require("../controllers/defaulterController");

const { getSystemStats, getRelocationRequests, getAnalytisTrends } = require("../controllers/adminAnalyticsController");

const {
  logAction,
  getAuditLogs,
  clearAuditLogs,
  getAuditLogById,
  getAuditLogsByUser,
  getAuditLogsByAction
} = require("../utils/audit");

// Reports
router.get("/report/house/:houseId", protectRoute, isAdmin, getHouseReport);
router.get("/report/estate/:estate", protectRoute, isAdmin, getEstateReport);

// Staff management
router.post("/register-staff", protectRoute, isAdmin, registerStaff);
router.patch("/suspend-user/:id", protectRoute, isAdmin, toggleUserSuspension);
router.get("/staff", protectRoute, isAdmin, getStaffList);
router.get("/profile", protectRoute, isAdmin, getUserProfile);
router.put("/profile", protectRoute, isAdmin, editUserProfile);
router.patch("/profile/:id", protectRoute, isAdmin, editStaffById);
router.get("/profile/:id", protectRoute, isAdmin, getStaffById);



// Mass notification
router.post("/admin/mass-notify", protectRoute, isAdmin, sendMassNotification);

// Defaulters
router.get("/defaulters", protectRoute, isAdmin, getDefaulters);
router.post("/defaulters/notify", protectRoute, isAdmin, notifyDefaulters);

// Analytics
router.get("/admin/analytics", protectRoute, isAdmin, getSystemStats);
router.get("/admin/relocation-requests", protectRoute, isAdmin, getRelocationRequests);
router.get("/admin/analytics/trends", protectRoute, isAdmin, getAnalytisTrends);
// Audit logs
router.get("/admin/audit-logs", protectRoute, isAdmin, getAuditLogs);
router.post("/admin/audit-logs", protectRoute, isAdmin, async (req, res) => {
  const { actionBy, action, details } = req.body;
  try {
    await logAction({ actionBy, action, details });
    res.status(201).json({ message: "Audit log created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating audit log", error });
  }
});
router.delete("/admin/audit-logs/clear", protectRoute, isAdmin, clearAuditLogs);
router.get("/admin/audit-logs", protectRoute, isAdmin, getAuditLogById);
router.get("/admin/audit-logs/user", protectRoute, isAdmin, getAuditLogsByUser);
router.get("/admin/audit-logs/action/:action", protectRoute, isAdmin, getAuditLogsByAction);

module.exports = router;
