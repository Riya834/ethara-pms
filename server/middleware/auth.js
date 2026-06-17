const jwt = require('jsonwebtoken');
const { jwtAccessSecret } = require('../config/env');
const { error } = require('../utils/apiResponse');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(error('No token provided', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtAccessSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(error('Token expired', 401));
    }
    return res.status(401).json(error('Invalid token', 401));
  }
};

module.exports = verifyToken;
