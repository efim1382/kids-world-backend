const mongoose = require('mongoose');
const Advert = mongoose.model('Advert');
const User = mongoose.model('User');

exports.getAdverts = function(req, res) {
  Advert.find({}, function(err, adverts) {
    res.send(adverts);
  });
};

exports.addAdvert = function(req, res) {
  let newAdvert = new Advert(req.body);

  newAdvert.save(function(err, advert) {
    res.send('Добавлено');
  });
};
