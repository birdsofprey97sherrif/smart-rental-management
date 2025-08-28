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

    // 🔑 Keep landlord reference only if you want "staff created directly under landlord"
    landlord: { type: Schema.Types.ObjectId, ref: "User" },

    // Tenant-specific
    tenantDetails: {
      nationalId: String,
      nextOfKin: String,
      currentHouseId: { type: Schema.Types.ObjectId, ref: "House" }, // THIS is the key link
      leaseSigned: { type: Boolean, default: false },
      relocationServiceOpted: { type: Boolean, default: false },
    },

    // Caretaker-specific (can also be derived from House)
    caretakerDetails: {
      housesManaged: [{ type: Schema.Types.ObjectId, ref: "House" }],
      assignedBy: { type: Schema.Types.ObjectId, ref: "User" }, // landlord
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
      isDeleted: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
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
