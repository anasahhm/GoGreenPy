import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const signup = (userData) => api.post('/auth/signup', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// Impact APIs
export const calculateImpact = (data) => api.post('/impact/calculate', data);
export const getHistory = (page = 1, pageSize = 10) => 
  api.get(`/impact/history?page=${page}&page_size=${pageSize}`);

// AI Chat API - NEW
export const chatWithAI = (message) => api.post('/impact/chat', { message });

// Admin APIs
export const getAllUsers = (page = 1, pageSize = 20) => 
  api.get(`/admin/users?page=${page}&page_size=${pageSize}`);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);
export const getAllLogs = (page = 1, pageSize = 20) => 
  api.get(`/admin/logs?page=${page}&page_size=${pageSize}`);

export default api;