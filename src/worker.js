// King Kebab · Cloudflare Worker (API) + Durable Object (datos). La web (public/) la sirve Cloudflare directamente.
import core from '../lib/core.cjs';

const CHUNK = 100 * 1024;           // los valores de Durable Objects tienen límite por clave: se guardan en trozos
const enc = new TextEncoder(), dec = new TextDecoder();

function makeStore(storage) {
  async function putBig(key, u8, rev) {
    const n = Math.max(1, Math.ceil(u8.length / CHUNK));
    const old = await storage.get(key + ':meta');
    const entries = {};
    for (let i = 0; i < n; i++) entries[`${key}:${i}`] = u8.slice(i * CHUNK, (i + 1) * CHUNK);
    entries[key + ':meta'] = { n, rev };
    await storage.put(entries);
    if (old && old.n > n) await storage.delete(Array.from({ length: old.n - n }, (_, i) => `${key}:${n + i}`));
  }
  async function getBig(key) {
    const meta = await storage.get(key + ':meta');
    if (!meta) return null;
    const parts = await storage.get(Array.from({ length: meta.n }, (_, i) => `${key}:${i}`));
    const out = new Uint8Array(Array.from(parts.values()).reduce((a, p) => a + p.length, 0));
    let o = 0; for (let i = 0; i < meta.n; i++) { const p = parts.get(`${key}:${i}`); out.set(p, o); o += p.length; }
    return { u8: out, rev: meta.rev };
  }
  return {
    async get(key) {
      const r = await getBig('doc/' + key); if (!r) return null;
      return { data: JSON.parse(dec.decode(r.u8)), etag: String(r.rev) };
    },
    async set(key, data, etag) {
      const meta = await storage.get('doc/' + key + ':meta');
      if ((meta ? String(meta.rev) : null) !== (etag || null)) return false;
      await putBig('doc/' + key, enc.encode(JSON.stringify(data)), (meta ? meta.rev : 0) + 1);
      return true;
    },
    async putBin(name, u8) { await putBig('img/' + name, u8, 1); },
    async getBin(name) { const r = await getBig('img/' + name); return r ? r.u8 : null; },
    async hasBin(name) { return !!(await storage.get('img/' + name + ':meta')); },
  };
}

export class KitchenDO {
  constructor(state, env) { this.app = core.makeApp(makeStore(state.storage), env); }
  async fetch(request) {
    const url = new URL(request.url);
    const headers = {}; request.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
    const body = ['GET', 'HEAD'].includes(request.method) ? '' : await request.text();
    const ip = headers['cf-connecting-ip'] || '?';
    const r = await this.app.handle({ method: request.method, path: url.pathname, query: url.searchParams, headers, body, ip });
    return new Response(r.body, { status: r.status, headers: r.headers });
  }
}

export default {
  async fetch(request, env) {
    // Solo llegan aquí /api/* y /uploads/* (ver wrangler.toml: run_worker_first). El resto lo sirve Cloudflare como archivos estáticos.
    return env.KK.get(env.KK.idFromName('main')).fetch(request);
  },
};
