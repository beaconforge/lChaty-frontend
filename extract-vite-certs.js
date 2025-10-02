const fs = require('fs');
const forge = require('node-forge');

try {
  // Read and parse PFX
  const pfxBuffer = fs.readFileSync('./certs/local.lchaty.com.pfx');
  const pfxData = forge.util.createBuffer(pfxBuffer.toString('binary'));
  const pkcs12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(pfxData), false, 'changeit');

  // Extract certificate and private key
  const certBags = pkcs12.getBags({ bagType: forge.pki.oids.certBag });
  const keyBags = pkcs12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

  if (certBags[forge.pki.oids.certBag] && keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]) {
    const cert = certBags[forge.pki.oids.certBag][0].cert;
    const key = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;

    // Convert to PEM format
    const certPem = forge.pki.certificateToPem(cert);
    const keyPem = forge.pki.privateKeyToPem(key);

    // Write to files with proper names
    fs.writeFileSync('./certs/local.lchaty.com-vite.pem', certPem);
    fs.writeFileSync('./certs/local.lchaty.com-vite-key.pem', keyPem);

    console.log('✅ Extracted certificate and key from PFX:');
    console.log('   Certificate: ./certs/local.lchaty.com-vite.pem');
    console.log('   Private Key: ./certs/local.lchaty.com-vite-key.pem');
    
    // Verify certificate details
    console.log('   Subject CN:', cert.subject.getField('CN')?.value);
    const san = cert.getExtension('subjectAltName');
    if (san) {
      console.log('   SANs:', san.altNames.map(n => n.value).join(', '));
    }
  } else {
    console.log('❌ Could not find certificate or key in PFX');
  }
} catch (error) {
  console.error('❌ Error extracting from PFX:', error.message);
}