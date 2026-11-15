const { query } = require('../database/db');

/**
 * GET /games
 * Retrieve all games OR search games by player capacity (GET /games?players=4)
 */
async function getAllGames(req, res) {
  const { players } = req.query;

  try {
    // Check if search query parameter is provided
    if (players !== undefined) {
      const parsedPlayers = parseInt(players, 10);
      if (isNaN(parsedPlayers) || parsedPlayers <= 0) {
        return res.status(400).json({
          error: 'Invalid players query parameter. It must be a positive integer.'
        });
      }

      // Search logic: min_players <= players AND max_players >= players
      const searchSql = `
        SELECT *
        FROM games
        WHERE min_players <= ? AND max_players >= ?
        ORDER BY id ASC
      `;
      const matchedGames = await query.all(searchSql, [parsedPlayers, parsedPlayers]);
      return res.status(200).json(matchedGames);
    }

    // Default: Return all games
    const allGames = await query.all('SELECT * FROM games ORDER BY id ASC');
    return res.status(200).json(allGames);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve games.', details: err.message });
  }
}

/**
 * GET /games/available?date=YYYY-MM-DD
 * Special Twist: Free on this date
 * Returns all board games that have no booking covering the requested date.
 */
async function getAvailableGames(req, res) {
  const { date } = req.query;

  try {
    // SQL Logic matching the client assignment brief:
    // A game is booked if start_date <= date AND end_date >= date.
    // Available games are those whose IDs are NOT in that booked list.
    const availableSql = `
      SELECT *
      FROM games
      WHERE id NOT IN (
          SELECT game_id
          FROM bookings
          WHERE start_date <= ?
            AND end_date >= ?
      )
      ORDER BY id ASC
    `;

    const availableGames = await query.all(availableSql, [date, date]);
    return res.status(200).json(availableGames);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to query available games.', details: err.message });
  }
}

/**
 * GET /games/:id
 * Retrieve a single game by ID
 */
async function getGameById(req, res) {
  const gameId = parseInt(req.params.id, 10);
  if (isNaN(gameId) || gameId <= 0) {
    return res.status(400).json({ error: 'Invalid game ID.' });
  }

  try {
    const game = await query.get('SELECT * FROM games WHERE id = ?', [gameId]);
    if (!game) {
      return res.status(404).json({ error: `Game with ID ${gameId} not found.` });
    }
    return res.status(200).json(game);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve game.', details: err.message });
  }
}

/**
 * POST /games
 * Add a new board game
 */
async function createGame(req, res) {
  const { name, min_players, max_players, duration_minutes } = req.body;

  try {
    const result = await query.run(
      'INSERT INTO games (name, min_players, max_players, duration_minutes) VALUES (?, ?, ?, ?)',
      [name.trim(), parseInt(min_players, 10), parseInt(max_players, 10), parseInt(duration_minutes, 10)]
    );

    const newGame = {
      id: result.lastID,
      name: name.trim(),
      min_players: parseInt(min_players, 10),
      max_players: parseInt(max_players, 10),
      duration_minutes: parseInt(duration_minutes, 10)
    };

    return res.status(201).json(newGame);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create game.', details: err.message });
  }
}

/**
 * PUT /games/:id
 * Update an existing game
 */
async function updateGame(req, res) {
  const gameId = parseInt(req.params.id, 10);
  const { name, min_players, max_players, duration_minutes } = req.body;

  try {
    await query.run(
      'UPDATE games SET name = ?, min_players = ?, max_players = ?, duration_minutes = ? WHERE id = ?',
      [name.trim(), parseInt(min_players, 10), parseInt(max_players, 10), parseInt(duration_minutes, 10), gameId]
    );

    const updatedGame = {
      id: gameId,
      name: name.trim(),
      min_players: parseInt(min_players, 10),
      max_players: parseInt(max_players, 10),
      duration_minutes: parseInt(duration_minutes, 10)
    };

    return res.status(200).json(updatedGame);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update game.', details: err.message });
  }
}

/**
 * DELETE /games/:id
 * Delete a game (prevent deletion if game has existing bookings)
 */
async function deleteGame(req, res) {
  const gameId = parseInt(req.params.id, 10);
  if (isNaN(gameId) || gameId <= 0) {
    return res.status(400).json({ error: 'Invalid game ID.' });
  }

  try {
    // 1. Check if game exists
    const game = await query.get('SELECT * FROM games WHERE id = ?', [gameId]);
    if (!game) {
      return res.status(404).json({ error: `Game with ID ${gameId} not found.` });
    }

    // 2. Check if game has existing bookings
    const bookingCount = await query.get(
      'SELECT COUNT(*) AS count FROM bookings WHERE game_id = ?',
      [gameId]
    );

    if (bookingCount.count > 0) {
      return res.status(409).json({
        error: `Cannot delete game ID ${gameId}: Game has ${bookingCount.count} existing booking(s). Delete associated bookings first.`
      });
    }

    // 3. Delete game safely
    await query.run('DELETE FROM games WHERE id = ?', [gameId]);
    return res.status(200).json({ message: `Game ID ${gameId} deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete game.', details: err.message });
  }
}

module.exports = {
  getAllGames,
  getAvailableGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
};
