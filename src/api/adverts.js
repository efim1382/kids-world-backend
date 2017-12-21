module.exports = function(app, urlPath) {
  const Advert = require('../controllers/AdvertController');

  app.get(`${urlPath}/adverts`, Advert.getAdverts);
  app.get(`${urlPath}/advert/:id`, Advert.getAdvert);
  app.post(`${urlPath}/adverts/create`, Advert.createAdvert);
  app.post(`${urlPath}/adverts/add`, Advert.addAdvert);
};
