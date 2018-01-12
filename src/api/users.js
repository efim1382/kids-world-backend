module.exports = function(app, urlPath) {
  const User = require('../controllers/UserController');

  app.get(`${urlPath}/users`, User.getUsers);
  app.get(`${urlPath}/user/:id`, User.getUser);
  app.post(`${urlPath}/user/me`, User.me);
};
