module.exports = function(app) {
  const urlPath = '/api/v1';
  const Advert = require('./controllers/AdvertController');
  const User = require('./controllers/UserController');
  const Review = require('./controllers/ReviewController');

  app.route(`${urlPath}/adverts`).get(Advert.getAdverts);
  app.route(`${urlPath}/adverts/:id`).get(Advert.getOneAdvert);
  app.route(`${urlPath}/adverts/add`).post(Advert.addAdvert);

  app.route(`${urlPath}/auth/login`).post(User.login);
  app.route(`${urlPath}/auth/register`).post(User.register);
  
  app.route(`${urlPath}/users`).get(User.getUsers);
  app.route(`${urlPath}/users/:id`).get(User.getOneUser);
  app.route(`${urlPath}/users/me`).post(User.getCurrentUser);

  app.route(`${urlPath}/reviews`).get(Review.getReviews);
  app.route(`${urlPath}/reviews/add`).post(Review.addReview);
};
