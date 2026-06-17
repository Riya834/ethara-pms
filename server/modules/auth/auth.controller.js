const authService = require('./auth.service');
const { success, error } = require('../../utils/apiResponse');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.register(req.body);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.status(201).json(success({ accessToken, user }, 'Registration successful', 201));
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.status(200).json(success({ accessToken, user }, 'Login successful'));
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    res.clearCookie('refreshToken');
    res.status(200).json(success(null, 'Logged out'));
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const { accessToken, refreshToken: newRT } = await authService.refreshAccessToken(token);
    res.cookie('refreshToken', newRT, COOKIE_OPTS);
    res.status(200).json(success({ accessToken }, 'Token refreshed'));
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.status(200).json(success(null, 'If that email exists, a reset link has been sent'));
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.status(200).json(success(null, 'Password reset successful'));
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json(success(user, 'User fetched'));
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe };
