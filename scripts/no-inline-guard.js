#!/usr/bin/env node
// no-inline-guard.js
// This file intentionally does nothing other than exit successfully.
// Some project scripts call this as a guard; historically it prevented
// running Vite with certain inline flags. Restoring a no-op here
// keeps the dev script working in local environments.
try {
  // noop
  // console.log('no-inline-guard: noop');
  process.exitCode = 0;
} catch (err) {
  // If anything unexpected happens, print and exit non-zero
  console.error('no-inline-guard error', err);
  process.exitCode = 1;
}
