const { query } = require('../database/db');

/**
 * GET /bookings
 * Retrieve all bookings
 */
async function getAllBookings(req, res) {
  try {
    const bookings = await query.all('SELECT * FROM bookings ORDER BY id ASC');
    return res.status(200).json(bookings);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve bookings.', details: err.message });
  }
}

/**
 * GET /bookings/:id
 * Retrieve a single booking by ID
 */
async function getBookingById(req, res) {
  const bookingId = parseInt(req.params.id, 10);
  if (isNaN(bookingId) || bookingId <= 0) {
    return res.status(400).json({ error: 'Invalid booking ID.' });
  }

  try {
    const booking = await query.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) {
      return res.status(404).json({ error: `Booking with ID ${bookingId} not found.` });
    }
    return res.status(200).json(booking);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve booking.', details: err.message });
  }
}

/**
 * GET /bookings/details
 * Retrieve all bookings with joined guest and game details
 * Fields: booking_id, guest_name, game_name, start_date, end_date
 */
async function getBookingDetails(req, res) {
  try {
    const joinSql = `
      SELECT
        b.id AS booking_id,
        gu.name AS guest_name,
        ga.name AS game_name,
        b.start_date,
        b.end_date
      FROM bookings b
      INNER JOIN guests gu ON b.guest_id = gu.id
      INNER JOIN games ga ON b.game_id = ga.id
      ORDER BY b.id ASC
    `;

    const details = await query.all(joinSql);
    return res.status(200).json(details);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve booking details.', details: err.message });
  }
}

/**
 * POST /bookings
 * Create a new booking
 */
async function createBooking(req, res) {
  const { guest_id, game_id, start_date, end_date } = req.body;
  const parsedGuestId = parseInt(guest_id, 10);
  const parsedGameId = parseInt(game_id, 10);

  try {
    const result = await query.run(
      'INSERT INTO bookings (guest_id, game_id, start_date, end_date) VALUES (?, ?, ?, ?)',
      [parsedGuestId, parsedGameId, start_date.trim(), end_date.trim()]
    );

    const newBooking = {
      id: result.lastID,
      guest_id: parsedGuestId,
      game_id: parsedGameId,
      start_date: start_date.trim(),
      end_date: end_date.trim()
    };

    return res.status(201).json(newBooking);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create booking.', details: err.message });
  }
}

/**
 * DELETE /bookings/:id
 * Delete a booking by ID
 */
async function deleteBooking(req, res) {
  const bookingId = parseInt(req.params.id, 10);
  if (isNaN(bookingId) || bookingId <= 0) {
    return res.status(400).json({ error: 'Invalid booking ID.' });
  }

  try {
    const booking = await query.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) {
      return res.status(404).json({ error: `Booking with ID ${bookingId} not found.` });
    }

    await query.run('DELETE FROM bookings WHERE id = ?', [bookingId]);
    return res.status(200).json({ message: `Booking ID ${bookingId} deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete booking.', details: err.message });
  }
}

module.exports = {
  getAllBookings,
  getBookingById,
  getBookingDetails,
  createBooking,
  deleteBooking
};
