const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

// Controllers
const houseController = require("../controllers/houseController");
const messageController = require("../controllers/messageController");
const visitController = require("../controllers/visitController");
const agreementController = require("../controllers/agreementController");
const relocationController = require("../controllers/relocationController");
const maintenanceController = require("../controllers/maintenanceController");
const defaulterController = require("../controllers/defaulterController");
const staffController = require("../controllers/staffController");
const tenantController = require("../controllers/tenantController");
const broadcastController = require("../controllers/broadcastController");
const activityLogController = require("../controllers/activityLogController");

// Apply landlord auth middleware to all
router.use(protect, authorize("landlord"));

/**
 * 📦 Houses Management
 */
router.post("/houses", houseController.createHouse);
router.get("/houses", houseController.getAllHouses);
router.get("/houses/:id", houseController.getHouseById);
router.put("/houses/:id", houseController.updateHouse);
router.delete("/houses/:id", houseController.deleteHouse);
router.post("/houses/:id/upload", houseController.uploadHouseImages);
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
router.get("/agreements", agreementController.getAllAgreementsForLandlord);
router.patch("/agreements/:id/sign", agreementController.signAgreement);

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
router.post("/broadcast", broadcastController.sendBroadcast);

/**
 * 💰 Defaulters
 */
router.get("/defaulters", defaulterController.getDefaultersForLandlord);
router.post("/defaulters/notify", defaulterController.notifyDefaulters);

/**
 * 👥 Staff & Tenants
 */
router.post("/staff", staffController.registerStaff); // caretaker, assistant, etc.
router.get("/staff", staffController.getStaffForLandlord);

router.post("/tenants", tenantController.registerTenant);
router.get("/tenants", tenantController.getTenantsForLandlord);

/**
 * 📊 Activity Logs
 */
router.get("/activity", activityLogController.getLandlordActivity);

module.exports = router;
