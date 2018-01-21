const uuidv4 = require('uuid/v4');
const db = require('../database')();
const { logger } = require('../functions');
const passwordHash = require('password-hash');
const fs = require('fs');
const path = require('path');
const multer  = require('multer');
const rimraf = require('rimraf');

/**
 * @api {post} /auth/login Авторизация
 * @apiGroup User
 *
 * @apiParam {String} email Эл. почта пользователя.
 * @apiParam {String} password Пароль.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "user": {
 *         "id": 12,
 *         "token": "dfs34rfeveg25grfdv"
 *       }
 *     }
 */
exports.login = function(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.send({
      status: 400,
      message: 'Не заполнены все поля',
    });

    return;
  }

  db.get(`
    SELECT id, hash, token
    FROM user
    WHERE email = ?
  `, [email], function(error, user) {
    if (error) {
      logger(error.message);
      return;
    }

    if (!user || !passwordHash.verify(password, user.hash)) {
      res.send({
        status: 500,
        message: 'Почта или пароль неверны',
      });

      return;
    }

    res.send({
      status: 200,

      user: {
        id: user.id,
        token: user.token,
      },
    });
  });
}

/**
 * @api {post} /auth/register Регистрация
 * @apiGroup User
 *
 * @apiParam {String} firstName Имя.
 * @apiParam {String} lastName Фамилия.
 * @apiParam {String} email Почта.
 * @apiParam {String} phone Телефон.
 * @apiParam {String} address Адрес.
 * @apiParam {String} password Пароль.
 * @apiParam {String} confirmPassword Повторный пароль.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "user": {
 *         "id": 12,
 *         "token": "dfs34rfeveg25grfdv"
 *       }
 *     }
 */
exports.register = function(req, res) {
  const { firstName, lastName, email, phone, address, password, confirmPassword } = req.body;
  const photo = '/images/user-image.jpg';

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !address ||
    !password ||
    !confirmPassword
  ) {
    res.send({
      status: 400,
      message: 'Не заполнены все обязательные поля'
    });

    return;
  }

  if (password !== confirmPassword) {
    res.send({
      status: 400,
      message: 'Пароли не совпадают',
    });

    return;
  }

  db.get(`
    SELECT id
    FROM user
    WHERE email = ?
  `, [email], function(error, user) {
    if (error) {
      logger(error.message);
      return;
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
        logger(error.message);
        return;
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

/**
 * @api {post} /user/me Получить текущего пользователя
 * @apiGroup User
 *
 * @apiParam {String} token Токен пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "user": {
 *         "id": 1,
 *         "firstName": "Петр",
 *         "lastName": "Петров",
 *         "email": "petr@gmail.com",
 *         "phone": "+79099993344",
 *         "address": "Ростов-на-Дону, Красноармейская, 11",
 *         "photo": "/images/user-image.jpg",
 *       }
 *     }
 */
exports.getCurrentUser = function(req, res) {
  const { token } = req.body;

  if (!token) {
    logger('"getCurrentUser", не пришли данные token');

    res.send({
      status: 500,
      message: 'Нет токена',
    });

    return;
  }

  db.get(`
    SELECT id,
           firstName,
           lastName,
           email,
           phone,
           address,
           photo
    FROM user
    WHERE token = ?
  `, [token], function(error, user) {
    if (error) {
      logger(error.message);
      return;
    }

    if (!user) {
      logger('"getCurrentUser", пользователь с таким токеном не существует');

      res.send({
        status: 500,
        message: 'Пользователь с таким token не существует',
      });

      return;
    }

    res.send({
      status: 200,
      user,
    });
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

exports.getbestSalers = function(req, res) {
  db.all(`
    SELECT DISTINCT count(review.id) as likes,
                    user.id,
                    user.photo,
                    user.firstName,
                    user.lastName
    FROM user, review
    WHERE user.id = review.idRecipient
    AND review.emotion = 'like'
    GROUP BY user.id
  `, [], function(error, users) {
    if (error) {
      return console.error(error.message);
    }

    if (!users) {
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

const deleteUserAdverts = (adverts) => {
  adverts.forEach(advert => {
    let imagesPath = `${process.env.ROOT_PATH}/upload/adverts/${advert.id}`;

    if (fs.existsSync(imagesPath)) {
      rimraf(imagesPath, function() {});
    }
  });
};

exports.deleteProfile = function(req, res) {
  const { id } = req.body;

  db.all(`
    SELECT *
    FROM advert
    WHERE idUser = ?
  `, [id], function(error, adverts) {
    if (error) {
      return console.error(error.message);
    }

    if (adverts) {
      deleteUserAdverts(adverts);
    }

    let photoPath = `${process.env.ROOT_PATH}/upload/users/${id}`;

    if (fs.existsSync(photoPath)) {
      rimraf(photoPath, function() {});
    }

    db.run(`
      DELETE
      FROM user
      WHERE id = ?
    `, [id], function(error) {
      if (error) {
        return console.error(error.message);
      }

      res.status(200).send();
    });
  });
};
