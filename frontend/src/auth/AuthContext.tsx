import React, { createContext, useContext, useState } from 'react';

export interface User {
  userId?: number | null;
  username: string;
  fullName: string;
  role: string;
  roleId?: number | null;
  permissions?: string | Record<string, string[]> | null;
}
export const User = {};

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (moduleName: string, actionName: string) => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isSuperAdmin = (): boolean => {
    if (!user) return false;
    const r = user.role?.toUpperCase() || '';
    return r === 'SUPER ADMIN' || r === 'SUPER_ADMIN';
  };

  const hasPermission = (moduleName: string, actionName: string): boolean => {
    if (!user) return false;
    if (isSuperAdmin()) return true;

    if (!user.permissions) return false;

    let permMap: Record<string, string[]> = {};
    if (typeof user.permissions === 'string') {
      try {
        permMap = JSON.parse(user.permissions);
      } catch (e) {
        permMap = {};
      }
    } else {
      permMap = user.permissions;
    }

    const actions = permMap[moduleName];
    if (!actions || !Array.isArray(actions)) return false;

    return actions.includes(actionName) || actions.includes('Check all');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, hasPermission, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
