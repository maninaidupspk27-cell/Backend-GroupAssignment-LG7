const { query } = require('../database/db');

// Regular expression for basic email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regular expression for YYYY-MM-DD date format
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Helper to check if a string is a valid calendar date
function isValidDate(dateStr) {
  if (!DATE_REGEX.test(dateStr)) return false;
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Middleware: Validate Guest creation (POST /guests)
 */
async function validateGuest(req, res, next) {
  const { name, email, phone } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required.' });
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ error: 'Email is required.' });
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  try {
    const existing = await query.get('SELECT id FROM guests WHERE email = ?', [email.trim()]);
    if (existing) {
      return res.status(409).json({ error: 'Email already exists. Guest email must be unique.' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Database error validating guest email.' });
  }
}

/**
 * Middleware: Validate Guest update (PUT /guests/:id)
 */
async function validateGuestUpdate(req, res, next) {
  const guestId = parseInt(req.params.id, 10);
  if (isNaN(guestId) || guestId <= 0) {
    return res.status(400).json({ error: 'Invalid guest ID.' });
  }

  const { name, email, phone } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required.' });
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ error: 'Email is required.' });
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  try {
    const existingGuest = await query.get('SELECT id FROM guests WHERE id = ?', [guestId]);
    if (!existingGuest) {
      return res.status(404).json({ error: `Guest with ID ${guestId} not found.` });
    }

    const emailOwner = await query.get('SELECT id FROM guests WHERE email = ? AND id != ?', [email.trim(), guestId]);
    if (emailOwner) {
      return res.status(409).json({ error: 'Email already in use by another guest.' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Database error validating guest update.' });
  }
}

/**
 * Middleware: Validate Game creation (POST /games)
 */
function validateGame(req, res, next) {
  const { name, min_players, max_players, duration_minutes } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Game name is required.' });
  }

  const minP = parseInt(min_players, 10);
  const maxP = parseInt(max_players, 10);
  const dur = parseInt(duration_minutes, 10);

  if (isNaN(minP) || minP <= 0) {
    return res.status(400).json({ error: 'Minimum players must be greater than zero.' });
  }

  if (isNaN(maxP) || maxP <= 0) {
    return res.status(400).json({ error: 'Maximum players must be greater than zero.' });
  }

  if (maxP < minP) {
    return res.status(400).json({ error: 'Maximum players must be greater than or equal to minimum players.' });
  }

  if (isNaN(dur) || dur <= 0) {
    return res.status(400).json({ error: 'Duration must be greater than zero.' });
  }

  next();
}

/**
 * Middleware: Validate Game update (PUT /games/:id)
 */
async function validateGameUpdate(req, res, next) {
  const gameId = parseInt(req.params.id, 10);
  if (isNaN(gameId) || gameId <= 0) {
    return res.status(400).json({ error: 'Invalid game ID.' });
  }

  try {
    const existing = await query.get('SELECT id FROM games WHERE id = ?', [gameId]);
    if (!existing) {
      return res.status(404).json({ error: `Game with ID ${gameId} not found.` });
    }

    // Run standard game field validation
    validateGame(req, res, next);
  } catch (err) {
    return res.status(500).json({ error: 'Database error validating game.' });
  }
}

/**
 * Middleware: Validate Booking creation (POST /bookings)
 */
async function validateBooking(req, res, next) {
  const { guest_id, game_id, start_date, end_date } = req.body;

  // 1. Check required fields
  if (guest_id === undefined || guest_id === null) {
    return res.status(400).json({ error: 'Guest ID is required.' });
  }

  if (game_id === undefined || game_id === null) {
    return res.status(400).json({ error: 'Game ID is required.' });
  }

  if (!start_date) {
    return res.status(400).json({ error: 'Start date is required.' });
  }

  if (!end_date) {
    return res.status(400).json({ error: 'End date is required.' });
  }

  const parsedGuestId = parseInt(guest_id, 10);
  const parsedGameId = parseInt(game_id, 10);

  if (isNaN(parsedGuestId) || parsedGuestId <= 0) {
    return res.status(400).json({ error: 'Guest ID must be a positive integer.' });
  }

  if (isNaN(parsedGameId) || parsedGameId <= 0) {
    return res.status(400).json({ error: 'Game ID must be a positive integer.' });
  }

  // 2. Format validation (YYYY-MM-DD)
  if (!isValidDate(start_date)) {
    return res.status(400).json({ error: 'Invalid start date format. Expected YYYY-MM-DD.' });
  }

  if (!isValidDate(end_date)) {
    return res.status(400).json({ error: 'Invalid end date format. Expected YYYY-MM-DD.' });
  }

  // 3. Date ordering check (Mandatory Twist Test 1 requirement)
  if (end_date < start_date) {
    return res.status(400).json({ error: 'End date cannot be before start date.' });
  }

  try {
    // 4. Verify guest exists
    const guest = await query.get('SELECT id FROM guests WHERE id = ?', [parsedGuestId]);
    if (!guest) {
      return res.status(404).json({ error: `Guest with ID ${parsedGuestId} does not exist.` });
    }

    // 5. Verify game exists
    const game = await query.get('SELECT id FROM games WHERE id = ?', [parsedGameId]);
    if (!game) {
      return res.status(404).json({ error: `Game with ID ${parsedGameId} does not exist.` });
    }

    // 6. Check for overlapping bookings for the same game
    const overlapSql = `
      SELECT id, start_date, end_date
      FROM bookings
      WHERE game_id = ?
        AND start_date <= ?
        AND end_date >= ?
    `;
    const overlapping = await query.get(overlapSql, [parsedGameId, end_date, start_date]);
    if (overlapping) {
      return res.status(409).json({
        error: `Conflicting booking exists for game ID ${parsedGameId} from ${overlapping.start_date} to ${overlapping.end_date}.`
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Database error validating booking.' });
  }
}

/**
 * Middleware: Validate date query parameter for /games/available?date=YYYY-MM-DD
 */
function validateAvailableDateQuery(req, res, next) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date query parameter is required (e.g., ?date=YYYY-MM-DD).' });
  }

  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
  }

  next();
}

module.exports = {
  validateGuest,
  validateGuestUpdate,
  validateGame,
  validateGameUpdate,
  validateBooking,
  validateAvailableDateQuery
};
