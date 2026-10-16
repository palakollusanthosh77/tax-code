import { createContext, useState, useEffect, useCallback } from 'react';
import { loginApi, registerApi, getMeApi } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('tci_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('tci_token');
      if (token) {
        try {
          const { data } = await getMeApi();
          setUser(data.data.user);
          localStorage.setItem('tci_user', JSON.stringify(data.data.user));
        } catch (err) {
          localStorage.removeItem('tci_token');
          localStorage.removeItem('tci_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await loginApi({ email, password });
    localStorage.setItem('tci_token', data.data.token);
    localStorage.setItem('tci_user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await registerApi(payload);
    localStorage.setItem('tci_token', data.data.token);
    localStorage.setItem('tci_user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tci_token');
    localStorage.removeItem('tci_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('tci_user', JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};
