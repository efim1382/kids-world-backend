let db = require('./src/database')();
const { logger } = require('./src/functions');

db.serialize(function() {
	db.run('DELETE FROM user', function(error) {
		if (error) {
			logger(error.message);
			return;
		}
	});

	db.run('DELETE FROM favorites', function(error) {
		if (error) {
			logger(error.message);
			return;
		}
	});
});

db.close();
