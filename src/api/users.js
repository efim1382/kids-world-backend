module.exports = function(app) {
  const urlPath = '/api/v1';
  const User = require('../controllers/UserController');

  const fs = require('fs');

  const multer  = require('multer');
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync('upload')) {
        fs.mkdirSync('upload');
      }
      if (!fs.existsSync('upload/users')) {
        fs.mkdirSync('upload/users');
      }
      if (!fs.existsSync(`upload/users/${req.params.id}`)) {
        fs.mkdirSync(`upload/users/${req.params.id}`);
      }

      cb(null, `upload/users/${req.params.id}`);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  const upload = multer({ storage: storage })

  app.route(`${urlPath}/users`).get(User.getUsers);
  app.route(`${urlPath}/users/:id`).get(User.getOneUser);
  app.route(`${urlPath}/users/me`).post(User.getCurrentUser);
  app.post(`${urlPath}/users/:id/updatePhoto`, upload.single('photo'), User.updatePhoto);
  app.post(`${urlPath}/users/:id/updateEmail`, User.updateEmail);
  app.post(`${urlPath}/users/:id/updatePhone`, User.updatePhone);
  app.post(`${urlPath}/users/:id/updateAddress`, User.updateAddress);
  app.post(`${urlPath}/users/:id/updatePassword`, User.updatePassword);
  app.post(`${urlPath}/deleteProfile`, User.deleteProfile);
};
