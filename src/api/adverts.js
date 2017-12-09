module.exports = function(app, urlPath) {
  const Advert = require('../controllers/AdvertController');

  app.post(`${urlPath}/adverts/add`, Advert.addAdvert);
};
