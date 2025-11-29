import axios from "axios";

const API = axios.create({
  baseURL: "https://saimr-backend-1.onrender.com/api/agents",
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or your token storage method
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// CREATE
export const createAgent = (data) => API.post("/", data);

// GET ALL
export const getAgents = (page = 1, search = '') =>
  API.get(`/?page=${page}&limit=10&search=${search}`);

// GET ONE
export const getAgent = (id) => API.get(`/${id}`);

// UPDATE
export const updateAgent = (id, data) => API.put(`/${id}`, data);

// DELETE
export const deleteAgent = (id) => API.delete(`/${id}`);