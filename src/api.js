module.exports = function(app) {
  const urlPath = '/api/v1';
  const fs = require('fs');

  const multer  = require('multer');
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
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

  const Advert = require('./controllers/AdvertController');
  const User = require('./controllers/UserController');
  const Review = require('./controllers/ReviewController');

  app.route(`${urlPath}/adverts`).get(Advert.getAdverts);
  app.route(`${urlPath}/adverts/:id`).get(Advert.getOneAdvert);
  app.route(`${urlPath}/adverts/user/:id`).get(Advert.getUserAdverts);
  // app.route(`${urlPath}/adverts/add`).post(Advert.addAdvert);
  app.post(`${urlPath}/adverts/add`, upload.single('image'), Advert.addAdvert);

  app.route(`${urlPath}/auth/login`).post(User.login);
  app.route(`${urlPath}/auth/register`).post(User.register);
  
  app.route(`${urlPath}/users`).get(User.getUsers);
  app.route(`${urlPath}/users/:id`).get(User.getOneUser);
  app.route(`${urlPath}/users/me`).post(User.getCurrentUser);

  app.route(`${urlPath}/reviews`).get(Review.getReviews);
  app.route(`${urlPath}/reviews/user/:id`).get(Review.getUserReviews);
  app.route(`${urlPath}/reviews/add`).post(Review.addReview);
};
