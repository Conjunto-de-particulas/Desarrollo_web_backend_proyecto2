const express = require('express');
const auth = require('../middleware/auth');
const reservationController = require('../controllers/reservationController');

const router = express.Router();

router.put('/:id/return', auth, reservationController.returnBook);

module.exports = router;