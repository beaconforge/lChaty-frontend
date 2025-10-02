const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Creating certificates using Node.js crypto...');

const forge = require('node-forge');

// Generate a key pair
console.log('Generating key pair...');
const keys = forge.pki.rsa.generateKeyPair(2048);

// Create a certificate
console.log('Creating certificate...');
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

// Set subject and issuer
const attrs = [{
  name: 'commonName',
  value: 'local.lchaty.com'
}, {
  name: 'organizationName',
  value: 'lChaty Dev'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Add extensions including Subject Alternative Names
cert.setExtensions([{
  name: 'basicConstraints',
  cA: true
}, {
  name: 'keyUsage',
  keyCertSign: true,
  digitalSignature: true,
  nonRepudiation: true,
  keyEncipherment: true,
  dataEncipherment: true
}, {
  name: 'extKeyUsage',
  serverAuth: true,
  clientAuth: true,
  codeSigning: true,
  emailProtection: true,
  timeStamping: true
}, {
  name: 'subjectAltName',
  altNames: [{
    type: 2, // DNS
    value: 'local.lchaty.com'
  }, {
    type: 2, // DNS
    value: 'local.admin.lchaty.com'
  }, {
    type: 7, // IP
    ip: '127.0.0.1'
  }]
}]);

// Sign the certificate
console.log('Signing certificate...');
cert.sign(keys.privateKey, forge.md.sha256.create());

// Convert to PEM format
const certPem = forge.pki.certificateToPem(cert);
const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

// Ensure certs directory exists
const certsDir = './certs';
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

// Write certificate files
console.log('Writing certificate files...');
fs.writeFileSync(path.join(certsDir, 'local.lchaty.com+1.pem'), certPem);
fs.writeFileSync(path.join(certsDir, 'local.lchaty.com+1-key.pem'), keyPem);

console.log('✅ Certificates created successfully!');
console.log('   Certificate: ./certs/local.lchaty.com+1.pem');
console.log('   Private key: ./certs/local.lchaty.com+1-key.pem');

// Test the certificate
console.log('\nTesting certificate validity...');
try {
  const testCert = forge.pki.certificateFromPem(certPem);
  console.log('✅ Certificate is valid');
  console.log('   Subject:', testCert.subject.getField('CN').value);
  
  const san = testCert.getExtension('subjectAltName');
  if (san) {
    console.log('   SAN domains:', san.altNames.filter(n => n.type === 2).map(n => n.value));
  }
} catch (e) {
  console.log('❌ Certificate validation error:', e.message);
}