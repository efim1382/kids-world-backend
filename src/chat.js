module.exports = function(http) {
  const io = require('socket.io')(http);
  const db = require('./database')();
  const { logger } = require('./functions');

  io.on('connection', function(socket) {
    console.log('user connected');

    socket.on('message', function(data) {
      const { userFrom, userTo, message } = data;

      if (!userFrom || !userTo || !message) {
        io.emit('message', {
          status: 500,
          message: 'Ошибка при отправке сообщения',
        });

        return;
      }

      db.run(`
        INSERT INTO messages (idUserFrom, idUserTo, message)
        VALUES (?, ?, ?)
      `, [userFrom, userTo, message], function(error) {
        if (error) {
          logger('');

          io.emit('message', {
            status: 500,
            message: 'Ошибка при отправке сообщения',
          });

          return;
        }

        io.emit('message', { status: 200 });
      });
    });

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });

  return io;
};
