import api from './axios';
export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getMyStats = () => api.get('/dashboard/my-stats');
export const getProjectHealth = () => api.get('/dashboard/project-health');
export const getTeamWorkload = () => api.get('/dashboard/team-workload');
export const getActivityFeed = (params) => api.get('/dashboard/activity-feed', { params });
export const getHrOverview = () => api.get('/dashboard/hr-overview');
