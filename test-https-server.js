const https = require('https');
const fs = require('fs');
const path = require('path');

// Read the certificate and key files
const certPath = path.resolve('./certs/local.lchaty.com+1.pem');
const keyPath = path.resolve('./certs/local.lchaty.com+1-key.pem');

// Create HTTPS server options
const serverOptions = {
  cert: fs.readFileSync(certPath),
  key: fs.readFileSync(keyPath)
};

// Create a simple HTTPS server
const server = https.createServer(serverOptions, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>lChaty Frontend - HTTPS Test</title>
    </head>
    <body>
      <h1>✅ HTTPS Working!</h1>
      <p>Server Name: ${req.headers.host}</p>
      <p>URL: ${req.url}</p>
      <p>User Agent: ${req.headers['user-agent']}</p>
      <p>Time: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
});

server.listen(5173, '0.0.0.0', () => {
  console.log('✅ HTTPS server running on:');
  console.log('   https://localhost:5173/');
  console.log('   https://local.lchaty.com:5173/');
  console.log('   https://local.admin.lchaty.com:5173/');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
});