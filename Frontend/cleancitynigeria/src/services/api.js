import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  verifyEmail: (data) => apiClient.post('/auth/verify-email', data),
  login: (data) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  getStats: () => apiClient.get('/auth/stats'),
};

// Report API endpoints
export const reportAPI = {
  create: (data) => {
    const formData = new FormData();
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('location', JSON.stringify(data.location));
    
    // Also send latitude and longitude as separate fields for backend validation
    if (data.location && data.location.coordinates) {
      formData.append('longitude', data.location.coordinates[0]);
      formData.append('latitude', data.location.coordinates[1]);
    }
    
    // Send other location details
    if (data.location) {
      formData.append('address', data.location.address || '');
      formData.append('lga', data.location.lga || '');
      formData.append('state', data.location.state || '');
    }
    
    if (data.images) {
      data.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }
    
    return apiClient.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: (params) => apiClient.get('/reports', { params }),
  getById: (id) => apiClient.get(`/reports/${id}`),
  getMyReports: (params) => apiClient.get('/reports/my-reports', { params }),
  getNearby: (params) => apiClient.get('/reports/nearby', { params }),
  updateStatus: (id, status) => apiClient.patch(`/reports/${id}/status`, { status }),
  delete: (id) => apiClient.delete(`/reports/${id}`),
};

// Agency API endpoints
export const agencyAPI = {
  register: (data) => apiClient.post('/agencies/register', data),
  getAll: (params) => apiClient.get('/agencies', { params }),
  getById: (id) => apiClient.get(`/agencies/${id}`),
  getAssignedReports: (params) => apiClient.get('/agencies/assigned-reports', { params }),
  updateProfile: (data) => apiClient.put('/agencies/profile', data),
  getStats: () => apiClient.get('/agencies/stats'),
  verify: (id) => apiClient.patch(`/agencies/${id}/verify`),
};

// Reward API endpoints
export const rewardAPI = {
  getMyRewards: (params) => apiClient.get('/rewards/my-rewards', { params }),
  getMyTokens: (params) => apiClient.get('/rewards/my-tokens', { params }),
  getRewardById: (id) => apiClient.get(`/rewards/${id}`),
  getLeaderboard: (params) => apiClient.get('/rewards/leaderboard', { params }),
  redeemTokens: (data) => apiClient.post('/rewards/redeem', data),
  awardBonus: (data) => apiClient.post('/rewards/bonus', data),
};

export default apiClient;
