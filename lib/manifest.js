/* Datos de marca de CaducaMóvil. tools/generar.js usa también name, domain, email y updated. */
(function () {
  "use strict";
  window.__BRAND__ = {
    name: "CaducaMóvil",
    // Sin dominio propio: la web vive en GitHub Pages bajo /caducamovil/. Con dominio propio (p. ej. caducamovil.com):
    // domain: "caducamovil.com", base: "/", crear el archivo CNAME y ejecutar node tools/generar.js.
    domain: "asierfernandezmotilva-maker.github.io",
    base: "/caducamovil/",
    email: "asierfernandezmotilva@gmail.com",
    gaId: "",                    // ID de Google Analytics 4 de esta web («G-…»); vacío = sin analítica
    adsense: "",                 // «ca-pub-4424403733078041» cuando AdSense apruebe esta web
    adsenseSlots: {},            // p. ej. { articulo: "1234567890" } (ver js/ads.js)
    updated: "2026-10-07"
  };
})();
