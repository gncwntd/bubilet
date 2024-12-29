const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { createReservation, getUserReservations, cancelReservation } = require('../controllers/reservations.controller');

router.use(protect);

router.post('/', createReservation);
router.get('/my', getUserReservations);
router.post('/:reservation_id/cancel', cancelReservation);

module.exports = router; 