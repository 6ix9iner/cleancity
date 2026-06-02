const Reward = require('../models/Reward');
const User = require('../models/User');
const { generateRewardToken } = require('../utils/tokenGenerator');

// GET /api/rewards/my-rewards
const getMyRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('report', 'category status createdAt');

    res.json({ success: true, data: { rewards, tokenBalance: req.user.tokenBalance } });
  } catch (error) {
    next(error);
  }
};

// GET /api/rewards/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const leaders = await User.find({ role: 'citizen', tokenBalance: { $gt: 0 } })
      .select('name tokenBalance totalReports state')
      .sort({ tokenBalance: -1 })
      .limit(20);

    res.json({ success: true, data: { leaderboard: leaders } });
  } catch (error) {
    next(error);
  }
};

// GET /api/rewards/:rewardId
const getReward = async (req, res, next) => {
  try {
    const reward = await Reward.findById(req.params.rewardId).populate('report', 'category status');

    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found.' });
    }

    // Ensure citizen can only see their own rewards
    if (req.user.role === 'citizen' && reward.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: { reward } });
  } catch (error) {
    next(error);
  }
};

// POST /api/rewards/redeem
const redeemTokens = async (req, res, next) => {
  try {
    const { rewardToken } = req.body;

    if (!rewardToken) {
      return res.status(400).json({ success: false, message: 'Reward token is required.' });
    }

    const reward = await Reward.findOne({ rewardToken, user: req.user._id });

    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward token not found.' });
    }

    if (reward.status === 'redeemed') {
      return res.status(400).json({ success: false, message: 'Token already redeemed.' });
    }

    if (reward.status === 'expired' || reward.expiresAt < new Date()) {
      reward.status = 'expired';
      await reward.save();
      return res.status(400).json({ success: false, message: 'Token has expired.' });
    }

    if (req.user.tokenBalance < reward.amount) {
      return res.status(400).json({ success: false, message: 'Insufficient token balance.' });
    }

    // Deduct tokens and mark as redeemed
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenBalance: -reward.amount } });

    reward.status = 'redeemed';
    reward.redeemedAt = new Date();
    await reward.save();

    res.json({ success: true, message: `Token redeemed. ${reward.amount} tokens deducted.`, data: { reward } });
  } catch (error) {
    next(error);
  }
};

// POST /api/rewards/bonus  (admin only)
const awardBonus = async (req, res, next) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: 'userId and amount are required.' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const rewardToken = generateRewardToken();

    await Promise.all([
      Reward.create({
        user: userId,
        rewardToken,
        amount: parseInt(amount),
        type: 'bonus',
        description: description || 'Admin bonus award',
      }),
      User.findByIdAndUpdate(userId, { $inc: { tokenBalance: parseInt(amount) } }),
    ]);

    res.json({
      success: true,
      message: `${amount} bonus tokens awarded to ${targetUser.name}.`,
      data: { rewardToken },
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/rewards/my-tokens — token balance + individual token list
const getMyTokens = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).select('tokenBalance');

    const tokens = await Reward.find({
      user: req.user._id,
      status: { $in: ['active', 'redeemed'] },
    })
      .select('rewardToken amount type status createdAt redeemedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { tokenBalance: user.tokenBalance, tokens },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyRewards, getMyTokens, getLeaderboard, getReward, redeemTokens, awardBonus };