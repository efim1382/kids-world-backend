const fs = require('fs');
const rimraf = require('rimraf');

exports.logger = (message) => {
  console.error(message);
};

exports.createUserPhotoDir = (id) => {
  if (!fs.existsSync('upload')) {
    fs.mkdirSync('upload');
  }

  if (!fs.existsSync('upload/users')) {
    fs.mkdirSync('upload/users');
  }

  if (!fs.existsSync(`upload/users/${id}`)) {
    fs.mkdirSync(`upload/users/${id}`);
  }
}

exports.deleteUserAdverts = (adverts) => {
  adverts.forEach(advert => {
    let imagesPath = `${process.env.ROOT_PATH}/upload/adverts/${advert.id}`;

    if (fs.existsSync(imagesPath)) {
      rimraf(imagesPath, function() {});
    }
  });
};
