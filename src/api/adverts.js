module.exports = function(app, urlPath) {
  const Advert = require('../controllers/AdvertController');

  app.get(`${urlPath}/adverts`, Advert.getAdverts);
  app.get(`${urlPath}/advert/:id`, Advert.getAdvert);
  app.get(`${urlPath}/adverts/user/:id`, Advert.getUserAdverts);
  app.post(`${urlPath}/adverts/:id/edit`, Advert.editAdvert);
  app.post(`${urlPath}/adverts/:id/edit/image`, Advert.editAdvertWithImage);
  app.post(`${urlPath}/adverts/create`, Advert.createAdvert);
  app.post(`${urlPath}/adverts/add`, Advert.addAdvert);
  app.delete(`${urlPath}/adverts/:id/delete`, Advert.deleteAdvert);
};
