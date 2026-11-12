'use strict';
// Servidor local que usa EXACTAMENTE el mismo núcleo que la función de Netlify (para probar). Uso: node tools/dev-serverless.cjs
const http = require('http'), fs = require('fs'), path = require('path');
const { makeApp } = require('../lib/core.cjs');
const app = makeApp(require('./memstore.cjs')(), process.env);
const PUB = path.join(__dirname, '..', 'public'), PORT = +process.env.PORT || 3200;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.txt': 'text/plain', '.webp': 'image/webp' };
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'), p = u.pathname;
  if (p.startsWith('/api/') || p.startsWith('/uploads/')) {
    const ch = []; for await (const c of req) ch.push(c);
    const r = await app.handle({ method: req.method, path: p, query: u.searchParams, headers: req.headers, body: Buffer.concat(ch).toString('utf8'), ip: req.socket.remoteAddress });
    res.writeHead(r.status, r.headers); return res.end(r.body);
  }
  let f = p === '/' ? '/index.html' : p === '/admin' ? '/admin.html' : p;
  const file = path.join(PUB, f);
  if (!file.startsWith(PUB) || !fs.existsSync(file)) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log('dev-serverless http://localhost:' + PORT));
