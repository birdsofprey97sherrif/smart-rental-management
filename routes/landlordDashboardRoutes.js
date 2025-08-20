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
router.get("/dashboard", landlordDashboardController.getLandlordDashboardStats);

// Activity logs
router.get("/activity", landlordDashboardController.getLandlordActivityLog);

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
router.get("/visits", visitController.getAllForLandlord);
router.patch("/visits/:id/approve", visitController.approveVisit);
router.patch("/visits/:id/decline", visitController.declineVisit);

/**
 * 📜 Rental Agreements
 */
router.get("/agreements", rentAgreementController.getAllrentAgreementsForLandlord);
router.patch("/agreements/:id/sign", rentAgreementController.markDepositPaid);

/**
 * 🚚 Relocations
 */
router.get("/relocations", relocationController.getAllForLandlord);
router.patch("/relocations/:id/approve", relocationController.approveRelocation);
router.patch("/relocations/:id/decline", relocationController.declineRelocation);

/**
 * 🛠 Maintenance Requests
 */
router.get("/maintenance", maintenanceController.getAllForLandlord);
router.get("/maintenance/summary", maintenanceController.getSummaryStats);
router.patch("/maintenance/:id/update-status", maintenanceController.updateMaintenanceStatus);

/**
 * 📢 Broadcast Messaging
 */
router.post("/broadcast", messageController.sendBroadcast); // ✅ reuse same controller

/**
 * 💰 Defaulters
 */
router.get("/defaulters", defaulterController.getDefaultersForLandlord);
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