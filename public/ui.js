/* King Kebab · utilidades compartidas (web + panel) */
const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>
<symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></symbol>
<symbol id="i-bag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></symbol>
<symbol id="i-minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></symbol>
<symbol id="i-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></symbol>
<symbol id="i-bike" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h3l2 6M5.5 17.5 9 8h6l3.5 9.5M9 8H6"/></symbol>
<symbol id="i-store" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1-5h16l1 5"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/></symbol>
<symbol id="i-print" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol>
<symbol id="i-fire" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/></symbol>
<symbol id="i-vol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></symbol>
<symbol id="i-volx" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></symbol>
<symbol id="i-flask" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6M10 2v6L4 20a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2l-6-12V2"/></symbol>
<symbol id="i-cloud" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></symbol>
<symbol id="i-mobile" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></symbol>
<symbol id="i-warn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></symbol>
<symbol id="i-chef" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.9A4 4 0 0 1 7 6a5 5 0 0 1 9.6-1A4 4 0 0 1 18 14v6H6z"/><path d="M6 17h12"/></symbol>
<symbol id="i-crown" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
<symbol id="i-dice" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="currentColor" stroke="#0d0d0d" stroke-width="1.6" stroke-linejoin="round"/></symbol>
<symbol id="i-edit" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></symbol>
<symbol id="i-img" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></symbol>
<symbol id="i-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></symbol>
<symbol id="i-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 4 3 5-7"/></symbol>
<symbol id="i-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></symbol>
</defs>
</svg>`;
document.body.insertAdjacentHTML('afterbegin', SPRITE);
const eur = n => Number(n).toFixed(2).replace('.', ',') + '€';
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const I = (n, s = '') => `<svg class="ic" ${s ? `style="${s}"` : ''}><use href="#i-${n}"/></svg>`;
function toast(msg) { const t = document.getElementById('toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }
function nowIn(tz) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = t => p.find(x => x.type === t).value;
  return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), min: (+g('hour')) * 60 + (+g('minute')) };
}
function isOpenNow(h, tz) {
  const n = nowIn(tz);
  return (h[n.day] || '').split(',').some(r => { const m = r.trim().match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/); if (!m) return false; const a = +m[1] * 60 + +m[2], b = +m[3] * 60 + +m[4]; return n.min >= a && n.min < b; });
}

const ART={
 pizza:`<circle cx="50" cy="52" r="44" fill="#e8b36a"/><circle cx="50" cy="52" r="35" fill="#ffd400"/><circle cx="38" cy="40" r="7.5" fill="#ff2e2e"/><circle cx="63" cy="47" r="7.5" fill="#ff2e2e"/><circle cx="44" cy="66" r="7.5" fill="#ff2e2e"/><circle cx="69" cy="68" r="5.5" fill="#ff2e2e"/><circle cx="30" cy="57" r="3.6" fill="#2fd07a" stroke-width="2"/><circle cx="55" cy="29" r="3.6" fill="#2fd07a" stroke-width="2"/><circle cx="58" cy="82" r="3.2" fill="#2fd07a" stroke-width="2"/>`,
 burger:`<path d="M10 74H90Q90 91 76 91H24Q10 91 10 74Z" fill="#ff8a00"/><rect x="8" y="58" width="84" height="17" rx="8.5" fill="#8b4a1f"/><path d="M12 56H88L80 68 70 58 60 69 50 58 40 69 30 58 20 68Z" fill="#ffd400"/><path d="M8 50Q18 42 28 50T48 50T68 50T92 49V57H8Z" fill="#2fd07a"/><path d="M8 47Q8 10 50 10Q92 10 92 47Z" fill="#ff8a00"/><ellipse cx="32" cy="24" rx="4.2" ry="2.2" fill="#fff3d6" stroke-width="2"/><ellipse cx="52" cy="19" rx="4.2" ry="2.2" fill="#fff3d6" stroke-width="2"/><ellipse cx="70" cy="27" rx="4.2" ry="2.2" fill="#fff3d6" stroke-width="2"/><ellipse cx="44" cy="34" rx="4.2" ry="2.2" fill="#fff3d6" stroke-width="2"/><ellipse cx="62" cy="38" rx="4.2" ry="2.2" fill="#fff3d6" stroke-width="2"/>`,
 fries:`<rect x="27" y="12" width="9" height="48" rx="2" fill="#ffd400" transform="rotate(-12 31 36)"/><rect x="37" y="6" width="9" height="52" rx="2" fill="#ffd400" transform="rotate(-4 41 32)"/><rect x="48" y="10" width="9" height="50" rx="2" fill="#ffd400" transform="rotate(5 52 35)"/><rect x="59" y="5" width="9" height="54" rx="2" fill="#ffd400" transform="rotate(10 63 32)"/><rect x="68" y="16" width="9" height="44" rx="2" fill="#ffd400" transform="rotate(18 72 38)"/><path d="M22 50H78L71 93H29Z" fill="#ff2e2e"/><path d="M25 66H75L73 78H27Z" fill="#ffd400" stroke-width="2.5"/>`,
 can:`<rect x="28" y="12" width="44" height="78" rx="8" fill="#ff2e2e"/><path d="M28 40Q50 28 72 40V62Q50 50 28 62Z" fill="#fff"/><ellipse cx="50" cy="13" rx="22" ry="5.5" fill="#cfd3d8"/><rect x="45" y="8" width="10" height="5" rx="2" fill="#9aa0a6" stroke-width="2"/>`,
 chicken:`<path d="M46 62L24 84" stroke="#0d0d0d" stroke-width="15"/><path d="M46 62L24 84" stroke="#fff3d6" stroke-width="8"/><circle cx="19" cy="82" r="6.5" fill="#fff3d6"/><circle cx="27" cy="91" r="6.5" fill="#fff3d6"/><path d="M30 20C56 4 90 22 78 50 70 66 50 68 40 58 22 46 18 28 30 20Z" fill="#e0791a"/><path d="M44 25Q58 20 67 30" fill="none" stroke="#ffc15e" stroke-width="4.5"/><circle cx="60" cy="48" r="2" fill="#8b4a1f" stroke="none"/><circle cx="48" cy="40" r="2" fill="#8b4a1f" stroke="none"/><circle cx="70" cy="38" r="2" fill="#8b4a1f" stroke="none"/>`,
 nuggets:`<path d="M14 54Q12 36 30 34 46 30 52 44 58 62 38 68 18 70 14 54Z" fill="#e0a23a"/><path d="M50 40Q56 20 74 24 92 30 84 50 76 66 58 58Z" fill="#e0a23a"/><path d="M34 72Q40 62 62 66 84 68 80 82 74 94 50 90 28 88 34 72Z" fill="#e0a23a"/><circle cx="28" cy="46" r="2" fill="#b9731d" stroke="none"/><circle cx="40" cy="56" r="2" fill="#b9731d" stroke="none"/><circle cx="68" cy="36" r="2" fill="#b9731d" stroke="none"/><circle cx="60" cy="78" r="2" fill="#b9731d" stroke="none"/><circle cx="48" cy="72" r="2" fill="#b9731d" stroke="none"/>`,
 salad:`<circle cx="28" cy="46" r="12" fill="#2fd07a"/><circle cx="46" cy="38" r="14" fill="#3ee68a"/><circle cx="64" cy="43" r="11" fill="#2fd07a"/><circle cx="76" cy="50" r="8" fill="#3ee68a"/><circle cx="40" cy="48" r="6" fill="#ff2e2e"/><circle cx="62" cy="36" r="5.5" fill="#ff2e2e"/><circle cx="52" cy="50" r="3.2" fill="#ffd400" stroke-width="2"/><circle cx="30" cy="38" r="3" fill="#ffd400" stroke-width="2"/><path d="M8 52H92A42 38 0 0 1 8 52Z" fill="#fff3d6"/><path d="M8 52H92" stroke-width="4"/>`,
 pita:`<path d="M14 52Q10 22 38 26L40 54Z" fill="#d9a55a"/><path d="M12 50Q16 24 30 30 36 14 50 22 62 12 72 28 88 24 88 52Z" fill="#2fd07a"/><rect x="28" y="28" width="26" height="14" rx="7" fill="#8b4a1f" transform="rotate(-12 41 35)"/><rect x="52" y="30" width="22" height="12" rx="6" fill="#a8652d" transform="rotate(10 63 36)"/><circle cx="22" cy="42" r="6" fill="#ff2e2e"/><circle cx="80" cy="40" r="5.5" fill="#ff2e2e"/><path d="M26 33Q40 24 52 33T78 31" fill="none" stroke="#fff" stroke-width="4.5"/><path d="M8 54Q50 40 92 54L84 88Q50 98 16 88Z" fill="#e8b36a"/><path d="M22 66Q50 76 78 66" fill="none" stroke-width="2.5" opacity=".45"/>`,
 wrap:`<g transform="rotate(-26 50 52)"><circle cx="41" cy="12" r="7.5" fill="#2fd07a"/><circle cx="57" cy="10" r="6.5" fill="#ff2e2e"/><circle cx="50" cy="19" r="6.5" fill="#8b4a1f"/><rect x="30" y="12" width="40" height="80" rx="20" fill="#e8b36a"/><path d="M30 54H70V72Q70 92 50 92 30 92 30 72Z" fill="#d3d7dc"/><path d="M30 61H70M30 69H70M31 77H69" stroke-width="2" opacity=".5"/><path d="M34 22Q50 30 66 22" fill="none" stroke-width="2.5" opacity=".5"/></g>`,
 plate:`<ellipse cx="50" cy="62" rx="46" ry="30" fill="#fff"/><ellipse cx="50" cy="60" rx="34" ry="21" fill="#f0f0f0" stroke-width="2"/><ellipse cx="36" cy="56" rx="15" ry="7.5" fill="#8b4a1f"/><ellipse cx="50" cy="49" rx="15" ry="6.5" fill="#a8652d"/><rect x="60" y="54" width="6" height="24" rx="2" fill="#ffd400" transform="rotate(62 63 66)" stroke-width="2.5"/><rect x="66" y="50" width="6" height="24" rx="2" fill="#ffd400" transform="rotate(72 69 62)" stroke-width="2.5"/><rect x="58" y="60" width="6" height="22" rx="2" fill="#ffd400" transform="rotate(52 61 71)" stroke-width="2.5"/><circle cx="28" cy="68" r="8" fill="#2fd07a" stroke-width="2.5"/><circle cx="43" cy="72" r="5" fill="#ff2e2e" stroke-width="2.5"/>`,
 doner:`<path d="M38 12H62L74 40 80 62Q80 76 66 80H34Q20 76 20 62L26 40Z" fill="#8b4a1f"/><path d="M28 36H72M23 52H77M22 66H78" stroke-width="2.5" opacity=".6"/><path d="M50 3V12" stroke-width="4"/><rect x="28" y="80" width="44" height="9" rx="4" fill="#d3d7dc"/>`
};
function art(t){return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true"><g stroke="#0d0d0d" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${ART[t]||ART.doner}</g></svg>`}
function modelFor(it){const n=(it.name||it.n||'').toLowerCase();
  if(/pizza|miércoles/.test(n))return'pizza';
  if(/hamburg/.test(n))return'burger';
  if(/d[uü]rum|burrito|lahmacun/.test(n))return'wrap';
  if(/plato|pedrata/.test(n))return'plate';
  if(/nuggets|pops|popcorn|tiras|samosa|falafel/.test(n))return'nuggets';
  if(/kebab/.test(n))return'pita';
  if(/ensalada/.test(n))return'salad';
  if(/lata|agua|refresco/.test(n))return'can';
  if(/patata|aros/.test(n))return'fries';
  if(/alitas|pollo|broaster/.test(n))return'chicken';
  return'doner'}

