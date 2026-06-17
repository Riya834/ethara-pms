const Notification = require('../../models/Notification.model');
const paginate = require('../../utils/paginate');

const getNotifications = async (userId, query) => {
  const { isRead, page = 1, limit = 20 } = query;
  const filter = { recipient: userId };
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  const { skip, limit: lim, page: pg } = paginate(query, page, limit);
  const [data, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    Notification.countDocuments(filter),
  ]);
  return { data, total, page: pg, limit: lim };
};

const markRead = async (notifId, userId) => {
  const n = await Notification.findOneAndUpdate(
    { _id: notifId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  if (!n) { const e = new Error('Notification not found'); e.statusCode = 404; throw e; }
  return n;
};

const markAllRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

const deleteNotification = async (notifId, userId) => {
  await Notification.findOneAndDelete({ _id: notifId, recipient: userId });
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification, getUnreadCount };
