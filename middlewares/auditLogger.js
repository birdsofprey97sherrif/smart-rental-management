// middlewares/auditLogger.js
const AuditLog = require('../models/AuditLog');

exports.logAction = async (req, res, next) => {
  // Skip for GET requests
  if (req.method === 'GET') return next();

  const originalSend = res.json;

  res.json = function(data) {
    // Log after successful response
    if (res.statusCode < 400) {
      AuditLog.create({
        actionBy: req.user?.userId,
        action: `${req.method} ${req.originalUrl}`,
        details: {
          body: req.body,
          params: req.params,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      }).catch(err => console.error('Audit log failed:', err));
    }

    originalSend.call(this, data);
  };

  next();
};

// Use in main.js
app.use('/api', protectRoute, logAction);