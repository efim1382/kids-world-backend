const uuidv4 = require('uuid/v4');
const db = require('../database')();

const {
  logger,
  createUserPhotoDir,
  deleteUserAdverts,
} = require('../functions');

const passwordHash = require('password-hash');
const fs = require('fs');
const rimraf = require('rimraf');

/**
 * @api {post} /auth/login login
 * @apiGroup User
 *
 * @apiDescription Авторизация
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
 * @api {post} /auth/register register
 * @apiGroup User
 *
 * @apiDescription Регистрация
 *
 * @apiParam {String} name Полное имя.
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
  const { name, email, address, password } = req.body;
  const photo = req.files ? req.files.photo : null;

  if (
    !name ||
    !email ||
    !address ||
    !password
  ) {
    logger('Register, Заполнены не все поля');

    res.send({
      status: 500,
      message: 'Заполнены не все поля',
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

      res.send({
        status: 500,
        message: 'Ошибка при регистрации',
      });

      return;
    }

    if (user) {
      logger('Register, пользователь с таким email уже существует');

      res.send({
        status: 500,
        message: 'Пользователь с таким email уже существует',
      });

      return;
    }

    const token = uuidv4();
    let lastID = 0;

    db.run(`
      INSERT INTO user (name, email, address, photo, hash, token)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      name,
      email,
      address,
      '/images/user-image.jpg',
      passwordHash.generate(password),
      token,
    ], function(error) {
      if (error) {
        logger('Register, ошибка при внесении нового пользователя в бд');

        res.send({
          status: 500,
          message: 'Пользователь с таким email уже существует',
        });

        return;
      }

      lastID = this.lastID;

      if (!photo) {
        res.send({
          status: 200,

          user: {
            id: lastID,
            token,
          },
        });

        return;
      }
      console.log(photo.mv);

      createUserPhotoDir(lastID);

      photo.mv(`${process.env.ROOT_PATH}/upload/users/${lastID}/${photo.name}`, function(error) {
        if (error) {
          logger(error);

          res.send({
            status: 500,
            message: 'Ошибка при регистрации',
          });

          return;
        }

        db.run(`
          UPDATE user
          SET photo = ?
          WHERE id = ?
        `, [
          `users/${lastID}/${photo.name}`,
          lastID,
        ], (error) => {
          if (error) {
            logger(error.message);

            res.send({
              status: 500,
              message: 'Ошибка при регистрации',
            });

            return;
          }

          res.send({
            status: 200,

            user: {
              id: lastID,
              token,
            },
          });
        });
      });
    });
  });
};

/**
 * @api {post} /user/me getCurrentUser
 * @apiGroup User
 *
 * @apiDescription Получить текущего пользователя по token
 *
 * @apiParam {String} token Токен пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "user": {
 *         "id": 1,
 *         "name": "Петр Петров",
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
           name,
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

/**
 * @api {get} /user/:id getUser
 * @apiGroup User
 *
 * @apiDescription Получить пользователя по id
 *
 * @apiParam {Number} id Id пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "user": {
 *         "id": 1,
 *         "name": "Петр Петров",
 *         "email": "petr@gmail.com",
 *         "phone": "+79099993344",
 *         "address": "Ростов-на-Дону, Красноармейская, 11",
 *         "photo": "/images/user-image.jpg",
 *       }
 *     }
 */
exports.getUser = function(req, res, idUser) {
  let id = Number.isInteger(idUser) ? idUser : req.params.id;

  if (!id) {
    res.send({
      status: 500,
      message: 'Не указан id',
    });

    logger('"getUser", Не указан id');
    return;
  }

  db.get(`
    SELECT id,
           name,
           email,
           phone,
           address,
           photo
    FROM user
    WHERE id = ?
  `, [id], (error, user) => {
    if (error) {
      logger(error.message);
      return;
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
      user,
    });
  });
};

/**
 * @api {get} /users getUsers
 * @apiGroup User
 *
 * @apiDescription Получить всех пользователей
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "user": [{
 *         "id": 1,
 *         "name": "Петр Петров",
 *         "email": "petr@gmail.com",
 *         "phone": "+79099993344",
 *         "address": "Ростов-на-Дону, Красноармейская, 11",
 *         "photo": "/images/user-image.jpg",
 *       }, {
 *         "id": 2,
 *         "name": "Иван Иванов",
 *         "email": "ivan@gmail.com",
 *         "phone": "+79099993344",
 *         "address": "Ростов-на-Дону, Красноармейская, 11",
 *         "photo": "/images/user-image.jpg",
 *       }]
 *     }
 */
exports.getUsers = function(req, res) {
  db.all(`
    SELECT id,
           name,
           email,
           phone,
           address,
           photo
    FROM user
  `, [], (error, users) => {
    if (error) {
      logger(error.message);
      return;
    }

    if (!users) {
      res.send({
        status: 500,
        message: 'Пользователей нет',
      });

      return;
    }

    res.send({
      status: 200,
      users,
    });
  });
};

/**
 * @api {get} /users/bestSalers getbestSalers
 * @apiGroup User
 *
 * @apiDescription Получить трех пользователей с наибольшим кол-вом положительных отзывов
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "user": [{
 *         "likes": 143,
 *         "id": 1,
 *         "name": "Петр Петров",
 *         "photo": "/images/user-image.jpg",
 *       }, {
 *         "likes": 83,
 *         "id": 2,
 *         "name": "Иван Иванов",
 *         "photo": "/images/user-image.jpg",
 *       }, {
 *         "likes": 43,
 *         "id": 3,
 *         "name": "Сергей Сергеев",
 *         "photo": "/images/user-image.jpg",
 *       }]
 *     }
 */
exports.getbestSalers = function(req, res) {
  db.all(`
    SELECT DISTINCT count(review.id) as likes,
                    user.id,
                    user.name,
                    user.photo
    FROM user, review, reviewUser
    WHERE user.id = reviewUser.idUser
    AND reviewUser.type = 'recipient'
    AND reviewUser.idReview = review.id
    AND review.emotion = 'like'
    GROUP BY user.id
    LIMIT 3
  `, [], function(error, users) {
    if (error) {
      logger(error.message);
      return;
    }

    res.send({
      status: 200,
      users,
    });
  });
};

/**
 * @api {post} /user/address changeAddress
 * @apiGroup User
 *
 * @apiDescription Изменить адрес пользователя
 *
 * @apiParam {Number} id Id пользователя.
 * @apiParam {String} address Адрес пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *     }
 */
exports.changeAddress = function(req, res) {
  const { id, address } = req.body;

  if (!id || !address) {
    logger('Введены не все данные');

    res.send({
      status: 500,
      message: 'Введены не все данные',
    });

    return;
  }

  db.run(`
    UPDATE user
    SET address = ?
    WHERE id = ?
  `, [address, id], function(error) {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при изменении адреса',
      });

      return;
    }

    res.send({ status: 200 });
  });
};

/**
 * @api {post} /user/phone changePhone
 * @apiGroup User
 *
 * @apiDescription Изменить телефон пользователя
 *
 * @apiParam {Number} id Id пользователя.
 * @apiParam {String} phone Телефон пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *     }
 */
exports.changePhone = function(req, res) {
  const { id, phone } = req.body;

  if (!id || !phone) {
    logger('Введены не все данные');

    res.send({
      status: 500,
      message: 'Введены не все данные',
    });

    return;
  }

  db.run(`
    UPDATE user
    SET phone = ?
    WHERE id = ?
  `, [phone, id], function(error) {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при изменении телефона',
      });

      return;
    }

    res.send({ status: 200 });
  });
};

/**
 * @api {post} /user/email changeEmail
 * @apiGroup User
 *
 * @apiDescription Изменить email пользователя
 *
 * @apiParam {Number} id Id пользователя.
 * @apiParam {String} email Email пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *     }
 */
exports.changeEmail = function(req, res) {
  const { id, email } = req.body;

  if (!id || !email) {
    logger('Введены не все данные');

    res.send({
      status: 500,
      message: 'Введены не все данные',
    });

    return;
  }

  db.run(`
    UPDATE user
    SET email = ?
    WHERE id = ?
  `, [email, id], function(error) {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при изменении почты',
      });

      return;
    }

    res.send({ status: 200 });
  });
};

/**
 * @api {post} /user/password changePassword
 * @apiGroup User
 *
 * @apiDescription Изменить пароль пользователя
 *
 * @apiParam {Number} id Id пользователя.
 * @apiParam {String} password Текущий пароль пользователя.
 * @apiParam {String} newPassword Новый пароль пользователя.
 * @apiParam {String} confirmNewPassword Повтор нового пароля пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *     }
 */
exports.changePassword = function(req, res) {
  const { id, password, newPassword, confirmNewPassword } = req.body;

  if (!id || !password || !newPassword || !confirmNewPassword) {
    logger('Введены не все данные');

    res.send({
      status: 500,
      message: 'Введены не все данные',
    });

    return;
  }

  if (newPassword !== confirmNewPassword) {
    logger('Пароли не совпадают');
    
    res.send({
      status: 500,
      message: 'Пароли не совпадают',
    });

    return;
  }

  db.get(`
    SELECT hash
    FROM user
    WHERE id = ?
  `, [id], function(error, user) {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Пользователя не существует',
      });

      return;
    }

    if (!passwordHash.verify(password, user.hash)) {
      res.send({
        status: 500,
        message: 'Текущий пароль указан неверно',
      });

      return;
    }

    db.run(`
      UPDATE user
      SET hash = ?
      WHERE id = ?
    `, [passwordHash.generate(newPassword), id], function(error) {
      if (error) {
        logger(error.message);

        res.send({
          status: 500,
          message: 'Ошибка при изменении пароля',
        });

        return;
      }

      res.send({ status: 200 });
    });
  });
};

/**
 * @api {post} /user/photo changePhoto
 * @apiGroup User
 *
 * @apiDescription Изменить фотографию пользователя
 *
 * @apiParam {Number} id Id пользователя.
 * @apiParam {Object} photo Фотография.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *     }
 */
exports.changePhoto = function(req, res) {
  const { id } = req.body;
  const { photo } = req.files;

  if (!photo || !id) {
    logger('Нет photo или id');

    res.send({
      status: 500,
      message: 'Ошибка при изменении фотографии',
    });

    return;
  }

  createUserPhotoDir(id);

  db.get(`
    SELECT photo
    FROM user
    WHERE id = ?
  `, [id], function(error, user) {
    if (error) {
      logger(error.message);
      return;
    }

    let imagesPath = `${process.env.ROOT_PATH}/upload/${user.photo}`;

    if (user.photo !== '/images/user-image.jpg' && fs.existsSync(imagesPath)) {
      fs.unlinkSync(imagesPath);
    }

    photo.mv(`${process.env.ROOT_PATH}/upload/users/${id}/${photo.name}`, function(error) {
      if (error) {
        logger(error);

        res.send({
          status: 500,
          message: 'Ошибка при изменении фотографии',
        });

        return;
      }

      db.run(`
        UPDATE user
        SET photo = ?
        WHERE id = ?
      `, [
        `users/${id}/${photo.name}`,
        id,
      ], (error) => {
        if (error) {
          logger(error.message);

          res.send({
            status: 500,
            message: 'Ошибка при изменении фотографии',
          });

          return;
        }

        res.send({ status: 200 });
      });
    });
  });
};

/**
 * @api {delete} /user/delete deleteProfile
 * @apiGroup User
 *
 * @apiDescription Удалить профиль
 *
 * @apiParam {Number} id Id пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *     }
 */
exports.deleteProfile = function(req, res) {
  const { id } = req.body;

  if (!id) {
    logger('Нет id пользователя');

    res.send({
      status: 500,
      message: 'Ошибка при удалении пользователя',
    });

    return;
  }

  db.all(`
    SELECT id
    FROM advert
    WHERE idUser = ?
  `, [id], function(error, adverts) {
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
        logger('Ошибка при удалении пользователя');

        res.send({
          status: 500,
          message: 'Ошибка при удалении пользователя',
        });

        return;
      }

      res.send({ status: 200 });
    });
  });
};
