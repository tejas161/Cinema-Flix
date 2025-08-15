import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user data exists in localStorage on app start
    const savedUser = localStorage.getItem('cinemaflix_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('cinemaflix_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('cinemaflix_user', JSON.stringify(userData));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cinemaflix_user');
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    handleLogin,
    handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
