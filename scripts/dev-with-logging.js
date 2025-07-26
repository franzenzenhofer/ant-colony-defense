#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '..', 'logs');

// Create logs directory
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const serverLogFile = path.join(logDir, `server-${new Date().toISOString().replace(/:/g, '-')}.log`);
const clientLogFile = path.join(logDir, `client-${new Date().toISOString().replace(/:/g, '-')}.log`);
const errorLogFile = path.join(logDir, `errors-${new Date().toISOString().replace(/:/g, '-')}.log`);

const serverLog = fs.createWriteStream(serverLogFile, { flags: 'a' });
const clientLog = fs.createWriteStream(clientLogFile, { flags: 'a' });
const errorLog = fs.createWriteStream(errorLogFile, { flags: 'a' });

console.log('📝 Logging to:');
console.log(`  Server: ${serverLogFile}`);
console.log(`  Client: ${clientLogFile}`);
console.log(`  Errors: ${errorLogFile}`);
console.log('');

// Function to log with timestamp
function logWithTimestamp(stream, message) {
  const timestamp = new Date().toISOString();
  stream.write(`[${timestamp}] ${message}\n`);
}

// Start Vite with full logging
const viteProcess = spawn('vite', ['--debug'], {
  shell: true,
  env: { ...process.env, DEBUG: '*' }
});

// Log server output
viteProcess.stdout.on('data', (data) => {
  const message = data.toString();
  process.stdout.write(message);
  logWithTimestamp(serverLog, message.trim());
});

// Log server errors
viteProcess.stderr.on('data', (data) => {
  const message = data.toString();
  process.stderr.write(message);
  logWithTimestamp(serverLog, message.trim());
  logWithTimestamp(errorLog, `[SERVER] ${message.trim()}`);
});

// Inject client-side error logging
const clientErrorHandler = `
<script>
// Log all client errors to console and send to server
window.addEventListener('error', function(event) {
  const errorInfo = {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error ? event.error.stack : 'No stack trace',
    timestamp: new Date().toISOString()
  };
  
  console.error('CLIENT ERROR:', errorInfo);
  
  // Send to server for logging
  fetch('/__log_client_error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorInfo)
  }).catch(() => {});
});

window.addEventListener('unhandledrejection', function(event) {
  const errorInfo = {
    type: 'unhandledRejection',
    reason: event.reason,
    promise: event.promise,
    timestamp: new Date().toISOString()
  };
  
  console.error('UNHANDLED REJECTION:', errorInfo);
  
  fetch('/__log_client_error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorInfo)
  }).catch(() => {});
});

// Log console errors
const originalError = console.error;
console.error = function(...args) {
  originalError.apply(console, args);
  
  fetch('/__log_client_error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'console.error',
      messages: args.map(arg => String(arg)),
      timestamp: new Date().toISOString()
    })
  }).catch(() => {});
};
</script>
`;

// Create a simple proxy server to inject error handling
import http from 'http';
import httpProxy from 'http-proxy-middleware';

setTimeout(() => {
  const proxy = httpProxy.createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    selfHandleResponse: true,
    onProxyRes(proxyRes, req, res) {
      if (req.url === '/__log_client_error') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const error = JSON.parse(body);
            logWithTimestamp(clientLog, JSON.stringify(error));
            logWithTimestamp(errorLog, `[CLIENT] ${JSON.stringify(error)}`);
          } catch (e) {
            logWithTimestamp(errorLog, `[CLIENT] Failed to parse error: ${body}`);
          }
        });
        res.writeHead(200);
        res.end('ok');
        return;
      }
      
      if (proxyRes.headers['content-type']?.includes('text/html')) {
        let body = '';
        proxyRes.on('data', chunk => body += chunk.toString());
        proxyRes.on('end', () => {
          // Inject error handler into HTML
          body = body.replace('</head>', `${clientErrorHandler}</head>`);
          res.writeHead(proxyRes.statusCode, {
            ...proxyRes.headers,
            'content-length': Buffer.byteLength(body)
          });
          res.end(body);
        });
      } else {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    }
  });
  
  const server = http.createServer((req, res) => {
    proxy(req, res);
  });
  
  server.listen(5174, () => {
    console.log('🚀 Development server with logging at: http://localhost:5174');
    console.log('📊 Tail logs with: tail -f logs/errors-*.log');
  });
}, 2000);

// Handle exit
process.on('SIGINT', () => {
  console.log('\n\n📝 Logs saved to:');
  console.log(`  ${serverLogFile}`);
  console.log(`  ${clientLogFile}`);
  console.log(`  ${errorLogFile}`);
  
  viteProcess.kill();
  process.exit(0);
});

viteProcess.on('error', (error) => {
  logWithTimestamp(errorLog, `Failed to start Vite: ${error.message}`);
  console.error('Failed to start Vite:', error);
  process.exit(1);
});