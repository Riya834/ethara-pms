import api, { setAccessToken } from './axios';

export const register = (data) => api.post('/auth/register', data);
export const login = async (data) => {
  const res = await api.post('/auth/login', data);
  setAccessToken(res.data.data.accessToken);
  return res;
};
export const logout = async () => {
  await api.post('/auth/logout');
  setAccessToken(null);
};
export const refreshToken = () => api.post('/auth/refresh-token');
export const getMe = () => api.get('/auth/me');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/auth/reset-password', data);
