const router = require("express").Router();
const { createRentalAgreement } = require("../controllers/rentalAgreementController");
const { protectRoute } = require("../middlewares/authMiddleware");

router.post("/create", protectRoute, createRentalAgreement);

module.exports = router;
