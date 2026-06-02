const express = require('express');
const { body, validationResult } = require('express-validator');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

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

// All report routes require a logged-in user
router.use(authMiddleware);

// ── IMPORTANT: Specific named routes MUST come before /:id ────────
// If /nearby or /my-reports were after /:id, Express would treat
// "nearby" and "my-reports" as an ID param and break everything.

// GET /api/reports/nearby?latitude=6.5&longitude=3.3&radius=5000
router.get('/nearby', reportController.getNearbyReports);

// GET /api/reports/my-reports
router.get('/my-reports', reportController.getMyReports);

// POST /api/reports — multipart/form-data with up to 5 images
router.post(
  '/',
  upload.array('images', 5),
  [
    body('category')
      .isIn(['illegal_dumpsite', 'overflowing_bin', 'hazardous_waste', 'other'])
      .withMessage('category must be: illegal_dumpsite, overflowing_bin, hazardous_waste, or other'),
    body('latitude')
      .notEmpty().withMessage('latitude is required')
      .isFloat({ min: -90, max: 90 }).withMessage('latitude must be a valid number'),
    body('longitude')
      .notEmpty().withMessage('longitude is required')
      .isFloat({ min: -180, max: 180 }).withMessage('longitude must be a valid number'),
    body('description').optional().isString(),
    body('address').optional().isString(),
    body('lga').optional().isString(),
    body('state').optional().isString(),
  ],
  handleValidationErrors,
  reportController.createReport
);

// GET /api/reports — admin sees all, agency sees only their assigned reports
router.get('/', requireRole('admin', 'agency'), reportController.getAllReports);

// GET /api/reports/:id
router.get('/:id', reportController.getReport);

// PATCH /api/reports/:id/status — agency officers and admins only
router.patch(
  '/:id/status',
  requireRole('admin', 'agency'),
  [
    body('status')
      .isIn(['under_review', 'assigned', 'in_progress', 'resolved', 'rejected'])
      .withMessage('status must be: under_review, assigned, in_progress, resolved, or rejected'),
    body('rejectionReason').optional().isString(),
  ],
  handleValidationErrors,
  reportController.updateReportStatus
);

// DELETE /api/reports/:id — admin or original reporter only
router.delete('/:id', reportController.deleteReport);

module.exports = router;