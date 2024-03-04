const jwt = require("jsonwebtoken");

const decodeToken = (token, key) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, key, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

module.exports = { decodeToken };
