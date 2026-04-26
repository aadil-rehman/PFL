const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  plantName:   { type: String, trim: true },
  quantity:    { type: Number, default: 1, min: 1, max: 100 },
  photoUrl:    { type: String, required: true },
  description: { type: String, maxlength: 300, trim: true },

  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] },   // [longitude, latitude]
  },
  state:    { type: String, trim: true },
  district: { type: String, trim: true },
  address:  { type: String, trim: true },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  aiVerified:      { type: Boolean, default: false },
  adminVerified:   { type: Boolean, default: false },
  rejectionReason: { type: String, trim: true },

}, { timestamps: true });

// ─── Indexes ──────────────────────────────────
plantSchema.index({ coordinates: '2dsphere' });
plantSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Plant', plantSchema);