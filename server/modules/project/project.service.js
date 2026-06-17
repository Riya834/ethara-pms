const Project = require('../../models/Project.model');
const Task = require('../../models/Task.model');
const User = require('../../models/User.model');
const Notification = require('../../models/Notification.model');
const paginate = require('../../utils/paginate');
const { sendMail } = require('../../config/nodemailer');

const getProjects = async (userId, userRole, query) => {
  const { status, priority, search, tag, page = 1, limit = 20 } = query;
  const filter = { isArchived: false };

  if (!['team_leader', 'hr'].includes(userRole)) {
    filter['members.user'] = userId;
  }
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (tag) filter.tags = tag;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const { skip, limit: lim, page: pg } = paginate(query, page, limit);
  const [data, total] = await Promise.all([
    Project.find(filter)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .lean(),
    Project.countDocuments(filter),
  ]);
  return { data, total, page: pg, limit: lim };
};

const createProject = async (userId, body) => {
  const { title, description, status, priority, deadline, tags, members = [] } = body;
  const creator = await User.findById(userId).lean();

  // Ensure creator is in members
  const memberIds = members.map((m) => m.user?.toString?.() || m.user);
  const allMembers = memberIds.includes(userId.toString())
    ? members
    : [{ user: userId, role: creator.role }, ...members];

  const project = await Project.create({
    title, description, status, priority, deadline, tags, owner: userId, members: allMembers,
  });

  return Project.findById(project._id)
    .populate('owner', 'name email avatar role')
    .populate('members.user', 'name email avatar role');
};

const getProjectById = async (projectId, userId, userRole) => {
  const project = await Project.findById(projectId)
    .populate('owner', 'name email avatar role')
    .populate('members.user', 'name email avatar role')
    .lean();

  if (!project) { const e = new Error('Project not found'); e.statusCode = 404; throw e; }

  const isMember = project.members.some((m) => m.user._id.toString() === userId.toString());
  if (!isMember && !['team_leader', 'hr'].includes(userRole)) {
    const e = new Error('Access denied'); e.statusCode = 403; throw e;
  }

  // Task summary
  const tasks = await Task.find({ project: projectId }).lean();
  const summary = { total: tasks.length, todo: 0, in_progress: 0, review: 0, done: 0, blocked: 0 };
  tasks.forEach((t) => { if (summary[t.status] !== undefined) summary[t.status]++; });
  project.taskSummary = summary;
  return project;
};

const updateProject = async (projectId, userId, userRole, body) => {
  const project = await Project.findById(projectId);
  if (!project) { const e = new Error('Project not found'); e.statusCode = 404; throw e; }

  const isOwnerOrTL = project.owner.toString() === userId.toString() || userRole === 'team_leader';
  if (!isOwnerOrTL) { const e = new Error('Not authorized'); e.statusCode = 403; throw e; }

  const { title, description, deadline, tags, priority } = body;
  if (title) project.title = title;
  if (description !== undefined) project.description = description;
  if (deadline !== undefined) project.deadline = deadline;
  if (tags) project.tags = tags;
  if (priority) project.priority = priority;
  await project.save();
  return project;
};

const updateProjectStatus = async (projectId, userId, userRole, status) => {
  const project = await Project.findById(projectId);
  if (!project) { const e = new Error('Project not found'); e.statusCode = 404; throw e; }
  const canChange = project.owner.toString() === userId.toString() || userRole === 'team_leader';
  if (!canChange) { const e = new Error('Not authorized'); e.statusCode = 403; throw e; }
  project.status = status;
  await project.save();
  return project;
};

const archiveProject = async (projectId, userRole) => {
  if (userRole !== 'team_leader') { const e = new Error('Only Team Leaders can archive projects'); e.statusCode = 403; throw e; }
  const project = await Project.findById(projectId);
  if (!project) { const e = new Error('Project not found'); e.statusCode = 404; throw e; }
  const activeTasks = await Task.countDocuments({ project: projectId, status: { $ne: 'done' } });
  project.isArchived = true;
  await project.save();
  return { project, activeTasks };
};

const addMembers = async (projectId, userId, userRole, members) => {
  const project = await Project.findById(projectId).populate('members.user', 'name email');
  if (!project) { const e = new Error('Project not found'); e.statusCode = 404; throw e; }

  for (const m of members) {
    const exists = project.members.find((pm) => pm.user._id.toString() === m.userId);
    if (!exists) {
      project.members.push({ user: m.userId, role: m.role });
      const newUser = await User.findById(m.userId);
      if (newUser) {
        await Notification.create({
          recipient: m.userId,
          type: 'project_invite',
          message: `You have been added to project "${project.title}"`,
          meta: { projectId: project._id, projectName: project.title, fromUser: userId },
        });
        sendMail({
          to: newUser.email,
          subject: `You've been added to "${project.title}"`,
          html: `<p>Hi ${newUser.name},</p><p>You have been added to the project <strong>${project.title}</strong> on Ethara PMS.</p>`,
        }).catch((e) => console.error('Email error:', e.message));
      }
    }
  }
  await project.save();
  return Project.findById(projectId).populate('members.user', 'name email avatar role');
};

const removeMember = async (projectId, userId, userRole, targetUserId) => {
  const project = await Project.findById(projectId);
  if (!project) { const e = new Error('Project not found'); e.statusCode = 404; throw e; }
  project.members = project.members.filter((m) => m.user.toString() !== targetUserId);
  await project.save();

  // Unassign their tasks
  await Task.updateMany(
    { project: projectId, assignee: targetUserId },
    { assignee: null, status: 'todo' }
  );
  return project;
};

const getProjectStats = async (projectId) => {
  const tasks = await Task.find({ project: projectId }).lean();
  const now = new Date();
  const stats = {
    total: tasks.length,
    byStatus: { todo: 0, in_progress: 0, review: 0, done: 0, blocked: 0 },
    overdue: 0,
    completed: 0,
  };
  tasks.forEach((t) => {
    if (stats.byStatus[t.status] !== undefined) stats.byStatus[t.status]++;
    if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'done') stats.overdue++;
    if (t.status === 'done') stats.completed++;
  });
  return stats;
};

const recomputeProgress = async (projectId) => {
  const tasks = await Task.find({ project: projectId }).lean();
  if (tasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, { progress: 0 });
    return 0;
  }
  const done = tasks.filter((t) => t.status === 'done').length;
  const progress = Math.round((done / tasks.length) * 100);
  await Project.findByIdAndUpdate(projectId, { progress });
  return progress;
};

module.exports = {
  getProjects, createProject, getProjectById, updateProject, updateProjectStatus,
  archiveProject, addMembers, removeMember, getProjectStats, recomputeProgress,
};
