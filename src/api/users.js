module.exports = function(app, urlPath) {
  const User = require('../controllers/UserController');

  app.get(`${urlPath}/users`, User.getUsers);
  app.get(`${urlPath}/user/:id`, User.getUser);
  app.get(`${urlPath}/users/bestSalers`, User.getbestSalers);
  app.post(`${urlPath}/user/me`, User.getCurrentUser);
  app.post(`${urlPath}/user/address`, User.changeAddress);
  app.post(`${urlPath}/user/phone`, User.changePhone);
  app.post(`${urlPath}/user/email`, User.changeEmail);
  app.post(`${urlPath}/user/password`, User.changePassword);
  app.post(`${urlPath}/user/photo`, User.changePhoto);
  app.delete(`${urlPath}/user/delete`, User.deleteProfile);
};
