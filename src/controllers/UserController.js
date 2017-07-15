const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
const User = mongoose.model('User');

exports.login = function(req, res) {
  let email = req.body.email;

  User.findOne({ 'email': email }, function(err, user) {
    if (!err) {
      res.json({
        token: user.token
      });
    }
  });
};

exports.register = function(req, res) {
  let newUser = new User(Object.assign(req.body, {
    token: uuidv4(),
  }));

  newUser.save(function(err, user) {
    res.json(user);
  });
};

exports.getUsers = function(req, res) {
  User.find({}, function(err, users) {
    res.send(users);
  });
};

exports.getCurrentUser = function(req, res) {
  let token = req.body.token;

  User.findOne({ 'token': token }, function(err, user) {
    if (!err) {
      res.json(user);
    }
  });
};
