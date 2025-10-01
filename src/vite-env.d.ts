/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WORKER_API_BASE_URL: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_BACKEND_API_PROXY?: string;
  readonly VITE_WORKER_API_PROXY?: string;
  readonly DEV_CERT_PATH?: string;
  readonly DEV_KEY_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}