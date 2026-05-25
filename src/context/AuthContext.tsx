import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { AuthContext } from './auth-context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('capivari_token');
    setUser(null);
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('capivari_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('capivari_token', token);
    setUser(userData);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bootstrap: carrega usuário a partir do token salvo
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};