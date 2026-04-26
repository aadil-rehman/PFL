const Plant = require('../models/Plant');
const User  = require('../models/User');

// ─── Helper: update user's totalPlants count ──────────────────────
const syncUserTotalPlants = async (userId) => {
  const result = await Plant.aggregate([
    { $match: { userId, status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ]);
  const total = result[0]?.total || 0;
  await User.findByIdAndUpdate(userId, { totalPlants: total });
};

// Submit a new plant (protected)
const submitPlant = async (req, res) => {
  try {
    const {
      plantName,
      quantity,
      photoUrl,
      description,
      longitude,
      latitude,
      state,
      district,
      address,
    } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ message: 'photoUrl is required' });
    }

    const { isTree, confidence, reason } = req.aiResult || { isTree: true, confidence: 1.0, reason: null };

    const plant = await Plant.create({
      userId: req.user._id,
      plantName,
      quantity:    quantity || 1,
      photoUrl,
      description,
      state,
      district,
      address,
      coordinates: longitude && latitude
        ? { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] }
        : undefined,
      status:          isTree ? 'approved' : 'rejected',
      aiVerified:      isTree,
      rejectionReason: isTree ? undefined : reason,
    });

    return res.status(201).json({
      message: isTree ? 'Plant submitted successfully' : 'Submission rejected: no tree detected in image',
      data: plant,
    });
  } catch (err) {
    console.error('submitPlant error:', err);
    return res.status(500).json({ message: 'Failed to submit plant' });
  }
};


// All approved plants (public) with pagination
const getAllPlants = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    // Optional filters
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
      data: plants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('getAllPlants error:', err);
    return res.status(500).json({ message: 'Failed to fetch plants' });
  }
};


// Current user's submissions (protected)
const getMyPlants = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;  // filter by status optionally

    const [plants, total] = await Promise.all([
      Plant.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Plant.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: plants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('getMyPlants error:', err);
    return res.status(500).json({ message: 'Failed to fetch your plants' });
  }
};


// Single plant detail (public)
const getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id)
      .populate('userId', 'name profilePhoto district state');

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    return res.status(200).json({ data: plant });
  } catch (err) {
    console.error('getPlantById error:', err);
    return res.status(500).json({ message: 'Failed to fetch plant' });
  }
};

// Approve or reject a plant (admin only)
const updatePlantStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'rejectionReason is required when rejecting' });
    }

    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    if (plant.status !== 'pending') {
      return res.status(400).json({ message: `Plant already ${plant.status}` });
    }

    plant.status        = status;
    plant.adminVerified = status === 'approved';
    if (rejectionReason) plant.rejectionReason = rejectionReason;
    await plant.save();

    // Sync totalPlants on user after status change
    await syncUserTotalPlants(plant.userId);

    return res.status(200).json({
      message: `Plant ${status} successfully`,
      data: plant,
    });
  } catch (err) {
    console.error('updatePlantStatus error:', err);
    return res.status(500).json({ message: 'Failed to update plant status' });
  }
};

module.exports = {
  submitPlant,
  getAllPlants,
  getMyPlants,
  getPlantById,
  updatePlantStatus,
};