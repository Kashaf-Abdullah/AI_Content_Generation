const { body, validationResult } = require('express-validator');

// Common validation chains
exports.validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

exports.validatePostGenerate = [
  body('textInput').trim().notEmpty().isLength({ max: 500 }).withMessage('Text required (max 500 chars)'),
  body('platform').isIn(['instagram', 'whatsapp', 'linkedin']).withMessage('Invalid platform'),
  body('tone').isIn(['casual', 'professional', 'salesy', 'funny']).withMessage('Invalid tone')
];

exports.validateErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
