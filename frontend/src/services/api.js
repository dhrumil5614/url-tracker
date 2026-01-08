import axios from 'axios';

/**
 * API service for communicating with the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens (if needed in future)
api.interceptors.request.use(
  (config) => {
    // You can add authentication tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Link API endpoints
 */
export const linkAPI = {
  // Create a new shortened link
  createLink: async (linkData) => {
    const response = await api.post('/api/links', linkData);
    return response.data;
  },

  // Get all links
  getLinks: async (page = 1, limit = 20) => {
    const response = await api.get('/api/links', {
      params: { page, limit },
    });
    return response.data;
  },

  // Delete a link
  deleteLink: async (shortCode) => {
    const response = await api.delete(`/api/links/${shortCode}`);
    return response.data;
  },
};

/**
 * Analytics API endpoints
 */
export const analyticsAPI = {
  // Get analytics for a specific link
  getLinkAnalytics: async (shortCode, startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get(`/api/analytics/${shortCode}`, { params });
    return response.data;
  },

  // Get campaign-level analytics
  getCampaignAnalytics: async (campaign, startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get(`/api/analytics/campaign/${campaign}`, { params });
    return response.data;
  },

  // Get dashboard overview statistics
  getDashboardAnalytics: async (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/api/analytics/dashboard/overview', { params });
    return response.data;
  },

  // Export analytics to CSV
  exportAnalytics: async (shortCode, startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get(`/api/analytics/export/${shortCode}`, {
      params,
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `analytics-${shortCode}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

/**
 * Health check
 */
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
