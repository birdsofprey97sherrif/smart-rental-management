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

// Register Staff (by Landlord/Admin)
exports.registerStaff = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    if (!["caretaker", "admin", "landlord"].includes(role)) {
      return res.status(400).json({ message: "Invalid staff role" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const staff = await User.create({
      fullName,
      email,
      phone,
      password, // make sure your User model hashes this in pre-save
      role,
      landlord: req.user.userId, // link staff to the landlord creating them
    });

    res.status(201).json({
      message: "Staff registered successfully",
      staff: {
        id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to register staff" });
  }
};

// Get Staff under a landlord
exports.getStaffForLandlord = async (req, res) => {
  try {
    const staff = await User.find({ landlord: req.user.userId, role: { $in: ["caretaker", "admin"] } })
      .select("-password -resetToken -resetTokenExpiry");
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch staff" });
  }
};

// Register Tenant (by Landlord)
exports.registerTenant = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const tenant = await User.create({
      fullName,
      email,
      phone,
      password,
      role: "tenant",
      landlord: req.user.userId, // tenant is linked to landlord
    });

    res.status(201).json({
      message: "Tenant registered successfully",
      tenant: {
        id: tenant._id,
        fullName: tenant.fullName,
        email: tenant.email,
        role: tenant.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to register tenant" });
  }
};

// Get Tenants under a landlord
exports.getTenantsForLandlord = async (req, res) => {
  try {
    const tenants = await User.find({ landlord: req.user.userId, role: "tenant" })
      .select("-password -resetToken -resetTokenExpiry");
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
};
