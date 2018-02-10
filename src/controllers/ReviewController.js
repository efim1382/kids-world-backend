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
    INSERT INTO review (idAuthor, idRecipient, emotion, text)
    VALUES (?, ?, ?, ?)
  `, [idAuthor, idRecipient, emotion, text], function(error) {
    if (error) {
      logger(error.message);

      res.send({
        status: 500,
        message: 'Ошибка при добавлении отзыва',
      });

      return;
    }

    res.send({ status: 200 });
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
 *         "idRecipient": 1,
 *         "idAuthor": 2,
 *         "name": "Петр Петров",
 *         "photo": "/images/user-image.jpg",
 *         "text": "Хороший продавец",
 *         "emotion": "like"
 *       }, {
 *         "idRecipient": 3,
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
    SELECT review.id as id,
           user.id as idRecipient,
           review.idAuthor as idAuthor,
           user.name,
           user.photo,
           review.text,
           review.emotion
    FROM user, review
    WHERE user.id = review.idAuthor
    AND review.idRecipient = ?
    ORDER BY review.id
    DESC
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
