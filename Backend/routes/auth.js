const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ── Validation error handler ──────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Validation rules ──────────────────────────────────────────────
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('role').optional().isIn(['citizen', 'agency']).withMessage('Role must be citizen or agency'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Public routes ─────────────────────────────────────────────────
// IMPORTANT: Spread (...) validation arrays — passing an array directly
// causes the "next is not a function" error you saw earlier
router.post('/register', ...validateRegister, handleValidationErrors, authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', ...validateLogin, handleValidationErrors, authController.login);

// ── Protected routes ──────────────────────────────────────────────
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/profile', authMiddleware, authController.updateProfile);
router.get('/stats', authMiddleware, authController.getUserStats);

module.exports = router;