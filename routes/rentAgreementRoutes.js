const express = require("express");
const router = express.Router();

const {
  createRentalAgreement,
  getAgreementsByTenant,
  getAgreementsByLandlord,
  getAgreementsByHouse,
  getAllAgreements,
  getAgreementsByCaretaker,
  getAgreementsByRoles,
  getAgreementById,
  signAgreement,
  markDepositPaid,
  terminateAgreement,
  updateAgreement,
  deleteAgreement,
} = require("../controllers/rentAgreementController");

const { protectRoute } = require("../middlewares/authMiddleware");
const {
  isTenant,
  isLandlord,
  isAdminOrCaretaker,
} = require("../middlewares/roleMiddleware");

// CREATE a rental agreement (only landlord)
router.post("/create", protectRoute, isLandlord, createRentalAgreement);

// GET: Agreements by tenant
router.get("/tenant", protectRoute, isTenant, getAgreementsByTenant);

// GET: Agreements by landlord
router.get("/landlord", protectRoute, isLandlord, getAgreementsByLandlord);

// GET: Agreements by house
router.get("/house/:id", protectRoute, getAgreementsByHouse);

// GET: Agreements by caretaker
router.get(
  "/caretaker",
  protectRoute,
  isAdminOrCaretaker,
  getAgreementsByCaretaker
);

// GET: Agreements by any role and optional houseId filter
router.get("/by-role/:houseId", protectRoute, getAgreementsByRoles);

// GET: All agreements (admin/caretaker only)
router.get("/all", protectRoute, isAdminOrCaretaker, getAllAgreements);

// GET: Single agreement by ID
router.get("/:id", protectRoute, getAgreementById);

// PATCH: Sign agreement
router.patch("/sign/:id", protectRoute, signAgreement);

// PATCH: Mark deposit as paid
router.patch("/mark-deposit/:id", protectRoute, markDepositPaid);

// DELETE: Terminate agreement
router.delete("/terminate/:id", protectRoute, terminateAgreement);

// PATCH: Update agreement
router.patch("/update/:id", protectRoute, updateAgreement);

// DELETE: Delete agreement
router.delete("/delete/:id", protectRoute, deleteAgreement);

module.exports = router;
