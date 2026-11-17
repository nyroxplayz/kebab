// King Kebab · función de Vercel (API completa). Datos en Upstash Redis.
import core from '../lib/core.cjs';
import { makeUpstashStore } from '../lib/upstash-store.mjs';

let app;
function getApp() {
  if (!app) app = core.makeApp(makeUpstashStore(process.env), process.env);
  return app;
}

export default {
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    if (path.startsWith('/api/_up/')) path = '/uploads/' + path.slice('/api/_up/'.length);
    const headers = {}; req.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
    const body = ['GET', 'HEAD'].includes(req.method) ? '' : await req.text();
    const ip = (headers['x-forwarded-for'] || '').split(',')[0].trim() || headers['x-real-ip'] || '?';
    try {
      const r = await getApp().handle({ method: req.method, path, query: url.searchParams, headers, body, ip });
      return new Response(r.body, { status: r.status, headers: r.headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
  },
};
