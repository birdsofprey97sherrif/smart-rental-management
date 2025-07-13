const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const visitRequestSchema = new Schema({
  houseId: { type: Schema.Types.ObjectId, ref: "House", required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  requestedTo: { type: Schema.Types.ObjectId, ref: "User" }, // caretaker/landlord
  message: { type: String }, // optional note from tenant
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending",
  },
  scheduledDate: { type: Date }, // optional date
}, { timestamps: true });

module.exports = mongoose.model("VisitRequest", visitRequestSchema);
