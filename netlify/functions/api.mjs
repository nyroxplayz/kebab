// King Kebab · función de Netlify (API completa). Los datos se guardan en Netlify Blobs.
import { getStore } from '@netlify/blobs';
import core from '../../lib/core.cjs';

let app;
function getApp() {
  if (app) return app;
  const kv = () => getStore({ name: 'kingkebab', consistency: 'strong' });
  const store = {
    async get(key) {
      const r = await kv().getWithMetadata(key, { type: 'json' });
      return r ? { data: r.data, etag: r.etag } : null;
    },
    async set(key, data, etag) {
      const opts = etag ? { onlyIfMatch: etag } : { onlyIfNew: true };
      const r = await kv().setJSON(key, data, opts);
      return !(r && r.modified === false);
    },
    async putBin(name, buf) { await kv().set('img/' + name, buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)); },
    async getBin(name) {
      const d = await kv().get('img/' + name, { type: 'arrayBuffer' });
      return d ? Buffer.from(d) : null;
    },
    async hasBin(name) { return (await kv().getMetadata('img/' + name)) !== null; },
  };
  app = core.makeApp(store, process.env);
  return app;
}

export default async (req) => {
  const url = new URL(req.url);
  const headers = {}; req.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
  const body = ['GET', 'HEAD'].includes(req.method) ? '' : await req.text();
  const ip = headers['x-nf-client-connection-ip'] || (headers['x-forwarded-for'] || '').split(',')[0].trim() || '?';
  try {
    const r = await getApp().handle({ method: req.method, path: url.pathname, query: url.searchParams, headers, body, ip });
    return new Response(r.body, { status: r.status, headers: r.headers });
  } catch (e) {
    console.error('KK error', e && e.stack || e);
    return new Response(JSON.stringify({ error: 'Error del servidor: ' + String((e && e.message) || e) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};

export const config = { path: ['/api/*', '/uploads/*'] };
