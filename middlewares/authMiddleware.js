const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes (checks token + suspension + user existence)
exports.protectRoute = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Access denied: No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended by admin" });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      // You can add more fields here if needed
    };

    req.isAdmin = user.role === "admin";
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Role-based access control middleware
exports.allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

// Simple isAdmin middleware for quick checks
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

// Optional fallback: backward-compatible alias for protectRoute
exports.isAuthenticated = exports.protectRoute;

