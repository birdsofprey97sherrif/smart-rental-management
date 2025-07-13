const User = require("../models/User");

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

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password -resetToken -resetTokenExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load user profile" });
  }
};