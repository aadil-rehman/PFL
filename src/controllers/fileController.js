const cloudinary = require('../config/cloudinary');
const FileModel  = require('../models/File');
const { uploadToCloudinary, saveFileMeta } = require('../services/fileService');

const uploadFile = async (req, res) => {
  try {
    const { relatedRecordId, relatedRecordKey } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required', data: null });
    }
    if (!relatedRecordId || !relatedRecordKey) {
      return res.status(400).json({ success: false, message: 'relatedRecordId and relatedRecordKey are required', data: null });
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
      success: true,
      message: 'File uploaded successfully',
      data: { fileId: file._id, url: file.url },
    });
  } catch (err) {
    console.error('uploadFile error:', err);
    return res.status(500).json({ success: false, message: 'File upload failed', data: null });
  }
};

const getFilesByRecord = async (req, res) => {
  try {
    const { relatedRecordId, relatedRecordKey } = req.query;

    if (!relatedRecordId || !relatedRecordKey) {
      return res.status(400).json({ success: false, message: 'relatedRecordId and relatedRecordKey are required', data: null });
    }

    const files = await FileModel.find({ relatedRecordId, relatedRecordKey, activeState: true })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, message: 'Files fetched successfully', data: { files } });
  } catch (err) {
    console.error('getFilesByRecord error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch files', data: null });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await FileModel.findOne({ _id: req.params.id, activeState: true });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found', data: null });
    }

    const isOwner = file.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this file', data: null });
    }

    await cloudinary.uploader.destroy(file.publicId);

    file.activeState = false;
    await file.save();

    return res.status(200).json({ success: true, message: 'File deleted successfully', data: null });
  } catch (err) {
    console.error('deleteFile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete file', data: null });
  }
};

module.exports = { uploadFile, getFilesByRecord, deleteFile };
