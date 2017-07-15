let db = require('./src/database')();

db.dropDatabase().then(() => {
  console.log('Database droped');
  process.exit();
})

