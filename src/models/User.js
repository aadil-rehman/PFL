const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String },
    profilePhoto: { type: String },
    state: { type: String },
    district: { type: String },
    address: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    totalPlants: { type: Number, default: 0 },
    activeState: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
