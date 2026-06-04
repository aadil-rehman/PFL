const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title:     { type: String, trim: true, default: 'Plant For Life' },
  goal:      { type: Number, required: true, min: 1 },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

campaignSchema.index({ isActive: 1, endDate: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);
