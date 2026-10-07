/* Interfaz de la herramienta ([data-herramienta]): pestañas Buscar / Comparar / Segunda mano, detección del
   modelo y resultado con semáforo, batería de vida y mascota. Toda la lógica está en js/vida-movil.js.
   Nada de lo que se escribe sale del navegador; a Analytics solo va el nombre del evento («consulta»). */
(function () {
  "use strict";
  var D = window.CM_DATOS, WA = window.CM_WHATSAPP, V = window.VidaMovil;
  var raiz = document.querySelector("[data-herramienta]");
  if (!D || !WA || !V || !raiz) return;

  var BASE = window.__IC__ ? window.__IC__.base : "/";
  var hoy = (function () {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  })();
  var porId = {};
  D.MOVILES.forEach(function (m) { porId[m.id] = m; });
  var $ = function (s, c) { return (c || raiz).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var track = function () { if (window.__track) window.__track("consulta"); };

  function duracion(meses) {
    if (meses >= 12) return (Math.round(meses / 12 * 10) / 10).toString().replace(".", ",") + " años";
    return meses + (meses === 1 ? " mes" : " meses");
  }

  function lineas(m, e) {
    var l = [];
    if (e.meses > 0) l.push([e.meses <= 12 ? "ojo" : "bien", "Parches de seguridad hasta <strong>" + V.fmtMes(m.finSeguridad) + "</strong>."]);
    else if (V.mesesEntre(hoy, m.finSeguridad) === 0) l.push(["mal", "Su último parche de seguridad llega este mes (<strong>" + V.fmtMes(m.finSeguridad) + "</strong>)."]);
    else l.push(["mal", "Sin parches de seguridad desde <strong>" + V.fmtMes(m.finSeguridad) + "</strong>."]);

    if (!e.sigueSistema) l.push(["ojo", "Ya no recibe versiones nuevas: se quedó en <strong>" + V.nombreSo(m, m.soMax) + "</strong>."]);
    else if (m.so === "ios") l.push(["bien", "Sigue recibiendo versiones nuevas de iOS (hoy, " + V.nombreSo(m, m.soMax) + ") hasta <strong>" + V.fmtMes(m.finSistema) + "</strong>, aproximadamente."]);
    else l.push(["bien", "Recibirá versiones nuevas hasta <strong>" + V.nombreSo(m, m.soMax) + "</strong> (hasta " + V.fmtMes(m.finSistema) + ")."]);

    var w = e.whatsapp;
    if (!w) l.push(["bien", "WhatsApp: funciona y no hay fecha de corte anunciada."]);
    else if (w.ya) l.push(["mal", "WhatsApp ya no funciona: desde el " + V.fmtDia(w.fecha) + " pide " + V.nombreSo(m, w.min) + " o posterior."]);
    else l.push(["ojo", "WhatsApp dejará de funcionar el <strong>" + V.fmtDia(w.fecha) + "</strong>: pedirá " + V.nombreSo(m, w.min) + "."]);
    return l;
  }

  function nota(m) {
    var f = D.FUENTES[m.fuente];
    var txt = { oficial: "Fecha oficial publicada por " + m.marca + ".", politica: "Calculado con la política oficial de " + m.marca + ".", estimado: "Fechas estimadas: " + f.criterio }[m.precision];
    return esc(txt) + ' <a href="' + esc(f.url) + '" rel="noopener" target="_blank">Fuente: ' + esc(f.nombre) + "</a>.";
  }

  function tarjeta(m, extra) {
    var e = V.estado(m, WA, hoy);
    document.querySelectorAll(".mascota").forEach(function (s) { s.setAttribute("data-cara", e.color); });
    var enSuPagina = raiz.getAttribute("data-modelo") === m.id;
    return '<div class="resultado" data-color="' + e.color + '">' +
      "<h3>" + esc(m.modelo) + "</h3>" +
      '<span class="semaforo ' + e.color + '">' + e.etiqueta + "</span>" +
      '<div class="bateria" role="img" aria-label="Le queda ' + (e.meses ? duracion(e.meses) : "nada") + ' de uso con parches de seguridad">' +
        '<div class="bateria-cuerpo"><div class="bateria-carga" style="width:' + e.bateria + "%;--c:var(--" + e.color + ')"></div></div>' +
        '<div class="bateria-cifra">' + (e.meses ? duracion(e.meses) : "0 meses") + "<small>de uso seguro</small></div>" +
      "</div>" +
      '<ul class="datos">' + lineas(m, e).map(function (x) { return '<li class="' + x[0] + '">' + x[1] + "</li>"; }).join("") + "</ul>" +
      (extra || "") +
      '<p class="nota">' + nota(m) + (enSuPagina ? "" : ' <a href="' + BASE + "modelo/" + m.id + '/">Ficha completa del ' + esc(m.modelo) + "</a>.") + "</p>" +
    "</div>";
  }

  // ---------- Pestañas ----------
  var pestanas = Array.prototype.slice.call(raiz.querySelectorAll('[role="tab"]'));
  function activar(tab, foco) {
    pestanas.forEach(function (t) {
      var sel = t === tab;
      t.setAttribute("aria-selected", sel ? "true" : "false");
      t.tabIndex = sel ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !sel;
    });
    if (foco) tab.focus();
  }
  pestanas.forEach(function (t, i) {
    t.addEventListener("click", function () { activar(t); });
    t.addEventListener("keydown", function (ev) {
      var d = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
      if (d) { ev.preventDefault(); activar(pestanas[(i + d + pestanas.length) % pestanas.length], true); }
    });
  });

  // ---------- Selectores con todos los modelos (Comparar y Segunda mano) ----------
  function opciones() {
    var marcas = {};
    D.MOVILES.forEach(function (m) { (marcas[m.marca] = marcas[m.marca] || []).push(m); });
    return '<option value="">Elige un modelo</option>' + Object.keys(marcas).map(function (k) {
      return '<optgroup label="' + esc(k) + '">' + marcas[k].map(function (m) { return '<option value="' + m.id + '">' + esc(m.modelo) + "</option>"; }).join("") + "</optgroup>";
    }).join("");
  }
  raiz.querySelectorAll("select[data-modelos]").forEach(function (s) { s.innerHTML = opciones(); });

  // ---------- Buscar ----------
  var q = $("#cm-q"), sug = $("#cm-sugerencias"), res = $("#cm-resultado");
  function mostrar(m) {
    var aviso = $("#cm-detectado");
    if (aviso) aviso.hidden = true;
    res.innerHTML = tarjeta(m); sug.innerHTML = ""; track();
  }
  function sugerir() {
    var lista = V.buscar(D.MOVILES, q.value).slice(0, 6);
    if (!q.value.trim()) { sug.innerHTML = ""; return lista; }
    sug.innerHTML = lista.length
      ? lista.map(function (m) { return '<li><button type="button" data-id="' + m.id + '">' + esc(m.modelo) + "</button></li>"; }).join("")
      : '<li class="vacio">Todavía no tenemos ese modelo. Prueba con el nombre comercial, por ejemplo «Galaxy A54» o «iPhone 13».</li>';
    return lista;
  }
  if (q) {
    q.addEventListener("input", sugerir);
    q.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter") return;
      ev.preventDefault();
      var lista = sugerir();
      if (lista.length) mostrar(lista[0]);
    });
    sug.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-id]");
      if (b) { q.value = porId[b.getAttribute("data-id")].modelo; mostrar(porId[b.getAttribute("data-id")]); }
    });
  }

  // Ficha de modelo: resultado directo
  var fijo = porId[raiz.getAttribute("data-modelo")];
  if (fijo && res) res.innerHTML = tarjeta(fijo);

  // Detección del modelo desde el navegador (solo Android: un iPhone no dice su modelo)
  function detectar() {
    var aviso = $("#cm-detectado");
    if (!aviso || fijo) return;
    var poner = function (codigo) {
      var m = V.porCodigo(D.MOVILES, codigo);
      if (m) {
        aviso.innerHTML = "Parece que usas un <strong>" + esc(m.modelo) + "</strong>. Este es su resultado:";
        aviso.hidden = false;
        res.innerHTML = tarjeta(m);
      }
    };
    if (/iPhone/.test(navigator.userAgent)) {
      aviso.textContent = "Desde un iPhone no se puede leer el modelo. Escríbelo arriba (lo ves en Ajustes › General › Información).";
      aviso.hidden = false;
      return;
    }
    var uad = navigator.userAgentData;
    if (uad && uad.getHighEntropyValues) {
      uad.getHighEntropyValues(["model"]).then(function (v) { poner(v.model); }).catch(function () {});
    } else {
      var r = /Android [\d.]+; ([^;)]+?)(?: Build|\))/.exec(navigator.userAgent);
      if (r) poner(r[1]);
    }
  }
  detectar();

  // ---------- Comparar ----------
  var comp = raiz.querySelectorAll("select[data-comparar]"), compRes = $("#cm-comparar-resultado");
  function comparar() {
    var lista = Array.prototype.map.call(comp, function (s) { return porId[s.value]; }).filter(Boolean);
    if (lista.length < 2) { compRes.innerHTML = '<p class="vacio">Elige al menos dos modelos.</p>'; return; }
    var filas = V.comparar(lista, WA, hoy);
    compRes.innerHTML = '<div class="tabla-scroll"><table class="tabla"><caption class="sr">Comparación de modelos, de más a menos vida</caption>' +
      "<thead><tr><th>Modelo</th><th>Estado</th><th>Uso seguro</th><th>Parches hasta</th><th>WhatsApp</th></tr></thead><tbody>" +
      filas.map(function (x) {
        var w = x.e.whatsapp;
        return '<tr><td><a href="' + BASE + "modelo/" + x.m.id + '/">' + esc(V.corto(x.m)) + "</a></td>" +
          '<td><span class="semaforo ' + x.e.color + '">' + x.e.etiqueta + "</span></td>" +
          "<td>" + duracion(x.e.meses) + "</td><td>" + V.fmtMes(x.m.finSeguridad) + "</td>" +
          "<td>" + (!w ? "Sin corte anunciado" : w.ya ? "Ya no funciona" : "Hasta el " + V.fmtDia(w.fecha)) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
    track();
  }
  comp.forEach(function (s) { s.addEventListener("change", comparar); });

  // ---------- Segunda mano ----------
  var smModelo = $("#cm-sm-modelo"), smPrecio = $("#cm-sm-precio"), smRes = $("#cm-sm-resultado");
  function segundaMano() {
    var m = porId[smModelo.value];
    if (!m) { smRes.innerHTML = ""; return; }
    var precio = parseFloat(String(smPrecio.value).replace(",", "."));
    var coste = V.costeAnual(m, precio, WA, hoy);
    var e = V.estado(m, WA, hoy);
    var extra = e.meses <= 0
      ? '<p class="nota"><strong>No lo compres para uso diario:</strong> ya no recibe parches de seguridad.</p>'
      : coste ? "<p><strong>Te saldría a unos " + coste + " € por cada año de uso con parches.</strong> Compáralo con un modelo más nuevo antes de decidir.</p>"
      : '<p class="nota">Escribe el precio que te piden para ver cuánto pagas por cada año de uso seguro.</p>';
    smRes.innerHTML = tarjeta(m, extra);
    track();
  }
  if (smModelo) { smModelo.addEventListener("change", segundaMano); smPrecio.addEventListener("input", segundaMano); }
})();
