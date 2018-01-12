module.exports = function(app, urlPath) {
  const User = require('../controllers/UserController');

  app.post(`${urlPath}/auth/login`, User.login);
  app.post(`${urlPath}/auth/register`, User.register);
};
