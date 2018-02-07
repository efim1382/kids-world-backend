module.exports = function(http) {
  const io = require('socket.io')(http);
  const db = require('./database')();
  const { logger } = require('./functions');

  io.on('connection', function(socket) {
    socket.on('message', function(data) {
      const { id, userId, message } = data;

      if (!id || !userId || !message) {
        logger('При получении сообщения не пришли все данные');

        io.emit('message', {
          status: 500,
          message: 'Ошибка при отправке сообщения',
        });

        return;
      }

      db.serialize(function() {
        db.run(`
          UPDATE chat
          SET lastMessage = ?
          WHERE id = ?
        `, [message, id]);

        db.run(`
          INSERT INTO message (idChat, idUser, text)
          VALUES (?, ?, ?)
        `, [id, userId, message], function(error) {
          if (error) {
            logger('При обновлении message ошибка');

            io.emit('message', {
              status: 500,
              message: 'Ошибка при отправке сообщения',
            });

            return;
          }

          io.emit('message', { status: 200 });
        });
      });
    });
  });

  return io;
};
