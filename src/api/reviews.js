module.exports = function(app) {
  const urlPath = '/api/v1';
  const Review = require('../controllers/ReviewController');

  app.route(`${urlPath}/reviews`).get(Review.getReviews);
  app.route(`${urlPath}/reviews/user/:id`).get(Review.getUserReviews);
  app.route(`${urlPath}/reviews/add`).post(Review.addReview);
};
