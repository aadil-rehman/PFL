const cloudinary = require('../config/cloudinary');
const FileModel  = require('../models/File');

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `pfl/${folder}` },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
};

const saveFileMeta = ({ url, publicId, file, relatedRecordId, relatedRecordKey, uploadedBy }) => {
  return FileModel.create({
    url,
    publicId,
    originalName:    file.originalname,
    mimetype:        file.mimetype,
    sizeBytes:       file.size,
    relatedRecordId,
    relatedRecordKey,
    uploadedBy,
  });
};

module.exports = { uploadToCloudinary, saveFileMeta };
