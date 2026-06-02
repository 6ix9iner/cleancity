const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      default: null,
    },
    rewardToken: {
      type: String,
      unique: true,  // already creates an index — don't add rewardSchema.index({ rewardToken: 1 })
      sparse: true,  // allows null/undefined without violating unique constraint
    },
    amount: {
      type: Number,
      required: true,
      default: 10,
    },
    type: {
      type: String,
      enum: ['report_verification', 'bonus', 'referral', 'special'],
      default: 'report_verification',
    },
    status: {
      type: String,
      enum: ['active', 'redeemed', 'expired'],
      default: 'active',
    },
    description: {
      type: String,
      default: '',
    },
    redeemableAt: {
      type: Date,
      default: Date.now,
    },
    redeemedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// Only index fields that don't already have unique:true in the schema definition
rewardSchema.index({ user: 1 });
rewardSchema.index({ status: 1 });

module.exports = mongoose.model('Reward', rewardSchema);