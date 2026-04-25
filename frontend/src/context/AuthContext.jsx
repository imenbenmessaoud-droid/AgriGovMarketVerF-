import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login/', { email, password });
      const { user: userData, token } = response.data;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);

      setUser(userData);
      setIsLoggedIn(true);
      return { success: true, user: userData };
    } catch (error) {
      const errData = error.response?.data;
      const parsedError = errData?.non_field_errors?.[0] || errData?.detail || errData?.message || 'Login failed';
      console.error("Login failed:", parsedError);
      return { success: false, error: parsedError };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    sessionStorage.clear();

    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = async (updatedData) => {
    try {
      const response = await api.patch('/users/users/me/', updatedData);
      const userData = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Update profile failed:", error);
      const errData = error.response?.data;
      
      // Handle Django REST Framework validation errors
      let parsedError = 'Update failed';
      if (errData) {
        if (typeof errData === 'string') {
          parsedError = errData;
        } else if (errData.detail) {
          parsedError = errData.detail;
        } else if (errData.message) {
          parsedError = errData.message;
        } else {
          // It's likely a validation error object {field: [errors]}
          const firstKey = Object.keys(errData)[0];
          const firstError = errData[firstKey];
          parsedError = Array.isArray(firstError) ? `${firstKey}: ${firstError[0]}` : `${firstKey}: ${firstError}`;
        }
      }
      
      return { success: false, error: parsedError };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
