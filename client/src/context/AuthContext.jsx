import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cti_token') || null);
  const [sessionState, setSessionState] = useState('Anonymous'); // Anonymous | Authenticating | Authenticated
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('cti_token');
      if (!storedToken) {
        setSessionState('Anonymous');
        setLoading(false);
        return;
      }

      try {
        setSessionState('Authenticating');
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setSessionState('Authenticated');
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, returning to Anonymous:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setSessionState('Authenticating');
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('cti_token', newToken);
        setToken(newToken);
        setUser(userData);
        setSessionState('Authenticated');
        return { success: true };
      }
    } catch (err) {
      setSessionState('Anonymous');
      const msg = err.response?.data?.error || 'Authentication failed. Please verify credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async ({ email, password, role, name }) => {
    try {
      setError(null);
      setSessionState('Authenticating');
      const res = await api.post('/auth/register', { email, password, role, name });

      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('cti_token', newToken);
        setToken(newToken);
        setUser(userData);
        setSessionState('Authenticated');
        return { success: true };
      }
    } catch (err) {
      setSessionState('Anonymous');
      const msg = err.response?.data?.error || 'Registration failed.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('cti_token');
      setToken(null);
      setUser(null);
      setSessionState('Anonymous');
      setError(null);
    }
  };

  // 1-Click Demo Switcher
  const switchDemoRole = async (targetRole) => {
    try {
      setSessionState('Authenticating');
      const res = await api.post('/auth/demo-switch', { role: targetRole });
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('cti_token', newToken);
        setToken(newToken);
        setUser(userData);
        setSessionState('Authenticated');
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to switch role');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        sessionState,
        loading,
        error,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
