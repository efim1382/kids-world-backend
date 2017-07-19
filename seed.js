const db = require('./src/database')();
require('./src/models/_all')();
const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
const Advert = mongoose.model('Advert');
const User = mongoose.model('User');

let seed = new Promise((resolve, reject) => {

  let newUser = new User({
    name: 'Роман',
    phone: '+7 (909) 234-33-23',
    email: 'efim1382@mail.ru',
    address: 'Макеевка, Подъемная, 10',
    photo: 'images/user-image.jpg',
    password: '12345',
    token: uuidv4(),
  });

  newUser.save().then(user => {
    let obj = Object.assign({
      title: 'Детские кроссовки',
      image: 'images/ad-image.jpg',
      date: '25 августа 2017',
      price: 1420,
      category: 'Детская обувь',
      description: 'Хорошие кроссовки, новые',
    }, {
      userId: user._id,
    });

    let newAdvert = new Advert(obj);

    newAdvert.save().then(advert => {
      resolve([advert, user]);
    });
  });
});

seed.then(array => {
  console.log(array);

  process.exit();
});

