let db = require('./src/database')();

db.run('DELETE FROM advert', function(error) {
  if (error) {
    return console.error(error.message);
  }

  db.run('DELETE FROM user', function(error) {
    if (error) {
      return console.error(error.message);
    }
  });
});

db.close();
