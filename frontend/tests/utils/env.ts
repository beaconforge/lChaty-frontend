import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const winPath = 'D:\\Chat\\lChaty-frontend\\frontend\\.env.local';
const localPath = path.resolve(process.cwd(), '.env.local');

const envPath = fs.existsSync(winPath) ? winPath : (fs.existsSync(localPath) ? localPath : undefined);
if (envPath) dotenv.config({ path: envPath });

type Creds = { user?: string; pass?: string };

export function getUserCreds(): Creds {
  return { user: process.env.E2E_USER, pass: process.env.E2E_PASS };
}
export function getAdminCreds(): Creds {
  return { user: process.env.E2E_ADMIN_USER, pass: process.env.E2E_ADMIN_PASS };
}

export function requireCredsOrSkip(creds: Creds, role: 'user'|'admin', test: any) {
  if (!creds.user || !creds.pass) {
    test.skip(`Missing ${role} credentials in ${envPath ?? '.env.local'}`);
  }
}

export function getLandingExpectations(app: 'user'|'admin') {
  const selVar = app === 'user' ? 'E2E_USER_LANDING_SELECTOR' : 'E2E_ADMIN_LANDING_SELECTOR';
  const urlVar = app === 'user' ? 'E2E_USER_LANDING_URL_PATTERN' : 'E2E_ADMIN_LANDING_URL_PATTERN';
  return {
    selector: process.env[selVar],
    urlPattern: process.env[urlVar],
  };
}