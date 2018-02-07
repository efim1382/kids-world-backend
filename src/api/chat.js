module.exports = function(app, urlPath) {
  const Chat = require('../controllers/ChatController');

  app.get(`${urlPath}/chats/user/:id`, Chat.getUserChats);
  app.get(`${urlPath}/chat/:id/messages`, Chat.getChatMessages);
  app.get(`${urlPath}/chat/:id/user/currentUser/:userId`, Chat.getChatUser);
  app.post(`${urlPath}/chat/create`, Chat.createChat);
};
