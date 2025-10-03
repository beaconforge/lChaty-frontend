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
    return Promise.reject(error);
  },
);
