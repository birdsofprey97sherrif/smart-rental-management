const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const relocationRequestSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  houseId: { type: Schema.Types.ObjectId, ref: "House", required: true },
  distanceKm: Number,
  floorNumber: Number,
  houseSize: { type: String }, // small, medium, large
  estimatedCost: Number,
  driverId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  status: {
    type: String,
    enum: ["pending", "approved", "assigned", "completed", "declined"],
    default: "pending"
  },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  ratedByTenant: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model("RelocationRequest", relocationRequestSchema);
