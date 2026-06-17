const userService = require('./user.service');
const { success, paginated } = require('../../utils/apiResponse');
const path = require('path');

const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getUsers(req.query);
    res.json(paginated(result.data, result.total, result.page, result.limit));
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(success(user));
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.user.id, req.user.role, req.body);
    res.json(success(user, 'Profile updated'));
  } catch (err) { next(err); }
};

const changeRole = async (req, res, next) => {
  try {
    const user = await userService.changeRole(req.params.id, req.body.role, req.user.role);
    res.json(success(user, 'Role updated'));
  } catch (err) { next(err); }
};

const deactivateUser = async (req, res, next) => {
  try {
    const user = await userService.deactivateUser(req.params.id, req.user.id);
    res.json(success(user, 'User deactivated'));
  } catch (err) { next(err); }
};

const reactivateUser = async (req, res, next) => {
  try {
    const user = await userService.reactivateUser(req.params.id);
    res.json(success(user, 'User reactivated'));
  } catch (err) { next(err); }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await userService.updateAvatar(req.params.id, avatarUrl);
    res.json(success({ avatarUrl }, 'Avatar uploaded'));
  } catch (err) { next(err); }
};

const searchUsers = async (req, res, next) => {
  try {
    const users = await userService.searchUsers(req.query.q);
    res.json(success(users));
  } catch (err) { next(err); }
};

const updatePassword = async (req, res, next) => {
  try {
    await userService.updatePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    res.json(success(null, 'Password updated'));
  } catch (err) { next(err); }
};

const updateNotifPrefs = async (req, res, next) => {
  try {
    const prefs = await userService.updateNotifPrefs(req.user.id, req.body);
    res.json(success(prefs, 'Notification preferences updated'));
  } catch (err) { next(err); }
};

module.exports = { getUsers, getUserById, updateUser, changeRole, deactivateUser, reactivateUser, uploadAvatar, searchUsers, updatePassword, updateNotifPrefs };
