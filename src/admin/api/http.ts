import axios from 'axios';

export const http = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

http.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401) {
      // Allow upstream handlers to decide how to respond. Do not disrupt bootstrap flow.
    }
    return Promise.reject(error);
  },
);
