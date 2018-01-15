const uuidv4 = require('uuid/v4');
const db = require('../database')();
const passwordHash = require('password-hash');
const fs = require('fs');
const path = require('path');
const multer  = require('multer');
const rimraf = require('rimraf');

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
    SELECT id, hash, token
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
      user: user,
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
        return console.error(error.message);
      }

      res.send({
        status: 200,
        user: {
          id: this.lastID,
          token,
        },
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
      res.status(500).send('Пользователь не существует');
      return;
    }

    res.status(200).send(user);
  });
};

exports.getUser = function(req, res) {
  db.get(`
    SELECT *
    FROM user
    WHERE id = ?
  `, [req.params.id], (error, user) => {
    if (error) {
      return console.error(error.message);
    }

    if (!user) {
      res.status(500).send('Пользователь не существует');
      return;
    }

    res.status(200).send(user);
  });
};

exports.getUsers = function(req, res) {
  db.all(`
    SELECT *
    FROM user
  `, [], (error, users) => {
    if (error) {
      return console.error(error.message);
    }

    if (!users) {
      res.status(500).send('Пользователей нет');
      return;
    }

    res.status(200).send(users);
  });
};

exports.changeAddress = function(req, res) {
  db.run(`
    UPDATE user
    SET address = ?
    WHERE id = ?
  `, [req.body.address, req.body.id], function(error) {
    if (error) {
      return console.error(error.message);
    }

    res.status(200).send();
  });
};

exports.changePhone = function(req, res) {
  db.run(`
    UPDATE user
    SET phone = ?
    WHERE id = ?
  `, [req.body.phone, req.body.id], function(error) {
    if (error) {
      return console.error(error.message);
    }

    res.status(200).send();
  });
};

exports.changeEmail = function(req, res) {
  db.run(`
    UPDATE user
    SET email = ?
    WHERE id = ?
  `, [req.body.email, req.body.id], function(error) {
    if (error) {
      return console.error(error.message);
    }

    res.status(200).send();
  });
};

exports.changePassword = function(req, res) {
  const { id, password, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    // 500?
    res.status(500).send();
    return;
  }

  db.get(`
    SELECT hash
    FROM user
    WHERE id = ?
  `, [id], function(error, user) {
    if (error) {
      return console.error(error.message);
    }

    if (!passwordHash.verify(password, user.hash)) {
      res.status(500).send();
      return;
    }

    db.run(`
      UPDATE user
      SET hash = ?
      WHERE id = ?
    `, [passwordHash.generate(newPassword), id], function(error) {
      if (error) {
        return console.error(error.message);
      }

      res.status(200).send({ message: 'ok' });
    });
  });
};

const createUserPhotoDir = (id) => {
  if (!fs.existsSync('upload')) {
    fs.mkdirSync('upload');
  }

  if (!fs.existsSync('upload/users')) {
    fs.mkdirSync('upload/users');
  }

  if (!fs.existsSync(`upload/users/${id}`)) {
    fs.mkdirSync(`upload/users/${id}`);
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.body.id;
    createUserPhotoDir(userId);

    db.get(`
      SELECT photo
      FROM user
      WHERE id = ?
    `, [userId], function(error, user) {
      if (error) {
        return console.error(error.message);
      }

      let imagesPath = `${process.env.ROOT_PATH}/upload/${user.photo}`;

      if (user.photo !== '/images/user-image.jpg' && fs.existsSync(imagesPath)) {
        fs.unlinkSync(imagesPath);
      }

      db.run(`
        UPDATE user
        SET photo = ?
        WHERE id = ?
      `, [
        `users/${userId}/${file.originalname}`,
        userId,
      ], (error) => {
        if (error) {
          return console.error(error.message);
        }

        cb(null, `upload/users/${userId}`);
      });
    });

  },

  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage }).single('photo');

exports.changePhoto = function(req, res) {
  upload(req, res, function() {
    res.status(200).send();
  });
};
