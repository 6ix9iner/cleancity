const Report = require('../models/Report');
const User = require('../models/User');
const Reward = require('../models/Reward');
const { assignAgency } = require('../utils/agencyRouter');
const { generateRewardToken } = require('../utils/tokenGenerator');
const { sendReportStatusEmail, sendRewardEmail } = require('../utils/emailServices');

// POST /api/reports
const createReport = async (req, res, next) => {
  try {
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    const { description, category, address, lga, state } = req.body;

    // Handle location sent as JSON string or object with coordinates array
    if (req.body.location) {
      const location = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
      if (location.coordinates && Array.isArray(location.coordinates)) {
        longitude = location.coordinates[0];
        latitude = location.coordinates[1];
      }
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'GPS coordinates (latitude, longitude) are required.' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Invalid GPS coordinates.' });
    }

    // Collect uploaded image URLs from Cloudinary (via multer middleware)
    const images = req.files ? req.files.map((f) => f.path) : [];

    // Auto-assign to an agency
    const reportLga = lga || req.user.lga || '';
    const reportState = state || req.user.state || 'Lagos';
    const agency = await assignAgency(reportLga, category || 'other', reportState);

    const report = await Report.create({
      reportedBy: req.user._id,
      images,
      description: description || '',
      category: category || 'other',
      location: {
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON is [longitude, latitude]
        address: address || '',
        lga: reportLga,
        state: reportState,
      },
      assignedAgency: agency ? agency._id : null,
      status: agency ? 'assigned' : 'submitted',
    });

    // Increment user's total reports
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalReports: 1 } });

    await report.populate('reportedBy', 'name email');
    if (agency) await report.populate('assignedAgency', 'organizationName');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports
const getAllReports = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Citizens only see their own reports
    if (req.user.role === 'citizen') {
      filter.reportedBy = req.user._id;
    }

    // Agency sees only their assigned reports
    if (req.user.role === 'agency') {
      const Agency = require('../models/Agency');
      const agency = await Agency.findOne({ userId: req.user._id });
      if (agency) filter.assignedAgency = agency._id;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reportedBy', 'name email')
        .populate('assignedAgency', 'organizationName'),
      Report.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/my-reports
const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('assignedAgency', 'organizationName');

    res.json({ success: true, data: { reports } });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/nearby
const getNearbyReports = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // radius in metres

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'latitude and longitude are required.' });
    }

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseInt(radius),
        },
      },
    })
      .limit(50)
      .populate('reportedBy', 'name');

    res.json({ success: true, data: { reports } });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/:id
const getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedAgency', 'organizationName address');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Citizens can only view their own reports
    if (req.user.role === 'citizen' && report.reportedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/reports/:id/status
const updateReportStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    const validStatuses = ['under_review', 'assigned', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const report = await Report.findById(req.params.id).populate('reportedBy', 'name email');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    report.status = status;
    if (status === 'resolved') {
      report.resolvedAt = new Date();

      // Issue reward tokens if not already done
      if (!report.tokenIssued) {
        const tokenAmount = 10;
        const rewardToken = generateRewardToken();

        report.rewardToken = rewardToken;
        report.tokenIssued = true;

        // Increment user token balance
        await User.findByIdAndUpdate(report.reportedBy._id, {
          $inc: { tokenBalance: tokenAmount },
        });

        // Create reward record
        await Reward.create({
          user: report.reportedBy._id,
          report: report._id,
          rewardToken,
          amount: tokenAmount,
          type: 'report_verification',
          description: `Reward for resolved report #${report._id}`,
        });

        // Send reward email
        try {
          await sendRewardEmail(
            report.reportedBy.email,
            report.reportedBy.name,
            rewardToken,
            tokenAmount
          );
        } catch (e) {
          console.error('Reward email error (non-fatal):', e.message);
        }
      }
    }

    if (status === 'under_review') {
      report.verifiedAt = new Date();
    }

    await report.save();

    // Send status update email
    try {
      await sendReportStatusEmail(
        report.reportedBy.email,
        report.reportedBy.name,
        report._id,
        status
      );
    } catch (e) {
      console.error('Status email error (non-fatal):', e.message);
    }

    res.json({ success: true, message: `Report status updated to ${status}.`, data: { report } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Only the reporter or admin can delete
    if (req.user.role !== 'admin' && report.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await report.deleteOne();
    res.json({ success: true, message: 'Report deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getAllReports,
  getMyReports,
  getNearbyReports,
  getReport,
  updateReportStatus,
  deleteReport,
};