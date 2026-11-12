// Prueba local del Worker de Cloudflare con un "storage" falso de Durable Object. Uso: node tools/dev-cloudflare.mjs
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const tmp = path.join(dir, '.worker-test.mjs');
fs.writeFileSync(tmp, fs.readFileSync(path.join(dir, '..', 'src', 'worker.js'), 'utf8'));
const { KitchenDO } = await import(tmp);
const m = new Map();
const storage = {
  async get(k) { if (Array.isArray(k)) return new Map(k.filter(x => m.has(x)).map(x => [x, structuredClone(m.get(x))])); return m.has(k) ? structuredClone(m.get(k)) : undefined; },
  async put(o) { for (const [k, v] of Object.entries(o)) m.set(k, structuredClone(v)); },
  async delete(k) { for (const x of [].concat(k)) m.delete(x); },
};
const dobj = new KitchenDO({ storage }, { OWNER_PIN: process.env.OWNER_PIN, STAFF_PIN: process.env.STAFF_PIN });
const PUB = path.join(dir, '..', 'public'), PORT = +process.env.PORT || 3300;
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'), p = u.pathname;
  if (p.startsWith('/api/') || p.startsWith('/uploads/')) {
    const ch = []; for await (const c of req) ch.push(c);
    const hdr = { ...req.headers, 'cf-connecting-ip': '1.2.3.4' };
    const r = await dobj.fetch(new Request('http://x' + req.url, { method: req.method, headers: hdr, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(ch) }));
    res.writeHead(r.status, Object.fromEntries(r.headers)); return res.end(Buffer.from(await r.arrayBuffer()));
  }
  const f = p === '/' ? '/index.html' : p === '/admin' ? '/admin.html' : p, file = path.join(PUB, f);
  if (!file.startsWith(PUB) || !fs.existsSync(file)) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript' }[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log('dev-cloudflare http://localhost:' + PORT));
