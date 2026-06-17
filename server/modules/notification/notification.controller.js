const notifService = require('./notification.service');
const { success, paginated } = require('../../utils/apiResponse');

const getNotifications = async (req, res, next) => {
  try {
    const result = await notifService.getNotifications(req.user.id, req.query);
    res.json(paginated(result.data, result.total, result.page, result.limit));
  } catch (err) { next(err); }
};

const markRead = async (req, res, next) => {
  try {
    const n = await notifService.markRead(req.params.id, req.user.id);
    res.json(success(n, 'Marked as read'));
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    await notifService.markAllRead(req.user.id);
    res.json(success(null, 'All notifications marked as read'));
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notifService.deleteNotification(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notifService.getUnreadCount(req.user.id);
    res.json(success({ count }, 'Unread count'));
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification, getUnreadCount };
