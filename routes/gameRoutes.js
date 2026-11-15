const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const {
  validateGame,
  validateGameUpdate,
  validateAvailableDateQuery
} = require('../middleware/validation');

// 1. GET /games - Display all games (or filter by player capacity: GET /games?players=4)
router.get('/', gameController.getAllGames);

// 2. GET /games/available?date=YYYY-MM-DD - Free on this date (Special Twist)
// NOTE: Must be registered BEFORE /games/:id so Express doesn't treat 'available' as a parameter!
router.get('/available', validateAvailableDateQuery, gameController.getAvailableGames);

// 3. GET /games/:id - Display one game by ID
router.get('/:id', gameController.getGameById);

// 4. POST /games - Add a new game
router.post('/', validateGame, gameController.createGame);

// 5. PUT /games/:id - Update an existing game
router.put('/:id', validateGameUpdate, gameController.updateGame);

// 6. DELETE /games/:id - Delete a game (if no active bookings exist)
router.delete('/:id', gameController.deleteGame);

module.exports = router;
