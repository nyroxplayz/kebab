// Almacén para Vercel: Upstash Redis (REST) — gratis, sin librerías.
// Interfaz que pide lib/core.cjs: get / set(con etag) / putBin / getBin / hasBin
const CAS = `local c=redis.call('GET',KEYS[1])
if ARGV[1]=='' then if c then return 0 end
else
  if not c then return 0 end
  local i=string.find(c,'|',1,true)
  if not i or string.sub(c,1,i-1)~=ARGV[1] then return 0 end
end
redis.call('SET',KEYS[1],ARGV[2])
return 1`;

export function makeUpstashStore(env) {
  const URL_ = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const TOKEN = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!URL_ || !TOKEN) throw new Error('Falta la base de datos: conecta Upstash Redis en Vercel (Storage) — ver README-VERCEL.md');
  async function cmd(args) {
    const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.error) throw new Error('Redis: ' + (d.error || r.status));
    return d.result;
  }
  const ver = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  return {
    async get(key) {
      const v = await cmd(['GET', 'd:' + key]); if (v == null) return null;
      const i = v.indexOf('|'); return { etag: v.slice(0, i), data: JSON.parse(v.slice(i + 1)) };
    },
    async set(key, data, etag) {
      const nv = ver();
      const r = await cmd(['EVAL', CAS, '1', 'd:' + key, etag || '', nv + '|' + JSON.stringify(data)]);
      return r === 1;
    },
    async putBin(name, buf) { await cmd(['SET', 'b:' + name, Buffer.from(buf).toString('base64')]); },
    async getBin(name) { const v = await cmd(['GET', 'b:' + name]); return v ? Buffer.from(v, 'base64') : null; },
    async hasBin(name) { return (await cmd(['EXISTS', 'b:' + name])) === 1; },
  };
}
