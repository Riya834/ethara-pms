const express = require('express');
const router = express.Router();
const controller = require('./project.controller');
const verifyToken = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

router.use(verifyToken);

router.get('/', controller.getProjects);
router.post('/', roleGuard('team_leader', 'project_manager'), controller.createProject);
router.get('/:id', controller.getProjectById);
router.put('/:id', roleGuard('team_leader', 'project_manager'), controller.updateProject);
router.patch('/:id/status', roleGuard('team_leader', 'project_manager'), controller.updateProjectStatus);
router.delete('/:id', roleGuard('team_leader'), controller.archiveProject);
router.post('/:id/members', roleGuard('team_leader', 'project_manager'), controller.addMembers);
router.delete('/:id/members/:userId', roleGuard('team_leader', 'project_manager'), controller.removeMember);
router.get('/:id/stats', controller.getProjectStats);

module.exports = router;
