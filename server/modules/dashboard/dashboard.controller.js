const dashService = require('./dashboard.service');
const { success, paginated } = require('../../utils/apiResponse');

const getSummary = async (req, res, next) => {
  try { res.json(success(await dashService.getSummary(req.user.id, req.user.role))); } catch (err) { next(err); }
};
const getMyStats = async (req, res, next) => {
  try { res.json(success(await dashService.getMyStats(req.user.id))); } catch (err) { next(err); }
};
const getProjectHealth = async (req, res, next) => {
  try { res.json(success(await dashService.getProjectHealth(req.user.id, req.user.role))); } catch (err) { next(err); }
};
const getTeamWorkload = async (req, res, next) => {
  try { res.json(success(await dashService.getTeamWorkload())); } catch (err) { next(err); }
};
const getActivityFeed = async (req, res, next) => {
  try {
    const result = await dashService.getActivityFeed(req.user.id, req.user.role, req.query.page, req.query.limit);
    res.json(paginated(result.data, result.total, req.query.page || 1, req.query.limit || 20));
  } catch (err) { next(err); }
};
const getHrOverview = async (req, res, next) => {
  try { res.json(success(await dashService.getHrOverview())); } catch (err) { next(err); }
};

module.exports = { getSummary, getMyStats, getProjectHealth, getTeamWorkload, getActivityFeed, getHrOverview };
