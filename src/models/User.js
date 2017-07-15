const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address: String,
  photo: String,
  token: String,
});

module.exports = mongoose.model('User', UserSchema);
