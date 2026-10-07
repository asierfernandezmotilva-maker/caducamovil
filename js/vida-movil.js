/* Lógica de «¿Hasta cuándo funcionará tu móvil?». Funciones puras: reciben los datos y la fecha de hoy.
   En el navegador quedan en window.VidaMovil; en Node, con require (tools/test-vida-movil.js y tools/datos.js). */
(function (raiz) {
  "use strict";

  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  // "AAAA-MM" o "AAAA-MM-DD" → número de mes absoluto
  function mesAbs(f) { var p = f.split("-"); return (+p[0]) * 12 + (+p[1] - 1); }
  function mesesEntre(desde, hasta) { return mesAbs(hasta) - mesAbs(desde); }

  function fmtMes(f) { var p = f.split("-"); return MESES[+p[1] - 1] + " de " + p[0]; }
  function fmtDia(f) { var p = f.split("-"); return (+p[2]) + " de " + MESES[+p[1] - 1] + " de " + p[0]; }

  function nombreSo(m, v) {
    var n = m.so === "ios" ? "iOS " : "Android ";
    return n + (Number.isInteger(v) ? v : v.toFixed(1));
  }

  // Primer corte de WhatsApp que el móvil no cumple: { fecha, ya, min } o null si no hay ninguno anunciado.
  function whatsappHasta(m, wa, hoy) {
    var cortes = (wa[m.so] || []).slice().sort(function (a, b) { return a.desde < b.desde ? -1 : 1; });
    for (var i = 0; i < cortes.length; i++) {
      if (cortes[i].min > m.soMax) return { fecha: cortes[i].desde, ya: cortes[i].desde <= hoy, min: cortes[i].min };
    }
    return null;
  }

  // Semáforo: rojo sin parches o sin WhatsApp; ámbar si queda un año o menos; verde si no.
  function estado(m, wa, hoy) {
    var meses = mesesEntre(hoy, m.finSeguridad);
    var total = Math.max(1, mesesEntre(m.lanzamiento, m.finSeguridad));
    var w = whatsappHasta(m, wa, hoy);
    var waPronto = w && !w.ya && mesesEntre(hoy, w.fecha) <= 12;
    var color = (meses <= 0 || (w && w.ya)) ? "rojo" : (meses <= 12 || waPronto) ? "ambar" : "verde";
    return {
      color: color,
      etiqueta: { verde: "Sigue", ambar: "Cámbialo pronto", rojo: "Cámbialo ya" }[color],
      meses: Math.max(0, meses),
      bateria: Math.round(100 * Math.min(1, Math.max(0, meses / total))),
      sigueSistema: mesesEntre(hoy, m.finSistema) > 0,
      whatsapp: w
    };
  }

  // Nombre corto: «Galaxy S23, S23+ y S23 Ultra» → «Galaxy S23»; «iPhone SE (2020)» se queda igual
  function corto(m) {
    var primero = m.modelo.split(/,| y /)[0].trim();
    return /\($/.test(primero) || /\([^)]*$/.test(primero) ? m.modelo : primero;
  }

  function quitarTildes(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim(); }

  // Busca por nombre o alias. Primero los que coinciden exactos, luego los que empiezan por el texto.
  // Busca con el texto completo; si no hay nada, sin la marca delante («Apple iPhone 13» → «iphone 13»).
  function buscar(moviles, texto) {
    var q = quitarTildes(texto || "");
    var r = buscarTexto(moviles, q);
    return r.length ? r : buscarTexto(moviles, q.replace(/^(samsung|apple|google|xiaomi)\s+/, ""));
  }

  function buscarTexto(moviles, q) {
    if (!q) return [];
    var puntos = function (m) {
      var nombres = [m.modelo].concat(m.alias).map(quitarTildes);
      if (nombres.some(function (n) { return n === q; })) return 3;
      if (nombres.some(function (n) { return n.indexOf(q) === 0 || n.indexOf(" " + q) > -1; })) return 2;
      return nombres.some(function (n) { return n.indexOf(q) > -1; }) ? 1 : 0;
    };
    return moviles.map(function (m) { return { m: m, p: puntos(m) }; })
      .filter(function (x) { return x.p > 0; })
      .sort(function (a, b) { return b.p - a.p; })
      .map(function (x) { return x.m; });
  }

  // Modelo que da el navegador (p. ej. "SM-S911B" o "Pixel 8") → entrada de la base de datos, o null.
  function porCodigo(moviles, codigo) {
    if (!codigo) return null;
    var c = quitarTildes(codigo);
    for (var i = 0; i < moviles.length; i++) {
      var m = moviles[i];
      for (var j = 0; j < m.alias.length; j++) {
        var a = quitarTildes(m.alias[j]);
        if (/^sm-/.test(a) ? c.indexOf(a) === 0 : (c === a || c === "google " + a)) return m;
      }
    }
    return null;
  }

  // Ordena por meses de seguridad que quedan (más primero).
  function comparar(lista, wa, hoy) {
    return lista.map(function (m) { return { m: m, e: estado(m, wa, hoy) }; })
      .sort(function (a, b) { return b.e.meses - a.e.meses; });
  }

  // Segunda mano: euros por año de uso con parches. null si ya no tiene parches o no hay precio.
  function costeAnual(m, precio, wa, hoy) {
    var e = estado(m, wa, hoy);
    if (!(precio > 0) || e.meses <= 0) return null;
    return Math.round(precio / (e.meses / 12));
  }

  var api = {
    mesesEntre: mesesEntre, fmtMes: fmtMes, fmtDia: fmtDia, nombreSo: nombreSo,
    whatsappHasta: whatsappHasta, estado: estado, buscar: buscar, porCodigo: porCodigo,
    comparar: comparar, costeAnual: costeAnual, quitarTildes: quitarTildes, corto: corto
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else raiz.VidaMovil = api;
})(this);
