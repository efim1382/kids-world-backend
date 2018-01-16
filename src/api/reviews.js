module.exports = function(app, urlPath) {
  const Review = require('../controllers/ReviewController');

  app.get(`${urlPath}/reviews/user/:id`, Review.getUserReviews);
  app.post(`${urlPath}/reviews/add`, Review.addReview);
};
