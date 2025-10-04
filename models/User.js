const mongoose = require("mongoose"); 
const bcrypt = require("bcryptjs"); 
const Schema = mongoose.Schema;
// Install: npm install speakeasy qrcode
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

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
    twoFactorSecret: String,
    twoFactorEnabled: { type: Boolean, default: false },
    passwordChangedAt: Date,
  passwordResetAttempts: { type: Number, default: 0 },
  accountLockedUntil: Date,
  passwordHistory: [{ password: String, changedAt: Date }],

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


// Password strength checker
exports.checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#]/.test(password),
    noCommon: !['password', '12345678', 'qwerty'].includes(password.toLowerCase())
  };

  const score = Object.values(checks).filter(Boolean).length;
  return {
    score: Math.min(score / 6 * 100, 100),
    checks,
    strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong'
  };
};

// Prevent password reuse
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    // Check last 5 passwords
    const recentPasswords = this.passwordHistory.slice(-5);
    for (const old of recentPasswords) {
      const isReused = await bcrypt.compare(this.password, old.password);
      if (isReused) {
        throw new Error('Cannot reuse recent passwords');
      }
    }

    // Store in history
    this.passwordHistory.push({
      password: this.password,
      changedAt: Date.now()
    });

    this.passwordChangedAt = Date.now();
  }
  next();
});

// ✅ Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Enable 2FA
exports.setupTwoFactor = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `Smart Rental (${req.user.email})`
    });

    const user = await User.findById(req.user.userId);
    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode,
      message: 'Scan QR code with Google Authenticator'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to setup 2FA' });
  }
};

// Verify 2FA token
exports.verifyTwoFactor = async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.userId);

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token
  });

  if (verified) {
    user.twoFactorEnabled = true;
    await user.save();
    res.json({ message: '2FA enabled successfully' });
  } else {
    res.status(400).json({ message: 'Invalid 2FA token' });
  }
};

module.exports = mongoose.model("User", userSchema);
