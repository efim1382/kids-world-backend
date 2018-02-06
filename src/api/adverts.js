module.exports = function(app, urlPath) {
  const Advert = require('../controllers/AdvertController');

  app.get(`${urlPath}/adverts`, Advert.getAdverts);
  app.get(`${urlPath}/advert/:id`, Advert.getAdvert);
  app.get(`${urlPath}/advert/:id/favorite/user/:userId`, Advert.isAdvertFavorite);
  app.get(`${urlPath}/adverts/favorite/user/:userId`, Advert.getFavoritesAdverts);
  app.post(`${urlPath}/adverts/user/:id`, Advert.getUserAdverts);
  app.post(`${urlPath}/adverts/logged`, Advert.getAdvertsLogged);
  app.post(`${urlPath}/advert/:id/favorite`, Advert.setFavoriteAdvert);
  app.post(`${urlPath}/adverts/:id/edit`, Advert.editAdvert);
  app.post(`${urlPath}/adverts/add`, Advert.addAdvert);
  app.delete(`${urlPath}/adverts/:id/delete`, Advert.deleteAdvert);
};
