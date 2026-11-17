// Prueba local: servidor Redis-REST falso + la función de Vercel completa.
import http from 'node:http';
const db = new Map();
const srv = http.createServer((req, res) => { let b = ''; req.on('data', c => b += c); req.on('end', () => {
  const a = JSON.parse(b); let result = null; const [c, ...r] = a;
  if (c === 'GET') result = db.get(r[0]) ?? null;
  else if (c === 'SET') { db.set(r[0], r[1]); result = 'OK'; }
  else if (c === 'EXISTS') result = db.has(r[0]) ? 1 : 0;
  else if (c === 'EVAL') { const [script, , key, etag, val] = r; const cur = db.get(key);
    if (etag === '') result = cur ? 0 : (db.set(key, val), 1);
    else if (!cur || cur.slice(0, cur.indexOf('|')) !== etag) result = 0; else (db.set(key, val), result = 1); }
  res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ result }));
}); });
await new Promise(r => srv.listen(0, r));
process.env.KV_REST_API_URL = 'http://127.0.0.1:' + srv.address().port; process.env.KV_REST_API_TOKEN = 't';
process.env.OWNER_PIN = 'own999'; process.env.STAFF_PIN = 'stf999';
const { default: fn } = await import('../api/[...path].mjs');
const call = async (m, p, body, h = {}) => { const r = await fn.fetch(new Request('http://x' + p, { method: m, body: body && JSON.stringify(body), headers: { 'content-type': 'application/json', ...h } })); return { s: r.status, t: await r.text() }; };
const pub = await call('GET', '/api/public'); console.log('public', pub.s, JSON.parse(pub.t).cats.length, 'cats');
const lg = await call('POST', '/api/login', { pin: 'own999' }); console.log('login', lg.s);
const tok = JSON.parse(lg.t).token;
const it = JSON.parse(pub.t).cats[0].items[0];
const o = await call('POST', '/api/orders', { name: 'Test', phone: '600123123', mode: 'pickup', pay: JSON.parse(pub.t).settings.payments[0], items: [{ id: it.id, qty: 1, sauce: ['Picante', 'Salsa Blanca'] }] }); console.log('order', o.s, o.t.slice(0, 80));
const ad = await call('GET', '/api/admin/state', null, { authorization: 'Bearer ' + tok }); console.log('admin', ad.s, ad.t.includes('Picante + Salsa Blanca') ? 'ticket ok' : ad.t.slice(0, 120));
srv.close(); process.exit(0);
