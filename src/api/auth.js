module.exports = function(app) {
  const urlPath = '/api/v1';
  const User = require('../controllers/UserController');

  app.route(`${urlPath}/auth/login`).post(User.login);
  app.route(`${urlPath}/auth/register`).post(User.register);
};
