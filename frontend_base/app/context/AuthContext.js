'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const VALID_USER = 'prueba';
const VALID_PASS = '0258';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('febril_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(parsed.user);
        }
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    if (username === VALID_USER && password === VALID_PASS) {
      const userData = { username, name: 'Dr. Prueba', role: 'Investigador' };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('febril_auth', JSON.stringify({ isAuthenticated: true, user: userData }));
      return { success: true };
    }
    return { success: false, error: 'Credenciales incorrectas. Verifique usuario y contraseña.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('febril_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
