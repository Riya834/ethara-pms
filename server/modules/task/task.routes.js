const express = require('express');
const router = express.Router();
const controller = require('./task.controller');
const verifyToken = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

router.use(verifyToken);

router.get('/my-tasks', controller.getMyTasks);
router.get('/overdue', roleGuard('team_leader', 'project_manager', 'hr'), controller.getOverdueTasks);
router.get('/', controller.getTasks);
router.post('/', controller.createTask);
router.get('/:id', controller.getTaskById);
router.put('/:id', controller.updateTask);
router.patch('/:id/status', controller.updateTaskStatus);
router.patch('/:id/assign', roleGuard('team_leader', 'project_manager'), controller.assignTask);
router.delete('/:id', roleGuard('team_leader', 'project_manager'), controller.deleteTask);
router.post('/:id/comments', controller.addComment);
router.delete('/:id/comments/:commentId', controller.deleteComment);

module.exports = router;
