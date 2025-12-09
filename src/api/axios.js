import axios from 'axios';

const baseURL = 'https://saimr-backend-1.onrender.com/api';

// Create main API instance for JSON requests
const API = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
});

// Create separate instance for FormData/multipart requests
const APII = axios.create({
  baseURL,
  timeout: 30000, // Longer timeout for file uploads
  withCredentials: true,
});

// Request interceptor for JSON API
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['Content-Type'] = 'application/json';
    
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Request interceptor for FormData API (APII)
APII.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ⚠️ CRITICAL: Don't set Content-Type for FormData
    // Let the browser set it automatically with boundary
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    console.log(`📁 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, 
                config.data instanceof FormData ? '(FormData)' : '');
    
    return config;
  },
  (error) => {
    console.error('❌ FormData Request error:', error);
    return Promise.reject(error);
  }
);

// Common response interceptor for both instances
const handleResponseError = (error) => {
  console.error('❌ Response error:', {
    url: error.config?.url,
    status: error.response?.status,
    message: error.message,
    code: error.code,
    data: error.response?.data
  });

  if (error.code === 'ECONNABORTED') {
    throw new Error('Request timeout. Please check your connection.');
  }

  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Don't redirect here to avoid loops
  }

  if (error.response?.status === 403) {
    throw new Error('You do not have permission to access this resource.');
  }

  if (!error.response) {
    throw new Error('Network error. Please check your connection and try again.');
  }

  return Promise.reject(error);
};

API.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  handleResponseError
);

APII.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url} (FormData)`);
    return response;
  },
  handleResponseError
);

// API functions

export const getProperties = (params = {}) => {
  return API.get("/properties", { 
    params: { 
      ...params, 
      website: "cleartitle",
      page: params.page || 1,
      limit: params.limit || 12 // Add limit parameter
    } 
  });
};
export const getPropertyById = (id) => API.get(`/properties/${id}`);
export const likeProperty = (propertyId) => API.post(`/users/like/${propertyId}`);
export const unlikeProperty = (propertyId) => API.delete(`/users/like/${propertyId}`);
export const checkIfLiked = (propertyId) => API.get(`/users/like/${propertyId}/check`);
export const toggleLike = (propertyId) => API.post(`/users/like/${propertyId}/toggle`);
export const getAllProperties = () => API.get("/properties", { 
  params: { 
    limit: 1000, 
    page: 1 
  } 
});
export const createEnquiry = (enquiryData) => API.post("/auth/enquiries", enquiryData);
export const getUserProfile = () => API.get("/users/profile");
export const getUserEnquiries = () => API.get("/users/my-enquiries");
export const updateUserProfile = (userData) => API.put("/users/profile", userData);
export const deleteUserAccount = () => API.delete("/users/account");
export const getUserProperties = () => API.get("/users/properties");
export const deleteUserProperty = (propertyId) => API.delete(`/properties/${propertyId}`);

// FormData/Multimedia APIs
export const createProperty = (formData) => APII.post("/properties", formData);

// New multimedia upload routes
export const uploadPropertyImages = (propertyId, images) => {
  const formData = new FormData();
  images.forEach(image => {
    formData.append('images', image);
  });
  return APII.post(`/properties/${propertyId}/images`, formData);
};

export const updatePropertyImages = (propertyId, images) => {
  const formData = new FormData();
  images.forEach(image => {
    formData.append('images', image);
  });
  return APII.put(`/properties/${propertyId}/images`, formData);
};

export const deletePropertyImage = (propertyId, imageId) => 
  APII.delete(`/properties/${propertyId}/images/${imageId}`);

export const uploadUserAvatar = (avatarFile) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  return APII.post('/users/upload-avatar', formData);
};

export default API;