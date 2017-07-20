module.exports = function(app) {
  const urlPath = '/api/v1';
  const Advert = require('../controllers/AdvertController');

  app.route(`${urlPath}/adverts`).get(Advert.getAdverts);
  app.route(`${urlPath}/adverts/:id`).get(Advert.getOneAdvert);
  app.route(`${urlPath}/adverts/user/:id`).get(Advert.getUserAdverts);
  app.post(`${urlPath}/adverts/add`, Advert.addAdvert);
  app.post(`${urlPath}/adverts/:id/edit`, Advert.editAdvert);
};
