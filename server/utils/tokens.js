const jwt = require('jsonwebtoken');
const { jwtAccessSecret, jwtRefreshSecret, jwtAccessTtl, jwtRefreshTtl } = require('../config/env');

const signAccessToken = (payload) =>
  jwt.sign(payload, jwtAccessSecret, { expiresIn: jwtAccessTtl });

const signRefreshToken = (payload) =>
  jwt.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshTtl });

const verifyAccessToken = (token) => jwt.verify(token, jwtAccessSecret);

const verifyRefreshToken = (token) => jwt.verify(token, jwtRefreshSecret);

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
