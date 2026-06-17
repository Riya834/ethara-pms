const express = require('express');
const router = express.Router();
const controller = require('./dashboard.controller');
const verifyToken = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

router.use(verifyToken);

router.get('/summary', controller.getSummary);
router.get('/my-stats', controller.getMyStats);
router.get('/project-health', roleGuard('team_leader', 'project_manager', 'hr'), controller.getProjectHealth);
router.get('/team-workload', roleGuard('team_leader', 'project_manager', 'hr'), controller.getTeamWorkload);
router.get('/activity-feed', controller.getActivityFeed);
router.get('/hr-overview', roleGuard('team_leader', 'hr'), controller.getHrOverview);

module.exports = router;
