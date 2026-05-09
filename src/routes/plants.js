const express = require('express');
const router  = express.Router();
const {
  submitPlant,
  getAllPlants,
  getMyPlants,
  getPlantById,
  updatePlantStatus,
  getCampaignSummary,
} = require('../controllers/plantController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const imageAnalysisMiddleware = require('../ai/imageAnalysisMiddleware');
const upload = require('../config/multer');

router.post('/submit', protect, upload.single('image'), imageAnalysisMiddleware, submitPlant);
router.get('/summary', getCampaignSummary);
router.get('/all', getAllPlants);
router.get('/my', protect, getMyPlants);
router.get('/:id', getPlantById);
router.patch('/:id/status', protect, adminOnly, updatePlantStatus);

module.exports = router;