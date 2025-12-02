// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

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
      const { data } = await API.post('/auth/login', { 
        emailOrUsername, 
        password,
        captchaToken 
      });
      
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Handle specific error messages
      let errorMessage = 'Login failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email/username or password';
      } else if (error.response?.status === 400 && error.response.data.message.includes('Captcha')) {
        errorMessage = 'Security verification failed. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Register with reCAPTCHA
  const register = async (formData, captchaToken) => {
    try {
      const { data } = await API.post('/auth/register', {
        ...formData,
        captchaToken
      });
      
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Handle specific error messages
      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = 'User already exists with this email or username';
      } else if (error.response?.status === 400 && error.response.data.message.includes('Captcha')) {
        errorMessage = 'Security verification failed. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Verify reCAPTCHA token (can be used for other forms)
  const verifyCaptcha = async (captchaToken) => {
    try {
      const { data } = await API.post('/auth/verify-captcha', { captchaToken });
      return data.success;
    } catch (error) {
      console.error('❌ Captcha verification error:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    verifyCaptcha,
    loading,
    isAuthenticated: !!user,
    userInfo: user ? {
      id: user.id || user._id,
      name: user.name,
      lastName: user.lastName,
      username: user.username,
      gmail: user.gmail,
      userType: user.userType,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin
    } : null
  };

  return (
    <AuthContext.Provider value={value}>
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