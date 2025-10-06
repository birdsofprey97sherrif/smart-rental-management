const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");

// Register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      fullName,
      email,
      phone,
      password,
      role,
      tenantDetails,
      landlordDetails,
      caretakerDetails,
      landlord,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Email verification setup
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 minutes

    // Create new user (password will be hashed by schema pre-save hook)
    const newUser = new User({
      fullName,
      email,
      phone,
      password,
      role,
      verifyToken,
      verifyTokenExpiry,
      landlord: landlord || null,
    });

    if (role === "tenant" && tenantDetails) newUser.tenantDetails = tenantDetails;
    if (role === "landlord" && landlordDetails) newUser.landlordDetails = landlordDetails;
    if (role === "caretaker" && caretakerDetails) newUser.caretakerDetails = caretakerDetails;

    await newUser.save();

    // Send verification email
    try {
      const verifyLink = `${process.env.FRONTEND_URL}/verify-account/${verifyToken}`;
      const msg = `Hi ${fullName},\n\nPlease verify your account:\n${verifyLink}\n\nThis link expires in 15 minutes.`;

      await sendEmail({ to: email, subject: "Verify Your Account", text: msg });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      message: "Account created. Please check your email to verify.",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      message: "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Validate input
    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: "Email/Phone and password are required" });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if account is suspended
    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended. Contact administrator." });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Determine redirect path
    let redirectTo = "/";
    if (user.role === "admin") redirectTo = "/admin/dashboard";
    if (user.role === "landlord") redirectTo = "/landlord/dashboard";
    if (user.role === "tenant") redirectTo = "/tenant/dashboard";
    if (user.role === "caretaker") redirectTo = "/caretaker/dashboard";

    res.json({
      token,
      role: user.role,
      redirectTo,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Verify Account
exports.verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verifyToken = null;
    user.verifyTokenExpiry = null;
    await user.save();

    res.json({ message: "Account verified successfully!" });
  } catch (err) {
    console.error("Verify account error:", err);
    res.status(500).json({ message: "Failed to verify account" });
  }
};

// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account with that email" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 1000 * 60 * 10; // 10 minutes

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    try {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      await sendEmail({
        to: email,
        subject: "Reset Your Password",
        text: `Hi ${user.fullName},\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link expires in 10 minutes.`,
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }

    res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ message: "Failed to send password reset email" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};