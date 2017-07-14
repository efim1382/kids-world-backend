const mongoose = require('mongoose');

const AdvertSchema = new mongoose.Schema({
  title: String,
  image: String,
  userImage: String,
  userName: String,
  date: String,
  price: Number,
  category: String,
  address: String,
  description: String,
});

module.exports = mongoose.model('Adverts', AdvertSchema);
