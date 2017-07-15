const mongoose = require('mongoose');
const Advert = mongoose.model('Advert');

exports.getAllAdverts = function(req, res) {
  Advert.find({}, function(err, advert) {
    res.json(advert);
  });
};

exports.addAdvert = function(req, res) {
  let newAdvert = new Advert(req.body);

  newAdvert.save(function(err, advert) {
    res.json(advert);
  });
};
