const express = require("express");
const router = express.Router();
const User = require("../models/User"); // ✅ Add this import

const {
  getUserProfile,
  updateUserProfile,
  toggleAccountDeactivation,
  toggleSuspend,
  registerStaff,
  getStaffForLandlord,
  getAllStaffForLandlord,
  registerTenant,
  getTenantsForLandlord,
} = require("../controllers/userController");

const { protectRoute, allowRoles } = require("../middlewares/authMiddleware");

// User profile routes
router.get("/profile/get", protectRoute, getUserProfile);
router.put("/profile/update", protectRoute, updateUserProfile);
router.put("/deactivate", protectRoute, toggleAccountDeactivation);

// Admin: suspend user
router.put(
  "/admin/users/:id/suspend",
  protectRoute,
  allowRoles("admin"),
  toggleSuspend
);

// ✅ NEW: Landlord/Admin: get staff (matches frontend call to /users/staff)
router.get(
  "/staff",
  protectRoute,
  allowRoles("landlord", "admin"),
  getStaffForLandlord
);

// ✅ NEW: Alternative endpoint for all staff created by landlord
router.get(
  "/staff/all",
  protectRoute,
  allowRoles("landlord", "admin"),
  getAllStaffForLandlord
);

// Landlord/Admin: register staff
router.post(
  "/staff/register",
  protectRoute,
  allowRoles("landlord", "admin"),
  registerStaff
);

// Landlord: register tenant
router.post(
  "/tenants/register",
  protectRoute,
  allowRoles("landlord", "caretaker"),
  registerTenant
);

// Landlord: fetch tenants under them
router.get(
  "/tenants",
  protectRoute,
  allowRoles("landlord"),
  getTenantsForLandlord
);

// ✅ Get all caretakers (public or protected - adjust as needed)
router.get("/caretakers", protectRoute, async (req, res) => {
  try {
    const caretakers = await User.find({ role: "caretaker" }).select("-password");
    res.json({ caretakers });
  } catch (error) {
    console.error("Error fetching caretakers:", error);
    res.status(500).json({ error: "Failed to fetch caretakers" });
  }
});

module.exports = router;