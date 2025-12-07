// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresPhoneUpdate, setRequiresPhoneUpdate] = useState(false);
  const [currentWebsite, setCurrentWebsite] = useState(() => {
    // Get current website from localStorage or default to 'saimgroups'
    return localStorage.getItem('currentWebsite') || 'saimgroups';
  });

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const phoneUpdateFlag = localStorage.getItem('requiresPhoneUpdate');
        const storedWebsite = localStorage.getItem('currentWebsite');
        
        if (storedWebsite) {
          setCurrentWebsite(storedWebsite);
        }
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setRequiresPhoneUpdate(phoneUpdateFlag === 'true');
        } else {
          setUser(null);
          setRequiresPhoneUpdate(false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setUser(null);
        setRequiresPhoneUpdate(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('requiresPhoneUpdate');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set current website
  const setWebsite = (website) => {
    if (['saimgroups', 'cleartitle1', 'direct'].includes(website)) {
      setCurrentWebsite(website);
      localStorage.setItem('currentWebsite', website);
    }
  };

  // Google Sign-In
  const googleLogin = async (token) => {
    try {
      console.log('🔍 Google login attempt started');
      console.log('✅ Token received:', {
        type: typeof token,
        isString: typeof token === 'string',
        length: token?.length,
        first50: token?.substring(0, 50),
        isValidJWT: token?.split('.').length === 3
      });
      
      if (!token || typeof token !== 'string') {
        console.error('❌ Invalid token format:', token);
        throw new Error('Invalid Google token received');
      }
      
      // Send token and current website to backend
      console.log('📤 Sending to backend:', {
        endpoint: '/auth/google-signin',
        payload: { 
          token: token,
          sourceWebsite: currentWebsite 
        }
      });
      
      const { data } = await API.post('/auth/google-signin', {
        token: token,
        sourceWebsite: currentWebsite
      });
      
      console.log('✅ Backend response:', data);
      
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('requiresPhoneUpdate', data.user.requiresPhoneUpdate || false);
        
        // Store website info
        if (data.user.sourceWebsite) {
          localStorage.setItem('currentWebsite', data.user.sourceWebsite);
          setCurrentWebsite(data.user.sourceWebsite);
        }
        
        // Store website logins
        if (data.user.websiteLogins) {
          localStorage.setItem('websiteLogins', JSON.stringify(data.user.websiteLogins));
        }
        
        setUser(data.user);
        setRequiresPhoneUpdate(data.user.requiresPhoneUpdate || false);
        
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('❌ Google login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  };

  // Regular login
  const login = async (loginData) => {
    try {
      const { data } = await API.post('/auth/login', { 
        emailOrUsername: loginData.emailOrUsername, 
        password: loginData.password,
        sourceWebsite: currentWebsite // Use current website
      });
      
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('requiresPhoneUpdate', data.user.requiresPhoneUpdate || false);
        
        // Store website info
        if (data.user.sourceWebsite) {
          localStorage.setItem('currentWebsite', data.user.sourceWebsite);
          setCurrentWebsite(data.user.sourceWebsite);
        }
        
        // Store website logins
        if (data.user.websiteLogins) {
          localStorage.setItem('websiteLogins', JSON.stringify(data.user.websiteLogins));
        }
        
        setUser(data.user);
        setRequiresPhoneUpdate(data.user.requiresPhoneUpdate || false);
        
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  // Registration
  const register = async (registerData) => {
    try {
      // Ensure sourceWebsite is included (default to current website if not provided)
      const dataToSend = {
        ...registerData,
        sourceWebsite: registerData.sourceWebsite || currentWebsite
      };
      
      console.log('Registering user from:', dataToSend.sourceWebsite);
      
      const { data } = await API.post('/auth/register', dataToSend);
      
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('requiresPhoneUpdate', data.user.requiresPhoneUpdate || false);
        
        // Store website login info
        localStorage.setItem('currentWebsite', dataToSend.sourceWebsite);
        setCurrentWebsite(dataToSend.sourceWebsite);
        
        if (data.user.websiteLogins) {
          localStorage.setItem('websiteLogins', JSON.stringify(data.user.websiteLogins));
        }
        
        setUser(data.user);
        setRequiresPhoneUpdate(data.user.requiresPhoneUpdate || false);
        
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await API.put('/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('requiresPhoneUpdate', data.user.requiresPhoneUpdate || false);
        
        setUser(data.user);
        setRequiresPhoneUpdate(data.user.requiresPhoneUpdate || false);
        
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear Google session if exists
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('requiresPhoneUpdate');
    // Don't remove currentWebsite on logout so user stays on same site
    setUser(null);
    setRequiresPhoneUpdate(false);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const clearPhoneUpdateFlag = () => {
    setRequiresPhoneUpdate(false);
    localStorage.removeItem('requiresPhoneUpdate');
  };

  // Get website login stats
  const getWebsiteStats = (website) => {
    if (!user || !user.websiteLogins) return null;
    
    return user.websiteLogins[website] || null;
  };

  // Check if user has logged in to specific website
  const hasLoggedIntoWebsite = (website) => {
    if (!user || !user.websiteLogins) return false;
    return user.websiteLogins[website]?.hasLoggedIn || false;
  };

  const value = {
    user,
    login,
    googleLogin,
    register,
    logout,
    updateUser,
    updateProfile,
    loading,
    requiresPhoneUpdate,
    clearPhoneUpdateFlag,
    currentWebsite,
    setWebsite,
    getWebsiteStats,
    hasLoggedIntoWebsite,
    isAuthenticated: !!user,
    userInfo: user ? {
      id: user.id || user._id,
      name: user.name,
      username: user.username,
      gmail: user.gmail,
      userType: user.userType,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      isGoogleAuth: user.isGoogleAuth,
      avatar: user.avatar,
      requiresPhoneUpdate: user.requiresPhoneUpdate,
      sourceWebsite: user.sourceWebsite,
      websiteLogins: user.websiteLogins
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