module.exports = function(app) {
  app.get('/api/v1/adverts/', function(req, res) {
    var AdvertModel = require('./models/Advert');
    var adverts = AdvertModel.getAll().then(value => {
      res.send(value);
    });
  });

  app.post('/api/v1/adverts/add/', function(req, res) {
    var AdvertModel = require('./models/Advert');
    AdvertModel.save(req.body);
    res.send("Сохранено");
  });
};
