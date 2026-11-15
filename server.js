const express = require('express');
const path = require('path');
const { initDb } = require('./database/db');

// Import route modules
const guestRoutes = require('./routes/guestRoutes');
const gameRoutes = require('./routes/gameRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON request bodies
app.use(express.json());

// Request logger for helpful debugging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Welcome / Health check root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to BookNook Cafe - Board Game Booking Management System API',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: {
      guests: '/guests',
      games: '/games',
      bookings: '/bookings',
      bookingDetails: '/bookings/details',
      searchGamesByPlayers: '/games?players={number}',
      availableGamesTwist: '/games/available?date=YYYY-MM-DD'
    }
  });
});

// Register API routes
app.use('/guests', guestRoutes);
app.use('/games', gameRoutes);
app.use('/bookings', bookingRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Initialize DB schema and start server (only if executed directly)
if (require.main === module) {
  initDb()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log('====================================================');
        console.log(` BookNook Cafe API Server is running on port ${PORT}`);
        console.log(` Base URL: http://localhost:${PORT}`);
        console.log(' SQLite Foreign Key Enforcement: ACTIVE');
        console.log('====================================================');
      });
    })
    .catch((err) => {
      console.error('Failed to initialize database on startup:', err);
      process.exit(1);
    });
}

module.exports = app;
