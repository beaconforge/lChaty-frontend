import axios from 'axios';

export const http = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

http.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  },
);
