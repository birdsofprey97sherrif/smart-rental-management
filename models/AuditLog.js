const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true }, // e.g. "suspend-user", "edit-house", "delete-account"
  details: { type: Object, default: {} }, // optional extra details
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
