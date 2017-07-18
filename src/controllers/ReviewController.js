const mongoose = require('mongoose');
const Review = mongoose.model('Review');

exports.addReview = function(req, res) {
  let newReview = new Review(req.body);

  newReview.save(function(err, review) {
    res.send(review);
  });
};

exports.getReviews = function(req, res) {
  Review.find({}, function(err, reviews) {
    res.send(reviews);
  });
};

exports.getUserReviews = function(req, res) {
  Review.find({ 'idUserTo': req.params.id }, function(err, reviews) {
    if (!err) {
      res.json(reviews);
    }
  });
};
