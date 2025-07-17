const User = require("../models/User");

// Get Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -resetToken -resetTokenExpiry"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load user profile" });
  }
};

// Update Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, email, phone },
      { new: true, runValidators: true }
    ).select("-password -resetToken -resetTokenExpiry");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user profile" });
  }
};

// Deactivate or Reactivate Account
exports.toggleAccountDeactivation = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDeleted = !user.isDeleted;
    await user.save();

    res.json({
      message: user.isDeleted
        ? "Your account has been deactivated."
        : "Your account is now active again.",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update account status" });
  }
};

// Admin Suspend/Unsuspend
exports.toggleSuspend = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      message: `User is now ${user.isSuspended ? "suspended" : "active"}`,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user suspension" });
  }
};
