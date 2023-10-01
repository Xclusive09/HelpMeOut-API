const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoController = require('../controllers/videoController');

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new video
router.post('/', upload.single('video'), videoController.uploadVideo);

// Get all videos
router.get('/', videoController.getAllVideos);

// Get video by ID
router.get('/:id', videoController.getVideoById);


module.exports = router;
