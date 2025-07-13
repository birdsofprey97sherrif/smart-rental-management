// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const { register, login, requestPasswordReset, resetPassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
