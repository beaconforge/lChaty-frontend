/**
 * Environment configuration with typed access to VITE_* variables
 */

interface EnvConfig {
  API_BASE_URL: string;
  WORKER_API_BASE_URL: string;
  USER_BASE_URL: string;
  ADMIN_BASE_URL: string;
  APP_NAME: string;
  NODE_ENV: string;
}

function validateEnv(): EnvConfig {
  const requiredVars = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    WORKER_API_BASE_URL: import.meta.env.VITE_WORKER_API_BASE_URL,
    USER_BASE_URL: import.meta.env.VITE_USER_BASE_URL || 'https://local.lchaty.com:5173',
    ADMIN_BASE_URL: import.meta.env.VITE_ADMIN_BASE_URL || 'https://local.admin.lchaty.com:5173',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'lchaty',
    NODE_ENV: import.meta.env.MODE || 'development'
  };

  // Validate required environment variables
  const missing = [];
  if (!requiredVars.API_BASE_URL) missing.push('VITE_API_BASE_URL');
  if (!requiredVars.WORKER_API_BASE_URL) missing.push('VITE_WORKER_API_BASE_URL');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return requiredVars as EnvConfig;
}

export const env = validateEnv();
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';