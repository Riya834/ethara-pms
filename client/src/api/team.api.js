import api from './axios';
export const getTeams = () => api.get('/teams');
export const createTeam = (data) => api.post('/teams', data);
export const getTeamById = (id) => api.get(`/teams/${id}`);
export const updateTeam = (id, data) => api.put(`/teams/${id}`, data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`);
export const addTeamMembers = (id, userIds) => api.post(`/teams/${id}/members`, { userIds });
export const removeTeamMember = (id, userId) => api.delete(`/teams/${id}/members/${userId}`);
