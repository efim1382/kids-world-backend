const mongoose = require('mongoose');
const Advert = mongoose.model('Advert');
const User = mongoose.model('User');

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

    if (!fs.existsSync(`upload/adverts/${req.body.userId}`)) {
      fs.mkdirSync(`upload/adverts/${req.body.userId}`);
    }

    cb(null, `upload/adverts/${req.body.userId}`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage }).single('image');

exports.getAdverts = function(req, res) {
  Advert.find({}, function(err, adverts) {
    res.send(adverts);
  });
};

exports.addAdvert = function(req, res) {
  upload(req, res, function() {
    let obj = {
      userId: req.body.userId,
      title: req.body.title,
      date: req.body.date,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description,
      image: `adverts/${req.body.userId}/${req.file.originalname}`,
    }
    let newAdvert = new Advert(obj);

    newAdvert.save(function(err, advert) {
      res.send(advert);
    });
  });
};

exports.editAdvert = function(req, res) {
  upload(req, res, function() {
    Advert.findOne({ _id: req.params.id }, function (err, advert) {
      if (err) {
        return;
      }

      advert.title = req.body.title;
      advert.price = req.body.price;
      advert.category = req.body.category;
      advert.description = req.body.description;

      if (req.file !== undefined) {
        advert.image = `adverts/${req.body.userId}/${req.file.originalname}`;
      }

      advert.save(function(err, newAdvert) {
        res.json(newAdvert);
      });
    });
  });
};

exports.deleteAdvert = function(req, res) {
  Advert.findOne({ _id: req.params.id }, function (err, advert) {
    if (err) {
      return;
    }

    advert.remove();

    res.send({
      status: 200
    });
  });
};

exports.getOneAdvert = function(req, res) {
  Advert.findOne({ '_id': req.params.id }, function(err, advert) {
    if (!err) {
      res.json(advert);
    }
  });
};

exports.getUserAdverts = function(req, res) {
  Advert.find({ 'userId': req.params.id }, function(err, adverts) {
    if (!err) {
      res.json(adverts);
    }
  });
};
