const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.login = function(req, res) {
  res.send({
    token: 'sdasdsf43434fedff'
  });
};

exports.addUser = function(req, res) {
  let newUser = new User(req.body);

  newUser.save(function(err, user) {
    res.json(user);
  });
};
