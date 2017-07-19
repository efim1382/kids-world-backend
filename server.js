const express = require('express');
const app = express();
const port = 8000;
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./src/database')();
require('./src/models/_all')();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const staticPath = path.join(__dirname, './');

app.use('/', express.static(staticPath, {
  maxage: 31557600
}));

app.get('/', function(req, res) {
  res.header('Cache-Control', 'max-age=60, must-revalidate, private');
  res.sendFile('index.html', {
    root: staticPath
  });
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

require('./src/api/_all')(app);

app.listen(port, function () {
  console.log('Example app listening on port: ' + port);
});
