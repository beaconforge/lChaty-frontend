import fs from 'fs';
import path from 'path';
import { Page, test, expect, PlaywrightTestInfo } from '@playwright/test';

const BACKEND = 'https://chat-backend.lchaty.com';

export type HarEntry = {
  request: {
    method: string;
    url: string;
    headers: Record<string, string | string[]>;
    postData?: string | null;
  };
  response?: {
    status: number;
    headers: Record<string, string | string[]>;
    body?: string | null;
  };
};

/**
 * Attach network logging to a page and return helpers to inspect and save results.
 * Usage: const net = attachNetworkLogging(page, test.info());
 * After test: await net.saveHar();
 */
export function attachNetworkLogging(page: Page, testInfo: PlaywrightTestInfo) {
  const entries: HarEntry[] = [];
  const setCookieAttrs: Array<{ url: string; attrs: Record<string, any> }> = [];

  page.on('request', async (req) => {
    const url = req.url();
    if (isHmrNoise(url)) return;
    try {
      entries.push({
        request: {
          method: req.method(),
          url,
          headers: req.headers(),
          postData: req.postData() ?? null
        },
        response: undefined
      });
    } catch (e) {
      // ignore
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (isHmrNoise(url)) return;

    try {
      const last = entries.slice(-1)[0];
      const bodyBuf = await res.body().catch(() => Buffer.from('<non-text>'));
      const bodyText = bodyBuf ? bodyBuf.toString() : null;

      // Attach status/headers/body to the last request if it matches URL, otherwise push a standalone entry
      if (last && last.request && last.request.url === url && !last.response) {
        last.response = {
          status: res.status(),
          headers: await res.allHeaders(),
          body: bodyText
        };
      } else {
        entries.push({
          request: { method: 'GET', url, headers: {} },
          response: { status: res.status(), headers: await res.allHeaders(), body: bodyText }
        });
      }

      // Fail hard on 5xx
      if (res.status() >= 500) {
        testInfo.attach('server-5xx', { body: JSON.stringify({ url, status: res.status(), body: bodyText }, null, 2), contentType: 'application/json' });
        expect(res.status(), `Server 5xx at ${url}`).toBeLessThan(500);
      }

  // Record Set-Cookie attributes for auth endpoints (no values)
  // NOTE: In dev the client may use relative URLs proxied by Vite (e.g. /api/auth/login),
  // so match on path rather than requiring the absolute BACKEND host.
  if ((url.includes('/api/auth') || url.endsWith('/api/me'))) {
        const headers = await res.allHeaders();
        const setCookie = headers['set-cookie'];
        if (setCookie) {
          // set-cookie may be single string or array
          const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
          cookies.forEach((sc: string) => {
            const parts = sc.split(';').map((p: string) => p.trim());
            const attrs: Record<string, any> = {};
            parts.forEach((p: string, i: number) => {
              if (i === 0) return; // skip name=value
              const [k, v] = p.split('=');
              attrs[k ? k.toLowerCase() : p.toLowerCase()] = v ?? true;
            });
            setCookieAttrs.push({ url, attrs });
            testInfo.attach('set-cookie-attrs', { body: JSON.stringify({ url, attrs }, null, 2), contentType: 'application/json' });
          });
        }
      }
    } catch (e) {
      // ignore
    }
  });

  function getRequests() {
    return entries.slice();
  }

  function getSetCookieAttrs() {
    return setCookieAttrs.slice();
  }

  async function saveHar(name?: string) {
    try {
      const safeName = name || testInfo.title.replace(/[^a-z0-9._-]/gi, '_');
      const outDir = path.resolve(process.cwd(), 'test-results');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, `${safeName}.har.json`);
      fs.writeFileSync(outPath, JSON.stringify({ log: { entries } }, null, 2), 'utf8');
      await testInfo.attach('har', { path: outPath, contentType: 'application/json' });
      return outPath;
    } catch (e) {
      // ignore write errors
      return undefined;
    }
  }

  return { getRequests, getSetCookieAttrs, saveHar };
}

export async function waitForMe200(page: Page, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      // Use the page's fetch in browser context so cookies (and other browser state)
      // are included with the request. Use relative path to respect dev proxy.
      const resp = await page.evaluate(async () => {
        try {
          const r = await fetch('/api/me', { credentials: 'include' });
          return { ok: r.ok, status: r.status };
        } catch (e) {
          return { ok: false, status: 0 };
        }
      });

      if (resp && resp.ok) return true;
    } catch (e) {
      // ignore and retry
    }

    // Treat non-200/401 as "not authenticated yet" silently
    await page.waitForTimeout(400);
  }

  return false;
}

function isHmrNoise(url: string) {
  return url.includes('@vite') || url.includes('hot') || url.startsWith('ws:') || url.startsWith('wss:');
}
