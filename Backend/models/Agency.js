const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
  },
  registrationNumber: {
    type: String,
    trim: true,
    default: '',
  },
  state: {
    type: String,
    default: 'Lagos',
  },
  lga: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  serviceCategories: {
    type: [String],
    enum: ['illegal_dumpsite', 'overflowing_bin', 'hazardous_waste', 'other'],
    default: ['other'],
  },
  coverageAreas: {
    type: [String], // list of LGAs covered
    default: [],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  totalReportsHandled: {
    type: Number,
    default: 0,
  },
  resolvedReports: {
    type: Number,
    default: 0,
  },
  averageResolutionTime: {
    type: Number, // in hours
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Agency', agencySchema);