const { query } = require('../database/db');

/**
 * GET /guests
 * Retrieve all guests
 */
async function getAllGuests(req, res) {
  try {
    const guests = await query.all('SELECT * FROM guests ORDER BY id ASC');
    return res.status(200).json(guests);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve guests.', details: err.message });
  }
}

/**
 * GET /guests/:id
 * Retrieve a single guest by ID
 */
async function getGuestById(req, res) {
  const guestId = parseInt(req.params.id, 10);
  if (isNaN(guestId) || guestId <= 0) {
    return res.status(400).json({ error: 'Invalid guest ID.' });
  }

  try {
    const guest = await query.get('SELECT * FROM guests WHERE id = ?', [guestId]);
    if (!guest) {
      return res.status(404).json({ error: `Guest with ID ${guestId} not found.` });
    }
    return res.status(200).json(guest);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve guest.', details: err.message });
  }
}

/**
 * POST /guests
 * Add a new guest
 */
async function createGuest(req, res) {
  const { name, email, phone } = req.body;
  const cleanPhone = phone ? phone.trim() : null;

  try {
    const result = await query.run(
      'INSERT INTO guests (name, email, phone) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), cleanPhone]
    );

    const newGuest = {
      id: result.lastID,
      name: name.trim(),
      email: email.trim(),
      phone: cleanPhone
    };

    return res.status(201).json(newGuest);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create guest.', details: err.message });
  }
}

/**
 * PUT /guests/:id
 * Update an existing guest
 */
async function updateGuest(req, res) {
  const guestId = parseInt(req.params.id, 10);
  const { name, email, phone } = req.body;
  const cleanPhone = phone ? phone.trim() : null;

  try {
    await query.run(
      'UPDATE guests SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name.trim(), email.trim(), cleanPhone, guestId]
    );

    const updatedGuest = {
      id: guestId,
      name: name.trim(),
      email: email.trim(),
      phone: cleanPhone
    };

    return res.status(200).json(updatedGuest);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update guest.', details: err.message });
  }
}

/**
 * DELETE /guests/:id
 * Delete a guest (prevent deletion if guest has existing bookings)
 */
async function deleteGuest(req, res) {
  const guestId = parseInt(req.params.id, 10);
  if (isNaN(guestId) || guestId <= 0) {
    return res.status(400).json({ error: 'Invalid guest ID.' });
  }

  try {
    // 1. Check if guest exists
    const guest = await query.get('SELECT * FROM guests WHERE id = ?', [guestId]);
    if (!guest) {
      return res.status(404).json({ error: `Guest with ID ${guestId} not found.` });
    }

    // 2. Check if guest has active or historical bookings
    const bookingCount = await query.get(
      'SELECT COUNT(*) AS count FROM bookings WHERE guest_id = ?',
      [guestId]
    );

    if (bookingCount.count > 0) {
      return res.status(409).json({
        error: `Cannot delete guest ID ${guestId}: Guest has ${bookingCount.count} existing booking(s). Delete associated bookings first.`
      });
    }

    // 3. Delete guest safely
    await query.run('DELETE FROM guests WHERE id = ?', [guestId]);
    return res.status(200).json({ message: `Guest ID ${guestId} deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete guest.', details: err.message });
  }
}

module.exports = {
  getAllGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest
};
