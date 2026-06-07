const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    url:             { type: String, required: true },
    publicId:        { type: String, required: true },  // Cloudinary public ID (needed for delete/transform)
    originalName:    { type: String },
    mimetype:        { type: String },
    sizeBytes:       { type: Number },

    relatedRecordId:  { type: mongoose.Schema.Types.ObjectId, required: true },
    relatedRecordKey: {
      type: String,
      required: true,
      enum: ['plant', 'user_profile'],  // extend as new entities are added
    },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activeState: { type: Boolean, default: true },
  },
  { timestamps: true }
);

fileSchema.index({ relatedRecordId: 1, relatedRecordKey: 1 });

module.exports = mongoose.model('File', fileSchema);
