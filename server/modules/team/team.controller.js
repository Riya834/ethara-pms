const teamService = require('./team.service');
const { success } = require('../../utils/apiResponse');

const getTeams = async (req, res, next) => {
  try { res.json(success(await teamService.getTeams())); } catch (err) { next(err); }
};
const createTeam = async (req, res, next) => {
  try { res.status(201).json(success(await teamService.createTeam(req.body), 'Team created', 201)); } catch (err) { next(err); }
};
const getTeamById = async (req, res, next) => {
  try { res.json(success(await teamService.getTeamById(req.params.id))); } catch (err) { next(err); }
};
const updateTeam = async (req, res, next) => {
  try { res.json(success(await teamService.updateTeam(req.params.id, req.body), 'Team updated')); } catch (err) { next(err); }
};
const deleteTeam = async (req, res, next) => {
  try { await teamService.deleteTeam(req.params.id); res.status(204).send(); } catch (err) { next(err); }
};
const addMembers = async (req, res, next) => {
  try { res.json(success(await teamService.addMembers(req.params.id, req.body.userIds), 'Members added')); } catch (err) { next(err); }
};
const removeMember = async (req, res, next) => {
  try { res.json(success(await teamService.removeMember(req.params.id, req.params.userId), 'Member removed')); } catch (err) { next(err); }
};

module.exports = { getTeams, createTeam, getTeamById, updateTeam, deleteTeam, addMembers, removeMember };
