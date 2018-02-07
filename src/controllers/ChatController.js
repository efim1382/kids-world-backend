const db = require('../database')();
const User = require('./UserController');
const { logger } = require('../functions');

exports.createChat = function(req, res) {
  const { idAuthor, idRecipient } = req.body;
  let idNewChat = 0;

  if (!idAuthor || !idRecipient) {
    logger('createChat, не пришли данные idAuthor или idRecipient');

    res.send({
      status: 500,
      message: 'Ошибка при переходе к чату',
    });

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
};

exports.getUserChats = function(req, res) {
  const { id } = req.params;

  db.all(`
    SELECT chatUser.idChat,
           user.firstName,
           user.lastName,
           user.photo,
           chat.lastMessage
    FROM user, chatUser, chat
    WHERE user.id = chatUser.idUser
    AND chat.id = chatUser.idChat
    AND user.id != ?
  `, [id], function(error, chats) {
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
      chats,
    });
  });
};

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
