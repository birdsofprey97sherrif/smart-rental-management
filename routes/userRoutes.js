const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  toggleAccountDeactivation,
  toggleSuspend,
  registerStaff,
  getStaffForLandlord,
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

// Landlord/Admin: register staff
router.post(
  "/staff/register",
  protectRoute,
  allowRoles("landlord", "admin"),
  registerStaff
);

// Landlord: fetch staff (caretakers + admins under them)
router.get(
  "/staff",
  protectRoute,
  allowRoles("landlord"),
  getStaffForLandlord
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

router.get("/caretakers", async (req, res) => {
  try {
    const caretakers = await User.find({ role: "caretaker" }).select("-password");
    res.json(caretakers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch caretakers" });
  }
});


module.exports = router;
