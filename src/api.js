module.exports = function(app) {
  const urlPath = '/api/v1';
  const Advert = require('./controllers/AdvertController');
  const User = require('./controllers/UserController');

  app.route(`${urlPath}/adverts`).get(Advert.getAdverts);
  app.route(`${urlPath}/adverts/add`).post(Advert.addAdvert);

  app.route(`${urlPath}/auth/login`).post(User.login);
  app.route(`${urlPath}/auth/register`).post(User.register);
  app.route(`${urlPath}/auth/users`).get(User.getUsers);
  app.route(`${urlPath}/auth/users/me`).post(User.getCurrentUser);
};
