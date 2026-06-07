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
    // No `default: 'Point'` — otherwise Mongoose auto-creates an empty
    // { type: 'Point' } subdoc with no coordinates array, which the 2dsphere
    // index rejects ("Can't extract geo keys"). Only set when a real point exists.
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] },   // [longitude, latitude]
  },
  state:    { type: String, trim: true },
  district: { type: String, trim: true },
  address:  { type: String, trim: true },
  // Normalised slug of the planting area (derived from the free-text location),
  // used to group plants area-wise on the impact map.
  areaKey:  { type: String, trim: true },

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
// Partial index so plants submitted without a real location are simply not
// indexed (instead of failing geo-key extraction on an empty Point).
plantSchema.index(
  { coordinates: '2dsphere' },
  { partialFilterExpression: { 'coordinates.coordinates': { $exists: true } } }
);
plantSchema.index({ userId: 1, status: 1 });
plantSchema.index({ areaKey: 1, status: 1 });

module.exports = mongoose.model('Plant', plantSchema);