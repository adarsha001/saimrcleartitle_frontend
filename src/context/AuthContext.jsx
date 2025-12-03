// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://saimr-backend-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Set auth header for subsequent requests
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login with reCAPTCHA
  const login = async (emailOrUsername, password, captchaToken) => {
    try {
      console.log('🔐 Login attempt for:', emailOrUsername);
      
      const payload = { 
        emailOrUsername, 
        password 
      };
      
      // Only add captchaToken if provided (some routes might not need it)
      if (captchaToken) {
        payload.captchaToken = captchaToken;
      }
      
      const { data } = await API.post('/auth/login', payload);
      
      if (data.success && data.token && data.user) {
        console.log('✅ Login successful:', data.user.username);
        
        // Store tokens
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set auth header
        API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // Update state
        setUser(data.user);
        
        return { 
          success: true, 
          user: data.user,
          token: data.token 
        };
      } else {
        throw new Error(data.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Login error:', {
        message: error.message,
        response: error.response?.data
      });
      
      // Handle specific error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email/username or password';
      } else if (error.response?.status === 400) {
        if (error.response.data.message?.includes('Captcha') || 
            error.response.data.message?.includes('captcha')) {
          errorMessage = 'Security verification failed. Please try again.';
        }
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Register with reCAPTCHA - Accepts single object with all data
  const register = async (registrationData) => {
    try {
      const { captchaToken, ...formData } = registrationData;
      
      console.log('🔐 Registration attempt:', {
        username: formData.username,
        captchaProvided: !!captchaToken
      });
      
      if (!captchaToken) {
        throw new Error('Captcha verification required');
      }
      
      // Prepare payload exactly as backend expects
      const payload = {
        username: formData.username,
        name: formData.name,
        lastName: formData.lastName,
        userType: formData.userType,
        phoneNumber: formData.phoneNumber,
        gmail: formData.gmail, // Using 'gmail' as backend expects
        password: formData.password,
        captchaToken: captchaToken // Must be exact field name
      };
      
      console.log('📦 Sending payload:', {
        ...payload,
        password: '[HIDDEN]',
        captchaToken: captchaToken.substring(0, 20) + '...'
      });
      
      const { data } = await API.post('/auth/register', payload);
      
      console.log('✅ Registration response:', {
        success: data.success,
        username: data.user?.username
      });
      
      if (data.success && data.token && data.user) {
        // Store tokens
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set auth header
        API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // Update state
        setUser(data.user);
        
        return { 
          success: true, 
          user: data.user,
          token: data.token,
          message: data.message || 'Registration successful!'
        };
      } else {
        throw new Error(data.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Registration error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle specific error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = 'User already exists with this email or username';
      } else if (error.response?.status === 400) {
        if (error.response.data.message?.includes('Captcha') || 
            error.response.data.message?.includes('captcha') ||
            error.response.data.message?.includes('robot')) {
          errorMessage = 'Security verification failed. Please complete the captcha.';
        } else {
          errorMessage = error.response.data.message || 'Invalid request data';
        }
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Logout
  const logout = () => {
    console.log('👋 Logging out user:', user?.username);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Update user data
  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/auth/profile', profileData);
      
      if (data.success) {
        updateUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || 'Update failed');
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await API.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('❌ Password change error:', error);
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  };

  // Verify token (check if still valid)
  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const { data } = await API.get('/auth/verify-token');
      return data.success;
    } catch (error) {
      console.error('❌ Token verification error:', error);
      return false;
    }
  };

  // Get user by ID (for admin)
  const getUserById = async (userId) => {
    try {
      const { data } = await API.get(`/auth/users/${userId}`);
      return data;
    } catch (error) {
      console.error('❌ Get user error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  };

  // Get all users (admin only)
  const getAllUsers = async () => {
    try {
      const { data } = await API.get('/auth/users');
      return data;
    } catch (error) {
      console.error('❌ Get users error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    changePassword,
    verifyToken,
    getUserById,
    getAllUsers,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin === true,
    userInfo: user ? {
      id: user.id || user._id,
      name: user.name,
      lastName: user.lastName,
      username: user.username,
      gmail: user.gmail,
      email: user.email || user.gmail, // Provide both for compatibility
      userType: user.userType,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    } : null
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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