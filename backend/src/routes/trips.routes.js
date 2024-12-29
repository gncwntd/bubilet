const express = require('express');
const router = express.Router();
const { searchTrips, getSeats } = require('../controllers/trips.controller');

router.get('/search', searchTrips);
router.get('/:trip_id/seats', getSeats);

module.exports = router; 