// Proventa Local Connection Diagnostic Tool
// Run this script: node scratch/diagnose.js

const dns = require('dns');
const net = require('net');

console.log('🔍 Running Proventa Local Domain Diagnostics...\n');

// 1. Check DNS resolution for www.proventa.in
dns.lookup('www.proventa.in', (err, address) => {
  console.log('--- Step 1: DNS Domain Resolution ---');
  if (err) {
    console.error('❌ Failed to resolve www.proventa.in.');
    console.error('👉 Rationale: Your hosts file is missing the mapping.');
    console.error('👉 Fix: Add "127.0.0.1 www.proventa.in" to C:\\Windows\\System32\\drivers\\etc\\hosts\n');
  } else if (address !== '127.0.0.1') {
    console.warn(`⚠️ www.proventa.in resolves to ${address} instead of 127.0.0.1.`);
    console.warn('👉 Fix: Update C:\\Windows\\System32\\drivers\\etc\\hosts to map www.proventa.in to 127.0.0.1\n');
  } else {
    console.log('✅ www.proventa.in successfully resolves to localhost (127.0.0.1)\n');
  }

  // 2. Check Port 80 availability
  console.log('--- Step 2: Port 80 Availability Check ---');
  const server = net.createServer();

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error('❌ Port 80 is already occupied by another program.');
      console.error('👉 Rationale: IIS, Skype, Apache, or Docker is using port 80.');
      console.error('👉 Fix: Stop that service or run on a custom port like: npx next dev -H www.proventa.in -p 8080\n');
    } else if (err.code === 'EACCES') {
      console.error('❌ Permission Denied when trying to bind to port 80.');
      console.error('👉 Rationale: Windows blocks non-administrator accounts from binding to ports below 1024.');
      console.error('👉 Fix: Open PowerShell/CMD "As Administrator" and run the server again.\n');
    } else {
      console.error(`❌ Unexpected Port Error: ${err.message}\n`);
    }
    checkRunningDevServer();
  });

  server.once('listening', () => {
    console.log('✅ Port 80 is free and available to bind.');
    server.close();
    checkRunningDevServer();
  });

  try {
    server.listen(80, '127.0.0.1');
  } catch (listenErr) {
    console.error(`❌ Binding exception: ${listenErr.message}\n`);
    checkRunningDevServer();
  }
});

function checkRunningDevServer() {
  console.log('--- Step 3: Checking for Active Local Servers ---');
  const client = new net.Socket();
  
  // Try port 80
  client.connect(80, 'www.proventa.in', () => {
    console.log('✅ Found a running web server responding on www.proventa.in (port 80).');
    client.destroy();
  });

  client.on('error', () => {
    // Try port 3001
    const clientAlt = new net.Socket();
    clientAlt.connect(3001, 'www.proventa.in', () => {
      console.log('💡 Found a running Next.js server on port 3001.');
      console.log('👉 Rationale: The server is running on port 3001 instead of 80.');
      console.log('👉 Fix: Visit http://www.proventa.in:3001 in your browser.\n');
      clientAlt.destroy();
    });

    clientAlt.on('error', () => {
      console.log('❌ No local servers are running on port 80 or 3001.');
      console.log('👉 Fix: Open an Administrator terminal and run "npm run dev"\n');
    });
  });
}
