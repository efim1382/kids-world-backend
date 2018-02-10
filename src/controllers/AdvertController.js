const db = require('../database')();
const fs = require('fs');
const { logger, createAdvertImagesDir } = require('../functions');
const path = require('path');
const rimraf = require('rimraf');

/**
 * @api {get} /adverts getAdverts
 * @apiGroup Adverts
 *
 * @apiDescription Получить все объявления
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "adverts": [{
 *         "id": 1
 *         "title": "Детские тапки"
 *         "date": "15 декабря, 2017"
 *         "price": 1250
 *         "category": "footwear"
 *         "mainImage": "/images/ad-image.jpg"
 *         "userId": 3,
 *         "name": "Петр Петров",
 *         "address": "Ростов-на-Дону, Красноармейская, 12"
 *         "photo": "/images/user-image.jpg"
 *       }]
 *     }
 */
exports.getAdverts = function(req, res) {
  db.all(`
    SELECT advert.id,
           advert.title,
           advert.date,
           advert.price,
           advert.category,
           advert.mainImage,
           user.id as userId,
           user.name,
           user.address,
           user.photo
    FROM advert, user
    WHERE advert.idUser = user.id
    ORDER BY advert.id
    DESC
  `, [], (error, adverts) => {
    if (error) {
      logger(error.message);
      return;
    }

    if (!adverts) {
      logger('Нет объявлений');

      res.send({
        status: 200,
        adverts: [],
      });

      return;
    }

    res.send({
      status: 200,
      adverts,
    });
  });
};

/**
 * @api {post} /adverts/logged getAdvertsLogged
 * @apiGroup Adverts
 *
 * @apiDescription Получить все объявления, если пользователь авторизован
 *
 * @apiParam {Number} id Id пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "adverts": [{
 *         "id": 1,
 *         "title": "Детские тапки",
 *         "date": "15 декабря, 2017",
 *         "price": 1250,
 *         "category": "footwear",
 *         "mainImage": "/images/ad-image.jpg",
 *         "userId": 3,
 *         "name": "Петр Петров",
 *         "address": "Ростов-на-Дону, Красноармейская, 12",
 *         "isFavorite": "true",
 *         "photo": "/images/user-image.jpg"
 *       }]
 *     }
 */
exports.getAdvertsLogged = function(req, res) {
  const { id } = req.body;

  db.all(`
    SELECT advert.id as id,
           advert.title as title,
           advert.date as date,
           advert.price as price,
           advert.category as category,
           advert.mainImage as mainImage,
           user.id as userId,
           user.name as name,
           user.address as address,
           user.photo as photo,
           CASE WHEN EXISTS (
             SELECT idAdvert
             FROM favorites
             WHERE idAdvert = advert.id
           )
             THEN 'true'
           END AS isFavorite
    FROM advert
    INNER JOIN user ON user.id = advert.idUser
    ORDER BY advert.id
    DESC
  `, [], function(error, adverts) {
    if (error) {
      logger('Ошибка при получении объявлений');

      res.send({
        status: 500,
        message: 'Ошибка при получении объявлений',
      });

      return;
    }

    res.send({
      status: 200,
      adverts,
    });
  });
};

/**
 * @api {get} /adverts/:id getAdvert
 * @apiGroup Adverts
 *
 * @apiDescription Получить объявление по id
 *
 * @apiParam {String} description Описание.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "advert": {
 *         "id": 1
 *         "title": "Детские тапки"
 *         "date": "15 декабря, 2017"
 *         "price": 1250
 *         "category": "footwear"
 *         "mainImage": "/images/ad-image.jpg"
 *         "userId": 3
 *         "name": "Петр Петров",
 *         "address": "Ростов-на-Дону, Красноармейская, 12"
 *         "email": "petr@gmail.com"
 *         "photo": "/images/user-image.jpg"
 *       }
 *     }
 */
exports.getAdvert = function(req, res) {
  const { id } = req.params;

  if (!id) {
    logger('Не передан id');

    res.send({
      status: 500,
      message: 'Ошибка при получении объявления',
    });

    return;
  }

  db.get(`
    SELECT advert.id,
           advert.title,
           advert.date,
           advert.price,
           advert.category,
           advert.description,
           advert.mainImage,
           user.id as userId,
           user.name,
           user.address,
           user.email,
           user.phone,
           user.photo
    FROM advert, user
    WHERE advert.idUser = user.id
    AND advert.id = ?
  `, [id], (error, advert) => {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при получении объявления',
      });

      return;
    }

    if (!advert) {
      logger('Ошибка при получении объявления');

      res.send({
        status: 500,
        message: 'Ошибка при получении объявления',
      });

      return;
    }

    res.send({
      status: 200,
      advert,
    });
  });
};

/**
 * @api {post} /adverts/add addAdvert
 * @apiGroup Adverts
 *
 * @apiDescription Добавление объявления
 *
 * @apiParam {Number} userId Id автора объявления.
 * @apiParam {String} title Заголовок.
 * @apiParam {Date} date Дата создания объявления.
 * @apiParam {Number} price Цена.
 * @apiParam {String} category Категория.
 * @apiParam {String} description Описание.
 * @apiParam {Obect} image Фотография объявления.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "advert": {
 *         "id": 1
 *       }
 *     }
 */
exports.addAdvert = function(req, res) {
  const {
    userId, title, date, price, category, description
  } = req.body;

  const { image } = req.files;

  if (
    !userId ||
    !title ||
    !date ||
    !price ||
    !category ||
    !description ||
    !image
  ) {
    logger('Заполнены не все данные');

    res.send({
      status: 500,
      message: 'Заполните все данные'
    });

    return;
  }

  db.run(`
    INSERT INTO advert (
      title,
      date,
      price,
      category,
      description,
      idUser
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    title,
    date,
    price,
    category,
    description,
    userId
  ], function(error) {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при добавлении объявления',
      });

      return;
    }

    const advertId = this.lastID;

    db.run(`
      UPDATE advert
      SET mainImage = ?
      WHERE id = ?
    `, [`adverts/${advertId}/${image.name}`, advertId], function(error) {
      if (error) {
        logger(error.message);

        res.send({
          status: 500,
          message: 'Ошибка при добавлении объявления',
        });

        return;
      }
    });

    createAdvertImagesDir(advertId);

    image.mv(`${process.env.ROOT_PATH}/upload/adverts/${advertId}/${image.name}`, function(error) {
      if (error) {
        logger(error);
      }

      res.send({
        status: 200,

        advert: {
          id: advertId,
        },
      });
    });
  });
}

/**
 * @api {post} /adverts/:id/edit editAdvert
 * @apiGroup Adverts
 *
 * @apiDescription Редактирование объявления
 *
 * @apiParam {Number} id Id объявления.
 * @apiParam {String} title Заголовок.
 * @apiParam {Number} price Цена.
 * @apiParam {String} category Категория.
 * @apiParam {String} description Описание.
 * @apiParam {Obect} image Фотография объявления.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *     }
 */
exports.editAdvert = function(req, res) {
  const { id } = req.params;
  const { title, price, category, description } = req.body;

  const { image } = req.files || {};

  if (
    !id ||
    !title ||
    !price ||
    !category ||
    !description
  ) {
    logger('Заполните все поля');

    res.send({
      status: 500,
      message: 'Заполните все поля',
    });

    return;
  }

  db.get(`
    SELECT mainImage
    FROM advert
    WHERE id = ?
  `, [id], function(error, advert) {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при редактировании объявления',
      });

      return;
    }

    if (image) {
      fs.unlink(`${process.env.ROOT_PATH}/upload/${advert.mainImage}`, function(error) {
        if (error) {
          logger(error.message);
        };
      });

      image.mv(`${process.env.ROOT_PATH}/upload/adverts/${id}/${image.name}`, function(error) {
        if (error) {
          logger(error);
          return;
        }

        db.run(`
          UPDATE advert
          SET mainImage = ?
          WHERE id = ?
        `, [`adverts/${id}/${image.name}`, id], function(error) {
          if (error) {
            logger(error.message);
          }
        });
      });
    }

    db.run(`
      UPDATE advert
      SET title = ?, price = ?, category = ?, description = ?
      WHERE id = ?
    `, [title, price, category, description, id], function(error) {
      if (error) {
        logger(error.message);

        res.send({
          status: 500,
          message: 'Ошибка при редактировании объявления',
        });

        return;
      }

      res.send({ status: 200 });
    });
  });
};

/**
 * @api {post} /adverts/user/:id getUserAdverts
 * @apiGroup Adverts
 *
 * @apiDescription Получение объявлений пользователя
 *
 * @apiParam {Number} id Id пользователя.
 * @apiParam {Number} userId Id текущего пользователя. Не обязательно, если передано, отдаем поле isFavorite
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "adverts": [{
 *         "id": 1,
 *         "title": "Детские тапки",
 *         "mainImage": "/images/ad-image.jpg"
 *       }]
 *     }
 */
exports.getUserAdverts = function(req, res) {
  const { id } = req.params;
  const { userId } = req.body;

  if (userId) {
    queryUserAdvertsLogged();
  } else {
    queryUserAdverts();
  }

  function queryUserAdverts() {
    db.all(`
      SELECT id, title, mainImage, description
      FROM advert
      WHERE idUser = ?
    `, [id], result);
  }

  function queryUserAdvertsLogged() {
    db.all(`
      SELECT id,
             title,
             mainImage,
             description,
             CASE WHEN EXISTS (
               SELECT idAdvert
               FROM favorites
               WHERE idAdvert = advert.id
             )
               THEN 'true'
             END as isFavorite
      FROM advert
      WHERE idUser = ?
    `, [id], result);
  }

  function result(error, adverts) {
    if (error) {
      logger('Ошибка при получении объявлений');

      res.send({
        status: 500,
        message: 'Ошибка при получении объявлений',
      });

      return;
    }

    res.send({
      status: 200,
      adverts,
    });
  }
};

/**
 * @api {post} /advert/:id/favorite setFavoriteAdvert
 * @apiGroup Adverts
 *
 * @apiDescription Добавление объявления в избранное
 *
 * @apiParam {userId} id Id пользователя.
 * @apiParam {advertId} id Id объявления.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *     }
 */
exports.setFavoriteAdvert = function(req, res) {
  const userId = req.body.userId;
  const advertId = req.params.id;

  if (!userId || !advertId) {
    logger('Не пришли все данные');

    res.send({
      status: 500,
      message: 'Ошибка',
    });

    return;
  }

  db.get(`
    SELECT id
    FROM favorites
    WHERE idUser = ?
    AND idAdvert = ?
    LIMIT 1
  `, [userId, advertId], function(error, favorite) {
    if (!favorite) {
      db.run(`
        INSERT INTO favorites (idUser, idAdvert)
        VALUES (?, ?)
      `, [userId, advertId], function(error) {
        if (error) {
          logger(error.message);

          res.send({
            status: 500,
            message: 'Ошибка',
          });

          return;
        }
      });
    } else {
      db.run(`
        DELETE FROM favorites
        WHERE idUser = ?
        AND idAdvert = ?
      `, [userId, advertId], function(error) {
        if (error) {
          logger(error.message);

          res.send({
            status: 500,
            message: 'Ошибка',
          });

          return;
        }
      });
    }

    res.send({ status: 200 });
  });
};

/**
 * @api {get} /advert/:id/favorite/user/:userId isAdvertFavorite
 * @apiGroup Adverts
 *
 * @apiDescription Проверка помечено ли объявление как избранное
 *
 * @apiParam {id} id Id объявления.
 * @apiParam {userId} id Id пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "isFavorite": true
 *     }
 */
exports.isAdvertFavorite = function(req, res) {
  const { id, userId } = req.params;

  if (!id || !userId) {
    logger('Не пришли все данные');

    res.send({
      status: 500,
      message: 'Не пришли все данные',
    });

    return;
  }
  
  db.get(`
    SELECT *
    FROM favorites
    WHERE idUser = ?
    AND idAdvert = ?
    LIMIT 1
  `, [userId, id], function(error, favorite) {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при проверке',
      });

      return;
    }

    if (!favorite) {
      res.send({
        status: 200,
        isFavorite: false,
      });

      return;
    }

    res.send({
      status: 200,
      isFavorite: true,
    });
  });
};

/**
 * @api {get} /adverts/favorite/user/:userId getFavoritesAdverts
 * @apiGroup Adverts
 *
 * @apiDescription Получение избранных объявлений
 *
 * @apiParam {userId} id Id объявления.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "adverts": [{
 *         "id": 1,
 *         "title": "Детские тапки",
 *         "mainImage": "/images/ad-image.jpg"
 *       }]
 *     }
 */
exports.getFavoritesAdverts = function(req, res) {
  const { userId } = req.params;

  if (!userId) {
    logger('Не пришел id');

    res.send({
      status: 500,
      message: 'Ошибка',
    });

    return;
  }

  db.all(`
    SELECT advert.id,
           advert.title,
           advert.mainImage
    FROM advert, favorites
    WHERE advert.id = favorites.idAdvert
    AND favorites.idUser = ?
  `, [userId], function(error, adverts) {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при получении объявления',
      });

      return;
    }

    res.send({
      status: 200,
      adverts,
    });
  });
};

/**
 * @api {get} /adverts/:id/delete deleteAdvert
 * @apiGroup Adverts
 *
 * @apiDescription Удаление объявления
 *
 * @apiParam {id} id Id объявления.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *     }
 */
exports.deleteAdvert = function(req, res) {
  const { id } = req.params;

  if (!id) {
    logger('Не пришел id');
    return;
  }

  db.get(`
    SELECT *
    FROM advert
    WHERE id = ?
  `, [id], (error, advert) => {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при удалении объявления',
      });

      return;
    }

    if (!advert) {
      logger('Нет такого объявления');

      res.send({
        status: 500,
        message: 'Ошибка при удалении объявления',
      });

      return;
    }

    let imagesPath = `${process.env.ROOT_PATH}/upload/adverts/${id}`;

    if (fs.existsSync(imagesPath)) {
      rimraf(imagesPath, function() {});
    }

    db.run(`
      DELETE
      FROM advert
      WHERE id = ?
    `, [id], (error) => {
      if (error) {
        logger(error.message);

        res.send({
          status: 500,
          message: 'Ошибка при удалении объявления',
        });

        return;
      }

      res.send({ status: 200 });
    });
  });
};
