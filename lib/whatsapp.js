/* Versión mínima del sistema que exige WhatsApp, con la fecha desde la que se exige.
   Fuente: centro de ayuda de WhatsApp, «Acerca de los sistemas operativos compatibles» (comprobado el 07/10/2026).
   Al anunciar WhatsApp un corte nuevo: añadir una línea aquí, ejecutar tools/generar.py y publicar. */
(function (raiz) {
  "use strict";
  var WHATSAPP = {
    fuente: "https://faq.whatsapp.com/1150261202542208/?locale=es_LA",
    comprobado: "2026-10-07",
    android: [{ desde: "2026-09-08", min: 6.0 }],
    ios: [{ desde: "2025-05-05", min: 15.1 }, { desde: "2026-11-30", min: 15.5 }]
  };
  if (typeof module !== "undefined" && module.exports) module.exports = WHATSAPP;
  else raiz.CM_WHATSAPP = WHATSAPP;
})(this);
