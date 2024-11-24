const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();

// Define allowed origins
const allowedOrigins = ['https://discnet.libre.lol', 'https://apidisc.libre.lol', 'http://discnet.libre.lol', 'localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

app.use(cors(corsOptions)); // Enable CORS with options

connectDB();

// Sync models with the database
sequelize.sync();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/job', jobRoutes);

module.exports = app;