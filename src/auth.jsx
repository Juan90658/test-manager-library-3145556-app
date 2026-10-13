import { createContext, useContext, useEffect, useState } from 'react';
import { api, session, setUnauthorizedHandler } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => session.get());
  const logout = () => { session.set(null); setUser(null); };
  useEffect(() => setUnauthorizedHandler(logout), []);
  const login = async (username, password) => {
    const res = await api.login(username, password);
    const value = { token: res.access_token, role: res.role, username: username.trim().toLowerCase() };
    session.set(value);
    setUser(value);
  };
  return <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>{children}</AuthContext.Provider>;
}

