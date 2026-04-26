const express = require('express');
const router  = express.Router();
const {
  submitPlant,
  getAllPlants,
  getMyPlants,
  getPlantById,
  updatePlantStatus,
} = require('../controllers/plantController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const imageAnalysisMiddleware = require('../ai/imageAnalysisMiddleware');

router.post('/', protect, imageAnalysisMiddleware, submitPlant);
router.get('/', getAllPlants);
router.get('/my', protect, getMyPlants);
router.get('/:id', getPlantById);
router.patch('/:id/status', protect, adminOnly, updatePlantStatus);

module.exports = router;