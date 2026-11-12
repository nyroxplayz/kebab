'use strict';
/**
 * King Kebab · núcleo sin servidor (Netlify Functions + Blobs).
 * Misma lógica que server.js, pero el almacenamiento se inyecta (store).
 * store: { get(key)->{data,etag}|null, set(key,data,etag)->bool, putBin(name,Uint8Array), getBin(name)->Uint8Array|null, hasBin(name)->bool }
 */
const subtle = globalThis.crypto.subtle, enc = new TextEncoder(), dec = new TextDecoder();
const hex = u8 => Array.from(u8, x => x.toString(16).padStart(2, '0')).join('');
const unhex = h => Uint8Array.from((h.match(/../g) || []).map(x => parseInt(x, 16)));
const b64u = u8 => btoa(String.fromCharCode(...u8)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = t => Uint8Array.from(atob(t.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const ctEq = (a, b) => { a = String(a); b = String(b); let d = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return d === 0; };
const { buildSeed, slugify } = require('../seed');

/* ---------------- utilidades ---------------- */
const httpErr = (status, message) => Object.assign(new Error(message), { status });
const str = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const money = v => { const n = Number(String(v).replace(',', '.')); if (!Number.isFinite(n) || n < 0 || n > 999) throw httpErr(400, 'Precio no válido'); return Math.round(n * 100) / 100; };
const cents = n => Math.round(n * 100);
const rid = n => hex(globalThis.crypto.getRandomValues(new Uint8Array(n)));

const KDF_ITER = 10000;
async function kdf(pin, salt) {
  const k = await subtle.importKey('raw', enc.encode(String(pin)), 'PBKDF2', false, ['deriveBits']);
  return hex(new Uint8Array(await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: KDF_ITER }, k, 256)));
}
async function hashPin(pin, salt = rid(8)) { return 'p1:' + salt + ':' + await kdf(pin, salt); }
async function checkPin(pin, h) {
  if (!h) return false;
  const [v, salt, good] = h.split(':');
  return v === 'p1' && ctEq(await kdf(pin, salt), good);
}


function makeApp(store, ENV = {}) {
let db, ORD, mainEtag, ordEtag, dirtyMain, dirtyOrd;
const dirty = () => { dirtyMain = true; }, dirtyO = () => { dirtyOrd = true; };
/* ---------------- auth ---------------- */
async function hmac(body) {
  const k = await subtle.importKey('raw', enc.encode(db.auth.secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(new Uint8Array(await subtle.sign('HMAC', k, enc.encode(body))));
}
async function sign(payload) {
  const body = b64u(enc.encode(JSON.stringify(payload)));
  return body + '.' + await hmac(body);
}
async function verify(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!ctEq(sig, await hmac(body))) return null;
  try {
    const p = JSON.parse(dec.decode(unb64u(body)));
    if (p.exp < Date.now() || p.tv !== db.auth.tv) return null;
    return p;
  } catch (e) { return null; }
}
async function need(req, ...roles) {
  const h = req.headers.authorization || '';
  const p = await verify(h.startsWith('Bearer ') ? h.slice(7) : '');
  if (!p || (roles.length && !roles.includes(p.role))) throw httpErr(p ? 403 : 401, p ? 'No tienes permiso' : 'Sesión caducada');
  return p;
}

const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now(), arr = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (arr.length >= max) { hits.set(key, arr); return true; }
  arr.push(now); hits.set(key, arr); return false;
}
const ipOf = req => req.ip || '?';

/* ---------------- carta / pedidos ---------------- */
function findItem(id) {
  for (const c of db.cats) for (const it of c.items) if (it.id === id) return it;
  return null;
}
function publicSettings() {
  const s = db.settings;
  return { name: s.name, phone: s.phone, address: s.address, tz: s.tz, accepting: s.accepting, banner: s.banner || '', extraPrice: s.extraPrice,
    meats: s.meats, sauces: s.sauces, drinks: s.drinks, payments: s.payments, hours: s.hours };
}
function reviewStats() {
  const ok = db.reviews.filter(r => r.status === 'approved');
  const avg = ok.length ? ok.reduce((a, r) => a + r.rating, 0) / ok.length : 0;
  return { count: ok.length, avg: Math.round(avg * 10) / 10 };
}
const hourRe = /^\d{1,2}:\d{2}-\d{1,2}:\d{2}(,\s*\d{1,2}:\d{2}-\d{1,2}:\d{2})*$/;

function buildOrder(body, ip) {
  if (!db.settings.accepting) throw httpErr(409, 'Ahora mismo no estamos aceptando pedidos online. Llámanos al ' + db.settings.phone);
  const name = str(body.name, 40), phone = str(body.phone, 20);
  if (name.length < 2) throw httpErr(400, 'Escribe tu nombre');
  if (phone.replace(/\D/g, '').length < 9) throw httpErr(400, 'Teléfono no válido');
  const mode = body.mode === 'pickup' ? 'pickup' : 'delivery';
  let zone = null, addr = '';
  if (mode === 'delivery') {
    zone = db.zones.find(z => z.id === body.zone && z.active);
    if (!zone) throw httpErr(400, 'Elige una zona de reparto');
    addr = str(body.addr, 120);
    if (addr.length < 4) throw httpErr(400, 'Escribe tu dirección');
  }
  const pay = db.settings.payments.includes(body.pay) ? body.pay : db.settings.payments[0];
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 40) throw httpErr(400, 'El pedido está vacío');
  const S = db.settings, lines = [];
  let subC = 0, qtyAll = 0;
  for (const l of body.items) {
    const it = findItem(l.id);
    if (!it) throw httpErr(400, 'Un producto ya no existe. Recarga la página.');
    if (!it.available) throw httpErr(409, `“${it.name}” está agotado ahora mismo`);
    const qty = Math.floor(Number(l.qty));
    if (!(qty >= 1 && qty <= 20)) throw httpErr(400, 'Cantidad no válida');
    qtyAll += qty;
    let base, opts = [];
    if (it.sizes && it.sizes.length) {
      const sz = it.sizes[Number.isInteger(l.size) ? l.size : 0];
      if (!sz) throw httpErr(400, 'Tamaño no válido');
      base = sz.price; opts.push(sz.label);
    } else base = it.price;
    const pickOpt = (flag, list, key) => {
      if (!it.opts[flag]) return;
      const v = list.includes(l[key]) ? l[key] : list[0];
      if (v) opts.push(v);
    };
    pickOpt('meat', S.meats, 'meat'); pickOpt('sauce', S.sauces, 'sauce'); pickOpt('drink', S.drinks, 'drink');
    let unitC = cents(base);
    if (it.opts.extra && l.extra) { unitC += cents(S.extraPrice); opts.push('Extra +' + S.extraPrice.toFixed(2).replace('.', ',') + '€'); }
    const note = str(l.notes, 100);
    if (note) opts.push('“' + note + '”');
    lines.push({ id: it.id, n: it.name, o: opts.join(', '), q: qty, u: unitC / 100, p: unitC * qty / 100 });
    subC += unitC * qty;
  }
  if (qtyAll > 80) throw httpErr(400, 'Pedido demasiado grande, llámanos por teléfono');
  if (zone && subC < cents(zone.min)) throw httpErr(400, `Pedido mínimo para ${zone.name}: ${zone.min.toFixed(2).replace('.', ',')}€`);
  const feeC = zone ? cents(zone.fee) : 0;
  ORD.counter++;
  const order = {
    id: 'KK-' + String(ORD.counter).padStart(4, '0'), code: rid(4), ts: Date.now(), name, phone, mode,
    zone: zone ? zone.name : '', addr, items: lines, sub: subC / 100, fee: feeC / 100, total: (subC + feeC) / 100,
    pay, notes: str(body.notes, 200), status: 'pending', hist: [{ s: 'pending', t: Date.now(), by: 'cliente' }], ip,
  };
  return order;
}

function cleanMenu(input, hasImg) {
  if (!Array.isArray(input) || input.length > 40) throw httpErr(400, 'Carta no válida');
  const usedC = new Set(), usedI = new Set();
  return input.map(c => {
    const name = str(c.name, 40) || 'Categoría';
    let cid = slugify(c.id || name), base = cid, k = 2; while (usedC.has(cid)) cid = base + '-' + k++; usedC.add(cid);
    const items = (Array.isArray(c.items) ? c.items : []).slice(0, 300).map(it => {
      const nm = str(it.name, 60); if (!nm) return null;
      let iid = (typeof it.id === 'string' && /^[a-z0-9-]{1,60}$/.test(it.id)) ? it.id : slugify(nm) + '-' + rid(2);
      while (usedI.has(iid)) iid += '-' + rid(1); usedI.add(iid);
      const o = {
        id: iid, name: nm, desc: str(it.desc, 160), available: it.available !== false,
        opts: { meat: !!(it.opts && it.opts.meat), extra: !!(it.opts && it.opts.extra), sauce: !!(it.opts && it.opts.sauce), drink: !!(it.opts && it.opts.drink) },
        img: (typeof it.img === 'string' && (/^\/img\/[a-z0-9-]{1,40}\.webp$/.test(it.img) || (/^\/uploads\/[a-f0-9]{16}\.(jpg|png|webp)$/.test(it.img) && hasImg(it.img)))) ? it.img : null,
      };
      if (Array.isArray(it.sizes) && it.sizes.length) o.sizes = it.sizes.slice(0, 8).map(s => ({ label: str(s.label, 20) || 'Tamaño', price: money(s.price) }));
      else o.price = money(it.price);
      return o;
    }).filter(Boolean);
    return { id: cid, name, items };
  });
}

function cleanHours(h) {
  const out = {};
  for (let d = 0; d < 7; d++) {
    const v = str(h && h[d], 60);
    if (v && !hourRe.test(v)) throw httpErr(400, 'Horario no válido. Formato: 13:00-16:00, 18:30-24:00');
    out[d] = v;
  }
  return out;
}
const list = (v, max, minLen = 1) => {
  const arr = (Array.isArray(v) ? v : String(v || '').split(',')).map(x => str(x, 30)).filter(Boolean).slice(0, max);
  if (arr.length < minLen) throw httpErr(400, 'La lista no puede estar vacía');
  return arr;
};

function dayKey(ts, tz) { return new Intl.DateTimeFormat('sv-SE', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ts); }
function stats() {
  const tz = db.settings.tz, today = dayKey(Date.now(), tz);
  const live = ORD.list.filter(o => o.status !== 'cancelled');
  const byDay = {};
  for (let i = 6; i >= 0; i--) byDay[dayKey(Date.now() - i * 86400e3, tz)] = { orders: 0, total: 0 };
  const top = {};
  let todayO = 0, todayT = 0, allT = 0;
  for (const o of live) {
    const k = dayKey(o.ts, tz);
    if (byDay[k]) { byDay[k].orders++; byDay[k].total += o.total; }
    if (k === today) { todayO++; todayT += o.total; }
    allT += o.total;
    for (const l of o.items) top[l.n] = (top[l.n] || 0) + l.q;
  }
  return {
    today: { orders: todayO, total: Math.round(todayT * 100) / 100 }, all: { orders: live.length, total: Math.round(allT * 100) / 100 },
    avgTicket: live.length ? Math.round(allT / live.length * 100) / 100 : 0,
    days: Object.entries(byDay).map(([d, v]) => ({ d, orders: v.orders, total: Math.round(v.total * 100) / 100 })),
    top: Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, q]) => ({ n, q })),
  };
}


async function saveImage(dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw httpErr(400, 'Imagen no válida');
  const buf = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
  if (buf.length > 2.5 * 1024 * 1024 || buf.length < 100) throw httpErr(400, 'La imagen es demasiado grande (máx. 2,5 MB)');
  const isJpg = buf[0] === 0xff && buf[1] === 0xd8, isPng = buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47,
    isWebp = String.fromCharCode(...buf.slice(0, 4)) === 'RIFF' && String.fromCharCode(...buf.slice(8, 12)) === 'WEBP';
  if (!(isJpg || isPng || isWebp)) throw httpErr(400, 'Formato de imagen no válido');
  const ext = isJpg ? 'jpg' : isPng ? 'png' : 'webp', name = rid(8) + '.' + ext;
  await store.putBin(name, buf);
  return '/uploads/' + name;
}

const json = (res, code, obj) => { res.status = code; res.headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }; res.body = JSON.stringify(obj); };
function readBody(req, limit = 200000) {
  const b = req.body || '';
  if (b.length > limit) throw httpErr(413, 'Petición demasiado grande');
  try { return b ? JSON.parse(b) : {}; } catch (e) { throw httpErr(400, 'JSON no válido'); }
}
const ST = ['pending', 'cooking', 'ready', 'done', 'cancelled'];
async function api(req, res, u, p) {
  const m = req.method, ip = ipOf(req);
  let r;

  /* ----- público ----- */
  if (m === 'GET' && p === '/api/public') {
    return json(res, 200, { settings: publicSettings(), zones: db.zones.filter(z => z.active).map(({ id, name, fee, min }) => ({ id, name, fee, min })), cats: db.cats, reviews: reviewStats() });
  }
  if (m === 'GET' && p === '/api/reviews') {
    const rs = db.reviews.filter(x => x.status === 'approved').sort((a, b) => b.ts - a.ts).slice(0, 40)
      .map(({ id, ts, name, rating, text, verified, reply }) => ({ id, ts, name, rating, text, verified, reply: reply || '' }));
    return json(res, 200, { ...reviewStats(), list: rs });
  }
  if (m === 'POST' && p === '/api/orders') {
    if (limited('ord:' + ip, 8, 10 * 60e3)) throw httpErr(429, 'Demasiados pedidos seguidos. Llámanos por teléfono.');
    const order = buildOrder(await readBody(req), ip);
    ORD.list.unshift(order); if (ORD.list.length > 3000) ORD.list.length = 3000; dirtyO();
    return json(res, 201, { ok: true, id: order.id, code: order.code });
  }
  if (m === 'GET' && p === '/api/track') {
    if (limited('trk:' + ip, 120, 10 * 60e3)) throw httpErr(429, 'Demasiadas consultas');
    const o = ORD.list.find(x => x.id === u.searchParams.get('id'));
    const code = u.searchParams.get('code') || '';
    if (!o || o.code.length !== code.length || !ctEq(o.code, code)) throw httpErr(404, 'Pedido no encontrado');
    return json(res, 200, { id: o.id, status: o.status, mode: o.mode, total: o.total, ts: o.ts, reviewed: db.reviews.some(x => x.orderId === o.id) });
  }
  if (m === 'POST' && p === '/api/reviews') {
    if (limited('rev:' + ip, 4, 3600e3)) throw httpErr(429, 'Ya has enviado varias opiniones. ¡Gracias!');
    const b = await readBody(req);
    const name = str(b.name, 30), text = str(b.text, 400), rating = Math.floor(Number(b.rating));
    if (name.length < 2) throw httpErr(400, 'Escribe tu nombre');
    if (!(rating >= 1 && rating <= 5)) throw httpErr(400, 'Elige de 1 a 5 estrellas');
    if (text.length < 3) throw httpErr(400, 'Escribe un comentario');
    let verified = false, orderId = null;
    if (b.orderId) {
      const o = ORD.list.find(x => x.id === b.orderId);
      if (o && typeof b.code === 'string' && o.code === b.code && o.status !== 'cancelled') {
        if (db.reviews.some(x => x.orderId === o.id)) throw httpErr(409, 'Ya opinaste sobre este pedido');
        verified = true; orderId = o.id;
      }
    }
    const rev = { id: 'R' + rid(4), ts: Date.now(), name, rating, text, verified, orderId, reply: '', status: db.settings.autoApproveReviews ? 'approved' : 'pending' };
    db.reviews.unshift(rev); dirty();
    return json(res, 201, { ok: true, published: rev.status === 'approved' });
  }

  /* ----- login ----- */
  if (m === 'POST' && p === '/api/login') {
    if (limited('log:' + ip, 8, 10 * 60e3)) throw httpErr(429, 'Demasiados intentos. Espera unos minutos.');
    const pin = String((await readBody(req, 2000)).pin || '');
    let role = null;
    if (await checkPin(pin, db.auth.ownerHash)) role = 'owner'; else if (await checkPin(pin, db.auth.staffHash)) role = 'staff';
    if (!role) throw httpErr(401, 'PIN incorrecto');
    return json(res, 200, { token: await sign({ role, tv: db.auth.tv, exp: Date.now() + 14 * 86400e3 }), role });
  }

  /* ----- panel ----- */
  if (p.startsWith('/api/admin/')) {
    const me = await need(req);
    const owner = me.role === 'owner';
    const onlyOwner = () => { if (!owner) throw httpErr(403, 'Solo el dueño puede hacer esto'); };

    if (m === 'POST' && p === '/api/admin/ticket') {
      return json(res, 200, { t: 'polling' });
    }
    if (m === 'GET' && p === '/api/admin/state') {
      const out = { role: me.role, now: Date.now(), orders: ORD.list.slice(0, 600).map(({ ip: _ip, ...o }) => o), cats: db.cats, zones: db.zones, settings: owner ? db.settings : publicSettings() };
      if (owner) { out.reviews = db.reviews; out.defaults = { owner: !!db.auth.ownerDefault, staff: !!db.auth.staffDefault }; }
      else { out.settings = { ...publicSettings() }; }
      return json(res, 200, out);
    }
    if (m === 'POST' && p === '/api/admin/accepting') {
      db.settings.accepting = !!(await readBody(req, 500)).accepting; dirty();
      return json(res, 200, { accepting: db.settings.accepting });
    }
    if (m === 'PATCH' && (r = /^\/api\/admin\/orders\/(KK-\d+)$/.exec(p))) {
      const o = ORD.list.find(x => x.id === r[1]); if (!o) throw httpErr(404, 'Pedido no encontrado');
      const s = (await readBody(req, 500)).status;
      if (!ST.includes(s)) throw httpErr(400, 'Estado no válido');
      if (o.status !== s) { o.status = s; o.hist.push({ s, t: Date.now(), by: me.role }); dirtyO(); }
      return json(res, 200, { ok: true });
    }
    if (m === 'DELETE' && (r = /^\/api\/admin\/orders\/(KK-\d+)$/.exec(p))) {
      ORD.list = ORD.list.filter(x => x.id !== r[1]); dirtyO();
      return json(res, 200, { ok: true });
    }
    if (m === 'PATCH' && p === '/api/admin/availability') {
      const b = await readBody(req, 500), it = findItem(b.id); if (!it) throw httpErr(404, 'Producto no encontrado');
      it.available = !!b.available; dirty(); return json(res, 200, { ok: true });
    }
    if (m === 'PUT' && p === '/api/admin/menu') {
      onlyOwner(); const mb = (await readBody(req, 1.5e6)).cats, okImg = new Set();
      for (const c of (Array.isArray(mb) ? mb : [])) for (const it of ((c && c.items) || [])) if (it && typeof it.img === 'string' && !okImg.has(it.img) && it.img.startsWith('/uploads/') && await store.hasBin(it.img.replace('/uploads/', ''))) okImg.add(it.img);
      db.cats = cleanMenu(mb, im => okImg.has(im)); dirty();
      return json(res, 200, { ok: true, cats: db.cats });
    }
    if (m === 'PUT' && p === '/api/admin/zones') {
      onlyOwner();
      const arr = (await readBody(req, 50000)).zones; if (!Array.isArray(arr) || arr.length > 30) throw httpErr(400, 'Zonas no válidas');
      const used = new Set();
      db.zones = arr.map(z => {
        const name = str(z.name, 30); if (!name) return null;
        let id = slugify(z.id || name), b = id, k = 2; while (used.has(id)) id = b + '-' + k++; used.add(id);
        return { id, name, fee: money(z.fee), min: money(z.min), active: z.active !== false };
      }).filter(Boolean);
      dirty(); return json(res, 200, { ok: true, zones: db.zones });
    }
    if (m === 'PUT' && p === '/api/admin/settings') {
      onlyOwner();
      const b = await readBody(req, 50000), s = db.settings;
      s.name = str(b.name, 50) || s.name; s.phone = str(b.phone, 25) || s.phone; s.address = str(b.address, 100) || s.address;
      s.banner = str(b.banner, 140); s.extraPrice = money(b.extraPrice);
      s.meats = list(b.meats, 8); s.sauces = list(b.sauces, 10); s.drinks = list(b.drinks, 16); s.payments = list(b.payments, 5);
      s.hours = cleanHours(b.hours); s.autoApproveReviews = !!b.autoApproveReviews;
      dirty(); return json(res, 200, { ok: true, settings: s });
    }
    if (m === 'POST' && p === '/api/admin/reset-menu') {
      onlyOwner();
      const fresh = buildSeed(); db.cats = fresh.cats; db.zones = fresh.zones;
      dirty();
      return json(res, 200, { ok: true, cats: db.cats, zones: db.zones });
    }
    if (m === 'POST' && p === '/api/admin/pins') {
      onlyOwner();
      const b = await readBody(req, 1000), pin = String(b.pin || '');
      if (pin.length < 4 || pin.length > 30) throw httpErr(400, 'El PIN debe tener entre 4 y 30 caracteres');
      if (b.role === 'owner') { db.auth.ownerHash = await hashPin(pin); db.auth.ownerDefault = false; }
      else if (b.role === 'staff') { db.auth.staffHash = await hashPin(pin); db.auth.staffDefault = false; }
      else throw httpErr(400, 'Rol no válido');
      db.auth.tv++;   // cierra todas las sesiones
      dirty();
      return json(res, 200, { ok: true, token: await sign({ role: 'owner', tv: db.auth.tv, exp: Date.now() + 14 * 86400e3 }) });
    }
    if (m === 'PATCH' && (r = /^\/api\/admin\/reviews\/(R[a-f0-9]+)$/.exec(p))) {
      onlyOwner();
      const rv = db.reviews.find(x => x.id === r[1]); if (!rv) throw httpErr(404, 'Opinión no encontrada');
      const b = await readBody(req, 3000);
      if (b.status !== undefined) { if (!['approved', 'pending', 'hidden'].includes(b.status)) throw httpErr(400, 'Estado no válido'); rv.status = b.status; }
      if (b.reply !== undefined) rv.reply = str(b.reply, 300);
      dirty(); return json(res, 200, { ok: true });
    }
    if (m === 'DELETE' && (r = /^\/api\/admin\/reviews\/(R[a-f0-9]+)$/.exec(p))) {
      onlyOwner(); db.reviews = db.reviews.filter(x => x.id !== r[1]); dirty(); return json(res, 200, { ok: true });
    }
    if (m === 'POST' && p === '/api/admin/upload') {
      onlyOwner(); return json(res, 200, { url: await saveImage((await readBody(req, 4e6)).dataUrl) });
    }
    if (m === 'GET' && p === '/api/admin/stats') { onlyOwner(); return json(res, 200, stats()); }
    if (m === 'GET' && p === '/api/admin/export.csv') {
      onlyOwner();
      const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
      const rows = [['Pedido', 'Fecha', 'Cliente', 'Teléfono', 'Tipo', 'Zona', 'Dirección', 'Productos', 'Subtotal', 'Envío', 'Total', 'Pago', 'Estado', 'Notas'].map(q).join(',')];
      for (const o of ORD.list) rows.push([o.id, new Date(o.ts).toLocaleString('es-ES', { timeZone: db.settings.tz }), o.name, o.phone, o.mode === 'pickup' ? 'Recogida' : 'Domicilio', o.zone, o.addr,
        o.items.map(l => `${l.q}x ${l.n}${l.o ? ' (' + l.o + ')' : ''}`).join(' | '), o.sub, o.fee, o.total, o.pay, o.status, o.notes].map(q).join(','));
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="pedidos-king-kebab.csv"' });
      return res.end('﻿' + rows.join('\r\n'));
    }
  }
  throw httpErr(404, 'No encontrado');
}

/* ---------------- carga / guardado / peticiones ---------------- */
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const CONFLICT = Symbol('conflict');

async function load(needOrders) {
  const m = await store.get('main');
  mainEtag = m ? m.etag : null;
  db = m ? m.data : buildSeed();
  delete db.orders; delete db.counter;
  let changed = !m;
  const a = db.auth = db.auth || {};
  if (!a.secret) { a.secret = rid(32); changed = true; }
  if (!a.ownerHash) { a.ownerHash = await hashPin(ENV.OWNER_PIN || 'owner123'); a.ownerDefault = !ENV.OWNER_PIN; changed = true; }
  if (!a.staffHash) { a.staffHash = await hashPin(ENV.STAFF_PIN || 'staff123'); a.staffDefault = !ENV.STAFF_PIN; changed = true; }
  if (!a.tv) { a.tv = 1; changed = true; }
  db.reviews = db.reviews || [];
  dirtyMain = changed;
  ordEtag = null; ORD = { counter: 0, list: [] }; dirtyOrd = false;
  if (needOrders) {
    const o = await store.get('orders');
    if (o) { ORD = o.data; ordEtag = o.etag; }
  }
}
async function flush() {
  if (dirtyMain && !(await store.set('main', db, mainEtag))) return false;
  if (dirtyOrd && !(await store.set('orders', ORD, ordEtag))) return false;
  return true;
}
let chain = Promise.resolve();
function handle(req) {
  const run = chain.then(() => handleOnce(req));
  chain = run.catch(() => {});
  return run;
}
async function handleOnce(req) {
  const p = req.path;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = { status: 200, headers: {}, body: '', writeHead(s, h) { this.status = s; this.headers = h; }, end(b) { this.body = b; } };
    try {
      if (req.method === 'GET' && p.startsWith('/uploads/')) {
        const name = p.slice(9);
        if (!/^[a-f0-9]{16}\.(jpg|png|webp)$/.test(name)) throw httpErr(404, 'No encontrado');
        const buf = await store.getBin(name); if (!buf) throw httpErr(404, 'No encontrado');
        return { status: 200, headers: { 'Content-Type': MIME[name.split('.')[1]], 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' }, body: buf };
      }
      const readOnlyPublic = req.method === 'GET' && (p === '/api/public' || p === '/api/reviews');
      await load(!readOnlyPublic);
      const u = { searchParams: req.query };
      await api(req, res, u, p);
      if (await flush()) return res;
    } catch (e) {
      if (e && e.status) return { status: e.status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: e.message }) };
      console.error(e);
      return { status: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Error del servidor' }) };
    }
  }
  return { status: 503, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Servidor ocupado, inténtalo de nuevo' }) };
}
return { handle };
}
module.exports = { makeApp };
