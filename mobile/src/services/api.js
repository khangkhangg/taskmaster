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

// Messages API
export const messagesAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getTaskMessages: (taskId, params) => api.get(`/messages/task/${taskId}`, { params }),
  getConversations: (params) => api.get('/messages/conversations', { params }),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

// Users API
export const usersAPI = {
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  searchUsers: (params) => api.get('/users/search', { params }),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.post(`/users/${userId}/unfollow`),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
  saveTask: (taskId) => api.post(`/users/tasks/${taskId}/save`),
  unsaveTask: (taskId) => api.post(`/users/tasks/${taskId}/unsave`),
  getSavedTasks: (params) => api.get('/users/saved/tasks', { params }),
  getRecommendedUsers: () => api.get('/users/recommended/users'),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
  getRecommendedTasks: (params) => api.get('/tasks/recommended/for-me', { params }),
};

// Payments API
export const paymentsAPI = {
  createEscrow: (data) => api.post('/payments/escrow', data),
  confirmEscrow: (transactionId) => api.post(`/payments/${transactionId}/confirm`),
  releasePayment: (transactionId) => api.post(`/payments/${transactionId}/release`),
  refundPayment: (transactionId, data) => api.post(`/payments/${transactionId}/refund`, data),
  getTransactions: (params) => api.get('/payments/transactions', { params }),
  getTransaction: (transactionId) => api.get(`/payments/transactions/${transactionId}`),
  getTaskTransaction: (taskId) => api.get(`/payments/task/${taskId}/transaction`),
  getPaymentStats: () => api.get('/payments/stats'),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getTaskAnalytics: (taskId) => api.get(`/analytics/task/${taskId}`),
  getMarketplaceInsights: () => api.get('/analytics/marketplace'),
  getUserMetrics: () => api.get('/analytics/metrics'),
};

export default api;
