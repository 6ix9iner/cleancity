const express = require('express');
const { body, validationResult } = require('express-validator');
const rewardController = require('../controllers/rewardController');
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

// All reward routes require authentication
router.use(authMiddleware);

// ── IMPORTANT: Named routes MUST be declared before /:rewardId ────

// GET /api/rewards/my-rewards — citizen's full reward history
router.get('/my-rewards', rewardController.getMyRewards);

// GET /api/rewards/my-tokens — citizen's token balance + token list
router.get('/my-tokens', rewardController.getMyTokens);

// GET /api/rewards/leaderboard — top citizens by tokens earned
router.get('/leaderboard', rewardController.getLeaderboard);

// POST /api/rewards/redeem — citizen redeems their tokens
router.post(
  '/redeem',
  [
    body('amount')
      .isInt({ min: 1 })
      .withMessage('amount must be a positive integer'),
    body('redemptionType')
      .optional()
      .isString()
      .withMessage('redemptionType must be a string'),
  ],
  handleValidationErrors,
  rewardController.redeemTokens
);

// POST /api/rewards/bonus — admin awards bonus tokens to a citizen
router.post(
  '/bonus',
  requireRole('admin'),
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('amount')
      .isInt({ min: 1 })
      .withMessage('amount must be a positive integer'),
    body('description').optional().isString(),
  ],
  handleValidationErrors,
  rewardController.awardBonus
);

// ── Param route LAST ──────────────────────────────────────────────

// GET /api/rewards/:rewardId — get a single reward by ID
router.get('/:rewardId', rewardController.getReward);

module.exports = router;