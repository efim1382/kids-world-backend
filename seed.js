const db = require('./src/database')();
require('./src/models/_all')();
const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
const Advert = mongoose.model('Advert');
const User = mongoose.model('User');

let seed = new Promise((resolve, reject) => {
  let newAdvert = new Advert({
    title: 'Заголовок',
    image: '/images/ad-image.jpg',
    userImage: '/images/user-image.jpg',
    userName: 'Иван',
    date: '25 августа 2017',
    price: 1420,
    category: 'Одежда',
    address: 'Красноармейская, 212',
    description: 'Хорошие',
  });

  let newUser = new User({
    name: 'Иван',
    phone: '+7 (909) 234-33-23',
    email: 'email@mail.ru',
    address: 'Красноармейская, 212',
    photo: '/images/user-image.jpg',
    token: uuidv4(),
  });

  newAdvert.save().then(adverts => {
    newUser.save().then(users => {
      resolve([adverts, users]);
    });
  });
});

seed.then(array => {
  console.log(array);

  process.exit();
});

