const uuidv4 = require('uuid/v4');
let db = require('../database')();

exports.register = function(req, res) {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let phone = req.body.phone;
  let address = req.body.address;
  let password = req.body.password;
  let photo = req.body.photo;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !address ||
    !password
  ) {
    res.send({
      status: 400,
      message: 'Не заполнены все обязательные поля'
    });

    return;
  }

  db.run(`
    INSERT INTO user (firstName, lastName, email, phone, address, photo, hash, token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
      firstName,
      lastName,
      email,
      phone,
      address,
      photo,
      password,
      ''
    ], function(error) {
    if (error) {
      return console.log(error.message);
    }

    res.send({
      status: 200,
    });
  });
};
