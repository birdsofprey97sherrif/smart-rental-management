const express = require("express");
const router = express.Router();

const {
  payRent,
  getPaymentsByHouse,
  getLandlordPayments,
  getTenantPayments,
  getLandlordEarningsSummary,
  getCaretakerEarningsSummary,
  downloadReceipt,
  downloadRentHistory
} = require("../controllers/rentPaymentController");
const { protectRoute } = require("../middlewares/authMiddleware");
const { isTenant, isLandlord } = require("../middlewares/roleMiddleware");

// Tenant pays rent
router.post("/pay-rent", protectRoute, isTenant, payRent);

// Tenant views their rent payments
router.get("/my-rent", protectRoute, isTenant, getPaymentsByHouse);

// Landlord views all payments
router.get("/landlord-view", protectRoute, isLandlord, getLandlordPayments);

// Tenant views their payments (alternative route)
router.get("/tenant-view", protectRoute, isTenant, getTenantPayments);

// Download rent payment receipt
router.get("/download-receipt/:id", protectRoute, downloadReceipt);

// Download rent payment history (PDF)
router.get("/download-history", protectRoute, isTenant, downloadRentHistory);

// Landlord earnings summary
router.get("/landlord-earnings", protectRoute, isLandlord, getLandlordEarningsSummary);
// caretaker earnings summary
router.get("/caretaker-earnings", protectRoute, isLandlord, getCaretakerEarningsSummary);
module.exports = router;
