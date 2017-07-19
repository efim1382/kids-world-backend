module.exports = function(app) {
  const urlPath = '/api/v1';
  const Advert = require('../controllers/AdvertController');

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
  const upload = multer({ storage: storage })

  app.route(`${urlPath}/adverts`).get(Advert.getAdverts);
  app.route(`${urlPath}/adverts/:id`).get(Advert.getOneAdvert);
  app.route(`${urlPath}/adverts/user/:id`).get(Advert.getUserAdverts);
  app.post(`${urlPath}/adverts/add`, upload.single('image'), Advert.addAdvert);
};
