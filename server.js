require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const workoutRoutes = require('./routes/workoutRoutes');
const mealRoutes = require('./routes/mealRoutes'); 
const userRoutes = require('./routes/userRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'fitness_tracker';
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // serve HTML/CSS/JS from project root

// Env checks
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set. Please add it to your .env file.');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Please add it to your .env file.');
  process.exit(1);
}

// Database connection
mongoose
  .connect(MONGO_URI, { dbName: DB_NAME })
  .then(() => console.log(`✅ MongoDB connected (db: ${DB_NAME})`))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Status endpoint
app.get('/status', (req, res) => res.json({ status: 'OK' }));

// API Routes
app.use('/api/workouts', workoutRoutes);
app.use('/api/meals', mealRoutes); 
app.use('/api/users', userRoutes);

// Error handling middleware 
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
