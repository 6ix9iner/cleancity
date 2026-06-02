const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateVerificationCode } = require('../utils/tokenGenerator');
const { sendVerificationEmail } = require('../utils/emailServices');

// Generate a signed JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, state, lga } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Only allow citizen or agency self-registration (admin must be seeded manually)
    const allowedRoles = ['citizen', 'agency'];
    const userRole = allowedRoles.includes(role) ? role : 'citizen';

    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
      state: state || 'Lagos',
      lga: lga || '',
      verificationCode,
      verificationExpires,
    });

    // Send verification email (non-blocking — won't crash registration if email fails)
    try {
      await sendVerificationEmail(email, name, verificationCode);
    } catch (emailErr) {
      console.error('Email send error (non-fatal):', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Check your email for a verification code.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-email
const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required.' });
    }

    const user = await User.findOne({ email }).select('+verificationCode +verificationExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified.' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    if (user.verificationExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Verification code expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
 
    // Select password explicitly — it has select:false in the schema
    const user = await User.findOne({ email }).select('+password');
 
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
 
    // matchPassword is the method name defined in User.js
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
 
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
    }
 
    const token = signToken(user._id);
 
    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tokenBalance: user.tokenBalance,
          totalReports: user.totalReports,
          state: user.state,
          lga: user.lga,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, state, lga } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, state, lga },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Profile updated.', data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/stats
const getUserStats = async (req, res, next) => {
  try {
    const Report = require('../models/Report');
    const Reward = require('../models/Reward');

    const [totalReports, resolvedReports, totalRewards] = await Promise.all([
      Report.countDocuments({ reportedBy: req.user._id }),
      Report.countDocuments({ reportedBy: req.user._id, status: 'resolved' }),
      Reward.countDocuments({ user: req.user._id, status: 'active' }),
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        resolvedReports,
        totalRewards,
        tokenBalance: req.user.tokenBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyEmail, login, getCurrentUser, updateProfile, getUserStats };