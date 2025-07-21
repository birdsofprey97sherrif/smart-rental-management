const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  houseId: { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true },
  issue: { type: String, required: true },
  status: { type: String, enum: ["pending", "in-progress", "resolved"], default: "pending" },
  // Optional: add more fields if needed
  description: { type: String },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" }
}, { timestamps: true });

module.exports = mongoose.model("MaintenanceRequest", maintenanceSchema);
