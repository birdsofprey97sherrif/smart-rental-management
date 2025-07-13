const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["tenant", "landlord", "caretaker", "agent", "admin"],
    required: true,
  },
  photo: { type: String },

  // Optional tenant-specific fields
  tenantDetails: {
    nationalId: { type: String },
    nextOfKin: { type: String },
    currentHouseId: { type: Schema.Types.ObjectId, ref: "House" },
    leaseSigned: { type: Boolean, default: false },
    relocationServiceOpted: { type: Boolean, default: false },
  },

  // Optional landlord-specific fields
  landlordDetails: {
    companyName: { type: String },
    ownedHouseIds: [{ type: Schema.Types.ObjectId, ref: "House" }]
  },

  // Optional caretaker-specific fields
  caretakerDetails: {
    housesManaged: [{ type: Schema.Types.ObjectId, ref: "House" }],
    assignedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },

  resetToken: String,
  resetTokenExpiry: Date,
  notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  isVerified: { type: Boolean, default: false },
  verifyToken: String,
  verifyTokenExpiry: Date,
  isSuspended: { type: Boolean, default: false },

  notificationPrefs: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true }
  }

}, {
  timestamps: true // automatically manage createdAt and updatedAt
});

module.exports = mongoose.model("User", userSchema);
