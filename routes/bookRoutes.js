const express = require('express');
const auth = require('../middleware/auth');
const bookController = require('../controllers/bookController');

const router = express.Router();

router.post('/', auth, bookController.createBook);
router.get('/:id', bookController.getBook);
router.get('/', bookController.getBooks);
router.put('/:id', auth, bookController.updateBook);
router.delete('/:id', auth, bookController.deleteBook);
router.get('/:id/history', auth, bookController.getBookHistory);
router.post('/:id/reserve', auth, require('../controllers/reservationController').reserveBook);

module.exports = router;