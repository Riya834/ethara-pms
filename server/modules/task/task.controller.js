const taskService = require('./task.service');
const { success, paginated } = require('../../utils/apiResponse');

const getTasks = async (req, res, next) => {
  try {
    const result = await taskService.getTasks(req.user.id, req.user.role, req.query);
    res.json(paginated(result.data, result.total, result.page, result.limit));
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.user.id, req.body);
    res.status(201).json(success(task, 'Task created', 201));
  } catch (err) { next(err); }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.json(success(task));
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.user.id, req.user.role, req.body);
    res.json(success(task, 'Task updated'));
  } catch (err) { next(err); }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const task = await taskService.updateTaskStatus(req.params.id, req.user.id, req.user.role, req.body.status, io);
    res.json(success(task, 'Status updated'));
  } catch (err) { next(err); }
};

const assignTask = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const task = await taskService.assignTask(req.params.id, req.user.id, req.body.assigneeId, io);
    res.json(success(task, 'Task assigned'));
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.role);
    res.status(204).send();
  } catch (err) { next(err); }
};

const addComment = async (req, res, next) => {
  try {
    const comment = await taskService.addComment(req.params.id, req.user.id, req.body.content, req.body.mentions);
    res.status(201).json(success(comment, 'Comment added', 201));
  } catch (err) { next(err); }
};

const deleteComment = async (req, res, next) => {
  try {
    await taskService.deleteComment(req.params.commentId, req.user.id, req.user.role);
    res.status(204).send();
  } catch (err) { next(err); }
};

const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getMyTasks(req.user.id);
    res.json(success(tasks));
  } catch (err) { next(err); }
};

const getOverdueTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getOverdueTasks();
    res.json(success(tasks));
  } catch (err) { next(err); }
};

module.exports = { getTasks, createTask, getTaskById, updateTask, updateTaskStatus, assignTask, deleteTask, addComment, deleteComment, getMyTasks, getOverdueTasks };
