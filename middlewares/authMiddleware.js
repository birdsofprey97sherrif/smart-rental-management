const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Make sure to import your User model

exports.protectRoute = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Optionally fetch user from DB for up-to-date info
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended by admin" });
    }
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      // Add more fields if needed
    };
    req.isAdmin = user.role === "admin";
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

// Example toggleSuspend controller (should be in userController.js, not here)
exports.toggleSuspend = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isSuspended = !user.isSuspended;
  await user.save();
  res.json({ message: `User is now ${user.isSuspended ? "suspended" : "active"}` });
};
