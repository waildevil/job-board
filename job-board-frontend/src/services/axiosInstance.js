import axios from 'axios';
import { API_URL } from './config';

// Use remote backend if REACT_APP_API_URL is set; otherwise fall back to /api (dev proxy)
const baseURL = API_URL ? `${API_URL.replace(/\/$/, '')}/api` : '/api';
console.log('[axios] baseURL =', baseURL);

const instance = axios.create({ baseURL });

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default instance;
