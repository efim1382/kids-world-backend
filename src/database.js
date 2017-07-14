module.exports = function() {
  const mongoose = require('mongoose');

  if (mongoose.connection.readyState) {
    return mongoose.connection;
  }

  mongoose.Promise = global.Promise;
	mongoose.connect('mongodb://localhost/kids-world');
	const db = mongoose.connection;

	db.on('error', console.error.bind(console, 'Connection error:'));
	db.once('open', function() {
	  console.log('Database connected!');
	});

  return db;
};
