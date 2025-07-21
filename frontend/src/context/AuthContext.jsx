import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You might want to verify the token with the backend here
      setCurrentUser({ token });
    }
    setLoading(false);
  }, []);

  async function signup(email, password) {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/signup`, { email, password });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async function verifyEmail(token) {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/verify-email`, { token });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  async function signin(email, password) {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/signin`, { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser({ token });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  function signout() {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    signup,
    verifyEmail,
    signin,
    signout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}