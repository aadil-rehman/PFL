const mongoose = require('mongoose');

const authSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    phone: { type: String, required: true },
    otpHash: { type: String },
    otpExpiry: { type: Date },
    otpVerified: { type: Boolean, default: false },
    token: { type: String },
    loginAt: { type: Date },
    logoutAt: { type: Date },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
    deviceInfo: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    activeState: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuthSession', authSessionSchema);
