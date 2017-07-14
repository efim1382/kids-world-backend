const express = require('express');
const app = express();
const port = 8000;
const bodyParser = require('body-parser');
const db = require('./src/database')();
require('./src/models/_all')();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

require('./src/api')(app);

app.listen(port, function () {
  console.log('Example app listening on port: ' + port);
});
