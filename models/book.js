const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String },
  publicationDate: { type: Date },
  publisher: { type: String },
  available: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('Book', bookSchema);