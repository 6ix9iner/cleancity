const express = require('express');
const { body, validationResult } = require('express-validator');
const agencyController = require('../controllers/agencyController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

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

// All agency routes require authentication
router.use(authMiddleware);

// ── IMPORTANT: Named routes MUST be declared before /:agencyId ────
// Otherwise Express will match "assigned-reports", "stats", "profile"
// as an agencyId param instead of treating them as named paths.

// GET /api/agencies/assigned-reports — agency officers only
router.get('/assigned-reports', requireRole('agency'), agencyController.getAssignedReports);

// GET /api/agencies/stats — agency officers only
router.get('/stats', requireRole('agency'), agencyController.getAgencyStats);

// PUT /api/agencies/profile — agency officers update their own profile
router.put(
  '/profile',
  requireRole('agency'),
  [
    body('organizationName').optional().notEmpty().withMessage('Organization name cannot be empty'),
    body('contactEmail').optional().isEmail().withMessage('Valid contact email required'),
    body('contactPhone').optional().isString(),
    body('assignedAreas').optional().isArray(),
    body('categories').optional().isArray(),
  ],
  handleValidationErrors,
  agencyController.updateAgencyProfile
);

// POST /api/agencies/register — users with role 'agency' register their org
router.post(
  '/register',
  requireRole('agency'),
  [
    body('organizationName').notEmpty().withMessage('Organization name is required'),
    body('state').optional().isString(),
    body('lga').optional().isString(),
    body('address').optional().isString(),
    body('contactPhone').optional().isString(),
    body('assignedAreas').optional().isArray(),
    body('categories').optional().isArray(),
  ],
  handleValidationErrors,
  agencyController.registerAgency
);

// GET /api/agencies — public list of agencies (filterable by ?verified=true&state=Lagos)
router.get('/', agencyController.getAllAgencies);

// ── Param routes LAST ─────────────────────────────────────────────

// GET /api/agencies/:agencyId
router.get('/:agencyId', agencyController.getAgency);

// PATCH /api/agencies/:agencyId/verify — admin only
router.patch('/:agencyId/verify', requireRole('admin'), agencyController.verifyAgency);

module.exports = router;