'use strict';
// Almacén en memoria/disco con las mismas reglas que Netlify Blobs (etag + escritura condicional). Solo para pruebas locales.
const fs = require('fs'), path = require('path');
module.exports = function memstore(dir) {
  const docs = new Map(), bins = new Map();
  if (dir) fs.mkdirSync(dir, { recursive: true });
  return {
    async get(k) { const d = docs.get(k); return d ? { data: JSON.parse(d.json), etag: d.etag } : null; },
    async set(k, data, etag) {
      const cur = docs.get(k);
      if ((cur ? cur.etag : null) !== (etag || null)) return false;
      docs.set(k, { json: JSON.stringify(data), etag: String(Date.now()) + Math.random().toString(36).slice(2) });
      return true;
    },
    async putBin(n, buf) { bins.set(n, buf); },
    async getBin(n) { return bins.get(n) || null; },
    async hasBin(n) { return bins.has(n); },
  };
};
