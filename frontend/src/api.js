import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const signup = (userData) => api.post('/auth/signup', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// User APIs
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (userData) => api.put('/users/profile', userData);

// Companion APIs
export const getCompanions = () => api.get('/companions');
export const getCompanionCities = () => api.get('/companions/cities'); // NEW added API
export const getCompanion = (id) => api.get(`/companions/${id}`);
export const createCompanion = (companionData) => api.post('/companions', companionData);
export const updateCompanion = (id, companionData) => api.put(`/companions/${id}`, companionData);
export const deleteCompanion = (id) => api.delete(`/companions/${id}`);

// Booking APIs
export const getBookings = () => api.get('/bookings');
export const getAllBookings = () => api.get('/bookings/all');
export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const approveBooking = (id) => api.put(`/bookings/${id}/approve`);
export const rejectBooking = (id) => api.put(`/bookings/${id}/reject`);
export const deleteBooking = (id) => api.delete(`/bookings/${id}`);

export default api;