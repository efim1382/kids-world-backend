var express = require('express');
var app = express();
var port = 8000;
var bodyParser = require('body-parser');
var db = require('./database')();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

require('./api')(app);

var AdvertModel = require('./models/Advert')();
// AdvertModel.clearTable();
AdvertModel.getAll().then(value => console.log(value));

app.listen(port, function () {
  console.log('Example app listening on port: ' + port);
});
