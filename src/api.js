module.exports = function(app) {
  const uriPath = '/api/v1';
  const Advert = require('./controllers/AdvertController');
  const User = require('./controllers/UserController');

  app.route(`${uriPath}/adverts`).get(Advert.getAllAdverts);
  app.route(`${uriPath}/adverts/add`).post(Advert.addAdvert);

  app.route(`${uriPath}/auth/login`).post(User.login);
  app.route(`${uriPath}/auth/register`).post(User.addUser);
};
