const ActivityLog = require("../models/ActivityLog");

// 📌 Create a new log entry
exports.createLog = async (req, res) => {
  try {
    const log = new ActivityLog({
      user: req.user._id,
      role: req.user.role,
      action: req.body.action,
      details: req.body.details || "",
      ipAddress: req.ip,
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: "Failed to create activity log", error: error.message });
  }
};

// 📌 Fetch all logs (for admin/landlord audit view)
exports.getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activity logs", error: error.message });
  }
};

// 📌 Fetch logs for a specific user
exports.getUserLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.params.userId })
      .sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user logs", error: error.message });
  }
};
