module.exports = function(app, urlPath) {
  const Chat = require('../controllers/ChatController');

  app.post(`${urlPath}/chat/messages`, Chat.getMessages);
  app.post(`${urlPath}/chats`, Chat.getChats);
};
