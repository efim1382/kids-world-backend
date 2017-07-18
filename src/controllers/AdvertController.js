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
    res.send(advert);
  });
};

exports.getOneAdvert = function(req, res) {
  Advert.findOne({ '_id': req.params.id }, function(err, advert) {
    if (!err) {
      res.json(advert);
    }
  });
};

exports.getUserAdverts = function(req, res) {
  Advert.find({ 'userId': req.params.id }, function(err, adverts) {
    if (!err) {
      res.json(adverts);
    }
  });
};
