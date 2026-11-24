(function () {
  var admin = location.pathname.indexOf('/admin') === 0;
  try { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js'); } catch (e) {}
  if (admin) return;
  var standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) return;
  try { if (localStorage.getItem('kkInstallHide')) return; } catch (e) {}
  var ev = null, ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  function bar(txt, btn, fn) {
    if (document.getElementById('kkInstall')) return;
    var b = document.createElement('div'); b.id = 'kkInstall';
    b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;background:#0d0d0d;color:#fff;border:2px solid #ffd400;border-radius:14px;padding:10px 12px;display:flex;align-items:center;gap:10px;font:700 14px system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35)';
    b.innerHTML = '<img src="/img/icon-192.png" width="36" height="36" style="border-radius:8px"><span style="flex:1">' + txt + '</span>' +
      (btn ? '<button style="background:#ffd400;color:#0d0d0d;border:0;border-radius:10px;padding:8px 12px;font:800 14px system-ui">' + btn + '</button>' : '') +
      '<button aria-label="Cerrar" style="background:none;border:0;color:#fff;font-size:20px;padding:4px 6px">×</button>';
    var bs = b.querySelectorAll('button');
    if (btn) bs[0].onclick = function () { fn(); b.remove(); };
    bs[bs.length - 1].onclick = function () { b.remove(); try { localStorage.setItem('kkInstallHide', '1'); } catch (e) {} };
    document.body.appendChild(b);
  }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); ev = e;
    setTimeout(function () { bar('Instala la app de King Kebab', 'Instalar', function () { ev.prompt(); }); }, 4000);
  });
  if (ios) setTimeout(function () { bar('Instala la app: pulsa Compartir y luego «Añadir a pantalla de inicio»', '', null); }, 6000);
})();
