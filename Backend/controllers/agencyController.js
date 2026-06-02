const Agency = require('../models/Agency');
const User = require('../models/User');
const Report = require('../models/Report');

// POST /api/agencies/register
const registerAgency = async (req, res, next) => {
  try {
    const { organizationName, registrationNumber, state, lga, address, description, serviceCategories, coverageAreas } = req.body;

    if (req.user.role !== 'agency') {
      return res.status(403).json({ success: false, message: 'Only agency accounts can register an agency profile.' });
    }

    const existing = await Agency.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Agency profile already exists for this account.' });
    }

    const agency = await Agency.create({
      userId: req.user._id,
      organizationName,
      registrationNumber: registrationNumber || '',
      state: state || 'Lagos',
      lga: lga || '',
      address: address || '',
      description: description || '',
      serviceCategories: serviceCategories || ['other'],
      coverageAreas: coverageAreas || [],
    });

    res.status(201).json({ success: true, message: 'Agency registered. Awaiting admin verification.', data: { agency } });
  } catch (error) {
    next(error);
  }
};

// GET /api/agencies
const getAllAgencies = async (req, res, next) => {
  try {
    const { verified, state } = req.query;
    const filter = {};
    if (verified !== undefined) filter.verified = verified === 'true';
    if (state) filter.state = state;

    const agencies = await Agency.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { agencies } });
  } catch (error) {
    next(error);
  }
};

// GET /api/agencies/:agencyId
const getAgency = async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.params.agencyId).populate('userId', 'name email');
    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency not found.' });
    }
    res.json({ success: true, data: { agency } });
  } catch (error) {
    next(error);
  }
};

// GET /api/agencies/assigned-reports
const getAssignedReports = async (req, res, next) => {
  try {
    const agency = await Agency.findOne({ userId: req.user._id });
    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency profile not found.' });
    }

    const { status } = req.query;
    const filter = { assignedAgency: agency._id };
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email');

    res.json({ success: true, data: { reports } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/agencies/profile
const updateAgencyProfile = async (req, res, next) => {
  try {
    const { organizationName, address, description, serviceCategories, coverageAreas } = req.body;

    const agency = await Agency.findOneAndUpdate(
      { userId: req.user._id },
      { organizationName, address, description, serviceCategories, coverageAreas },
      { new: true, runValidators: true }
    );

    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency profile not found.' });
    }

    res.json({ success: true, message: 'Profile updated.', data: { agency } });
  } catch (error) {
    next(error);
  }
};

// GET /api/agencies/stats
const getAgencyStats = async (req, res, next) => {
  try {
    const agency = await Agency.findOne({ userId: req.user._id });
    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency profile not found.' });
    }

    const [total, resolved, inProgress] = await Promise.all([
      Report.countDocuments({ assignedAgency: agency._id }),
      Report.countDocuments({ assignedAgency: agency._id, status: 'resolved' }),
      Report.countDocuments({ assignedAgency: agency._id, status: 'in_progress' }),
    ]);

    res.json({
      success: true,
      data: {
        totalAssigned: total,
        resolved,
        inProgress,
        pending: total - resolved - inProgress,
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) + '%' : '0%',
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/agencies/:agencyId/verify  (admin only)
const verifyAgency = async (req, res, next) => {
  try {
    const agency = await Agency.findByIdAndUpdate(
      req.params.agencyId,
      { verified: true },
      { new: true }
    );

    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency not found.' });
    }

    res.json({ success: true, message: 'Agency verified.', data: { agency } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerAgency,
  getAllAgencies,
  getAgency,
  getAssignedReports,
  updateAgencyProfile,
  getAgencyStats,
  verifyAgency,
};