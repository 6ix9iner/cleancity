const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  images: [{ type: String }], // Cloudinary URLs
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['illegal_dumpsite', 'overflowing_bin', 'hazardous_waste', 'other'],
    default: 'other',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: { type: String, default: '' },
    lga: { type: String, default: '' },
    state: { type: String, default: 'Lagos' },
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'],
    default: 'submitted',
  },
  assignedAgency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    default: null,
  },
  rewardToken: {
    type: String,
    default: null,
  },
  tokenIssued: {
    type: Boolean,
    default: false,
  },
  verifiedAt: { type: Date },
  resolvedAt: { type: Date },
}, { timestamps: true });

// Geospatial index — required for $near queries
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);