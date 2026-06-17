const Task = require('../../models/Task.model');
const Project = require('../../models/Project.model');
const Comment = require('../../models/Comment.model');
const Notification = require('../../models/Notification.model');
const User = require('../../models/User.model');
const { recomputeProgress } = require('../project/project.service');
const { sendMail } = require('../../config/nodemailer');
const paginate = require('../../utils/paginate');

const getTasks = async (userId, userRole, query) => {
  const { projectId, status, priority, assignee, page = 1, limit = 20 } = query;
  const filter = {};
  if (projectId) filter.project = projectId;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;

  if (!['team_leader', 'project_manager'].includes(userRole)) {
    filter.assignee = userId;
  }

  const { skip, limit: lim, page: pg } = paginate(query, page, limit);
  const [data, total] = await Promise.all([
    Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('assignedBy', 'name email avatar')
      .populate('project', 'title')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip).limit(lim).lean(),
    Task.countDocuments(filter),
  ]);
  return { data, total, page: pg, limit: lim };
};

const createTask = async (userId, body) => {
  const { title, description, projectId, assigneeId, status, priority, dueDate, labels } = body;
  const task = await Task.create({
    title, description, project: projectId, assignee: assigneeId || null,
    assignedBy: userId, status: status || 'todo', priority: priority || 'medium',
    dueDate, labels,
  });

  await recomputeProgress(projectId);

  if (assigneeId && assigneeId !== userId) {
    const [project, assignee] = await Promise.all([
      Project.findById(projectId).lean(),
      User.findById(assigneeId).lean(),
    ]);
    await Notification.create({
      recipient: assigneeId,
      type: 'task_assigned',
      message: `You have been assigned task "${title}"`,
      meta: { taskId: task._id, taskTitle: title, projectId, projectName: project?.title, fromUser: userId },
    });
    if (assignee) {
      sendMail({
        to: assignee.email,
        subject: `New Task Assigned: ${title}`,
        html: `<p>Hi ${assignee.name},</p><p>You have been assigned a new task: <strong>${title}</strong>.</p>`,
      }).catch((e) => console.error(e.message));
    }
  }

  return Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('assignedBy', 'name email avatar');
};

const getTaskById = async (taskId) => {
  const task = await Task.findById(taskId)
    .populate('assignee', 'name email avatar')
    .populate('assignedBy', 'name email avatar')
    .populate('project', 'title')
    .populate({ path: 'comments', populate: { path: 'author', select: 'name avatar' } })
    .lean();
  if (!task) { const e = new Error('Task not found'); e.statusCode = 404; throw e; }
  return task;
};

const updateTask = async (taskId, userId, userRole, body) => {
  const task = await Task.findById(taskId);
  if (!task) { const e = new Error('Task not found'); e.statusCode = 404; throw e; }
  const allowed = ['team_leader', 'project_manager'].includes(userRole) ||
    task.assignee?.toString() === userId;
  if (!allowed) { const e = new Error('Not authorized'); e.statusCode = 403; throw e; }
  Object.assign(task, body);
  await task.save();
  await recomputeProgress(task.project);
  return task;
};

const updateTaskStatus = async (taskId, userId, userRole, newStatus, io) => {
  const task = await Task.findById(taskId);
  if (!task) { const e = new Error('Task not found'); e.statusCode = 404; throw e; }

  const transitions = Task.allowedTransitions[task.status] || [];
  if (!transitions.includes(newStatus)) {
    const e = new Error(`Cannot transition from "${task.status}" to "${newStatus}"`);
    e.statusCode = 400; throw e;
  }

  task.status = newStatus;
  if (newStatus === 'done') task.completedAt = new Date();
  await task.save();
  await recomputeProgress(task.project);

  // Broadcast via WebSocket
  if (io) {
    io.to(`project:${task.project}`).emit('task:status_changed', {
      taskId: task._id, status: newStatus, updatedBy: userId,
    });
  }

  return task;
};

const assignTask = async (taskId, userId, newAssigneeId, io) => {
  const task = await Task.findById(taskId).populate('project', 'title');
  if (!task) { const e = new Error('Task not found'); e.statusCode = 404; throw e; }
  task.assignee = newAssigneeId;
  await task.save();

  const assignee = await User.findById(newAssigneeId).lean();
  if (assignee) {
    await Notification.create({
      recipient: newAssigneeId,
      type: 'task_assigned',
      message: `You have been assigned task "${task.title}"`,
      meta: { taskId: task._id, taskTitle: task.title, projectId: task.project._id, fromUser: userId },
    });
    sendMail({
      to: assignee.email,
      subject: `Task Assigned: ${task.title}`,
      html: `<p>Hi ${assignee.name},</p><p>You have been assigned: <strong>${task.title}</strong></p>`,
    }).catch(console.error);
  }

  if (io) {
    io.to(`project:${task.project._id}`).emit('task:assigned', { taskId: task._id, assignee: newAssigneeId });
  }

  return task;
};

const deleteTask = async (taskId, userRole) => {
  const task = await Task.findById(taskId);
  if (!task) { const e = new Error('Task not found'); e.statusCode = 404; throw e; }
  const projectId = task.project;
  await Task.findByIdAndDelete(taskId);
  await Comment.deleteMany({ task: taskId });
  await recomputeProgress(projectId);
};

const addComment = async (taskId, userId, content, mentions = []) => {
  const task = await Task.findById(taskId).populate('project', 'title');
  if (!task) { const e = new Error('Task not found'); e.statusCode = 404; throw e; }

  const comment = await Comment.create({ task: taskId, author: userId, content, mentions });
  task.comments.push(comment._id);
  await task.save();

  // Create mention notifications
  for (const mentionedId of mentions) {
    await Notification.create({
      recipient: mentionedId,
      type: 'comment_mention',
      message: `You were mentioned in a comment on "${task.title}"`,
      meta: { taskId: task._id, taskTitle: task.title, projectId: task.project._id, fromUser: userId },
    });
  }

  return Comment.findById(comment._id).populate('author', 'name avatar');
};

const deleteComment = async (commentId, userId, userRole) => {
  const comment = await Comment.findById(commentId);
  if (!comment) { const e = new Error('Comment not found'); e.statusCode = 404; throw e; }
  const isAuthor = comment.author.toString() === userId;
  const isAdmin = ['team_leader', 'project_manager'].includes(userRole);
  if (!isAuthor && !isAdmin) { const e = new Error('Not authorized'); e.statusCode = 403; throw e; }
  await comment.deleteOne();
  await Task.findByIdAndUpdate(comment.task, { $pull: { comments: commentId } });
};

const getMyTasks = async (userId) => {
  return Task.find({ assignee: userId })
    .populate('project', 'title')
    .sort({ priority: -1, dueDate: 1 })
    .lean();
};

const getOverdueTasks = async () => {
  return Task.find({ dueDate: { $lt: new Date() }, status: { $ne: 'done' } })
    .populate('assignee', 'name email')
    .populate('project', 'title')
    .sort({ dueDate: 1 })
    .lean();
};

module.exports = {
  getTasks, createTask, getTaskById, updateTask, updateTaskStatus,
  assignTask, deleteTask, addComment, deleteComment, getMyTasks, getOverdueTasks,
};
