import axios from 'axios';
import { API_BASE_URL } from '@/config/backend';

const baseURL = API_BASE_URL || 'https://chat-backend.lchaty.com/api';

export const http = axios.create({
  baseURL,
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
