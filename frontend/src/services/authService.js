 
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const authService = {
  // Register user (without token storage)
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await axios.post(`${API_URL}/verify-email`, { token });
    return response.data;
  },

  // Login user (returns token and user data)
  login: async (userData) => {
    const response = await axios.post(`${API_URL}/login`, userData);
    
    // Return structured data for components
    return {
      token: response.data.token,
      user: response.data.user
    };
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await axios.post(`${API_URL}/reset-password`, { token, password });
    return response.data;
  },

  // Get current user
  getMe: async (token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${API_URL}/me`, config);
    return response.data;
  },

  // Get user by ID
  getUserById: async (token, userId) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${API_URL}/users/${userId}`, config);
    return response.data;
  }
};

export default authService;