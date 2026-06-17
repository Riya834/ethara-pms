const Project = require('../../models/Project.model');
const Task = require('../../models/Task.model');
const User = require('../../models/User.model');
const Team = require('../../models/Team.model');

const getSummary = async (userId, userRole) => {
  const now = new Date();
  let projectFilter = { isArchived: false };
  if (!['team_leader', 'hr'].includes(userRole)) projectFilter['members.user'] = userId;

  const [totalProjects, activeProjects, totalTasks, overdueCount, teamMembers] = await Promise.all([
    Project.countDocuments(projectFilter),
    Project.countDocuments({ ...projectFilter, status: 'active' }),
    Task.countDocuments(userRole === 'team_member' ? { assignee: userId } : {}),
    Task.countDocuments({ dueDate: { $lt: now }, status: { $ne: 'done' } }),
    userRole === 'team_leader' || userRole === 'hr' ? User.countDocuments({ isActive: true }) : null,
  ]);

  return { totalProjects, activeProjects, totalTasks, overdueCount, teamMembers };
};

const getMyStats = async (userId) => {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const [assigned, completedToday, overdue, projects] = await Promise.all([
    Task.countDocuments({ assignee: userId, status: { $ne: 'done' } }),
    Task.countDocuments({ assignee: userId, status: 'done', completedAt: { $gte: startOfDay } }),
    Task.countDocuments({ assignee: userId, dueDate: { $lt: new Date() }, status: { $ne: 'done' } }),
    Project.countDocuments({ 'members.user': userId, isArchived: false }),
  ]);
  return { assigned, completedToday, overdue, projects };
};

const getProjectHealth = async (userId, userRole) => {
  let filter = { isArchived: false };
  if (!['team_leader', 'hr'].includes(userRole)) filter['members.user'] = userId;

  const projects = await Project.find(filter).select('title status priority deadline progress').lean();
  const now = new Date();

  return projects.map((p) => ({
    ...p,
    daysUntilDeadline: p.deadline ? Math.ceil((new Date(p.deadline) - now) / (1000 * 60 * 60 * 24)) : null,
    isOverdue: p.deadline && new Date(p.deadline) < now && p.status !== 'completed',
  }));
};

const getTeamWorkload = async () => {
  const users = await User.find({ isActive: true }).select('name email avatar role').lean();
  const now = new Date();

  const workloads = await Promise.all(users.map(async (u) => {
    const [activeTasks, overdueTasks, completedThisWeek] = await Promise.all([
      Task.countDocuments({ assignee: u._id, status: { $in: ['todo', 'in_progress', 'review'] } }),
      Task.countDocuments({ assignee: u._id, dueDate: { $lt: now }, status: { $ne: 'done' } }),
      Task.countDocuments({
        assignee: u._id, status: 'done',
        completedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);
    return { user: u, activeTasks, overdueTasks, completedThisWeek };
  }));
  return workloads;
};

const getActivityFeed = async (userId, userRole, page = 1, limit = 20) => {
  const Notification = require('../../models/Notification.model');
  const skip = (page - 1) * limit;
  const filter = {};
  if (userRole === 'team_member') filter.recipient = userId;

  const [data, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate('meta.fromUser', 'name avatar')
      .lean(),
    Notification.countDocuments(filter),
  ]);
  return { data, total };
};

const getHrOverview = async () => {
  const users = await User.find({ isActive: true }).select('role department').lean();
  const byRole = { team_leader: 0, project_manager: 0, team_member: 0, hr: 0 };
  const byDept = {};
  users.forEach((u) => {
    if (byRole[u.role] !== undefined) byRole[u.role]++;
    const dept = u.department || 'Unassigned';
    byDept[dept] = (byDept[dept] || 0) + 1;
  });
  return { total: users.length, byRole, byDept };
};

module.exports = { getSummary, getMyStats, getProjectHealth, getTeamWorkload, getActivityFeed, getHrOverview };
