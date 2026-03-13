import axios from 'axios';
import Cookies from 'js-cookie';

const COOKIE_NAME = 'auth_data';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5000/api/v1',
  baseURL: 'https://theodyssey-backend-production.up.railway.app/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token from cookie/localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get auth data from localStorage first (more secure)
    let authData = null;
    
    try {
      const localAuth = localStorage.getItem('auth_data');
      if (localAuth) {
        const parsed = JSON.parse(localAuth);
        authData = parsed;
      }
    } catch (e) {
      // Fallback to cookie
    }
    
    // Fallback to cookie
    if (!authData) {
      try {
        const cookieAuth = Cookies.get(COOKIE_NAME);
        if (cookieAuth) {
          authData = JSON.parse(cookieAuth);
        }
      } catch (e) {
        // Ignore
      }
    }
    
    // Add auth token if user is authenticated
    if (authData?.user?.token) {
      config.headers.Authorization = `Bearer ${authData.user.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - auto logout
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('auth_data');
      } catch (e) {
        // Ignore
      }
      Cookies.remove(COOKIE_NAME);
      // Optionally redirect to login or refresh
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
