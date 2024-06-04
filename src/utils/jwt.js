import jwt from "jsonwebtoken";

const expiresIn = process.env.JTW_EXPIRES_IN;
const secret = process.env.JWT_SECRET;

export const jwtSign = (id) => {
  return new Promise((resolve, reject) => {
    jwt.sign({ id }, secret, { expiresIn: expiresIn }, (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    });
  });
};

export const jwtDecode = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      return resolve(decoded);
    });
  });
};
