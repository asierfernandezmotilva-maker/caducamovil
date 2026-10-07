/* Anuncios manuales de AdSense. Inactivo hasta que AdSense apruebe la web.
 *
 * Cómo se activa (cuando aprueben):
 *   1. lib/manifest.js → adsense: "ca-pub-4424403733078041"  (consent.js carga entonces el script y el aviso TCF de Google)
 *   2. En AdSense → Anuncios → Por bloque de anuncios, crea 1 bloque «Adaptable» y pon su número (10 cifras) en
 *      adsenseSlots de lib/manifest.js, p. ej. adsenseSlots: { articulo: "1234567890" }.
 *   3. Publicar. Mientras falte el número o el cliente, el hueco queda oculto y no ocupa espacio.
 *
 * Reglas: los huecos <div class="ad-slot" data-ad-slot="articulo"> solo van en guías y artículos, nunca dentro del
 * generador ni pegados a los botones de descargar. Cada hueco reserva alto (CSS .ad-slot) para no mover el texto.
 */
(function () {
  "use strict";

  function activar() {
    var marca = window.__BRAND__ || {};
    var cliente = marca.adsense, slots = marca.adsenseSlots || {};
    if (!cliente) return;
    Array.prototype.forEach.call(document.querySelectorAll(".ad-slot[data-ad-slot]"), function (hueco) {
      var id = slots[hueco.getAttribute("data-ad-slot")];
      if (!id || hueco.getAttribute("data-ad-listo")) return;
      hueco.setAttribute("data-ad-listo", "1");
      var etiqueta = document.createElement("p");
      etiqueta.className = "ad-etiqueta";
      etiqueta.textContent = "Publicidad";
      var ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", cliente);
      ins.setAttribute("data-ad-slot", id);
      ins.setAttribute("data-ad-format", "auto");
      ins.setAttribute("data-full-width-responsive", "true");
      hueco.appendChild(etiqueta);
      hueco.appendChild(ins);
      hueco.hidden = false;
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { hueco.hidden = true; }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", activar);
  else activar();
})();
