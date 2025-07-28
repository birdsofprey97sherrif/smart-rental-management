const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");

// Register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const {
      fullName,
      email,
      phone,
      password,
      role,
      tenantDetails,
      landlordDetails,
      caretakerDetails,
    } = req.body;

    if (!fullName || !email || !phone || !password || !role)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = Date.now() + 1000 * 60 * 15;

    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      verifyToken,
      verifyTokenExpiry,
    });

    if (role === "tenant") newUser.tenantDetails = tenantDetails;
    if (role === "landlord") newUser.landlordDetails = landlordDetails;
    if (role === "caretaker") newUser.caretakerDetails = caretakerDetails;

    await newUser.save();

    const verifyLink = `${process.env.FRONTEND_URL}/verify-account/${verifyToken}`;
    const msg = `Hi ${fullName},\n\nPlease verify your account:\n${verifyLink}\n\nThis link expires in 15 minutes.`;

    // await sendEmail({ to: email, subject: "Verify Your Account", text: msg });

    res.status(201).json({
      message: "Account created. Please check your email to verify.",
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    let redirectTo = "/";
    if (user.role === "admin") redirectTo = "/admin/dashboard";
    if (user.role === "landlord") redirectTo = "/landlord/dashboard";
    if (user.role === "tenant") redirectTo = "/tenant/dashboard";
    if (user.role === "caretaker") redirectTo = "/caretaker/dashboard";

    res.json({ token, role: user.role, redirectTo, user });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
};

// Verify Account
exports.verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.verifyToken = null;
    user.verifyTokenExpiry = null;
    await user.save();

    res.json({ message: "Account verified!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to verify account" });
  }
};

// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No account with that email" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 1000 * 60 * 10;

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      text: `Hi ${user.fullName},\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link expires in 10 minutes.`,
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send password reset email" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset password" });
  }
};
