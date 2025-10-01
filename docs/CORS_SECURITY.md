## CORS and Cookie Security

Hard constraints (restate):
- Allowed local origins:
  - https://local.lchaty.com:5173
  - https://local.admin.lchaty.com:5173
- Backend origin (always): https://chat-backend.lchaty.com

Key rules:
- Cookies must be set by the backend with: Secure; HttpOnly; SameSite=None; Path=/; Domain omitted (Worker will handle domain rewrite).
- The frontend must make credentialed requests (Axios instance has withCredentials: true).
- Vite dev proxy must forward cookies and rewrite cookie domains to the local origin using `cookieDomainRewrite: {'*': ''}` to remove domain attribute.

Common pitfalls and fixes:
- Missing SameSite=None — modern browsers will block cross-site cookies unless SameSite=None and Secure.
- Running over HTTP — cookies with Secure will not be set; use HTTPS dev server with SAN certs.
- Cookie Domain set to remote host — the proxy rewrite is required so browser accepts the cookie for the local origin.
- Using fetch without credentials — use Axios with withCredentials: true for all /api requests.

Minimal verification steps:
- Open browser devtools > Application > Cookies for `local.lchaty.com` and `local.admin.lchaty.com` after login; ensure cookie attributes match above.
