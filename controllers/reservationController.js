const Reservation = require('../models/reservation');
const Book = require('../models/book');

exports.reserveBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book || !book.available || book.disabled) return res.status(400).json({ message: 'Book not available' });

    const reservation = new Reservation({ user: req.user.id, book: book._id });
    await reservation.save();

    book.available = false;
    await book.save();

    res.status(201).json({ message: 'Book reserved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation || reservation.returnDate) return res.status(400).json({ message: 'Invalid reservation' });

    if (req.user.id !== reservation.user.toString() && !req.user.permissions.includes('manage_reservations')) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    reservation.returnDate = new Date();
    await reservation.save();

    const book = await Book.findById(reservation.book);
    book.available = true;
    await book.save();

    res.json({ message: 'Book returned' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};