const https = require('https');
const opts = {
  host: '127.0.0.1',
  port: 5173,
  servername: 'local.lchaty.com',
  rejectUnauthorized: false,
  path: '/'
};
const req = https.request(opts, (res) => {
  console.log('status', res.statusCode);
  res.on('data', () => {});
  res.on('end', () => console.log('end'));
});
req.on('error', e => console.error('err', e.message));
req.end();
