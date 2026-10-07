// Pruebas de la lógica (js/vida-movil.js) y de la coherencia de los datos (lib/moviles.js).
// Uso: node tools/test-vida-movil.js
const assert = require("assert");
const V = require("../js/vida-movil.js");
const { MOVILES, FUENTES } = require("../lib/moviles.js");
const WA = require("../lib/whatsapp.js");

const HOY = "2026-10-07";
const id = (x) => MOVILES.find((m) => m.id === x);
let n = 0;
const ok = (nombre, fn) => { fn(); n++; console.log("OK  " + nombre); };

ok("datos: ids únicos, fechas válidas y fuente conocida", () => {
  assert.strictEqual(new Set(MOVILES.map((m) => m.id)).size, MOVILES.length);
  for (const m of MOVILES) {
    for (const f of ["lanzamiento", "finSistema", "finSeguridad"]) assert.match(m[f], /^\d{4}-(0[1-9]|1[0-2])$/, m.id + " " + f);
    assert.ok(FUENTES[m.fuente], m.id);
    assert.ok(["oficial", "politica", "estimado"].includes(m.precision), m.id);
    assert.ok(m.finSeguridad >= m.finSistema, m.id + ": la seguridad no puede acabar antes que el sistema");
    assert.ok(m.soMax >= m.soSalida, m.id);
  }
});

ok("iPhone 6: sin WhatsApp (iOS 12.5 < 15.1) y en rojo", () => {
  const e = V.estado(id("iphone-6"), WA, HOY);
  assert.strictEqual(e.color, "rojo");
  assert.strictEqual(e.whatsapp.ya, true);
});

ok("iPhone 6s: WhatsApp sin corte anunciado (llega a iOS 15.8), pero sin parches: rojo", () => {
  const e = V.estado(id("iphone-6s"), WA, HOY);
  assert.strictEqual(e.whatsapp, null);
  assert.strictEqual(e.color, "rojo");
});

ok("móvil que se queda en iOS 15.2: WhatsApp hasta el 30/11/2026", () => {
  const m = { ...id("iphone-6s"), soMax: 15.2 };
  assert.deepStrictEqual(V.whatsappHasta(m, WA, HOY), { fecha: "2026-11-30", ya: false, min: 15.5 });
  assert.strictEqual(V.whatsappHasta(m, WA, "2026-12-01").ya, true);
});

ok("Galaxy S21: parches acabados en enero de 2026 → rojo", () => {
  assert.strictEqual(V.estado(id("galaxy-s21"), WA, HOY).color, "rojo");
});

ok("Pixel 7: quedan 12 meses → ámbar", () => {
  const e = V.estado(id("pixel-7"), WA, HOY);
  assert.strictEqual(e.meses, 12);
  assert.strictEqual(e.color, "ambar");
});

ok("Galaxy S24: 51 meses → verde y sigue recibiendo versiones", () => {
  const e = V.estado(id("galaxy-s24"), WA, HOY);
  assert.strictEqual(e.meses, 51);
  assert.strictEqual(e.color, "verde");
  assert.strictEqual(e.sigueSistema, true);
});

ok("Pixel 6: se acaba este mes → rojo con 0 meses", () => {
  const e = V.estado(id("pixel-6"), WA, HOY);
  assert.strictEqual(e.meses, 0);
  assert.strictEqual(e.color, "rojo");
});

ok("buscador: «s23 ultra», «iPhone 13 Pro», «redmi note 14 pro», «Samsung A54»", () => {
  assert.strictEqual(V.buscar(MOVILES, "s23 ultra")[0].id, "galaxy-s23");
  assert.strictEqual(V.buscar(MOVILES, "iPhone 13 Pro")[0].id, "iphone-13");
  assert.strictEqual(V.buscar(MOVILES, "redmi note 14 pro")[0].id, "redmi-note-14-pro");
  assert.strictEqual(V.buscar(MOVILES, "Samsung A54")[0].id, "galaxy-a54");
  assert.deepStrictEqual(V.buscar(MOVILES, "   "), []);
  assert.strictEqual(V.buscar(MOVILES, "xiaomi 15")[0].id, "xiaomi-15");
  assert.strictEqual(V.buscar(MOVILES, "Apple iPhone 12")[0].id, "iphone-12");
  assert.strictEqual(V.buscar(MOVILES, "z flip 6")[0].id, "galaxy-z-fold6");
});

ok("detección por código del navegador", () => {
  assert.strictEqual(V.porCodigo(MOVILES, "SM-S911B").id, "galaxy-s23");
  assert.strictEqual(V.porCodigo(MOVILES, "SM-A566E").id, "galaxy-a56");
  assert.strictEqual(V.porCodigo(MOVILES, "Pixel 8").id, "pixel-8");
  assert.strictEqual(V.porCodigo(MOVILES, "Pixel 8a").id, "pixel-8a");
  assert.strictEqual(V.porCodigo(MOVILES, "K"), null);
  assert.strictEqual(V.porCodigo(MOVILES, ""), null);
});

ok("comparar: S24 por delante de A54 y de S21", () => {
  const r = V.comparar([id("galaxy-s21"), id("galaxy-s24"), id("galaxy-a54")], WA, HOY).map((x) => x.m.id);
  assert.deepStrictEqual(r, ["galaxy-s24", "galaxy-a54", "galaxy-s21"]);
});

ok("segunda mano: 300 € por un A54 (18 meses) = 200 €/año; sin parches = null", () => {
  assert.strictEqual(V.costeAnual(id("galaxy-a54"), 300, WA, HOY), 200);
  assert.strictEqual(V.costeAnual(id("galaxy-s21"), 100, WA, HOY), null);
  assert.strictEqual(V.costeAnual(id("galaxy-a54"), 0, WA, HOY), null);
});

ok("nombre corto", () => {
  assert.strictEqual(V.corto(id("galaxy-s23")), "Galaxy S23");
  assert.strictEqual(V.corto(id("iphone-se-2020")), "iPhone SE (2020)");
  assert.strictEqual(V.corto(id("iphone-6s")), "iPhone 6s");
  assert.strictEqual(V.corto(id("redmi-note-13-pro")), "Redmi Note 13 Pro");
});

ok("formatos de fecha", () => {
  assert.strictEqual(V.fmtMes("2031-01"), "enero de 2031");
  assert.strictEqual(V.fmtDia("2026-11-30"), "30 de noviembre de 2026");
  assert.strictEqual(V.nombreSo(id("iphone-8"), 16.7), "iOS 16.7");
});

console.log(`\n${n}/${n} pruebas OK`);
