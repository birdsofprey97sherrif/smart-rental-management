// utils/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Store refresh tokens in database
const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdByIp: String,
  revokedAt: Date,
  revokedByIp: String,
  replacedByToken: String
}, { timestamps: true });

// Generate token pair
exports.generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { userId, tokenId: crypto.randomBytes(16).toString('hex') },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Add refresh token endpoint
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const storedToken = await RefreshToken.findOne({ 
      userId: decoded.userId, 
      token: refreshToken,
      expiresAt: { $gt: Date.now() },
      revokedAt: null
    });

    if (!storedToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.userId);
    const tokens = generateTokens(user._id, user.role);

    // Revoke old token
    storedToken.revokedAt = Date.now();
    storedToken.replacedByToken = tokens.refreshToken;
    await storedToken.save();

    // Save new refresh token
    await RefreshToken.create({
      userId: user._id,
      token: tokens.refreshToken,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      createdByIp: req.ip
    });

    res.json(tokens);
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};