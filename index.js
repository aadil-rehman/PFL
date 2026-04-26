require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');


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
  res.json({ message: 'PFL API is running' });
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
