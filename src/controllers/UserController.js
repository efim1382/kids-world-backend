const uuidv4 = require('uuid/v4');
const db = require('../database')();
const passwordHash = require('password-hash');

exports.login = function(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.send({
      status: 400,
      message: 'Не заполнены все поля'
    });

    return;
  }

  db.get(`
    SELECT hash, token
    FROM user
    WHERE email = ?
  `, [email], (error, user) => {
    if (error) {
      return console.error(error.message);
    }

    if (!user || !passwordHash.verify(password, user.hash)) {
      res.send({
        status: 500,
        message: 'Неверные данные',
      });

      return;
    }

    res.send({
      status: 200,
      token: user.token,
    });
  });
}

exports.register = function(req, res) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const phone = req.body.phone;
  const address = req.body.address;
  const password = req.body.password;
  const photo = req.body.photo;

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

  db.get(`
    SELECT id
    FROM user
    WHERE email = ?
  `, [email], (error, user) => {
    if (error) {
      return console.error(error.message);
    }

    if (user) {
      res.send({
        status: 500,
        message: 'Пользователь с таким email уже существует',
      });

      return;
    }

    const token = uuidv4();

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
        passwordHash.generate(password),
        token,
      ], function(error) {
      if (error) {
        return console.log(error.message);
      }

      res.send({
        status: 200,
        token,
      });
    });
  });
};

exports.me = function(req, res) {
  const token = req.body.token;

  if (!token) {
    res.send({
      status: 500,
      message: 'Не пришли данные token',
    });

    return;
  }

  db.get(`
    SELECT *
    FROM user
    WHERE token = ?
  `, [token], (error, user) => {
    if (error) {
      return console.error(error.message);
    }

    if (!user) {
      res.send({
        status: 500,
        message: 'Пользователь не существует',
      });

      return;
    }

    res.send({
      status: 200,
      user: user,
    });
  });
};
