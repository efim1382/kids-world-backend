const mongoose = require('mongoose');
const Advert = mongoose.model('Advert');
const User = mongoose.model('User');

exports.getAdverts = function(req, res) {
  Advert.find({}, function(err, adverts) {
    res.send(adverts);
  });
  // Advert.find({}, function(err, adverts) {
  //   let array = [];

  //   let chain = new Promise(function(resolve, reject) {
  //     adverts.forEach((elem, index) => {
  //       User.findOne({ '_id': elem.userId }, function(err, user) {
  //         array.push({
  //           userId: elem.userId,
  //           title: elem.title,
  //           image: elem.image,
  //           date: elem.date,
  //           price: elem.price,
  //           category: elem.category,
  //           description: elem.description,
  //           userImage: user.photo,
  //           userName: user.name,
  //           address: user.address,
  //         });

  //         if (index === adverts.length - 1) {
  //           resolve(array);
  //         }
  //       });
  //     });
  //   });

  //   chain.then(value => {
  //     res.send(value);
  //   });
  // });
};

exports.addAdvert = function(req, res) {
  let newAdvert = new Advert(req.body);

  newAdvert.save(function(err, advert) {
    res.send('Добавлено');
  });
};
