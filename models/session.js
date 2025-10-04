// models/Session.js
const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  deviceInfo: {
    browser: String,
    os: String,
    ip: String,
    location: String
  },
  lastActivity: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

// Track active sessions
exports.createSession = async (userId, req) => {
  const session = await Session.create({
    userId,
    token: jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' }),
    deviceInfo: {
      browser: req.headers['user-agent'],
      ip: req.ip,
      os: req.headers['sec-ch-ua-platform']
    },
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });

  return session;
};

// View active sessions
exports.getActiveSessions = async (req, res) => {
  const sessions = await Session.find({ 
    userId: req.user.userId,
    expiresAt: { $gt: Date.now() }
  }).sort({ lastActivity: -1 });

  res.json({ sessions });
};

// Logout from all devices
exports.logoutAllDevices = async (req, res) => {
  await Session.deleteMany({ userId: req.user.userId });
  res.json({ message: 'Logged out from all devices' });
};