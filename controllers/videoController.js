const Video = require('../models/Video');
const amqp = require('amqplib');
const dotenv = require('dotenv');
dotenv.config();

// Create a new video
exports.uploadVideo = async (req, res) => {
  try {
    // Implement logic to save video to Firebase Storage and get the video URL
    const videoUrl = process.env.FIREBASE_URI;
    const { title, description } = req.body;
    const video = new Video({ title, description, videoUrl });
    await video.save();

    // Implement logic to add transcription task to RabbitMQ queue
    const transcriptionTask = {
      videoId: video._id,
      videoUrl,
    };

    // Publish the transcription task to RabbitMQ
    const open = amqp.connect(process.env.RABBIT_URI);

    open.then(function (conn) {
      return conn.createChannel();
    }).then(function (channel) {
      const queue = 'transcription_queue';

      // Ensure the queue exists
      channel.assertQueue(queue, {
        durable: false,
      });

      // Publish the transcription task to the queue
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(transcriptionTask)));
    }).catch(console.warn);

    res.status(201).json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get video by ID
exports.getVideoById = async (req, res) => {
  const videoId = req.params.id;

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.status(200).json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


