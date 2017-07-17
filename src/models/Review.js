const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  text: String,
  emotion: String,
  idUserFrom: String,
  idUserTo: String,
});

module.exports = mongoose.model('Review', ReviewSchema);
