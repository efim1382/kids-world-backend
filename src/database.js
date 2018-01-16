module.exports = function() {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('./newdb.db', (error) => {
    if (error) {
      console.error(error.message);
    }
  });

  db.serialize(function() {
    db.run(`PRAGMA foreign_keys = ON`);
    db.run(`CREATE TABLE IF NOT EXISTS user (
      id integer PRIMARY KEY AUTOINCREMENT,
      firstName varchar(30),
      lastName varchar(50),
      email varchar(150),
      phone varchar(12),
      address varchar(255),
      photo varchar(255),
      hash varchar(255),
      token varchar(255)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS advert (
      id integer PRIMARY KEY AUTOINCREMENT,
      idUser integer,
      title varchar(255),
      date datetime,
      price double,
      category varchar(50),
      description text(2000),
      mainImage varchar(255),
      FOREIGN KEY (idUser) REFERENCES user(id) ON DELETE CASCADE
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS advertImages (
      id integer PRIMARY KEY AUTOINCREMENT,
      idAdvert integer,
      image varchar(255),
      FOREIGN KEY (idAdvert) REFERENCES advert(id) ON DELETE CASCADE
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS review (
      id integer PRIMARY KEY AUTOINCREMENT,
      text text(500),
      idAuthor integer,
      idRecipient integer,
      emotion varchar(7),
      FOREIGN KEY (idAuthor) REFERENCES user(id) ON DELETE CASCADE
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS favorites (
      id integer PRIMARY KEY AUTOINCREMENT,
      idUser integer,
      idAdvert integer,
      FOREIGN KEY (idUser) REFERENCES user(id) ON DELETE CASCADE,
      FOREIGN KEY (idAdvert) REFERENCES advert(id) ON DELETE CASCADE
    )`);
  });

  return db;
};
