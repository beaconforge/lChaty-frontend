import axios from 'axios'
import { API_BASE_URL } from '../config/backend'

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

export default instance
