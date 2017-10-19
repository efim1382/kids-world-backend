module.exports = function(app, urlPath) {
  const User = require('../controllers/UserController');

  app.route(`${urlPath}/auth/register`).post(User.register);
};
