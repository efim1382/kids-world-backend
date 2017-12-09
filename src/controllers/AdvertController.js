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

    if (!fs.existsSync(`upload/adverts/${req.body.userId}`)) {
      fs.mkdirSync(`upload/adverts/${req.body.userId}`);
    }

    cb(null, `upload/adverts/${req.body.userId}`);
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage }).single('image');

exports.addAdvert = function(req, res) {
  upload(req, res, function() {
    let obj = {
      userId: req.body.userId,
      title: req.body.title,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description,
      image: `adverts/${req.body.userId}/${req.file.originalname}`,
    };

    console.log(obj);
  });

  res.send(200);
}
