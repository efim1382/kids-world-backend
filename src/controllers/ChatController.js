const db = require('../database')();
const User = require('./UserController');
const { logger } = require('../functions');

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
