const express = require('express');
const router = express.Router();
const controller = require('./user.controller');
const verifyToken = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const { avatarUpload } = require('../../middleware/upload');

router.use(verifyToken);

router.get('/search', controller.searchUsers);
router.get('/', roleGuard('team_leader', 'hr'), controller.getUsers);
router.get('/:id', controller.getUserById);
router.put('/:id', controller.updateUser);
router.patch('/:id/role', roleGuard('team_leader'), controller.changeRole);
router.patch('/:id/deactivate', roleGuard('team_leader', 'hr'), controller.deactivateUser);
router.patch('/:id/reactivate', roleGuard('team_leader', 'hr'), controller.reactivateUser);
router.post('/:id/avatar', (req, res, next) => { req.uploadDest = 'uploads/avatars'; next(); }, avatarUpload.single('avatar'), controller.uploadAvatar);
router.patch('/me/password', controller.updatePassword);
router.patch('/me/notification-prefs', controller.updateNotifPrefs);

module.exports = router;
