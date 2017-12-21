module.exports = function(app, urlPath) {
  const User = require('../controllers/UserController');

  app.route(`${urlPath}/user/me`).post(User.me);
  app.route(`${urlPath}/users`).get(User.getUsers);
  app.route(`${urlPath}/user/:id`).get(User.getUser);
};
