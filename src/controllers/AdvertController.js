const db = require('../database')();
const fs = require('fs');
const multer  = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('upload')) {
      fs.mkdirSync('upload');
    }

    if (!fs.existsSync('upload/adverts')) {
      fs.mkdirSync('upload/adverts');
    }

    if (!fs.existsSync(`upload/adverts/${req.body.id}`)) {
      fs.mkdirSync(`upload/adverts/${req.body.id}`);
    }

    cb(null, `upload/adverts/${req.body.id}`);
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage }).single('image');

exports.getAdverts = function(req, res) {
  db.all(`
    SELECT *
    FROM advert
    ORDER BY id
    DESC
  `, [], (error, adverts) => {
    if (error) {
      return console.error(error.message);
    }

    if (!adverts) {
      res.status(500);
      return;
    }

    res.status(200).send(adverts);
  });
};

exports.createAdvert = function(req, res) {
  db.run(`
    INSERT INTO advert (title)
    VALUES (' ')
  `, [], function(error) {
    if (error) {
      return console.log(error.message);
    }

    res.send({
      status: 200,
      advertLastid: this.lastID,
    });
  });
};

exports.addAdvert = function(req, res) {
  upload(req, res, function() {
    let data = {
      userId: req.body.userId,
      title: req.body.title,
      date: req.body.date,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description,
      image: `adverts/${req.body.id}/${req.file.originalname}`,
    };

    db.run(`
      UPDATE advert
      SET title = ?, idUser = ?, title = ?, date = ?, price = ?, category = ?, description = ?, mainImage = ?
      WHERE id = ?
    `, [
      data.title,
      data.userId,
      data.title,
      data.date,
      data.price,
      data.category,
      data.description,
      data.image,
      req.body.id
    ], function(error) {
      if (error) {
        return console.log(error.message);
      }

      res.send({
        status: 200
      });
    });
  });
}
