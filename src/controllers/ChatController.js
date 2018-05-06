const db = require('../database')();
const User = require('./UserController');
const { logger } = require('../functions');

/**
 * @api {post} /chat/create createChat
 * @apiGroup Chat
 *
 * @apiDescription Создать чат с пользователем
 *
 * @apiParam {Number} idAuthor Id пользователя, создающего чат.
 * @apiParam {Number} idRecipient Id пользователя, с кем необходимо создать чат.
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *       "chat": {
 *         "id": 1,
 *       },
 *     }
 */
exports.createChat = function(req, res) {
  const { idAuthor, idRecipient } = req.body;
  let idNewChat = 0;
  let isChatExist = false;

  if (!idAuthor || !idRecipient) {
    logger('createChat, не пришли данные idAuthor или idRecipient');

    res.send({
      status: 500,
      message: 'Ошибка при переходе к чату',
    });

    return;
  }

  db.all(`
    SELECT idChat,
           count(idChat) as count
    FROM chatUser
    WHERE idUser IN (?, ?)
    GROUP BY idChat
  `, [idAuthor, idRecipient], function(error, chatsUser) {
    chatsUser.forEach(chat => {
      if (chat.count === 2) {
        isChatExist = true;

        res.send({
          status: 200,
          
          chat: {
            id: chat.idChat
          },
        });

        return;
      }
    });

    if (isChatExist) {
      return;
    }

    db.run(`
      INSERT INTO chat(lastMessage)
      VALUES ('')
    `, [], function(error) {
      if (error) {
        logger('createChat, ошибка при добавлении пустой записи в chat');

        res.send({
          status: 500,
          message: 'Ошибка при переходе к чату',
        });

        return;
      }

      idNewChat = this.lastID;

      db.serialize(function () {
        db.run(`
          INSERT INTO chatUser(idChat, idUser)
          VALUES (?, ?)
        `, [idNewChat, idAuthor]);

        db.run(`
          INSERT INTO chatUser(idChat, idUser)
          VALUES (?, ?)
        `, [idNewChat, idRecipient], function () {
          res.send({
            status: 200,

            chat: {
              id: idNewChat,
            },
          });
        });
      });
    });
  });
};

/**
 * @api {get} /chats/user/:id getUserChats
 * @apiGroup Chat
 *
 * @apiDescription Получить список чатов пользователя
 *
 * @apiParam {Number} id Id пользователя
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *       "chats": [{
 *         "idChat": 1,
 *         "name": "Иван Иванов",
 *         "photo": "/images/user-image.jpg",
 *         "lastMessage": "Добрый день",
 *       }],
 *     }
 */
exports.getUserChats = function(req, res) {
  const { id } = req.params;

  db.all(`
    SELECT chatUser.idChat as idChat,
           user.name as name,
           user.photo as photo,
           chat.lastMessage as lastMessage
    FROM (
      SELECT idChat, idUser
      FROM chatUser
      WHERE idUser = ?
    ) userChats
    INNER JOIN chatUser ON chatUser.idChat = userChats.idChat
    INNER JOIN user ON user.id = chatUser.idUser
    INNER JOIN chat ON chat.id = chatUser.idChat
    WHERE chatUser.idUser != userChats.idUser
  `, [id], function(error, userChats) {
    if (error) {
      logger('getUserChats, ошибка при получении чатов');

      res.send({
        status: 500,
        message: 'Ошибка при получении чатов',
      });

      return;
    }

    res.send({
      status: 200,
      chats: userChats,
    });
  });
};

/**
 * @api {get} /chat/:id/messages getChatMessages
 * @apiGroup Chat
 *
 * @apiDescription Получить сообщения чата
 *
 * @apiParam {Number} id Id чата
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
 *       "messages": [{
 *         "idMessage": 1,
 *         "idUser": 1,
 *         "text": "Добрый день",
 *       }],
 *     }
 */
exports.getChatMessages = function(req, res) {
  const { id } = req.params;

  db.all(`
    SELECT message.id as idMessage,
           message.idUser,
           text
    FROM message, chatUser
    WHERE chatUser.idChat = message.idChat
    AND message.idUser = chatUser.idUser
    AND chatUser.idChat = ?
    GROUP BY idMessage
  `, [id], function(error, messages) {
    if (error) {
      logger('getChatMessages, ошибка при получении сообщений');

      res.send({
        status: 500,
        message: 'Ошибка при получении сообщений',
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
 * @api {get} /chat/:id/user/currentUser/:userId getChatUser
 * @apiGroup Chat
 *
 * @apiDescription Получить пользователя, с которым переписываешься
 *
 * @apiParam {Number} id Id чата
 * @apiParam {Number} id Id пользователя
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 200
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
exports.getChatUser = function(req, res) {
  const { id, userId } = req.params;

  db.get(`
    SELECT user.id
    FROM user, chatUser
    WHERE user.id = chatUser.idUser
    AND chatUser.idChat = ?
    AND user.id != ?
  `, [id, userId], function(error, user) {
    if (error) {
      logger('Ошибка при получении id пользователя чата');

      res.send({
        status: 500,
        message: 'Ошибка при получении пользователя',
      });

      return;
    }

    User.getUser(req, res, user.id);
  });
};
