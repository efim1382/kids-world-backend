const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
const User = mongoose.model('User');
const Advert = mongoose.model('Advert');
const fs = require('fs');

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

exports.getOneUser = function(req, res) {
  User.findOne({ '_id': req.params.id }, function(err, user) {
    if (!err) {
      res.json(user);
    }
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

exports.updatePhoto = function(req, res) {
  User.findOne({ _id: req.params.id }, function (err, user) {
    if (!err) {
      user.photo = `users/${req.params.id}/${req.file.originalname}`;
      user.save(function(err, user) {
        res.json(user);
      });
    }
  });
};

exports.updateEmail = function(req, res) {
  User.findOne({ _id: req.params.id }, function (err, user) {
    if (err) return;

    user.email = req.body.email;
    user.save(function(err, newUser) {
      res.json(newUser);
    });
  });
};

exports.updatePhone = function(req, res) {
  User.findOne({ _id: req.params.id }, function (err, user) {
    if (err) return;

    user.phone = req.body.phone;
    user.save(function(err, newUser) {
      res.json(newUser);
    });
  });
};

exports.updateAddress = function(req, res) {
  User.findOne({ _id: req.params.id }, function (err, user) {
    if (err) return;

    user.address = req.body.address;
    user.save(function(err, newUser) {
      res.json(newUser);
    });
  });
};

exports.updatePassword = function(req, res) {
  User.findOne({ _id: req.params.id }, function (err, user) {
    if (err) return;

    user.password = req.body.password;
    user.save(function(err, newUser) {
      res.json(newUser);
    });
  });
};

exports.deleteProfile = function(req, res) {
  User.findOne({ token: req.body.token }, function (err, user) {
    if (err) return;

    Advert.find({ userId: user._id }, function(err, adverts) {
      adverts.forEach(advert => {
        removeAdvert(advert);
      });
    });

    user.remove();

    res.send({
      status: 200
    });
  });
};

function removeAdvert(advert) {
  advert.remove();

  if (advert.image === 'images/ad-image.jpg') {
    return;
  }

  const filePath = `upload/${advert.image}`;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
