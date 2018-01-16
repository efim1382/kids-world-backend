module.exports = function(app, urlPath) {
  const Review = require('../controllers/ReviewController');

  app.route(`${urlPath}/reviews/user/:id`).get(Review.getUserReviews);
  app.route(`${urlPath}/reviews/add`).post(Review.addReview);
};
