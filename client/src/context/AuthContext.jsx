import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth.api';
import { setAccessToken } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — silently attempt refresh token to restore session
  useEffect(() => {
    const init = async () => {
      try {
        const refreshRes = await authApi.refreshToken();
        const newToken = refreshRes?.data?.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          const meRes = await authApi.getMe();
          setUser(meRes.data.data);
        }
      } catch {
        // Expected when no cookie exists (not logged in) — silent
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.data.data.user);
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    setAccessToken(res.data.data.accessToken);
    setUser(res.data.data.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    setUser(null);
    setAccessToken(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
