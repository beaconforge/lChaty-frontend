// Fails if someone tries to run `npm run dev` inline.
// The external launcher (start-vite.ps1) sets EXTERNAL_START=1 so it passes.
const msg = [
  'Inline dev server is FORBIDDEN for this repo.',
  'Start it only via:  ./scripts/start-vite.ps1 -Port 5173 -Https',
].join('\n');
if (process.env.EXTERNAL_START !== '1') {
  console.error(msg);
  process.exit(1);
}
