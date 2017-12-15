module.exports = function(app, urlPath) {
  const User = require('../controllers/UserController');

  app.route(`${urlPath}/user/me`).post(User.me);
};
