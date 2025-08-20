const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middlewares/authMiddleware");
const { isLandlord } = require("../middlewares/roleMiddleware");

// Controllers
const houseController = require("../controllers/houseController");
const messageController = require("../controllers/messageController");
const visitController = require("../controllers/visitController");
const rentAgreementController = require("../controllers/rentAgreementController");
const relocationController = require("../controllers/relocationController");
const maintenanceController = require("../controllers/maintenanceController");
const defaulterController = require("../controllers/defaulterController");
const userController = require("../controllers/userController");
const landlordDashboardController = require("../controllers/landlordDashboardController");
const activityLogController = require("../controllers/activityLogController"); // ✅ new file

// Dashboard
router.get("/dashboard", protectRoute, isLandlord, landlordDashboardController.getDashboardStats);

// Activity logs
router.get("/activity", protectRoute, isLandlord, landlordDashboardController.getLandlordActivityLog);

// Apply landlord auth middleware
router.use(protectRoute, isLandlord);

/**
 * 📦 Houses Management
 */
router.post("/houses", houseController.createHouse);
router.get("/houses", houseController.getAllHouses);
router.get("/houses/:id", houseController.getHouseById);
router.put("/houses/:id", houseController.updateHouse);
router.delete("/houses/:id", houseController.deleteHouse);
router.post("/houses/:id/upload", houseController.uploadHouse);
router.post("/houses/:id/assign-caretaker", houseController.assignCaretaker);

/**
 * 📩 Messages (Landlord <-> Caretaker/Tenant)
 */
router.post("/messages/send", messageController.sendMessage);
router.get("/messages/:houseId", messageController.getHouseMessages);

/**
 * 📝 Visit Requests
 */
router.get("/visits", visitController.getMyVisitRequests);
router.patch("/visits/:id/approve", visitController.respondToVisit);
router.patch("/visits/:id/decline", visitController.respondToVisit);

/**
 * 📜 Rental Agreements
 */
router.get("/agreements", rentAgreementController.getAgreementsByRoles);
router.patch("/agreements/:id/sign", rentAgreementController.markDepositPaid);

/**
 * 🚚 Relocations
 */
router.get("/relocations", relocationController.getRelocationRequestById);
router.patch("/relocations/:id/approve", relocationController.updateRelocationStatus);
router.patch("/relocations/:id/decline", relocationController.updateRelocationStatus);

/**
 * 🛠 Maintenance Requests
 */
router.get("/maintenance", maintenanceController.getRequestsForLandlord);
router.get("/maintenance/summary", maintenanceController.getMaintenanceStatsForLandlord);
router.patch("/maintenance/:id/update-status", maintenanceController.updateMaintenanceStatus);

/**
 * 📢 Broadcast Messaging
 */
router.post("/broadcast", messageController.sendMessage); // ✅ reuse same controller

/**
 * 💰 Defaulters
 */
router.get("/defaulters", defaulterController.getDefaulters);
router.post("/defaulters/notify", defaulterController.notifyDefaulters);

/**
 * 👥 Staff & Tenants
 */
router.post("/staff", userController.registerStaff);
router.get("/staff", userController.getStaffForLandlord);

router.post("/tenants", userController.registerTenant);
router.get("/tenants", userController.getTenantsForLandlord);

/**
 * 📊 Activity Logs (separate controller)
 */
// 📊 Activity Logs
router.get("/logs", activityLogController.getLogs);            // all logs
router.get("/logs/:userId", activityLogController.getUserLogs); // logs for one user
router.post("/logs", activityLogController.createLog);          // create new log
 // ✅ avoid duplicate `/activity`
module.exports = router;