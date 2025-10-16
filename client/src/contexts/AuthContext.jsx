import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = '/api';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) {
      return;
    }
    
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedEmployee = localStorage.getItem('employee');

      if (token && savedUser) {
        // Check if we have recent cached data (less than 5 minutes old)
        const lastFetch = localStorage.getItem('lastAuthFetch');
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (lastFetch && (now - parseInt(lastFetch)) < fiveMinutes && savedEmployee) {
          // Use cached data if it's fresh
          console.log('🔄 Using cached auth data');
          setUser(JSON.parse(savedUser));
          setEmployee(JSON.parse(savedEmployee));
          setLoading(false);
          setInitialized(true);
          return;
        }

        try {
          // Fetch fresh user data from server
          const response = await axios.get('/auth/me');
          console.log('🔍 /auth/me response:', response.data);
          
          const freshUserData = response.data.user;
          const freshEmployeeData = response.data.employee;
          
          // Update localStorage with fresh data and timestamp
          localStorage.setItem('user', JSON.stringify(freshUserData));
          localStorage.setItem('employee', JSON.stringify(freshEmployeeData));
          localStorage.setItem('lastAuthFetch', now.toString());
          setUser(freshUserData);
          setEmployee(freshEmployeeData);
          
          console.log('✅ Updated user data:', freshUserData);
          console.log('✅ Updated employee data:', freshEmployeeData);
        } catch (error) {
          console.error('Token verification failed:', error);
          // Only clear auth if it's actually an auth error (401) - keep user logged in for network errors
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('employee');
            localStorage.removeItem('lastAuthFetch');
            setUser(null);
            setEmployee(null);
          } else {
            // For network errors, use cached data if available
            console.warn('Network error during token verification, using cached data:', error.message);
            if (savedEmployee) {
              setUser(JSON.parse(savedUser));
              setEmployee(JSON.parse(savedEmployee));
            }
          }
        }
      }
      setLoading(false);
      setInitialized(true);
    };

    initAuth();
  }, [initialized]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/login', { email, password });
      const { token, user: userData, employee: employeeData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('lastAuthFetch', Date.now().toString());
      if (employeeData) {
        localStorage.setItem('employee', JSON.stringify(employeeData));
        setEmployee(employeeData);
      }
      setUser(userData);

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('employee');
      localStorage.removeItem('lastAuthFetch');
      setUser(null);
      setEmployee(null);
      toast.info('Logged out successfully');
    }
  };

  const forceLogout = () => {
    localStorage.clear();
    setUser(null);
    setEmployee(null);
    setLoading(false);
    window.location.reload();
  };

  const refreshAuthData = async () => {
    try {
      const response = await axios.get('/auth/me');
      const freshUserData = response.data.user;
      const freshEmployeeData = response.data.employee;
      
      localStorage.setItem('user', JSON.stringify(freshUserData));
      localStorage.setItem('employee', JSON.stringify(freshEmployeeData));
      localStorage.setItem('lastAuthFetch', Date.now().toString());
      setUser(freshUserData);
      setEmployee(freshEmployeeData);
      
      console.log('🔄 Auth data refreshed');
      return { success: true };
    } catch (error) {
      console.error('Failed to refresh auth data:', error);
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/register', userData);
      const { token, user: newUser } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      const updatedUser = { ...user, ...response.data.user };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Use effectiveRole if available, otherwise fall back to role
  const userRole = user?.effectiveRole || user?.role;

  const value = {
    user,
    employee,
    loading,
    login,
    logout,
    forceLogout,
    refreshAuthData,
    register,
    updateProfile,
    changePassword,
    isAdmin: userRole === 'admin' || userRole === 'hr', // HR now has admin privileges
    isHR: userRole === 'hr' || userRole === 'admin',
    isManager: userRole === 'manager' || userRole === 'hr' || userRole === 'admin',
    isEmployee: userRole === 'employee'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
