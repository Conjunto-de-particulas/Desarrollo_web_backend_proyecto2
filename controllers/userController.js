const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.disabled || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, permissions: user.permissions }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.disabled) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user.id !== user._id.toString() && !req.user.permissions.includes('update_user')) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(user, req.body);
    await user.save();
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user.id !== user._id.toString() && !req.user.permissions.includes('delete_user')) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    user.disabled = true;
    await user.save();
    res.json({ message: 'User disabled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserHistory = async (req, res) => {
  try {
    const Reservation = require('../models/Reservation');
    if (req.user.id !== req.params.id && !req.user.permissions.includes('view_user_history')) { // Assume added perm if needed
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const reservations = await Reservation.find({ user: req.params.id }).populate('book', 'title');
    res.json(reservations.map(r => ({
      bookName: r.book.title,
      reservationDate: r.reservationDate,
      returnDate: r.returnDate
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};