const AuditLog = require("../models/AuditLog");

exports.logAction = async ({ actionBy, action, details = {} }) => {
  await AuditLog.create({ actionBy, action, details });
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("actionBy", "username email")
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching audit logs", error });
  }
};

exports.clearAuditLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    res.json({ message: "Audit logs cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing audit logs", error });
  }
};

exports.getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate("actionBy", "username email");
    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: "Error fetching audit log", error });
  }
};

exports.getAuditLogsByUser = async (req, res) => {
  try {
    const logs = await AuditLog.find({ actionBy: req.params.userId })
      .populate("actionBy", "username email")
      .sort({ timestamp: -1 });
    if (logs.length === 0) {
      return res.status(404).json({ message: "No audit logs found for this user" });
    }
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching audit logs for user", error });
  }
};

exports.getAuditLogsByAction = async (req, res) => {
  try {
    const logs = await AuditLog.find({ action: req.params.action })
      .populate("actionBy", "username email")
      .sort({ timestamp: -1 });
    if (logs.length === 0) {
      return res.status(404).json({ message: "No audit logs found for this action" });
    }
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching audit logs by action", error });
  }
};