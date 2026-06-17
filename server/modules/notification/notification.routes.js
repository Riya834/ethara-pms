const express = require('express');
const router = express.Router();
const controller = require('./notification.controller');
const verifyToken = require('../../middleware/auth');

router.use(verifyToken);

router.get('/', controller.getNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', controller.markRead);
router.delete('/:id', controller.deleteNotification);

module.exports = router;
