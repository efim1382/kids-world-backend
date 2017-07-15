const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.addUser = function(req, res) {
  let newUser = new User(req.body);

  newUser.save(function(err, user) {
    res.json(user);
  });
};
