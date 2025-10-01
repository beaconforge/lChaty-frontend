interface ImportMetaEnv {
  readonly VITE_DEV_CERT_PATH?: string
  readonly VITE_DEV_KEY_PATH?: string
  readonly VITE_PROXY_TARGET?: string
  // E2E credentials (optional for LIVE runs)
  readonly E2E_USER?: string
  readonly E2E_PASS?: string
  readonly E2E_ADMIN_USER?: string
  readonly E2E_ADMIN_PASS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
