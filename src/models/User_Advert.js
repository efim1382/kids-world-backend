const mongoose = require('mongoose');

const UserAdvertSchema = new mongoose.Schema({
  id_user: String,
  id_advert: String,
});

module.exports = mongoose.model('User_Advert', UserAdvertSchema);
