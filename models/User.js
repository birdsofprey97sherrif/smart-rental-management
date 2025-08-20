const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
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

    // 🔗 Link staff/tenants to a landlord
    landlord: { type: Schema.Types.ObjectId, ref: "User" },

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
      ownedHouseIds: [{ type: Schema.Types.ObjectId, ref: "House" }],
    },

    // Optional caretaker-specific fields
    caretakerDetails: {
      housesManaged: [{ type: Schema.Types.ObjectId, ref: "House" }],
      assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
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
      inApp: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true, // automatically manage createdAt and updatedAt
  }
);

// ✅ Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
