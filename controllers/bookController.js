const Book = require('../models/book');

exports.createBook = async (req, res) => {
  try {
    if (!req.user.permissions.includes('create_book')) return res.status(403).json({ message: 'Unauthorized' });

    const book = new Book(req.body);
    await book.save();
    res.status(201).json({ message: 'Book created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    const includeDisabled = req.query.includeDisabled === 'true';
    const query = { _id: req.params.id };
    if (!includeDisabled) query.disabled = false;

    const book = await Book.findOne(query);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const { genre, publicationDate, publisher, author, title, available, page = 1, limit = 10, includeDisabled = false } = req.query;
    const query = {};
    if (genre) query.genre = genre;
    if (publicationDate) query.publicationDate = new Date(publicationDate);
    if (publisher) query.publisher = publisher;
    if (author) query.author = author;
    if (title) query.title = { $regex: title, $options: 'i' };
    if (available !== undefined) query.available = available === 'true';
    if (!includeDisabled) query.disabled = false;

    const books = await Book.find(query)
      .select('title')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      books: books.map(b => b.title),
      pagination: {
        currentPage: parseInt(page),
        maxPage: totalPages,
        booksPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (!req.user.permissions.includes('update_book')) return res.status(403).json({ message: 'Unauthorized' });

    Object.assign(book, req.body);
    await book.save();
    res.json({ message: 'Book updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (!req.user.permissions.includes('delete_book')) return res.status(403).json({ message: 'Unauthorized' });

    book.disabled = true;
    await book.save();
    res.json({ message: 'Book disabled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookHistory = async (req, res) => {
  try {
    const Reservation = require('../models/reservation');
    if (!req.user.permissions.includes('view_book_history')) { // Assume perm if needed
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const reservations = await Reservation.find({ book: req.params.id }).populate('user', 'name');
    res.json(reservations.map(r => ({
      userName: r.user.name,
      reservationDate: r.reservationDate,
      returnDate: r.returnDate
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};