# Frontend Hostname-Based Routing Setup

## Overview

The lChaty frontend uses hostname-based routing to serve different applications from the same Vite dev server:

- **User App**: `https://local.lchaty.com:5173` → serves `index.html`
- **Admin App**: `https://local.admin.lchaty.com:5173` → serves `admin.html`

## Configuration

### Environment Variables

The frontend uses these environment variables:

```bash
# Frontend Base URLs
VITE_USER_BASE_URL=https://local.lchaty.com:5173
VITE_ADMIN_BASE_URL=https://local.admin.lchaty.com:5173

# API Base URLs  
VITE_API_BASE_URL=https://local.lchaty.com:5173
VITE_WORKER_API_BASE_URL=https://local.worker.lchaty.com
```

### Vite Configuration

The `vite.config.ts` includes a custom plugin that routes requests based on hostname:

- Requests to `local.admin.lchaty.com` → served from `admin.html`
- Requests to `local.lchaty.com` → served from `index.html`

### Cross-App Navigation

Use the `@/utils/navigation.ts` utilities for cross-app navigation:

```typescript
import { navigateToAdminApp, navigateToUserApp, getCurrentApp } from '@/utils/navigation';

// Navigate to admin app
navigateToAdminApp('/settings');

// Navigate to user app  
navigateToUserApp('/chat');

// Check current app
if (getCurrentApp() === 'admin') {
  // Admin-specific logic
}
```

## Prerequisites

### 1. Hosts File Configuration

Both domains must be configured in `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1   local.lchaty.com
127.0.0.1   local.admin.lchaty.com
```

### 2. SSL Certificates

The SSL certificate must include both hostnames in the Subject Alternative Name (SAN):

- `local.lchaty.com`
- `local.admin.lchaty.com`

**Current Certificate Status**: The existing certificate includes `local.admin.lchaty.com`. If you encounter SSL warnings for the admin domain, regenerate the certificate including both hostnames:

```powershell
# Regenerate certificate with both domains
mkcert local.lchaty.com local.admin.lchaty.com
```

### 3. Development Server

Start the dev server with the enhanced script:

```powershell
.\scripts\start-dev.ps1
```

The script will:
- ✅ Install dependencies
- ✅ Create/update `.env` file
- ✅ Validate TypeScript compilation  
- ✅ Check SSL certificates
- ✅ Start Vite dev server with HTTPS

## Testing

### Manual Testing

1. **User App**: Navigate to `https://local.lchaty.com:5173`
   - Should load the user chat interface
   
2. **Admin App**: Navigate to `https://local.admin.lchaty.com:5173`  
   - Should load the admin portal interface

### Build Verification

```powershell
npm run build
```

Should generate both `dist/index.html` and `dist/admin.html`.

## Troubleshooting

### SSL Certificate Warnings

If you see SSL warnings for `local.admin.lchaty.com`, the certificate may need to include the full domain name:

1. Check current certificate:
   ```powershell
   $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2(".\local.lchaty.com.pem")
   $cert.Extensions | Where-Object {$_.Oid.FriendlyName -eq "Subject Alternative Name"} | ForEach-Object {$_.Format($true)}
   ```

2. If `local.admin.lchaty.com` is not listed, regenerate:
   ```powershell
   mkcert local.lchaty.com local.admin.lchaty.com
   ```

### Hostname Routing Not Working

1. Verify hosts file entries
2. Clear browser DNS cache
3. Restart the development server
4. Check Vite dev server logs for routing information

### TypeScript Errors

Run validation and fix any compilation issues:

```powershell
npm run typecheck
```

## Architecture Notes

- Both apps share the same build system and dependencies
- API configuration is shared between apps
- Cross-app navigation preserves authentication state
- Environment variables are validated at startup
- The setup follows lChaty's non-negotiable security constraints (HTTPS-only, specific hostnames)
