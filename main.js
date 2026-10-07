/* CaducaMóvil — común a todas las páginas. Expone window.__IC__ (base y loadScript), que usan consent.js y
   analytics.js (copiados de InfoContrato), y arranca el consentimiento y la analítica. */
(function () {
  "use strict";
  var BASE = (function () {
    try { return new URL(".", document.currentScript.src).href; } catch (e) { return new URL("/", location.href).href; }
  })();
  var pendientes = {};
  function loadScript(src) {
    var url = new URL(src, BASE).href;
    if (!pendientes[url]) {
      pendientes[url] = new Promise(function (ok, mal) {
        var s = document.createElement("script");
        s.src = url; s.async = true;
        s.onload = function () { ok(); };
        s.onerror = function () { delete pendientes[url]; s.remove(); mal(new Error("No se pudo cargar " + src)); };
        document.head.appendChild(s);
      });
    }
    return pendientes[url];
  }
  window.__IC__ = { base: BASE, loadScript: loadScript };

  function arrancar() {
    try { window.__consent && window.__consent.init(); } catch (e) { console.warn("[consent]", e); }
    try { window.__analytics && window.__analytics.init(); } catch (e) { console.warn("[analytics]", e); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
