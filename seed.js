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
    '/public/user-image.png',
    'sfdfdsfd',
    ''
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
      '2017-10-10',
      1400,
      'footwear',
      'Хорошие кроссовки, почти новые',
      '/public/advert-image.jpg'
    ], function(err) {
    if (err) {
      return console.log(err.message);
    }
  });
});

db.close();
