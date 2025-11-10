import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@taskmaster:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      await AsyncStorage.removeItem('@taskmaster:token');
      // You can dispatch a logout action here
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Tasks API
export const tasksAPI = {
  createTask: (data) => api.post('/tasks', data),
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getMyTasks: (params) => api.get('/tasks/my-tasks', { params }),
  completeTask: (id, data) => api.post(`/tasks/${id}/complete`, data),
};

// Bids API
export const bidsAPI = {
  createBid: (data) => api.post('/bids', data),
  getMyBids: (params) => api.get('/bids/my-bids', { params }),
  getTaskBids: (taskId) => api.get(`/bids/task/${taskId}`),
  updateBid: (id, data) => api.put(`/bids/${id}`, data),
  acceptBid: (id) => api.post(`/bids/${id}/accept`),
  withdrawBid: (id) => api.post(`/bids/${id}/withdraw`),
};

// Reviews API
export const reviewsAPI = {
  createReview: (data) => api.post('/reviews', data),
  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  getTaskReviews: (taskId) => api.get(`/reviews/task/${taskId}`),
  getTrustScore: (userId) => api.get(`/reviews/trust-score/${userId}`),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
  respondToReview: (reviewId, data) => api.post(`/reviews/${reviewId}/respond`, data),
};

// Disputes API
export const disputesAPI = {
  createDispute: (data) => api.post('/disputes', data),
  getMyDisputes: (params) => api.get('/disputes/my-disputes', { params }),
  getDispute: (disputeId) => api.get(`/disputes/${disputeId}`),
  addMessage: (disputeId, data) => api.post(`/disputes/${disputeId}/message`, data),
  closeDispute: (disputeId) => api.post(`/disputes/${disputeId}/close`),
};

export default api;
