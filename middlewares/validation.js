// Install: npm install joi express-validator
const { body, validationResult } = require('express-validator');

// middlewares/validation.js
exports.validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('phone').isMobilePhone('any').withMessage('Invalid phone number'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be 8+ chars with uppercase, lowercase, number, and special char'),
  body('fullName').trim().isLength({ min: 2 }).escape(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Use in routes
router.post('/register', validateRegister, authController.register);