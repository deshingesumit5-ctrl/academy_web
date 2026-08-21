import axios from 'axios';
import { getCachedData, setCachedData, clearApiCache } from './apiCache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    if (method === 'GET') {
      const urlKey = response.config.url || '';
      if (urlKey) {
        setCachedData(urlKey, response.data);
      }
    } else if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method || '')) {
      clearApiCache();
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// High-speed GET wrapper for instant UI response
const originalGet = axiosInstance.get;
axiosInstance.get = function (url: string, config?: any) {
  const cached = getCachedData(url);
  if (cached && (!config || !config.skipCache)) {
    // Revalidate in background asynchronously
    originalGet.call(axiosInstance, url, config).then((res: any) => {
      setCachedData(url, res.data);
    }).catch(() => {});

    // Return cached data immediately
    return Promise.resolve({
      data: cached,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }
  return originalGet.call(axiosInstance, url, config);
} as any;

export default axiosInstance;

