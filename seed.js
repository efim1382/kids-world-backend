let db = require('./src/database')();
let lastUserId = 0;

db.run(`
  INSERT INTO user (firstName, lastName, email, phone, address, photo, hash, token)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`, [
    'Роман',
    'Ефимов',
    'efim1382@gmail.com',
    '+79094079312',
    'Ростов-на-Дону, Гвардейский, 6',
    '/images/user-image.jpg',
    'sha1$c96b7db9$1$6d652247b50eacc0bf5bc20573f941dcb692c218',
    'fsdgertq34t34fergerg34f4vw'
  ], function(err) {
  if (err) {
    return console.log(err.message);
  }

  lastUserId = this.lastID;
  
  db.run(`
    INSERT INTO advert (idUser, title, date, price, category, description, mainImage)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
      lastUserId,
      'Кроссовки на мальчика',
      '15 декабря, 2017',
      1400,
      'footwear',
      'Хорошие кроссовки, почти новые',
      '/images/ad-image.jpg'
    ], function(err) {
    if (err) {
      return console.log(err.message);
    }
  });
});

db.close();
