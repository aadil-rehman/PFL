const cloudinary              = require('../config/cloudinary');
const FileModel               = require('../models/File');
const { uploadToCloudinary, saveFileMeta } = require('../services/fileService');

const uploadFile = async (req, res) => {
  try {
    const { relatedRecordId, relatedRecordKey } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }
    if (!relatedRecordId || !relatedRecordKey) {
      return res.status(400).json({ message: 'relatedRecordId and relatedRecordKey are required' });
    }

    const result = await uploadToCloudinary(req.file.buffer, relatedRecordKey);

    const file = await saveFileMeta({
      url:             result.secure_url,
      publicId:        result.public_id,
      file:            req.file,
      relatedRecordId,
      relatedRecordKey,
      uploadedBy:      req.user._id,
    });

    return res.status(201).json({
      message: 'File uploaded successfully',
      data: { fileId: file._id, url: file.url },
    });
  } catch (err) {
    console.error('uploadFile error:', err);
    return res.status(500).json({ message: 'File upload failed' });
  }
};

const getFilesByRecord = async (req, res) => {
  try {
    const { relatedRecordId, relatedRecordKey } = req.query;

    if (!relatedRecordId || !relatedRecordKey) {
      return res.status(400).json({ message: 'relatedRecordId and relatedRecordKey are required' });
    }

    const files = await FileModel.find({ relatedRecordId, relatedRecordKey, activeState: true })
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: files });
  } catch (err) {
    console.error('getFilesByRecord error:', err);
    return res.status(500).json({ message: 'Failed to fetch files' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await FileModel.findOne({ _id: req.params.id, activeState: true });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const isOwner = file.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    await cloudinary.uploader.destroy(file.publicId);

    file.activeState = false;
    await file.save();

    return res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('deleteFile error:', err);
    return res.status(500).json({ message: 'Failed to delete file' });
  }
};

module.exports = { uploadFile, getFilesByRecord, deleteFile };
