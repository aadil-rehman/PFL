require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { MulterError } = require('multer');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes  = require('./src/routes/auth');
const plantRoutes = require('./src/routes/plants');
const fileRoutes  = require('./src/routes/files');

app.use('/api/auth',   authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/files',  fileRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'PFL API is running', data: null });
});

// Global error handler — must be after all routes
app.use((err, req, res, _next) => {
  if (err instanceof MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File too large. Maximum 5MB allowed.'
      : err.message;
    return res.status(400).json({ success: false, message, data: null });
  }

  if (err.message) {
    return res.status(400).json({ success: false, message: err.message, data: null });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ success: false, message: 'Internal server error', data: null });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
