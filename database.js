module.exports = function() {
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/kids-world');
	var db = mongoose.connection;

	db.on('error', console.error.bind(console, 'Connection error:'));
	db.once('open', function() {
	  console.log('Database connected!');
	});
};
