const projectService = require('./project.service');
const { success, paginated } = require('../../utils/apiResponse');

const getProjects = async (req, res, next) => {
  try {
    const result = await projectService.getProjects(req.user.id, req.user.role, req.query);
    res.json(paginated(result.data, result.total, result.page, result.limit));
  } catch (err) { next(err); }
};

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user.id, req.body);
    res.status(201).json(success(project, 'Project created', 201));
  } catch (err) { next(err); }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id, req.user.role);
    res.json(success(project, 'Project fetched'));
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.user.id, req.user.role, req.body);
    res.json(success(project, 'Project updated'));
  } catch (err) { next(err); }
};

const updateProjectStatus = async (req, res, next) => {
  try {
    const project = await projectService.updateProjectStatus(req.params.id, req.user.id, req.user.role, req.body.status);
    res.json(success(project, 'Status updated'));
  } catch (err) { next(err); }
};

const archiveProject = async (req, res, next) => {
  try {
    const result = await projectService.archiveProject(req.params.id, req.user.role);
    res.json(success(result, 'Project archived'));
  } catch (err) { next(err); }
};

const addMembers = async (req, res, next) => {
  try {
    const project = await projectService.addMembers(req.params.id, req.user.id, req.user.role, req.body.members);
    res.json(success(project, 'Members added'));
  } catch (err) { next(err); }
};

const removeMember = async (req, res, next) => {
  try {
    const project = await projectService.removeMember(req.params.id, req.user.id, req.user.role, req.params.userId);
    res.json(success(project, 'Member removed'));
  } catch (err) { next(err); }
};

const getProjectStats = async (req, res, next) => {
  try {
    const stats = await projectService.getProjectStats(req.params.id);
    res.json(success(stats, 'Stats fetched'));
  } catch (err) { next(err); }
};

module.exports = { getProjects, createProject, getProjectById, updateProject, updateProjectStatus, archiveProject, addMembers, removeMember, getProjectStats };
