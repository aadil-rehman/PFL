const Plant    = require('../models/Plant');
const User     = require('../models/User');
const Campaign = require('../models/Campaign');
const { uploadToCloudinary, saveFileMeta } = require('../services/fileService');

// Mission defaults — used by the summary endpoint when no Campaign document has
// been created yet, so the homepage always shows live tree counts against the
// real goal: 1,00,000 trees by 5 June 2027.
const DEFAULT_CAMPAIGN = {
  _id:       null,
  title:     'Pollution Free Loni Mission',
  goal:      100000,
  startDate: new Date('2025-06-05T00:00:00.000Z'),
  endDate:   new Date('2027-06-05T00:00:00.000Z'),
};

// Turn a free-text location ("Loni, UP", "Tila Shahbazpur") into a stable
// slug we can group and look areas up by. Falls back to 'other' when the text
// has no usable latin characters (e.g. Devanagari-only input).
const slugifyArea = (text = '') =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'other';

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

    const areaName = (district || address || state || '').trim();

    const plant = await Plant.create({
      userId: req.user._id,
      plantName,
      quantity:    quantity || 1,
      photoUrl:    cloudinaryResult.secure_url,
      description,
      state,
      district,
      address,
      areaKey:     areaName ? slugifyArea(areaName) : undefined,
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

    if (plant.status === 'approved') {
      await syncUserTotalPlants(req.user._id);
    }

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

const getCampaignSummary = async (req, res) => {
  try {
    // Fall back to the mission defaults so the campaign banner works even before
    // an admin creates a Campaign document in the database.
    const campaign = (await Campaign.findOne({ isActive: true }).sort({ endDate: -1 })) || DEFAULT_CAMPAIGN;

    const [plantsAgg, participants, states] = await Promise.all([
      Plant.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$quantity' } } },
      ]),
      Plant.distinct('userId', { status: 'approved' }),
      Plant.distinct('state', { status: 'approved', state: { $nin: [null, ''] } }),
    ]);

    const treesPlanted = plantsAgg[0]?.total || 0;
    const goal         = campaign.goal;
    const toGo         = Math.max(goal - treesPlanted, 0);

    const now      = new Date();
    const endDate  = new Date(campaign.endDate);
    const diffMs   = Math.max(endDate - now, 0);
    const totalSec = Math.floor(diffMs / 1000);
    const days     = Math.floor(totalSec / 86400);
    const hours    = Math.floor((totalSec % 86400) / 3600);
    const minutes  = Math.floor((totalSec % 3600) / 60);

    const progressPercent = goal > 0
      ? Math.min(Number(((treesPlanted / goal) * 100).toFixed(2)), 100)
      : 0;

    return res.status(200).json({
      success: true,
      message: 'Campaign summary fetched successfully',
      data: {
        campaign: {
          id:        campaign._id,
          title:     campaign.title,
          goal,
          startDate: campaign.startDate,
          endDate:   campaign.endDate,
        },
        treesPlanted,
        toGo,
        participants:   participants.length,
        statesCovered:  states.length,
        progressPercent,
        timeRemaining: {
          days,
          hours,
          minutes,
          totalMs: diffMs,
          isEnded: diffMs === 0,
        },
      },
    });
  } catch (err) {
    console.error('getCampaignSummary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch campaign summary', data: null });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page, 10)  || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip  = (page - 1) * limit;

    const baseFilter = { activeState: true, totalPlants: { $gt: 0 } };

    const [users, total] = await Promise.all([
      User.find(baseFilter)
        .select('name profilePhoto state district totalPlants')
        .sort({ totalPlants: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(baseFilter),
    ]);

    const leaderboard = users.map((u, idx) => ({
      rank:         skip + idx + 1,
      userId:       u._id,
      name:         u.name,
      profilePhoto: u.profilePhoto,
      state:        u.state,
      district:     u.district,
      totalPlants:  u.totalPlants || 0,
    }));

    return res.status(200).json({
      success: true,
      message: 'Leaderboard fetched successfully',
      data: {
        leaderboard,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch leaderboard', data: null });
  }
};

const getMyLeaderboardRank = async (req, res) => {
  try {
    const meDoc = await User.findById(req.user._id)
      .select('name profilePhoto state district totalPlants activeState')
      .lean();

    if (!meDoc) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    const myTotal = meDoc.totalPlants || 0;
    const rank = myTotal > 0 && meDoc.activeState
      ? (await User.countDocuments({
          activeState: true,
          $or: [
            { totalPlants: { $gt: myTotal } },
            { totalPlants: myTotal, _id: { $lt: meDoc._id } },
          ],
        })) + 1
      : null;

    return res.status(200).json({
      success: true,
      message: 'Your leaderboard rank fetched successfully',
      data: {
        rank,
        userId:       meDoc._id,
        name:         meDoc.name,
        profilePhoto: meDoc.profilePhoto,
        state:        meDoc.state,
        district:     meDoc.district,
        totalPlants:  myTotal,
      },
    });
  } catch (err) {
    console.error('getMyLeaderboardRank error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch your rank', data: null });
  }
};

const getImpactMap = async (req, res) => {
  try {
    const minLng = parseFloat(req.query.minLng);
    const minLat = parseFloat(req.query.minLat);
    const maxLng = parseFloat(req.query.maxLng);
    const maxLat = parseFloat(req.query.maxLat);
    const zoom   = Math.min(Math.max(parseInt(req.query.zoom, 10) || 5, 1), 20);
    const limit  = Math.min(Math.max(parseInt(req.query.limit, 10) || 1000, 1), 5000);

    const hasBbox = [minLng, minLat, maxLng, maxLat].every(Number.isFinite);

    const match = { status: 'approved', 'coordinates.coordinates': { $exists: true, $ne: [] } };
    if (hasBbox) {
      match.coordinates = {
        $geoWithin: {
          $box: [[minLng, minLat], [maxLng, maxLat]],
        },
      };
    }

    if (zoom >= 12) {
      const plants = await Plant.find(match)
        .select('plantName photoUrl state district coordinates createdAt')
        .limit(limit)
        .lean();

      return res.status(200).json({
        success: true,
        message: 'Impact map points fetched successfully',
        data: {
          mode: 'points',
          zoom,
          count: plants.length,
          points: plants.map(p => ({
            id:        p._id,
            plantName: p.plantName,
            photoUrl:  p.photoUrl,
            state:     p.state,
            district:  p.district,
            lng:       p.coordinates?.coordinates?.[0],
            lat:       p.coordinates?.coordinates?.[1],
            createdAt: p.createdAt,
          })),
        },
      });
    }

    const gridSize = zoom >= 9 ? 0.1
                   : zoom >= 7 ? 0.5
                   : zoom >= 5 ? 1
                   : zoom >= 3 ? 2.5
                   :              5;

    const clusters = await Plant.aggregate([
      { $match: match },
      {
        $project: {
          quantity: 1,
          lng: { $arrayElemAt: ['$coordinates.coordinates', 0] },
          lat: { $arrayElemAt: ['$coordinates.coordinates', 1] },
        },
      },
      {
        $group: {
          _id: {
            gx: { $floor: { $divide: ['$lng', gridSize] } },
            gy: { $floor: { $divide: ['$lat', gridSize] } },
          },
          count:  { $sum: { $ifNull: ['$quantity', 1] } },
          avgLng: { $avg: '$lng' },
          avgLat: { $avg: '$lat' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Impact map clusters fetched successfully',
      data: {
        mode: 'clusters',
        zoom,
        gridSize,
        count: clusters.length,
        clusters: clusters.map(c => ({
          lng:   c.avgLng,
          lat:   c.avgLat,
          count: c.count,
        })),
      },
    });
  } catch (err) {
    console.error('getImpactMap error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch impact map', data: null });
  }
};

// Area-wise impact: group approved plants by their slug so the map can show
// "where we planted" without needing real coordinates from users.
const getImpactAreas = async (req, res) => {
  try {
    const areas = await Plant.aggregate([
      { $match: { status: 'approved', areaKey: { $exists: true, $nin: [null, ''] } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id:          '$areaKey',
          name:         { $first: '$district' },
          state:        { $first: '$state' },
          treeCount:    { $sum: { $ifNull: ['$quantity', 1] } },
          entries:      { $sum: 1 },
          latestDate:   { $first: '$createdAt' },
          latestUser:   { $first: '$userId' },
          participants: { $addToSet: '$userId' },
        },
      },
      { $sort: { treeCount: -1 } },
      {
        $lookup: {
          from:         'users',
          localField:   'latestUser',
          foreignField: '_id',
          as:           'planter',
        },
      },
    ]);

    const data = areas.map((a) => ({
      id:           a._id,
      name:         a.name || a._id,
      state:        a.state || '',
      treeCount:    a.treeCount,
      participants: a.participants.length,
      planter:      a.planter?.[0]?.name || 'A planter',
      date:         a.latestDate,
    }));

    return res.status(200).json({
      success: true,
      message: 'Impact areas fetched successfully',
      data: { areas: data, total: data.reduce((s, a) => s + a.treeCount, 0) },
    });
  } catch (err) {
    console.error('getImpactAreas error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch impact areas', data: null });
  }
};

// Every tree planted in a single area (for the area detail page).
const getAreaTrees = async (req, res) => {
  try {
    const { areaKey } = req.params;

    const plants = await Plant.find({ areaKey, status: 'approved' })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    if (!plants.length) {
      return res.status(404).json({ success: false, message: 'Area not found', data: null });
    }

    const treeCount = plants.reduce((s, p) => s + (p.quantity || 1), 0);

    const trees = plants.map((p) => ({
      id:        p._id,
      species:   p.plantName || 'Tree',
      quantity:  p.quantity || 1,
      photoUrl:  p.photoUrl,
      planter:   p.userId?.name || 'A planter',
      date:      p.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: 'Area trees fetched successfully',
      data: {
        area: {
          id:        areaKey,
          name:      plants[0].district || areaKey,
          state:     plants[0].state || '',
          planter:   plants[plants.length - 1].userId?.name || 'A planter',
          date:      plants[plants.length - 1].createdAt,
          treeCount,
        },
        trees,
      },
    });
  } catch (err) {
    console.error('getAreaTrees error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch area trees', data: null });
  }
};

module.exports = { submitPlant, getAllPlants, getMyPlants, getPlantById, updatePlantStatus, getCampaignSummary, getLeaderboard, getMyLeaderboardRank, getImpactMap, getImpactAreas, getAreaTrees };
