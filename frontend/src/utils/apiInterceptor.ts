import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, AUTH_BASE } from '../apis/base_url';

const API_TIMEOUT = 30000;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export const setupAxiosInterceptors = (onSessionExpired?: () => void) => {
  axios.defaults.timeout = API_TIMEOUT;

  axios.interceptors.request.use(
    (config) => {
      if (!config.timeout) {
        config.timeout = API_TIMEOUT;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.code === 'ECONNABORTED') {
        return Promise.reject(
          new Error('Request timed out. Please check your connection and try again.'),
        );
      }

      if (!error.response) {
        return Promise.reject(
          new Error('Network error. Please check your internet connection.'),
        );
      }

      if (
        error.response?.status === 401 &&
        error.response?.data?.code === 'TOKEN_EXPIRED' &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return axios(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem('refreshToken');

          if (!refreshToken) {
            processQueue(new Error('No refresh token'), null);
            if (onSessionExpired) onSessionExpired();
            return Promise.reject(error);
          }

          const response = await axios.post(
            `${BASE_URL}${AUTH_BASE}/refresh-token`,
            { refreshToken },
            { timeout: 10000, _retry: true } as any,
          );

          const { token: newToken, refreshToken: newRefreshToken } = response.data;

          await AsyncStorage.setItem('refreshToken', newRefreshToken);

          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          processQueue(null, newToken);
          return axios(originalRequest);
        } catch (refreshError: any) {
          processQueue(refreshError, null);

          if (
            refreshError?.response?.data?.code === 'REFRESH_EXPIRED' ||
            refreshError?.response?.status === 401
          ) {
            await AsyncStorage.removeItem('refreshToken');
            if (onSessionExpired) onSessionExpired();
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (error.response?.status === 403) {
        return Promise.reject(
          new Error('Access denied. Please login again.'),
        );
      }

      if (error.response?.status >= 500) {
        return Promise.reject(
          new Error('Server error. Please try again later.'),
        );
      }

      return Promise.reject(error);
    },
  );
};
