const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/email");
const { sendSMS } = require("../utils/sms");

// Register staff
exports.registerStaff = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    if (!["landlord", "caretaker", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid staff role" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ fullName, email, phone, password: hashedPassword, role });

    res.status(201).json({ message: `${role} registered`, user: newUser });
  } catch (err) {
    console.error('registerStaff', err);
    res.status(500).json({ message: "Failed to register staff" });
  }
};

// Get staff list
exports.getStaffList = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ["landlord", "caretaker", "admin"] } })
      .select("-password -__v")
      .sort({ createdAt: -1 });

    const totalPages = 1; // Later calculate based on query & total count
    const currentPage = 1;

    res.json({ staff, totalPages, currentPage });
  } catch (err) {
    res.status(500).json({ message: "Failed to load staff list" });
  }
};

// Toggle user suspension
exports.toggleUserSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      message: `User ${user.name} has been ${user.isSuspended ? "suspended" : "unsuspended"}.`,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user suspension" });
  }
};

// Get user profile
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

// Edit user profile
exports.editUserProfile = async (req, res) => {
  try {
    const { fullName, phone, role, suspended  } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, role, suspended  },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user profile" });
  }
};

// Send mass notification
exports.sendMassNotification = async (req, res) => {
  try {
    const { message, target, channel } = req.body;
    const filter = target === "all" ? {} : { role: target };
    const users = await User.find(filter);

    const jobs = users.map(user => {
      if (channel === "sms" && user.phone) {
        return sendSMS({ to: user.phone, message });
      } else if (channel === "email" && user.email) {
        return sendEmail({
          to: user.email,
          subject: "Important Update",
          text: message,
        });
      }
    });

    await Promise.all(jobs);
    res.json({ message: `Message sent to ${users.length} users.` });
  } catch (err) {
    res.status(500).json({ message: "Failed to send notifications" });
  }
};
