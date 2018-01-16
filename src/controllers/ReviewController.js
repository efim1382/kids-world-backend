const db = require('../database')();

exports.addReview = function(req, res) {
  const { idAuthor, idRecipient, emotion, text } = req.body;

  db.run(`
    INSERT INTO review (idAuthor, idRecipient, emotion, text)
    VALUES (?, ?, ?, ?)
  `, [idAuthor, idRecipient, emotion, text], function(error) {
    if (error) {
      return console.error(error.message);
    }

    res.status(200).send();
  });
};

exports.getUserReviews = function(req, res) {
  const { id } = req.params;

  db.all(`
    SELECT user.id as idRecipient,
           review.idAuthor as idAuthor,
           user.firstName,
           user.lastName,
           user.photo,
           review.text,
           review.emotion
    FROM user, review
    WHERE user.id = review.idAuthor
    AND review.idRecipient = ?
    ORDER BY review.id
    DESC
  `, [id], function(error, reviews) {
    if (error) {
      return console.error(error.message);
    }

    if (!reviews) {
      return;
    }

    res.status(200).send(reviews);
  });
};
