const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const videoRoutes = require('./routes/videoRoutes');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Connect to MongoDB (replace with your MongoDB URI)
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Check if the connection was successful
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});



// RabbitMQ connection
const open = amqp.connect(process.env.RABBIT_URI);

open.then(function (conn) {
  return conn.createChannel();
}).then(function (channel) {
  const queue = 'transcription_queue';

  // Ensure the queue exists
  channel.assertQueue(queue, {
    durable: false,
  });

  // Start consuming from the queue
  channel.consume(queue, function (message) {
    // Process transcription task (e.g., use Deepgram)
    console.log('Transcribing:', message.content.toString());
  }, {
    noAck: true,
  });
}).catch(console.warn);

// Routes
app.use('/videos', videoRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
