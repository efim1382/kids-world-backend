const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('./src/chat')(http);
const port = 8001;
const bodyParser = require('body-parser');
const path = require('path');
const fileUpload = require('express-fileupload');
let db = require('./src/database')();

process.env.ROOT_PATH = path.resolve(__dirname);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
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
app.use(fileUpload());

require('./src/api/_all')(app);

http.listen(port, function () {
  console.log('Server app listening on port: ' + port);
});

db.close();
