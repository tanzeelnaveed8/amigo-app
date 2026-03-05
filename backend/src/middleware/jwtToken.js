const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const secretKey = process.env.jwtsecretKey;
const REFRESH_SECRET = process.env.jwtRefreshSecretKey || secretKey + '_refresh';

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;

    jwt.verify(req.token, secretKey, (err, authData) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            status: 'TokenExpired',
            data: 'Token has expired',
            code: 'TOKEN_EXPIRED',
          });
        }
        return res.status(403).json({
          status: 'Forbidden',
          data: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
      } else {
        req.authData = {
          userId: authData.user._id,
          phone: authData.user.phone,
        };
        next();
      }
    });
  } else {
    res.status(401).json({
      status: 'Unauthorized',
      data: 'Token not provided',
      code: 'NO_TOKEN',
    });
  }
}

function generateToken(user) {
  return jwt.sign({ user }, secretKey, { expiresIn: '7d' });
}

function generateRefreshToken(user) {
  return jwt.sign({ user }, REFRESH_SECRET, { expiresIn: '90d' });
}

function verifyRefreshToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, REFRESH_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

module.exports = {
  verifyToken,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
};
