const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address: String,
  photo: String,
});

module.exports = mongoose.model('Users', UserSchema);
