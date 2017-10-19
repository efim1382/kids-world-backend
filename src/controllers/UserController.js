const uuidv4 = require('uuid/v4');

exports.register = function(req, res) {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let phone = req.body.phone;
  let address = req.body.address;
  let password = req.body.password;
  let photo = req.body.photo;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !address ||
    !email ||
    !password
  ) {
    res.send({
      status: 400,
      message: 'Не заполнены все обязательные поля'
    });

    return;
  }

  res.send({
    status: 200,
  });
};
