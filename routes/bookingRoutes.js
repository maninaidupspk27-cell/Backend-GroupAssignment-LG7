const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { validateBooking } = require('../middleware/validation');

// 1. GET /bookings - Display all bookings
router.get('/', bookingController.getAllBookings);

// 2. GET /bookings/details - Display booking details with guest & game names via SQL JOIN
// NOTE: Must be registered BEFORE /bookings/:id so Express doesn't treat 'details' as an ID!
router.get('/details', bookingController.getBookingDetails);

// 3. GET /bookings/:id - Display one booking by ID
router.get('/:id', bookingController.getBookingById);

// 4. POST /bookings - Create a new booking (with validation and overlap checking)
router.post('/', validateBooking, bookingController.createBooking);

// 5. DELETE /bookings/:id - Delete a booking by ID
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
