const db = require('../database')();
const fs = require('fs');
const path = require('path');
const multer  = require('multer');
const rimraf = require('rimraf');

const updateAdvertImage = (req, file, cb) => {
  db.run(`
    UPDATE advert
    SET mainImage = ?
    WHERE id = ?
  `, [
    `adverts/${req.body.id}/${file.originalname}`,
    req.body.id,
  ], (error, advert) => {
    if (error) {
      return console.error(error.message);
    }

    cb(null, `upload/adverts/${req.body.id}`);
  });
};

const createAdvertImagesDir = (id) => {
  if (!fs.existsSync('upload')) {
    fs.mkdirSync('upload');
  }

  if (!fs.existsSync('upload/adverts')) {
    fs.mkdirSync('upload/adverts');
  }

  if (!fs.existsSync(`upload/adverts/${id}`)) {
    fs.mkdirSync(`upload/adverts/${id}`);
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    createAdvertImagesDir(req.body.id);
    cb(null, `upload/adverts/${req.body.id}`);
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage }).single('image');

const storageEdit = multer.diskStorage({
  destination: function (req, file, cb) {
    db.get(`
      SELECT mainImage
      FROM advert
      WHERE id = ?
    `, [req.body.id], (error, advert) => {
      if (error) {
        console.error(error.message);
      }

      if (!advert) {
        return;
      }

      if (advert.mainImage === '/images/ad-image.jpg') {
        createAdvertImagesDir(req.body.id);
        updateAdvertImage(req, file, cb);
        return;
      }

      fs.unlink(`${process.env.ROOT_PATH}/upload/${advert.mainImage}`, function(error) {
        if (error) {
          console.error(error.message);
        };

        updateAdvertImage(req, file, cb);
      });
    });
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const uploadEdit = multer({ storage: storageEdit }).single('image');

exports.getAdverts = function(req, res) {
  db.all(`
    SELECT advert.id,
           advert.title,
           advert.date,
           advert.price,
           advert.category,
           advert.mainImage,
           user.id as userId,
           user.firstName,
           user.lastName,
           user.address,
           user.photo
    FROM advert, user
    WHERE advert.idUser = user.id
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

exports.getAdvert = function(req, res) {
  var id = req.params.id;

  db.get(`
    SELECT advert.id,
           advert.title,
           advert.date,
           advert.price,
           advert.category,
           advert.description,
           advert.mainImage,
           user.id as userId,
           user.firstName,
           user.lastName,
           user.address,
           user.email,
           user.phone,
           user.photo
    FROM advert, user
    WHERE advert.idUser = user.id
    AND advert.id = ?
  `, [id], (error, advert) => {
    if (error) {
      return console.error(error.message);
    }

    if (!advert) {
      res.status(500);
      return;
    }

    res.status(200).send(advert);
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
      SET title = ?, idUser = ?, date = ?, price = ?, category = ?, description = ?, mainImage = ?
      WHERE id = ?
    `, [
      data.title,
      data.userId,
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

function updateAdvert(req, res) {
  const id = req.body.id || req.params.id;

  db.run(`
    UPDATE advert
    SET title = ?, price = ?, category = ?, description = ?
    WHERE id = ?
  `, [
    req.body.title,
    req.body.price,
    req.body.category,
    req.body.description,
    id,
  ], (error) => {
    if (error) {
      return console.error(error.message);
    }

    res.status(200).send({ message: 'ok' });
  });
}

exports.editAdvertWithImage = function(req, res) {
  uploadEdit(req, res, function() {
    updateAdvert(req, res);
  });
};

exports.editAdvert = function(req, res) {
  updateAdvert(req, res);
}

exports.getUserAdverts = function(req, res) {
  db.all(`
    SELECT *
    FROM advert
    WHERE idUser = ?
  `, [req.params.id], function(error, adverts) {
    if (error) {
      return console.log(error.message);
    }

    if (!adverts) {
      res.status(400).send({ message: 'У пользователя нет объявлений' });
      return;
    }

    res.status(200).send(adverts);
  });
};

exports.deleteAdvert = function(req, res) {
  const { id } = req.params;

  db.get(`
    SELECT *
    FROM advert
    WHERE id = ?
  `, [id], (error, advert) => {
    if (error) {
      return console.error(error.message);
    }

    if (!advert) {
      // 500 ?
      res.status(500);
    }

    let imagesPath = `${process.env.ROOT_PATH}/upload/adverts/${id}`;

    if (fs.existsSync(imagesPath)) {
      rimraf(imagesPath, function() {});
    }

    db.run(`
      DELETE
      FROM advert
      WHERE id = ?
    `, [id], (error) => {
      if (error) {
        return console.error(error.message);
      }

      res.status(200).send();
    });
  });
};
