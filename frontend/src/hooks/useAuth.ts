import { useState, useCallback } from 'react';
import type { User } from '../types/api';
import { loginUser, getCurrentUser } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('token')
  );

  const login = useCallback(async (username: string, password: string) => {
    const { access_token } = await loginUser(username, password);
    localStorage.setItem('token', access_token);
    const userData = await getCurrentUser();
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return { user, isAuthenticated, login, logout };
}
