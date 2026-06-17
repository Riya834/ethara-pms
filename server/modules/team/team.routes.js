const express = require('express');
const router = express.Router();
const controller = require('./team.controller');
const verifyToken = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

router.use(verifyToken);

router.get('/', controller.getTeams);
router.post('/', roleGuard('team_leader', 'hr'), controller.createTeam);
router.get('/:id', controller.getTeamById);
router.put('/:id', roleGuard('team_leader', 'hr'), controller.updateTeam);
router.delete('/:id', roleGuard('team_leader'), controller.deleteTeam);
router.post('/:id/members', roleGuard('team_leader', 'hr'), controller.addMembers);
router.delete('/:id/members/:userId', roleGuard('team_leader', 'hr'), controller.removeMember);

module.exports = router;
