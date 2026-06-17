const User = require('../../models/User.model');
const paginate = require('../../utils/paginate');

const getUsers = async (query) => {
  const { role, department, isActive, search, page = 1, limit = 20 } = query;
  const filter = {};
  if (role) filter.role = role;
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  const { skip, limit: lim, page: pg } = paginate(query, page, limit);
  const [data, total] = await Promise.all([
    User.find(filter).select('-password -refreshToken').sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    User.countDocuments(filter),
  ]);
  return { data, total, page: pg, limit: lim };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select('-password -refreshToken').lean();
  if (!user) { const e = new Error('User not found'); e.statusCode = 404; throw e; }
  return user;
};

const updateUser = async (id, requesterId, requesterRole, body) => {
  const isSelf = id === requesterId;
  const isAdmin = ['team_leader', 'hr'].includes(requesterRole);
  if (!isSelf && !isAdmin) { const e = new Error('Not authorized'); e.statusCode = 403; throw e; }
  const { name, department } = body;
  const update = {};
  if (name) update.name = name;
  if (department !== undefined) update.department = department;
  return User.findByIdAndUpdate(id, update, { new: true }).select('-password -refreshToken');
};

const changeRole = async (id, newRole, requesterRole) => {
  if (requesterRole !== 'team_leader') { const e = new Error('Only Team Leaders can change roles'); e.statusCode = 403; throw e; }
  return User.findByIdAndUpdate(id, { role: newRole }, { new: true }).select('-password -refreshToken');
};

const deactivateUser = async (id, requesterId) => {
  if (id === requesterId) {
    const e = new Error('Cannot deactivate yourself'); e.statusCode = 403; throw e;
  }
  return User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password -refreshToken');
};

const reactivateUser = async (id) => {
  return User.findByIdAndUpdate(id, { isActive: true }, { new: true }).select('-password -refreshToken');
};

const updateAvatar = async (id, avatarUrl) => {
  return User.findByIdAndUpdate(id, { avatar: avatarUrl }, { new: true }).select('-password -refreshToken');
};

const searchUsers = async (q) => {
  if (!q || q.length < 2) return [];
  return User.find({
    isActive: true,
    $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }],
  }).select('name email avatar role').limit(20).lean();
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) { const e = new Error('User not found'); e.statusCode = 404; throw e; }
  const match = await user.comparePassword(currentPassword);
  if (!match) { const e = new Error('Current password is incorrect'); e.statusCode = 400; throw e; }
  user.password = newPassword;
  await user.save();
};

const updateNotifPrefs = async (userId, prefs) => {
  return User.findByIdAndUpdate(userId, { notificationPrefs: prefs }, { new: true }).select('notificationPrefs');
};

module.exports = { getUsers, getUserById, updateUser, changeRole, deactivateUser, reactivateUser, updateAvatar, searchUsers, updatePassword, updateNotifPrefs };
