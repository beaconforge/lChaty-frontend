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

function resolveEnv(value: string | undefined, fallback: string, name: string): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (import.meta.env.DEV) {
    console.warn(
      `[env] ${name} missing – defaulting to ${fallback ? fallback : 'same-origin'}.`,
    );
  }

  return fallback;
}

function validateEnv(): EnvConfig {
  const apiBase = resolveEnv(
    import.meta.env.VITE_API_BASE_URL,
    'https://chat-backend.lchaty.com/api',
    'VITE_API_BASE_URL',
  );
  const workerBase = resolveEnv(
    import.meta.env.VITE_WORKER_API_BASE_URL,
    'https://chat-backend.lchaty.com/api/worker',
    'VITE_WORKER_API_BASE_URL',
  );

  return {
    API_BASE_URL: apiBase,
    WORKER_API_BASE_URL: workerBase,
    USER_BASE_URL: resolveEnv(
      import.meta.env.VITE_USER_BASE_URL,
      'https://local.lchaty.com:5173',
      'VITE_USER_BASE_URL',
    ),
    ADMIN_BASE_URL: resolveEnv(
      import.meta.env.VITE_ADMIN_BASE_URL,
      'https://local.admin.lchaty.com:5173',
      'VITE_ADMIN_BASE_URL',
    ),
    APP_NAME: resolveEnv(import.meta.env.VITE_APP_NAME, 'lchaty', 'VITE_APP_NAME'),
    NODE_ENV: resolveEnv(import.meta.env.MODE, 'development', 'MODE'),
  };
}

export const env = validateEnv();
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
