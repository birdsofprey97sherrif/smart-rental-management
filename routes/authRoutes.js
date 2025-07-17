const express = require("express");
const router = express.Router();
const {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  verifyAccount,
} = require("../controllers/authController");

// Public auth endpoints
router.post("/register", register);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-account/:token", verifyAccount); 

module.exports = router;
