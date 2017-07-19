module.exports = function(app) {
  require('./auth')(app);
  require('./users')(app);
  require('./adverts')(app);
  require('./reviews')(app);
};
