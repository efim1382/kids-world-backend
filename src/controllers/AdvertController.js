const mongoose = require('mongoose');
const Advert = mongoose.model('Advert');
const User = mongoose.model('User');

exports.getAdverts = function(req, res) {
  Advert.find({}, function(err, adverts) {
    res.send(adverts);
  });
};

exports.addAdvert = function(req, res) {
  let obj = {
    userId: req.body.userId,
    title: req.body.title,
    date: req.body.date,
    price: req.body.price,
    category: req.body.category,
    description: req.body.description,
    image: `upload/adverts/${req.body.userId}/${req.file.originalname}`,
  }
  let newAdvert = new Advert(obj);

  newAdvert.save(function(err, advert) {
    res.send(obj);
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
