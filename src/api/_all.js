module.exports = function(app) {
  require('./auth')(app, '/api/v1');
  require('./users')(app, '/api/v1');
  require('./adverts')(app, '/api/v1');
  require('./reviews')(app, '/api/v1');
  require('./chat')(app, '/api/v1');
};
