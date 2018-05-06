const db = require('../database')();

const { logger } = require('../functions');

/**
 * @api {post} /reviews/add addReview
 * @apiGroup Review
 *
 * @apiDescription Добавление отзыва о пользователе
 *
 * @apiParam {Number} idAuthor Id автора отзыва.
 * @apiParam {Number} idRecipient Id получателя.
 * @apiParam {String} emotion Оценка пользователя (like, dislike).
 * @apiParam {String} text Текст отзыва.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *     }
 */
exports.addReview = function(req, res) {
  const { idAuthor, idRecipient, emotion, text } = req.body;

  if (!idAuthor || !idRecipient || !emotion || !text) {
    logger('Не заполнены все данные');

    res.send({
      status: 500,
      message: 'Не заполнены все данные',
    });

    return;
  }

  db.run(`
    INSERT INTO review (text, emotion)
    VALUES (?, ?)
  `, [text, emotion], function(error) {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при добавлении отзыва',
      });

      return;
    }

    const idNewReview = this.lastID;

    db.serialize(function() {
      db.run(`
        INSERT INTO reviewUser (idUser, idReview, type)
        VALUES (?, ?, ?)
      `, [idAuthor, idNewReview, 'author']);

      db.run(`
        INSERT INTO reviewUser (idUser, idReview, type)
        VALUES (?, ?, ?)
      `, [idRecipient, idNewReview, 'recipient']);

      res.send({ status: 200 });
    });
  });
};

/**
 * @api {get} /reviews/user/:id getUserReviews
 * @apiGroup Review
 *
 * @apiDescription Получить отзывы пользователя
 *
 * @apiParam {Number} id Id пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *       "reviews": [{
 *         "idAuthor": 2,
 *         "name": "Петр Петров",
 *         "photo": "/images/user-image.jpg",
 *         "text": "Хороший продавец",
 *         "emotion": "like"
 *       }, {
 *         "idAuthor": 5,
 *         "name": "Иван Иванов",
 *         "photo": "/images/user-image.jpg",
 *         "text": "Плохой продавец",
 *         "emotion": "dislike"
 *       }]
 *     }
 */
exports.getUserReviews = function(req, res) {
  const { id } = req.params;

  if (!id) {
    logger('Нет id');

    res.send({
      status: 500,
      message: 'Ошибка при загрузке отзывов',
    });

    return;
  }

  db.all(`
    SELECT reviewUser.idUser as idAuthor,
           user.name as name,
           user.photo as photo,
           review.text as text,
           review.emotion as emotion
    FROM (
      SELECT idReview, idUser
      FROM reviewUser
      WHERE idUser = ?
      AND type = 'recipient'
    ) recipientReviews
    INNER JOIN review ON review.id = recipientReviews.idReview
    INNER JOIN reviewUser ON reviewUser.idReview = recipientReviews.idReview
    INNER JOIN user ON user.id = reviewUser.idUser
    WHERE reviewUser.type = 'author'
  `, [id], function(error, reviews) {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при загрузке отзывов',
      });

      return;
    }

    if (!reviews) {
      res.send({
        status: 200,
        reviews: [],
      });

      return;
    }

    res.send({
      status: 200,
      reviews,
    });
  });
};
