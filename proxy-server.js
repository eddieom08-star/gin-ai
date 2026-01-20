// Simple CORS proxy server for local development
// Run: node proxy-server.js
// Then open: http://localhost:3001

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const ELEVENLABS_BASE = 'api.elevenlabs.io';

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, xi-api-key');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Serve static files
    if (!req.url.startsWith('/api/')) {
        let filePath = req.url === '/' ? '/stayeasy-dashboard.html' : req.url;
        filePath = filePath.split('?')[0]; // Remove query string
        const fullPath = path.join(__dirname, filePath);
        const ext = path.extname(fullPath);
        const contentTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' };

        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
                return;
            }
            res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
            res.end(data);
        });
        return;
    }

    // Parse URL for API routing
    const urlParts = req.url.split('?');
    const pathname = urlParts[0];
    const queryString = urlParts[1] || '';

    // Route: /api/conversations -> /v1/convai/conversations
    // Route: /api/conversations/[id] -> /v1/convai/conversations/[id]
    let targetPath = pathname.replace('/api/', '/v1/convai/');
    if (queryString) targetPath += '?' + queryString;

    const options = {
        hostname: ELEVENLABS_BASE,
        port: 443,
        path: targetPath,
        method: req.method,
        headers: {
            'xi-api-key': req.headers['xi-api-key'] || '',
            'Content-Type': 'application/json'
        }
    };

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    });

    req.pipe(proxyReq);
});

server.listen(PORT, () => {
    console.log(`\n  Local dev server running at http://localhost:${PORT}`);
    console.log(`  Dashboard: http://localhost:${PORT}/stayeasy-dashboard.html\n`);
});
