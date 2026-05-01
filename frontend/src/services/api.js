import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

export const activityService = {
  // Create a new activity
  createActivity: async (activityData) => {
    const response = await api.post('/activities', activityData);
    return response.data;
  },

  // Get all activities
  getAllActivities: async () => {
    const response = await api.get('/activities');
    return response.data;
  },

  // Get activity by date
  getActivityByDate: async (date) => {
    const response = await api.get(`/activities/${date}`);
    return response.data;
  },

  // Update activity
  updateActivity: async (id, activityData) => {
    const response = await api.put(`/activities/${id}`, activityData);
    return response.data;
  },

  // Delete activity
  deleteActivity: async (id) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },

  // Get weekly analysis
  getWeeklyAnalysis: async () => {
    const response = await api.get('/analysis/weekly');
    return response.data;
  },

  // Get monthly analysis
  getMonthlyAnalysis: async () => {
    const response = await api.get('/analysis/monthly');
    return response.data;
  },

  // Get yearly analysis
  getYearlyAnalysis: async () => {
    const response = await api.get('/analysis/yearly');
    return response.data;
  },
};

export default api;


