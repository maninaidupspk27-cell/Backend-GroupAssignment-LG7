const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const { validateGuest, validateGuestUpdate } = require('../middleware/validation');

// 1. GET /guests - Display all guests
router.get('/', guestController.getAllGuests);

// 2. GET /guests/:id - Display one guest by ID
router.get('/:id', guestController.getGuestById);

// 3. POST /guests - Add a new guest
router.post('/', validateGuest, guestController.createGuest);

// 4. PUT /guests/:id - Update existing guest information
router.put('/:id', validateGuestUpdate, guestController.updateGuest);

// 5. DELETE /guests/:id - Delete a guest (if no active bookings exist)
router.delete('/:id', guestController.deleteGuest);

module.exports = router;
