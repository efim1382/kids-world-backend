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
 *         "userId": 3
 *         "firstName": "Петр"
 *         "lastName": "Петров"
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
           user.firstName,
           user.lastName,
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
 * @api {get} /adverts/:id getAdvert
 * @apiGroup Adverts
 *
 * @apiDescription Получить объявление по id
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
 *         "firstName": "Петр"
 *         "lastName": "Петров"
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
           user.firstName,
           user.lastName,
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

exports.getUserAdverts = function(req, res) {
  db.all(`
    SELECT *
    FROM advert
    WHERE idUser = ?
  `, [req.params.id], function(error, adverts) {
    if (error) {
      return console.log(error.message);
    }

    if (!adverts) {
      res.status(400).send({ message: 'У пользователя нет объявлений' });
      return;
    }

    res.status(200).send(adverts);
  });
};

exports.setFavoriteAdvert = function(req, res) {
  const userId = req.body.userId;
  const advertId = req.params.id;

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
          console.log(error.message);
        }
      });
    } else {
      db.run(`
        DELETE FROM favorites
        WHERE idUser = ?
        AND idAdvert = ?
      `, [userId, advertId], function(error) {
        if (error) {
          console.error(error.message);
        }
      });
    }

    res.status(200).send({ message: 'ok' });
  });

};

exports.isAdvertFavorite = function(req, res) {
  const { id, userId } = req.params;
  
  db.get(`
    SELECT *
    FROM favorites
    WHERE idUser = ?
    AND idAdvert = ?
    LIMIT 1
  `, [userId, id], function(error, favorite) {
    if (!favorite) {
      res.send(false);
      return;
    }

    res.send(true);
  });
};

exports.getFavoritesAdverts = function(req, res) {
  const { userId } = req.params;

  db.all(`
    SELECT advert.id,
           advert.title,
           advert.mainImage
    FROM advert, favorites
    WHERE advert.id = favorites.idAdvert
    AND favorites.idUser = ?
  `, [userId], function(error, adverts) {
    if (error) {
      return console.error(error.message);
    }

    res.status(200).send(adverts);
  });

};

exports.deleteAdvert = function(req, res) {
  const { id } = req.params;

  db.get(`
    SELECT *
    FROM advert
    WHERE id = ?
  `, [id], (error, advert) => {
    if (error) {
      return console.error(error.message);
    }

    if (!advert) {
      // 500 ?
      res.status(500);
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
        return console.error(error.message);
      }

      res.status(200).send();
    });
  });
};
