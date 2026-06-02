const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, required: true }, // number of tokens
  status: {
    type: String,
    enum: ['issued', 'redeemed', 'cancelled'],
    default: 'issued'
  },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin or agency
  redeemedAt: Date,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Token', tokenSchema);
