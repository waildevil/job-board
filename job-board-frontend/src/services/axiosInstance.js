import axios from 'axios';
import { API_URL, BACKEND_URL } from './config';

const instance = axios.create({
  baseURL: `${API_URL}`,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");

      
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default instance;
