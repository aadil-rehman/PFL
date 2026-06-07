const express  = require('express');
const router   = express.Router();
const upload   = require('../config/multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadFile, getFilesByRecord, deleteFile } = require('../controllers/fileController');

router.post('/upload', protect, upload.single('image'), uploadFile);
router.get('/',        protect, getFilesByRecord);
router.delete('/:id', protect, deleteFile);

module.exports = router;
