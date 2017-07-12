var db = require('../database')();

var AdvertModel = require('../models/Advert')();

AdvertModel.clearTable().then(() => {
  AdvertModel.save({
    title: 'Детская шапка',
    image: '/images/ad-image.jpg',
    userImage: '/images/user-image.jpg',
    userName: 'Василий Петров',
    date: '25 января, 2017',
    price: 1500,
    category: 'Детская одежда',
    address: 'Ростов-на-Дону, Красноармейская, 55',
    description: 'Хорошая шапка, новая почти',
  }).then(() => {
    AdvertModel.save({
      title: 'Детская шапка',
      image: '/images/ad-image.jpg',
      userImage: '/images/user-image.jpg',
      userName: 'Василий Петров',
      date: '25 января, 2017',
      price: 1500,
      category: 'Детская одежда',
      address: 'Ростов-на-Дону, Красноармейская, 55',
      description: 'Хорошая шапка, новая почти',
    }).then(() => {
      AdvertModel.getAll().then(value => console.log(value));
    });
  });
});
