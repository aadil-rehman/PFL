const Plant = require('../models/Plant');
const User  = require('../models/User');
const { uploadToCloudinary, saveFileMeta } = require('../services/fileService');

const syncUserTotalPlants = async (userId) => {
  const result = await Plant.aggregate([
    { $match: { userId, status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ]);
  const total = result[0]?.total || 0;
  await User.findByIdAndUpdate(userId, { totalPlants: total });
};

const submitPlant = async (req, res) => {
  try {
    const { plantName, quantity, description, longitude, latitude, state, district, address } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Plant image is required', data: null });
    }

    const { isTree } = req.aiResult || { isTree: true };
    if (!isTree) {
      return res.status(400).json({ success: false, message: 'Tree is not present in uploaded image', data: null });
    }

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'plant');

    const plant = await Plant.create({
      userId: req.user._id,
      plantName,
      quantity:    quantity || 1,
      photoUrl:    cloudinaryResult.secure_url,
      description,
      state,
      district,
      address,
      coordinates: longitude && latitude
        ? { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] }
        : undefined,
      status:     'approved',
      aiVerified: true,
    });

    await saveFileMeta({
      url:              cloudinaryResult.secure_url,
      publicId:         cloudinaryResult.public_id,
      file:             req.file,
      relatedRecordId:  plant._id,
      relatedRecordKey: 'plant',
      uploadedBy:       req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Plant submitted successfully', data: { plant } });
  } catch (err) {
    console.error('submitPlant error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit plant', data: null });
  }
};

const getAllPlants = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const filter = { status: 'approved' };
    if (req.query.district) filter.district = req.query.district;
    if (req.query.state)    filter.state    = req.query.state;

    const [plants, total] = await Promise.all([
      Plant.find(filter)
        .populate('userId', 'name profilePhoto district state')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Plant.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Plants fetched successfully',
      data: {
        plants,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    console.error('getAllPlants error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch plants', data: null });
  }
};

const getMyPlants = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [plants, total] = await Promise.all([
      Plant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Plant.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Plants fetched successfully',
      data: {
        plants,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    console.error('getMyPlants error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch your plants', data: null });
  }
};

const getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id)
      .populate('userId', 'name profilePhoto district state');

    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found', data: null });
    }

    return res.status(200).json({ success: true, message: 'Plant fetched successfully', data: { plant } });
  } catch (err) {
    console.error('getPlantById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch plant', data: null });
  }
};

const updatePlantStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected', data: null });
    }
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ success: false, message: 'rejectionReason is required when rejecting', data: null });
    }

    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found', data: null });
    }
    if (plant.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Plant already ${plant.status}`, data: null });
    }

    plant.status        = status;
    plant.adminVerified = status === 'approved';
    if (rejectionReason) plant.rejectionReason = rejectionReason;
    await plant.save();

    await syncUserTotalPlants(plant.userId);

    return res.status(200).json({ success: true, message: `Plant ${status} successfully`, data: { plant } });
  } catch (err) {
    console.error('updatePlantStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update plant status', data: null });
  }
};

module.exports = { submitPlant, getAllPlants, getMyPlants, getPlantById, updatePlantStatus };
