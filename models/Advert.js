module.exports = function() {
  var mongoose = require('mongoose');
  var db = require('../database')();
  var AdvertModel = function() {};

  AdvertModel.__proto__.AdvertsSchema = new mongoose.Schema({
    title: String,
    image: String,
    userImage: String,
    userName: String,
    date: String,
    price: Number,
    category: String,
    adress: String,
    category: String,
    description: String,
  });

  AdvertModel.__proto__.Advert = db.model('Advert', AdvertModel.AdvertsSchema);

  AdvertModel.__proto__.save = function(data) {
    var newAdvert = new AdvertModel.Advert(data);

    newAdvert.save(function (error, newAd) {
      if (error) {
        console.log("Something goes wrong with advert save " + newAd);
      }
    });
  }

  AdvertModel.__proto__.getAll = function() {
    return AdvertModel.Advert.find(function (err, adverts) {
      return adverts;
    }).then(value => {
      return value;
    });
  };

  AdvertModel.__proto__.clearTable = function() {
    db.collections['adverts'].drop(function(err) {
      console.log('Adverts removed');
    });
  };

  return AdvertModel;
};
