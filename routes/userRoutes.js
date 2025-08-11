const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  toggleAccountDeactivation,
  toggleSuspend,
} = require("../controllers/userController");

const { protectRoute, allowRoles } = require("../middlewares/authMiddleware");

router.get("/profile/get", protectRoute, getUserProfile);
router.put("/profile/update", protectRoute, updateUserProfile);
router.put("/deactivate", protectRoute, toggleAccountDeactivation);

// ❗ Must ensure toggleSuspend is defined and exported
router.put(
  "/admin/users/:id/suspend",
  protectRoute,
  allowRoles("admin"),
  toggleSuspend
);

module.exports = router;
