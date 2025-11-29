import axios from 'axios';

// Use relative paths in production, full URL in development
const isDevelopment = import.meta.env.DEV;
const baseURL = "https://saimr-backend-1.onrender.com/api/admin" 

const API = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
});

// Enhanced request interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  config.headers['Content-Type'] = 'application/json';
  
  if (isDevelopment) {
    console.log(`🔐 Admin API: ${config.method?.toUpperCase()} ${config.url}`);
  }
  
  return config;
});

// Enhanced response interceptor
API.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log(`✅ Admin API Success: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('❌ Admin API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (error.response?.status === 403) {
      throw new Error('Access denied. Admin privileges required.');
    }

    if (!error.response) {
      throw new Error('Cannot connect to server. Please check your internet connection.');
    }

    const backendError = error.response.data?.message || error.response.data?.error;
    if (backendError) {
      throw new Error(backendError);
    }

    throw error;
  }
);

// Add retry mechanism for critical requests
const fetchWithRetry = async (apiCall, retries = 2) => {
  try {
    return await apiCall();
  } catch (error) {
    if (retries > 0 && (error.code === 'ECONNABORTED' || !error.response)) {
      console.log(`🔄 Retrying request... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(apiCall, retries - 1);
    }
    throw error;
  }
};

// ==================== PROPERTY MANAGEMENT ENDPOINTS ====================

// Property Management - ADD THESE MISSING EXPORTS
export const fetchAllProperties = (params = {}) => 
  fetchWithRetry(() => API.get("/properties/all", { params }));

export const fetchPendingProperties = () => 
  fetchWithRetry(() => API.get("/properties/pending"));

export const fetchPropertiesByStatus = (status) => 
  fetchWithRetry(() => API.get(`/properties?status=${status}`));

export const approveProperty = (id) => 
  API.put(`/properties/approve/${id}`);

export const rejectProperty = (id, reason) => 
  API.put(`/properties/reject/${id}`, { reason });

export const toggleFeatured = (id) => 
  API.put(`/properties/feature/${id}`);

export const updatePropertyOrder = (id, data) => 
  API.put(`/properties/order/${id}`, data);

export const bulkUpdateProperties = (data) => 
  API.put("/properties/bulk-update", data);

export const fetchPropertyStats = () => 
  fetchWithRetry(() => API.get("/properties/stats"));

export const updateProperty = (id, data) => 
  API.put(`/properties/${id}`, data);

export const patchProperty = (id, data) => 
  API.patch(`/properties/${id}`, data);

// ==================== ENQUIRY MANAGEMENT ENDPOINTS ====================

// Get all enquiries with pagination and filters
export const fetchAllEnquiries = (page = 1, limit = 10, status = '', search = '') => {
  const params = { page, limit };
  if (status) params.status = status;
  if (search) params.search = search;
  
  return fetchWithRetry(() => API.get("/enquiries", { params }));
};

export const getsPropertyById = (id) => 
  fetchWithRetry(() => API.get(`/properties/${id}`));
// Get enquiry by ID
export const fetchEnquiryById = (id) => 
  fetchWithRetry(() => API.get(`/enquiries/${id}`));

// Update enquiry status
export const updateEnquiryStatus = (id, status, adminNotes = '') => 
  API.put(`/enquiries/${id}/status`, { status, adminNotes });

// Add notes to enquiry
export const addEnquiryNotes = (id, notes) => 
  API.post(`/enquiries/${id}/notes`, { notes });

// Delete enquiry
export const deleteEnquiry = (id) => 
  API.delete(`/enquiries/${id}`);

// Bulk update enquiries
export const bulkUpdateEnquiries = (enquiryIds, updates) => 
  API.put("/enquiries/bulk-update", { enquiryIds, updates });

// Get enquiry statistics
export const fetchEnquiryStats = (timeframe = '30d') => 
  fetchWithRetry(() => API.get("/enquiries/stats", { params: { timeframe } }));

// Export enquiries
export const exportEnquiries = async (format = 'json', timeframe = '30d', status = '') => {
  try {
    const params = { format, timeframe };
    if (status) params.status = status;

    const response = await fetchWithRetry(() => API.get("/enquiries/export", {
      params,
      responseType: format === 'csv' ? 'blob' : 'json'
    }));

    if (format === 'csv') {
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enquiries-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true, message: 'Enquiries CSV exported successfully' };
    } else {
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enquiries-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true, message: 'Enquiries JSON exported successfully' };
    }
  } catch (error) {
    console.error('Enquiry export error:', error);
    throw error;
  }
};

// Get enquiries by user ID
export const fetchEnquiriesByUserId = (userId, page = 1, limit = 10) => 
  fetchWithRetry(() => API.get(`/enquiries/user/${userId}`, { 
    params: { page, limit } 
  }));

// ==================== USER MANAGEMENT ENDPOINTS ====================

export const fetchAllUsers = (page = 1, limit = 10, search = '') => 
  fetchWithRetry(() => API.get(`/users?page=${page}&limit=${limit}&search=${search}`));

export const fetchUserById = (id) => 
  fetchWithRetry(() => API.get(`/users/${id}`));

// ==================== ANALYTICS ENDPOINTS ====================

// Click Analytics Endpoints
export const fetchClickAnalytics = (timeframe = '7d', type, propertyId) => {
  const params = { timeframe };
  if (type) params.type = type;
  if (propertyId) params.propertyId = propertyId;
  
  return fetchWithRetry(() => API.get("/analytics/clicks", { params }));
};

export const fetchClickStatsByType = (timeframe = '30d') => {
  return fetchWithRetry(() => API.get("/analytics/clicks/by-type", { params: { timeframe } }));
};

export const fetchPopularClicks = (timeframe = '7d', limit = 10) => {
  return fetchWithRetry(() => API.get("/analytics/clicks/popular", { 
    params: { timeframe, limit: parseInt(limit) } 
  }));
};

export const fetchClickTrends = (timeframe = '30d', groupBy = 'day') => {
  return fetchWithRetry(() => API.get("/analytics/clicks/trends", { 
    params: { timeframe, groupBy } 
  }));
};

// User Analytics Endpoints
export const fetchUserAnalytics = async (timeframe = '30d', userId = null) => {
  try {
    const params = { timeframe };
    if (userId) params.userId = userId;
    
    const response = await fetchWithRetry(() => API.get("/analytics/users", { params }));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCompleteAnalytics = async (timeframe = '7d', includeRawData = false) => {
  try {
    const response = await fetchWithRetry(() => API.get("/analytics/clicks", { 
      params: { timeframe, includeRawData, limit: 500 } 
    }));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchRawClickData = async (params = {}) => {
  try {
    const response = await fetchWithRetry(() => API.get("/analytics/clicks/raw", { params }));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUserSessions = async (timeframe = '7d', limit = 50) => {
  try {
    const response = await fetchWithRetry(() => API.get("/analytics/clicks/sessions", { 
      params: { timeframe, limit } 
    }));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const trackClick = async (clickData) => {
  try {
    const response = await API.post("/analytics/track", clickData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportClickData = async (format = 'json', timeframe = '30d') => {
  try {
    const response = await fetchWithRetry(() => API.get("/analytics/clicks/export", {
      params: { format, timeframe },
      responseType: format === 'csv' ? 'blob' : 'json'
    }));

    if (format === 'csv') {
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `click-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true, message: 'CSV exported successfully' };
    } else {
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `click-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true, message: 'JSON exported successfully' };
    }
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

export const fetchHourlyDistribution = async (timeframe = '7d', groupBy = 'hour') => {
  try {
    const response = await fetchWithRetry(() => API.get("/analytics/clicks/hourly", { 
      params: { timeframe, groupBy } 
    }));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Hourly distribution fetch error:', error);
    throw error;
  }
};
// ✅ FIXED: Get property by ID for editing
export const fetchPropertyById = (id) => 
  fetchWithRetry(() => API.get(`/agent/properties/${id}`));

// adminApi.js - FIXED VERSION
// adminApi.js - UPDATED createPropertyByAdmin function
export const createPropertyByAdmin = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    
    console.log('📤 Sending FormData to server...');
    
    // Debug FormData contents
    if (formData instanceof FormData) {
      console.log('📋 FormData contents:');
      let imageCount = 0;
      for (let [key, value] of formData.entries()) {
        if (key === 'images') {
          imageCount++;
          console.log(`  ${key}[${imageCount}]:`, value.name || 'File', `(${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}:`, typeof value === 'string' ? value.substring(0, 100) + '...' : value);
        }
      }
      console.log(`📊 Total images: ${imageCount}`);
    }

    const response = await fetch(`${baseURL}/agent/properties`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No Content-Type header for FormData
      },
      body: formData,
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ Server error response:', responseData);
      
      // Provide more specific error messages
      if (response.status === 500) {
        throw new Error(responseData.message || 'Server error occurred while creating property');
      } else if (response.status === 400) {
        throw new Error(responseData.message || 'Invalid data provided');
      } else {
        throw new Error(responseData.message || `Failed to create property (Status: ${response.status})`);
      }
    }

    console.log('✅ Property created successfully:', responseData);
    return responseData;
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    // Enhanced error handling
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot connect to server. Please check your internet connection.');
    }
    
    throw error;
  }
};
// Admin updates property with all fields
export const updatePropertyByAdmin = async (id, formData) => {
  try {
    const token = localStorage.getItem('token');
    
    console.log('📤 Sending UPDATE FormData with fetch...');
    
    // Debug: Check FormData contents
    for (let [key, value] of formData.entries()) {
      if (key === 'images') {
        console.log(`  ${key}:`, value.name || 'File', `(${value.size} bytes)`);
      } else if (key === 'existingImages') {
        console.log(`  ${key}:`, value); // Array of existing image URLs
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    const response = await fetch(`${baseURL}/agent/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No Content-Type header - let browser set it automatically for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Server error response:', errorData);
      throw new Error(errorData.message || 'Failed to update property');
    }

    const result = await response.json();
    console.log('✅ Property updated successfully:', result);
    return result;
    
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

// Get properties with agent details and filters
export const getPropertiesWithAgents = (params = {}) => 
  fetchWithRetry(() => API.get("/agent/properties/with-agents", { params }));

// Get single property by ID for admin
export const getPropertyById = (id) => 
  fetchWithRetry(() => API.get(`/agent/properties/${id}`));

// Delete property by admin
export const deletePropertyByAdmin = (id) => 
  API.delete(`/agent/properties/${id}`);

// Assign agent to property
export const assignAgentToProperty = async (propertyId, agentData) => {
  try {
    const response = await API.put(`/agent/properties/${propertyId}/assign-agent`, agentData);
    return response;
  } catch (error) {
    throw error;
  }
};
// Get agents list
export const getAgentsList = async (params = {}) => {
  try {
    const response = await API.get('/agent/agents/list', { params });
    return response;
  } catch (error) {
    throw error;
  }
};
export const getPropertyStats = async () => {
  try {
    const response = await API.get('/agent/properties-stats');
    return response;
  } catch (error) {
    throw error;
  }
};
// // ✅ FIXED: Update property
// export const updateProperty = (id, data) => 
//   API.put(`/properties/${id}`, data);


// ==================== TEST ENDPOINT ====================

// Test connection first
export const testConnection = () => API.get("/test");

export default API;