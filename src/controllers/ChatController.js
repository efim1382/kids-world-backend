const db = require('../database')();
const { logger } = require('../functions');

/**
 * @api {post} /chat/messages getMessages
 * @apiGroup Chat
 *
 * @apiDescription Получить сообщения пользователя в чате
 *
 * @apiParam {Number} idUserFrom Id текущего пользователя.
 * @apiParam {Number} idUserTo Id пользователя по переписке.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "messages": [{
 *         "id": 1,
 *         "idUserFrom": 1,
 *         "idUserTo": 2,
 *         "message": "Здравствуйте!"
 *         "author": "you"
 *       }, {
 *         "id": 2,
 *         "idUserFrom": 2,
 *         "idUserTo": 1,
 *         "message": "Здравствуйте!"
 *         "author": "user"
 *       }]
 *     }
 */
exports.getMessages = function(req, res) {
  const { idUserFrom, idUserTo } = req.body;

  if (!idUserFrom || !idUserTo) {
    logger('Ошибка при загрузке сообщений');

    res.send({
      status: 500,
      message: 'Ошибка при загрузке сообщений',
    });

    return;
  }

  db.all(`
    SELECT id,
           idUserFrom,
           idUserTo,
           message,
           CASE idUserFrom
             WHEN ? THEN
               'you'
             ELSE
               'user'
           END author
    FROM messages
    WHERE (idUserTo = ? AND idUserFrom = ?) OR
          (idUserFrom = ? AND idUserTo = ?)
    ORDER BY id
  `, [idUserFrom, idUserTo, idUserFrom, idUserTo, idUserFrom], function(error, messages) {
    if (error) {
      logger('Ошибка при загрузке сообщений');

      res.send({
        status: 500,
        message: 'Ошибка при загрузке сообщений',
      });

      return;
    }

    res.send({
      status: 200,
      messages,
    });
  });
};

/**
 * @api {post} /chats getChats
 * @apiGroup Chat
 *
 * @apiDescription Получить список чатов пользователя
 *
 * @apiParam {Number} id Id текущего пользователя.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200,
 *       "chats": [{
 *         "id": 1,
 *         "firstName": "Петр",
 *         "lastName": "Петров",
 *         "photo": "/images/user-image.jpg",
 *         "message": "Здравствуйте"
 *       }]
 *     }
 */
exports.getChats = function(req, res) {
  const { id } = req.body;

  if (!id) {
    logger('Ошибка при получении чатов');

    res.send({
      status: 500,
      message: 'Ошибка при получении чатов',
    });

    return;
  }

  db.all(`
    SELECT idUserTo as id,
           firstName,
           lastName,
           photo,
           message
    FROM messages, user
    WHERE idUserFrom = ?
    AND user.id = messages.idUserTo
    GROUP BY idUserTo
  `, [id], function(error, chats) {
    if (error) {
      logger('Ошибка при получении чатов');

      res.send({
        status: 500,
        message: 'Ошибка при получении чатов',
      });

      return;
    }

    res.send({
      status: 200,
      chats,
    });
  });
};
