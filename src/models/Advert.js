const mongoose = require('mongoose');

const AdvertSchema = new mongoose.Schema({
  userId: String,
  title: String,
  image: String,
  date: String,
  price: Number,
  category: String,
  description: String,
});

module.exports = mongoose.model('Advert', AdvertSchema);
