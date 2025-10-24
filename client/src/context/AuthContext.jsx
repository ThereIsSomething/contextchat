import React, { createContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});
// Ensure the Authorization header is present for the very first requests
// (before React effects run) using any token already in localStorage.
const bootToken = localStorage.getItem('token');
if (bootToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${bootToken}`;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to immediately apply session to axios + localStorage to avoid race conditions
  const applySession = (t, u) => {
    try {
      if (t) {
        localStorage.setItem('token', t);
        api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      }
      if (u) localStorage.setItem('user', JSON.stringify(u));
    } catch {}
    setToken(t);
    setUser(u);
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Set up axios interceptors to ensure token is attached and handle 401 globally
  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use((config) => {
      const t = token || localStorage.getItem('token');
      if (t) config.headers['Authorization'] = `Bearer ${t}`;
      return config;
    });

    const resInterceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err?.response?.status === 401) {
          // Invalid/expired token – force logout and show a friendly error
          setError('Session expired. Please log in again.');
          setToken(null);
          setUser(null);
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
          } catch {}
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const signup = async ({ username, email, password }) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/api/auth/signup', { username, email, password });
      applySession(res.data.token, res.data.user);
      return true;
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      applySession(res.data.token, res.data.user);
      return true;
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    } catch {}
  };

  const value = useMemo(
    () => ({ api, token, user, loading, error, signup, login, logout, setError }),
    [token, user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
