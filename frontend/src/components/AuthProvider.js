'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchMe, loginUser, registerUser } from '@/lib/api';
import { clearToken, getToken, setToken } from '@/lib/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = getToken()
      ? fetchMe()
          .then((result) => result.user)
          .catch(() => null)
      : Promise.resolve(null);

    check.then((currentUser) => {
      if (cancelled) return;
      setUser(currentUser);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleExpired() {
      setUser(null);
    }

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await loginUser(email, password);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (email, password) => {
    const result = await registerUser(email, password);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}