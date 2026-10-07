// Genera TODAS las páginas de CaducaMóvil desde lib/moviles.js y lib/whatsapp.js, con la misma cabecera y pie.
// Uso:  node tools/generar.js              → escribe las páginas
//       node tools/generar.js --comprobar  → falla si alguna página no coincide con lo que generaría (antes de publicar)
// Los textos fijos usan fechas absolutas; el semáforo («quedan X meses») lo calcula js/app.js en el navegador.
const fs = require("fs");
const path = require("path");
const V = require("../js/vida-movil.js");
const { MOVILES, FUENTES } = require("../lib/moviles.js");
const WA = require("../lib/whatsapp.js");

const RAIZ = path.resolve(__dirname, "..");
const manifiesto = fs.readFileSync(path.join(RAIZ, "lib/manifest.js"), "utf8");
const leer = (k) => (manifiesto.match(new RegExp("^\\s*" + k + ':\\s*"([^"]*)"', "m")) || [])[1]; // ignora comentarios
const MARCA = leer("name"), DOMINIO = leer("domain"), EMAIL = leer("email"), FECHA = leer("updated");
const BASE = leer("base") || "/";                       // "/caducamovil/" en GitHub Pages sin dominio propio
const URL_BASE = "https://" + DOMINIO + BASE.replace(/\/$/, "");
// Las páginas se escriben con rutas desde la raíz ("/modelo/…") y aquí se les pone la base delante
const conBase = (html) => html.replace(/(href|src)="\//g, `$1="${BASE}`);
const VER = "?v=" + FECHA.replace(/-/g, "");
const TITULAR = { nombre: "Asier Fernández", nif: "21745417K", domicilio: "C/ 1º de Mayo, nº 5, 1º B, 50500 Tarazona (Zaragoza)" };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const corto = V.corto;
const so = (m, v) => V.nombreSo(m, v);
const porMarca = () => MOVILES.reduce((o, m) => ((o[m.marca] = o[m.marca] || []).push(m), o), {});

// ---------------- Piezas comunes ----------------
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="7" y="2" width="18" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="11" y="16" width="10" height="10" rx="2" fill="currentColor"/></svg>`;

const MASCOTA = `<svg class="mascota" data-cara="verde" viewBox="0 0 120 160" aria-hidden="true">
  <rect x="8" y="6" width="104" height="148" rx="24" fill="#1a1a18"/>
  <rect x="16" y="20" width="88" height="122" rx="14" fill="#fff"/>
  <rect x="47" y="11" width="26" height="4" rx="2" fill="#5a5a55"/>
  <circle cx="44" cy="66" r="15" fill="#fff" stroke="#1a1a18" stroke-width="3.5"/>
  <circle cx="76" cy="66" r="15" fill="#fff" stroke="#1a1a18" stroke-width="3.5"/>
  <g class="cara cara-verde"><circle cx="47" cy="61" r="6.5" fill="#1a1a18"/><circle cx="79" cy="61" r="6.5" fill="#1a1a18"/><path d="M45 100 Q60 116 75 100" fill="none" stroke="#1a1a18" stroke-width="4" stroke-linecap="round"/></g>
  <g class="cara cara-ambar"><circle cx="44" cy="70" r="6.5" fill="#1a1a18"/><circle cx="76" cy="70" r="6.5" fill="#1a1a18"/><path d="M29 66a15 15 0 0 1 30 0zM61 66a15 15 0 0 1 30 0z" fill="#1a1a18"/><path d="M48 104h24" stroke="#1a1a18" stroke-width="4" stroke-linecap="round"/></g>
  <g class="cara cara-rojo"><circle cx="41" cy="71" r="6.5" fill="#1a1a18"/><circle cx="73" cy="71" r="6.5" fill="#1a1a18"/><path d="M31 46l22 8M89 46l-22 8" stroke="#1a1a18" stroke-width="4" stroke-linecap="round"/><path d="M46 110 Q60 96 74 110" fill="none" stroke="#1a1a18" stroke-width="4" stroke-linecap="round"/><path d="M96 38c4 7 4 11 0 13-4-2-4-6 0-13z" fill="#5aa9e6"/></g>
</svg>`;

const MENU = [["/#herramienta", "Buscar"], ["/#comparar", "Comparar"], ["/whatsapp-dejara-de-funcionar/", "WhatsApp"], ["/blog/", "Blog"], ["/saber-mi-modelo/", "Mi modelo"]];

function cabecera(ruta) {
  return `<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="contenedor cabecera">
  <a class="logo" href="/">${LOGO}${MARCA}</a>
  <nav class="menu" aria-label="Principal">${MENU.map(([h, t]) => `<a href="${h}"${h === ruta ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
  <a class="btn" href="/#herramienta">Comprobar mi móvil</a>
</header>`;
}

function pie() {
  const marcas = porMarca();
  return `<footer class="pie">
  <div class="contenedor pie-rejilla">
    <div>
      <a class="logo" href="/">${LOGO}${MARCA}</a>
      <p>Hasta cuándo recibe actualizaciones y WhatsApp cada móvil, con fechas oficiales de las marcas. Gratis y sin registro. Datos revisados el ${V.fmtDia(FECHA)}.</p>
    </div>
    <div>
      <p><strong>Guías</strong></p>
      <ul>
        <li><a href="/whatsapp-dejara-de-funcionar/">Móviles que se quedan sin WhatsApp</a></li>
        <li><a href="/ios-27-iphone-compatibles/">iPhone compatibles con iOS 27</a></li>
        <li><a href="/android-17-moviles-compatibles/">Móviles con Android 17</a></li>
        <li><a href="/saber-mi-modelo/">Cómo saber mi modelo</a></li>
        <li><a href="/moviles-sin-actualizaciones-2026/">Sin actualizaciones en 2026</a></li>
        <li><a href="/moviles-sin-actualizaciones-2027/">Sin actualizaciones en 2027</a></li>
        <li><a href="/moviles-con-mas-actualizaciones/">Los que más duran</a></li>
      </ul>
    </div>
    <div>
      <p><strong>Marcas</strong></p>
      <ul>
        <li><a href="/marca/apple/">iPhone</a></li>
        <li><a href="/marca/samsung/">Samsung Galaxy</a></li>
        <li><a href="/marca/google/">Google Pixel</a></li>
        <li><a href="/marca/xiaomi/">Xiaomi, Redmi y POCO</a></li>
      </ul>
    </div>
    <div>
      <p><strong>${MARCA}</strong></p>
      <ul>
        <li><a href="/quienes-somos.html">Quiénes somos y fuentes</a></li>
        <li><a href="/contacto.html">Contacto</a></li>
        <li><a href="/aviso-legal.html">Aviso legal</a></li>
        <li><a href="/privacidad.html">Privacidad</a></li>
        <li><a href="/cookies.html">Cookies</a></li>
        <li><button type="button" data-consent-open hidden>Configurar cookies</button></li>
      </ul>
    </div>
  </div>
  <p class="contenedor">Modelos: ${Object.keys(marcas).map((k) => k + " (" + marcas[k].length + ")").join(", ")}. ${MARCA} no tiene relación con Apple, Samsung, Google ni Xiaomi.</p>
</footer>`;
}

function pagina({ ruta, titulo, descripcion, cuerpo, jsonld = [], herramienta = false, robots = "index,follow" }) {
  const canonica = URL_BASE + ruta;
  return conBase(paginaSinBase({ canonica, titulo, descripcion, cuerpo, jsonld, herramienta, robots, ruta }));
}
function paginaSinBase({ canonica, titulo, descripcion, cuerpo, jsonld, herramienta, robots, ruta }) {
  const scripts = [
    "/lib/manifest.js", "/js/consent.js", "/js/analytics.js", "/js/ads.js",
    ...(herramienta ? ["/lib/moviles.js", "/lib/whatsapp.js", "/js/vida-movil.js", "/js/app.js"] : []),
    "/main.js"
  ];
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonica}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${MARCA}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${canonica}">
<meta property="og:locale" content="es_ES">
<meta name="theme-color" content="#f4f4f1">
<meta name="google-adsense-account" content="ca-pub-4424403733078041">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Inter+Tight:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="/styles.css${VER}">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head>
<body>
${cabecera(ruta)}
<main id="contenido">
${cuerpo}
</main>
${pie()}
${scripts.map((s) => `<script src="${s}${VER}" defer></script>`).join("\n")}
</body>
</html>
`;
}

// La ventana de la herramienta (portada, fichas y guías). modeloId: ficha con resultado directo.
function herramienta(modeloId) {
  return `<div class="app-marco" id="herramienta">
  ${MASCOTA}
  <section class="app" data-herramienta${modeloId ? ` data-modelo="${modeloId}"` : ""} aria-label="Herramienta">
    <div class="app-barra">
      <div class="app-puntos" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="pestanas" role="tablist" aria-label="Qué quieres hacer">
        <button type="button" role="tab" id="t-buscar" aria-controls="p-buscar" aria-selected="true">Buscar</button>
        <button type="button" role="tab" id="t-comparar" aria-controls="p-comparar" aria-selected="false" tabindex="-1">Comparar</button>
        <button type="button" role="tab" id="t-segunda" aria-controls="p-segunda" aria-selected="false" tabindex="-1">Segunda mano</button>
      </div>
    </div>
    <div class="app-cuerpo">
      <div role="tabpanel" id="p-buscar" aria-labelledby="t-buscar">
        <p class="detectado" id="cm-detectado" hidden></p>
        <div class="campo">
          <label for="cm-q">${modeloId ? "Busca otro modelo" : "¿Qué móvil tienes?"}</label>
          <input type="search" id="cm-q" placeholder="Por ejemplo: iPhone 13, Galaxy A54, Redmi Note 13" autocomplete="off" enterkeyhint="search">
          <ul class="sugerencias" id="cm-sugerencias" aria-live="polite"></ul>
        </div>
        <div id="cm-resultado" aria-live="polite"></div>
      </div>
      <div role="tabpanel" id="p-comparar" aria-labelledby="t-comparar" hidden>
        <p class="vacio" id="comparar">¿Dudas entre varios? Mira cuál te dará más años de uso seguro.</p>
        <div class="fila">
          <div class="campo"><label for="cm-c1">Primer móvil</label><select id="cm-c1" data-modelos data-comparar></select></div>
          <div class="campo"><label for="cm-c2">Segundo móvil</label><select id="cm-c2" data-modelos data-comparar></select></div>
          <div class="campo"><label for="cm-c3">Tercero (opcional)</label><select id="cm-c3" data-modelos data-comparar></select></div>
        </div>
        <div id="cm-comparar-resultado" aria-live="polite"></div>
      </div>
      <div role="tabpanel" id="p-segunda" aria-labelledby="t-segunda" hidden>
        <p class="vacio">Antes de comprarlo en Wallapop o Vinted, mira cuánta vida segura le queda.</p>
        <div class="fila">
          <div class="campo"><label for="cm-sm-modelo">Modelo</label><select id="cm-sm-modelo" data-modelos></select></div>
          <div class="campo"><label for="cm-sm-precio">Precio que te piden (€)</label><input type="number" id="cm-sm-precio" min="0" step="1" inputmode="numeric" placeholder="200"></div>
        </div>
        <div id="cm-sm-resultado" aria-live="polite"></div>
      </div>
    </div>
  </section>
</div>`;
}

const faqHtml = (lista) => lista.map(([p, r]) => `<details><summary>${esc(p)}</summary><p>${r}</p></details>`).join("\n");
const faqLd = (lista) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: lista.map(([p, r]) => ({ "@type": "Question", name: p, acceptedAnswer: { "@type": "Answer", text: r.replace(/<[^>]+>/g, "") } })) });
const migasLd = (items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: URL_BASE + u })) });
const adSlot = `<div class="ad-slot" data-ad-slot="articulo" hidden></div>`;

function chipsModelos(lista) {
  return `<ul>${lista.map((m) => `<li><a class="chip" href="/modelo/${m.id}/">${esc(corto(m))}</a></li>`).join("")}</ul>`;
}

// Textos fijos de un modelo a fecha FECHA
function textoWhatsapp(m) {
  const w = V.whatsappHasta(m, WA, FECHA);
  if (!w) return `funciona y no hay ningún corte anunciado para ${so(m, m.soMax)}`;
  if (w.ya) return `ya no funciona: desde el ${V.fmtDia(w.fecha)} WhatsApp pide ${so(m, w.min)} o posterior y este modelo se quedó en ${so(m, m.soMax)}`;
  return `dejará de funcionar el ${V.fmtDia(w.fecha)}, cuando WhatsApp pida ${so(m, w.min)}`;
}
function textoSistema(m) {
  if (V.mesesEntre(FECHA, m.finSistema) <= 0) return `ya no recibe versiones nuevas del sistema (se quedó en ${so(m, m.soMax)})`;
  if (m.so === "ios") return `seguirá recibiendo versiones nuevas de iOS hasta ${V.fmtMes(m.finSistema)}, aproximadamente`;
  return `recibirá versiones nuevas hasta ${so(m, m.soMax)}, hasta ${V.fmtMes(m.finSistema)}`;
}
function textoSeguridad(m) {
  const meses = V.mesesEntre(FECHA, m.finSeguridad);
  if (meses < 0) return `dejó de recibir parches de seguridad en ${V.fmtMes(m.finSeguridad)}`;
  if (meses === 0) return `recibe su último parche de seguridad este mes, ${V.fmtMes(m.finSeguridad)}`;
  return `recibe parches de seguridad hasta ${V.fmtMes(m.finSeguridad)}`;
}
const etiquetaPrecision = (m) => ({ oficial: "Fecha oficial de " + m.marca, politica: "Política oficial de " + m.marca + " aplicada al lanzamiento", estimado: "Estimación (" + m.marca + " no publica fechas)" }[m.precision]);

// ---------------- Blog: contenido/blog/<slug>.html con un comentario JSON de cabecera ----------------
const DIR_BLOG = path.join(RAIZ, "contenido/blog");
const ARTICULOS = (fs.existsSync(DIR_BLOG) ? fs.readdirSync(DIR_BLOG) : []).filter((f) => f.endsWith(".html")).map((f) => {
  const txt = fs.readFileSync(path.join(DIR_BLOG, f), "utf8");
  const m = txt.match(/^<!--(\{[\s\S]*?\})-->\s*/);
  if (!m) throw new Error("Falta la cabecera JSON en contenido/blog/" + f);
  const meta = JSON.parse(m[1]);
  for (const k of ["titulo", "descripcion", "fecha"]) if (!meta[k]) throw new Error(`Falta «${k}» en contenido/blog/${f}`);
  for (const id of meta.modelos || []) if (!MOVILES.some((x) => x.id === id)) throw new Error(`Modelo desconocido «${id}» en contenido/blog/${f}`);
  return { slug: f.replace(/\.html$/, ""), ...meta, cuerpo: txt.slice(m[0].length) };
}).sort((a, b) => (a.fecha === b.fecha ? (a.titulo < b.titulo ? -1 : 1) : a.fecha < b.fecha ? 1 : -1));

const listaArticulos = (lista) => `<ul class="articulos">${lista.map((a) => `<li><a href="/blog/${a.slug}/"><strong>${esc(a.titulo)}</strong></a><p>${esc(a.descripcion)}</p><small>${V.fmtDia(a.fecha)}</small></li>`).join("")}</ul>`;

// ---------------- Páginas ----------------
const paginas = {};

// Portada
const FAQ_PORTADA = [
  ["¿Qué pasa si mi móvil deja de recibir parches de seguridad?", "Sigue encendiendo y funcionando, pero los fallos de seguridad nuevos ya no se arreglan. Para la banca, las compras y el correo, lo prudente es cambiarlo en los meses siguientes. Algunas apps, como las de bancos, dejan de funcionar en versiones antiguas del sistema."],
  ["¿Hasta cuándo funcionará WhatsApp en mi móvil?", `WhatsApp funciona en Android 6.0 o posterior y en iOS 15.1 o posterior. Desde el 30 de noviembre de 2026 pedirá iOS 15.5. Busca tu modelo arriba y te decimos si le afecta. <a href="/whatsapp-dejara-de-funcionar/">Más sobre los cortes de WhatsApp</a>.`],
  ["¿Por qué los iPhone salen como «estimado»?", `Apple no publica hasta cuándo actualiza cada iPhone. Partimos de su lista oficial de modelos compatibles con iOS 27 y de lo que ha hecho con los anteriores: unos 8 años de versiones de iOS y unos 2 más de parches.`],
  ["¿De dónde salen las fechas?", `De las páginas oficiales de cada marca: Google, Samsung, Xiaomi y Apple. En cada resultado enlazamos la fuente y decimos si la fecha es oficial, calculada con la política de la marca o estimada. <a href="/quienes-somos.html">Cómo lo calculamos</a>.`],
  ["¿Guardáis el modelo que busco?", "No. La búsqueda se hace en tu navegador y no se envía a ningún sitio. Si aceptas la analítica, solo contamos que se hizo una consulta, no qué móvil era."]
];
paginas["index.html"] = pagina({
  ruta: "/",
  titulo: "¿Hasta cuándo funcionará tu móvil? Actualizaciones y WhatsApp",
  descripcion: "Busca tu móvil y mira hasta cuándo recibirá parches de seguridad, versiones de Android o iOS y WhatsApp. Fechas oficiales de Apple, Samsung, Google y Xiaomi.",
  herramienta: true,
  jsonld: [{ "@context": "https://schema.org", "@type": "WebSite", name: MARCA, url: URL_BASE + "/", inLanguage: "es" }, faqLd(FAQ_PORTADA)],
  cuerpo: `<section class="contenedor hero">
  <a class="aviso-pill" href="/whatsapp-dejara-de-funcionar/"><b>30 nov</b> WhatsApp pedirá iOS 15.5 en iPhone</a>
  <h1 class="titular">¿Hasta cuándo <span class="s">funcionará</span> tu móvil? <span class="s">Y cuándo cambiarlo.</span></h1>
  <p class="entradilla">Busca tu modelo y mira hasta cuándo recibirá parches de seguridad, versiones nuevas del sistema y WhatsApp. Con las fechas oficiales de Apple, Samsung, Google y Xiaomi.</p>
  <div class="hero-acciones"><a class="btn" href="#herramienta">Buscar mi móvil</a><a class="btn btn--claro" href="/whatsapp-dejara-de-funcionar/">Móviles sin WhatsApp</a></div>
  ${herramienta()}
</section>
<section class="contenedor seccion">
  <h2>Tres fechas <span class="s">deciden cuándo cambiarlo</span></h2>
  <div class="tres">
    <div><h3>Parches de seguridad</h3><p>Arreglan los fallos que usan los estafadores. Sin ellos, el móvil es un riesgo para la banca y el correo. Es la fecha que marca el semáforo.</p></div>
    <div><h3>Versiones del sistema</h3><p>Android o iOS nuevos traen funciones y mantienen la compatibilidad con las apps. Cuando acaban, las apps dejan de funcionar poco a poco.</p></div>
    <div><h3>WhatsApp</h3><p>WhatsApp pide una versión mínima del sistema y la sube cada cierto tiempo. Te avisamos si tu móvil se queda fuera y cuándo.</p></div>
  </div>
</section>
${adSlot}
${ARTICULOS.length ? `<section class="contenedor seccion">
  <h2>Del blog <span class="s">lo último</span></h2>
  ${listaArticulos(ARTICULOS.slice(0, 3))}
  <p><a class="btn btn--claro" href="/blog/">Todos los artículos</a></p>
</section>` : ""}
<section class="contenedor seccion">
  <h2>Todos los móviles <span class="s">que tenemos</span></h2>
  <div class="marcas">${Object.entries(porMarca()).map(([k, l]) => `<div><h3><a href="/marca/${k.toLowerCase()}/">${k}</a></h3>${chipsModelos(l)}</div>`).join("")}</div>
</section>
<section class="contenedor seccion">
  <h2>Preguntas frecuentes</h2>
  ${faqHtml(FAQ_PORTADA)}
</section>`
});

// Fichas de modelo
for (const m of MOVILES) {
  const c = corto(m);
  const f = FUENTES[m.fuente];
  const meses = V.mesesEntre(FECHA, m.finSeguridad);
  const otros = MOVILES.filter((x) => x.marca === m.marca && x.id !== m.id);
  const segunda = meses <= 0
    ? `No, salvo como móvil de repuesto: ya no recibe parches de seguridad. Para uso diario, mejor un modelo con varios años de soporte por delante.`
    : meses <= 18
      ? `Solo si es muy barato. A ${V.fmtDia(FECHA)} le quedan ${meses} meses de parches de seguridad. Divide el precio entre esos meses y compáralo con un modelo más nuevo.`
      : `Puede merecer la pena: a ${V.fmtDia(FECHA)} le quedan unos ${Math.floor(meses / 12)} años de parches de seguridad. Comprueba el estado de la batería y que no esté bloqueado.`;
  const faq = [
    [`¿Hasta cuándo tendrá actualizaciones el ${c}?`, `El ${esc(m.modelo)} ${textoSeguridad(m)} y ${textoSistema(m)}. ${esc(etiquetaPrecision(m))}.`],
    [`¿Hasta cuándo funcionará WhatsApp en el ${c}?`, `WhatsApp en el ${esc(c)} ${textoWhatsapp(m)}.`],
    [`¿Merece la pena comprar un ${c} de segunda mano?`, segunda]
  ];
  const ruta = `/modelo/${m.id}/`;
  paginas[`modelo/${m.id}/index.html`] = pagina({
    ruta, herramienta: true,
    titulo: `${c}: ¿hasta cuándo tendrá actualizaciones?`,
    descripcion: `El ${m.modelo} ${textoSeguridad(m)}. Mira si sigue siendo seguro, hasta cuándo funcionará WhatsApp y si merece la pena de segunda mano.`,
    jsonld: [faqLd(faq), migasLd([["Inicio", "/"], [c, ruta]])],
    cuerpo: `<div class="contenedor">
  <nav class="migas" aria-label="Migas"><a href="/">Inicio</a> › ${esc(m.marca)} › ${esc(c)}</nav>
  <h1 class="pagina-titulo">¿Hasta cuándo tendrá actualizaciones el ${esc(c)}?</h1>
  <p class="prosa">El ${esc(m.modelo)} ${textoSeguridad(m)} y ${textoSistema(m)}. WhatsApp ${textoWhatsapp(m)}.</p>
  ${herramienta(m.id)}
  <section class="seccion prosa">
    <h2>Datos del ${esc(c)}</h2>
    <div class="tabla-scroll"><table class="tabla">
      <tbody>
        <tr><th scope="row">Modelos incluidos</th><td>${esc(m.modelo)}</td></tr>
        <tr><th scope="row">Lanzamiento</th><td>${V.fmtMes(m.lanzamiento)}</td></tr>
        <tr><th scope="row">Salió con</th><td>${so(m, m.soSalida)}</td></tr>
        <tr><th scope="row">${V.mesesEntre(FECHA, m.finSistema) > 0 ? (m.so === "ios" ? "Versión actual" : "Última versión prometida") : "Última versión"}</th><td>${so(m, m.soMax)}</td></tr>
        <tr><th scope="row">Versiones nuevas hasta</th><td>${V.fmtMes(m.finSistema)}</td></tr>
        <tr><th scope="row">Parches de seguridad hasta</th><td>${V.fmtMes(m.finSeguridad)}</td></tr>
        <tr><th scope="row">WhatsApp</th><td>${textoWhatsapp(m).replace(/^./, (x) => x.toUpperCase())}</td></tr>
        <tr><th scope="row">Precisión</th><td>${esc(etiquetaPrecision(m))}</td></tr>
      </tbody>
    </table></div>
    <h2>De dónde sale esta fecha</h2>
    <p>${esc(f.criterio)} Fuente: <a href="${esc(f.url)}" rel="noopener">${esc(f.nombre)}</a>. Datos revisados el ${V.fmtDia(FECHA)}.</p>
  </section>
  ${adSlot}
  <section class="seccion">
    <h2>Preguntas sobre el ${esc(c)}</h2>
    ${faqHtml(faq)}
  </section>
  ${otros.length ? `<section class="seccion marcas"><div><h2>Otros ${esc(m.marca)}</h2>${chipsModelos(otros)}</div></section>` : ""}
</div>`
  });
}

// WhatsApp
const sinWa = MOVILES.filter((m) => V.whatsappHasta(m, WA, FECHA));
const FAQ_WA = [
  ["¿Qué móviles se quedan sin WhatsApp el 30 de noviembre de 2026?", "Los iPhone que no tengan iOS 15.5 o posterior. Los iPhone 6s, 7 y SE (2016) pueden actualizar a iOS 15.8, así que les basta con actualizar. Los iPhone 6 y anteriores ya no tienen WhatsApp desde 2025."],
  ["¿Y en Android?", "Desde el 8 de septiembre de 2026 WhatsApp pide Android 6.0 o posterior. Afecta a móviles de 2015 o antes que se quedaron en Android 5."],
  ["¿Pierdo mis chats si WhatsApp deja de funcionar?", "No, si haces antes una copia de seguridad: en Android, en Google Drive; en iPhone, en iCloud. Después restauras la copia en el móvil nuevo con el mismo número."],
  ["¿Cómo sé qué versión tengo?", `En Android: Ajustes › Acerca del teléfono › Versión de Android. En iPhone: Ajustes › General › Información › Versión de iOS. <a href="/saber-mi-modelo/">Guía paso a paso</a>.`]
];
paginas["whatsapp-dejara-de-funcionar/index.html"] = pagina({
  ruta: "/whatsapp-dejara-de-funcionar/", herramienta: true,
  titulo: "WhatsApp dejará de funcionar en estos móviles (2026)",
  descripcion: "Desde el 30 de noviembre de 2026 WhatsApp pide iOS 15.5 y desde septiembre, Android 6. Comprueba si tu móvil se queda sin WhatsApp y qué hacer.",
  jsonld: [faqLd(FAQ_WA)],
  cuerpo: `<div class="contenedor">
  <h1 class="pagina-titulo">WhatsApp dejará de funcionar <span class="s">en estos móviles</span></h1>
  <div class="prosa">
    <p>WhatsApp solo funciona con una versión mínima del sistema, y la sube cada cierto tiempo. Estos son los mínimos según su centro de ayuda, comprobados el ${V.fmtDia(WA.comprobado)}:</p>
    <div class="tabla-scroll"><table class="tabla">
      <thead><tr><th>Sistema</th><th>Versión mínima</th><th>Desde</th></tr></thead>
      <tbody>
        ${WA.android.map((c) => `<tr><td>Android</td><td>Android ${c.min.toFixed(1)}</td><td>${V.fmtDia(c.desde)}</td></tr>`).join("")}
        ${WA.ios.map((c) => `<tr><td>iPhone</td><td>iOS ${c.min}</td><td>${V.fmtDia(c.desde)}</td></tr>`).join("")}
      </tbody>
    </table></div>
    <p class="nota">Fuente: <a href="${WA.fuente}" rel="noopener">WhatsApp, «Acerca de los sistemas operativos compatibles»</a>.</p>
  </div>
  ${herramienta()}
  <section class="seccion prosa">
    <h2>Modelos de nuestra lista afectados</h2>
    <ul>${sinWa.map((m) => { const w = V.whatsappHasta(m, WA, FECHA); return `<li><a href="/modelo/${m.id}/">${esc(m.modelo)}</a>: ${w.ya ? "sin WhatsApp desde el " + V.fmtDia(w.fecha) : "hasta el " + V.fmtDia(w.fecha)} (se quedó en ${so(m, m.soMax)}).</li>`; }).join("")}</ul>
    <p>El resto de los modelos de la lista cumplen los mínimos actuales. Busca el tuyo arriba para ver también hasta cuándo recibe parches de seguridad.</p>
  </section>
  ${adSlot}
  <section class="seccion"><h2>Preguntas frecuentes</h2>${faqHtml(FAQ_WA)}</section>
</div>`
});

// iOS 27
const ios = MOVILES.filter((m) => m.so === "ios");
const conIos27 = ios.filter((m) => m.soMax >= 27), sinIos27 = ios.filter((m) => m.soMax < 27);
paginas["ios-27-iphone-compatibles/index.html"] = pagina({
  ruta: "/ios-27-iphone-compatibles/",
  titulo: "iOS 27: qué iPhone son compatibles y cuáles se quedan fuera",
  descripcion: "Lista de iPhone compatibles con iOS 27 según Apple: del iPhone 11 y el SE (2020) en adelante. Mira hasta cuándo se actualizará el tuyo.",
  jsonld: [migasLd([["Inicio", "/"], ["iOS 27", "/ios-27-iphone-compatibles/"]])],
  cuerpo: `<div class="contenedor prosa">
  <h1 class="pagina-titulo">iOS 27: <span class="s">qué iPhone son compatibles</span></h1>
  <p>Según la <a href="${FUENTES.apple.url}" rel="noopener">lista oficial de Apple</a>, iOS 27 funciona en los mismos iPhone que iOS 26: el iPhone 11 y posteriores y el iPhone SE (2020) y posteriores. Este año ningún iPhone se ha quedado fuera.</p>
  <h2>Compatibles con iOS 27</h2>
  <ul>${conIos27.map((m) => `<li><a href="/modelo/${m.id}/">${esc(m.modelo)}</a>: versiones nuevas hasta ${V.fmtMes(m.finSistema)} y parches hasta ${V.fmtMes(m.finSeguridad)} (estimado).</li>`).join("")}</ul>
  <h2>Sin iOS 27</h2>
  <ul>${sinIos27.map((m) => `<li><a href="/modelo/${m.id}/">${esc(m.modelo)}</a>: se quedó en ${so(m, m.soMax)}.</li>`).join("")}</ul>
  <h2>¿Cuál será el próximo en quedarse fuera?</h2>
  <p>Por cómo ha actuado Apple, lo más probable es que el iPhone 11 sea el primero en no recibir la versión de 2027. Aun así, seguiría recibiendo parches de seguridad unos dos años más. ${esc(FUENTES.apple.criterio)}</p>
  ${adSlot}
</div>`
});

// Android 17
const android = MOVILES.filter((m) => m.so === "android");
const con17 = android.filter((m) => m.soMax >= 17), sin17 = android.filter((m) => m.soMax < 17);
paginas["android-17-moviles-compatibles/index.html"] = pagina({
  ruta: "/android-17-moviles-compatibles/",
  titulo: "Android 17: qué móviles lo recibirán (Samsung, Pixel, Xiaomi)",
  descripcion: "Qué Samsung, Google Pixel y Xiaomi recibirán Android 17 según las actualizaciones que promete cada marca, y cuáles se quedan sin él.",
  jsonld: [migasLd([["Inicio", "/"], ["Android 17", "/android-17-moviles-compatibles/"]])],
  cuerpo: `<div class="contenedor prosa">
  <h1 class="pagina-titulo">Android 17: <span class="s">qué móviles lo recibirán</span></h1>
  <p>Cada marca promete un número de versiones de Android para cada modelo. Con esa promesa calculamos quién llega a Android 17, la versión de 2026. La fecha exacta de llegada depende de cada marca y de tu país.</p>
  <h2>Lo reciben o lo recibirán</h2>
  <ul>${con17.map((m) => `<li><a href="/modelo/${m.id}/">${esc(m.modelo)}</a>: hasta ${so(m, m.soMax)}.</li>`).join("")}</ul>
  <h2>Se quedan sin Android 17</h2>
  <ul>${sin17.map((m) => `<li><a href="/modelo/${m.id}/">${esc(m.modelo)}</a>: su última versión es ${so(m, m.soMax)}.</li>`).join("")}</ul>
  <p class="nota">Solo incluye los modelos de nuestra lista. Fuentes: ${["samsung", "pixel", "xiaomi"].map((k) => `<a href="${FUENTES[k].url}" rel="noopener">${esc(FUENTES[k].nombre)}</a>`).join(", ")}.</p>
  ${adSlot}
</div>`
});

// Saber mi modelo
paginas["saber-mi-modelo/index.html"] = pagina({
  ruta: "/saber-mi-modelo/",
  titulo: "Cómo saber qué modelo de móvil tengo y su versión",
  descripcion: "Dónde ver el modelo exacto, la versión de Android o iOS y el último parche de seguridad en iPhone, Samsung, Xiaomi y Pixel, paso a paso.",
  jsonld: [migasLd([["Inicio", "/"], ["Saber mi modelo", "/saber-mi-modelo/"]])],
  cuerpo: `<div class="contenedor prosa">
  <h1 class="pagina-titulo">Cómo saber <span class="s">qué móvil tienes</span></h1>
  <p>Si entras desde un Android, la herramienta de la <a href="/">portada</a> intenta reconocer el modelo sola. En iPhone no es posible: el navegador no lo dice, así que hay que mirarlo en los ajustes.</p>
  <h2>iPhone</h2>
  <ol><li>Abre Ajustes › General › Información.</li><li>En «Nombre del modelo» verás, por ejemplo, «iPhone 13».</li><li>En «Versión de iOS» verás la versión instalada.</li></ol>
  <h2>Samsung Galaxy</h2>
  <ol><li>Abre Ajustes › Acerca del teléfono.</li><li>Arriba sale el nombre (por ejemplo, «Galaxy A54 5G») y el número de modelo (SM-A546B).</li><li>En Información de software verás la versión de Android y el «Nivel de parche de seguridad».</li></ol>
  <h2>Xiaomi, Redmi y POCO</h2>
  <ol><li>Abre Ajustes › Sobre el teléfono.</li><li>Verás el nombre del modelo, la versión de HyperOS y la de Android.</li></ol>
  <h2>Google Pixel</h2>
  <ol><li>Abre Ajustes › Información del teléfono › Modelo.</li><li>En Ajustes › Sistema › Actualización de software verás la versión de Android y el parche de seguridad.</li></ol>
  <h2>¿Qué es el «parche de seguridad»?</h2>
  <p>Es la fecha de la última corrección de seguridad que tiene tu móvil. Si tiene más de unos meses y no aparecen actualizaciones nuevas, es probable que el fabricante ya no lo mantenga. <a href="/#herramienta">Compruébalo con tu modelo</a>.</p>
  ${adSlot}
</div>`
});

// Tabla de modelos con sus fechas (marcas, años y ranking)
function tablaModelos(lista) {
  return `<div class="tabla-scroll"><table class="tabla">
    <thead><tr><th>Modelo</th><th>Lanzamiento</th><th>Versiones hasta</th><th>Parches hasta</th></tr></thead>
    <tbody>${lista.map((m) => `<tr><td><a href="/modelo/${m.id}/">${esc(m.modelo)}</a></td><td>${V.fmtMes(m.lanzamiento)}</td><td>${so(m, m.soMax)}</td><td>${V.fmtMes(m.finSeguridad)}${m.precision === "estimado" ? " (estimado)" : ""}</td></tr>`).join("")}</tbody>
  </table></div>`;
}
const porFinDesc = (a, b) => (a.finSeguridad < b.finSeguridad ? 1 : -1);

// Páginas por marca
const SLUG_MARCA = { Apple: "apple", Samsung: "samsung", Google: "google", Xiaomi: "xiaomi" };
const NOMBRE_MARCA = { Apple: "iPhone", Samsung: "Samsung Galaxy", Google: "Google Pixel", Xiaomi: "Xiaomi, Redmi y POCO" };
for (const [marca, lista] of Object.entries(porMarca())) {
  const ruta = `/marca/${SLUG_MARCA[marca]}/`;
  const f = FUENTES[lista[0].fuente];
  const vigentes = lista.filter((m) => V.mesesEntre(FECHA, m.finSeguridad) > 0).sort(porFinDesc);
  const acabados = lista.filter((m) => V.mesesEntre(FECHA, m.finSeguridad) <= 0).sort(porFinDesc);
  paginas[`marca/${SLUG_MARCA[marca]}/index.html`] = pagina({
    ruta, herramienta: true,
    titulo: `¿Hasta cuándo actualiza ${NOMBRE_MARCA[marca]}? Fechas por modelo`,
    descripcion: `Fechas de fin de actualizaciones y de parches de seguridad de cada ${NOMBRE_MARCA[marca]}, con la política oficial de ${marca}. Mira cuáles siguen siendo seguros.`,
    jsonld: [migasLd([["Inicio", "/"], [NOMBRE_MARCA[marca], ruta]])],
    cuerpo: `<div class="contenedor">
  <nav class="migas" aria-label="Migas"><a href="/">Inicio</a> › ${esc(NOMBRE_MARCA[marca])}</nav>
  <h1 class="pagina-titulo">¿Hasta cuándo actualiza ${esc(marca)}? <span class="s">Modelo a modelo</span></h1>
  <div class="prosa">
    <p>${esc(f.criterio)} Fuente: <a href="${esc(f.url)}" rel="noopener">${esc(f.nombre)}</a>.</p>
    <h2>Siguen recibiendo parches (${vigentes.length})</h2>
    ${vigentes.length ? tablaModelos(vigentes) : "<p>Ninguno de nuestra lista.</p>"}
    ${acabados.length ? `<h2>Ya sin parches de seguridad (${acabados.length})</h2>${tablaModelos(acabados)}` : ""}
  </div>
  ${adSlot}
  ${herramienta()}
</div>`
  });
}

// Móviles que se quedan sin actualizaciones cada año
for (const anio of ["2026", "2027"]) {
  const lista = MOVILES.filter((m) => m.finSeguridad.slice(0, 4) === anio).sort((a, b) => (a.finSeguridad > b.finSeguridad ? 1 : -1));
  const ruta = `/moviles-sin-actualizaciones-${anio}/`;
  paginas[`moviles-sin-actualizaciones-${anio}/index.html`] = pagina({
    ruta, herramienta: true,
    titulo: `Móviles que se quedan sin actualizaciones en ${anio}`,
    descripcion: `Lista de iPhone, Samsung, Pixel y Xiaomi que reciben su último parche de seguridad en ${anio}, mes a mes, con la fuente oficial de cada marca.`,
    jsonld: [migasLd([["Inicio", "/"], [`Sin actualizaciones en ${anio}`, ruta]])],
    cuerpo: `<div class="contenedor">
  <h1 class="pagina-titulo">Móviles que se quedan sin actualizaciones <span class="s">en ${anio}</span></h1>
  <div class="prosa">
    <p>Estos ${lista.length} modelos reciben su último parche de seguridad en ${anio}. Desde ese mes siguen funcionando, pero los fallos nuevos ya no se arreglan. Para la banca y las compras, conviene cambiarlos en los meses siguientes.</p>
    ${tablaModelos(lista)}
    <p class="nota">Solo incluye los modelos de nuestra lista. Las fechas de iPhone son estimadas porque Apple no las publica.</p>
  </div>
  ${adSlot}
  ${herramienta()}
</div>`
  });
}

// Ranking de más años de actualizaciones
const ranking = MOVILES.slice().sort(porFinDesc).slice(0, 20);
paginas["moviles-con-mas-actualizaciones/index.html"] = pagina({
  ruta: "/moviles-con-mas-actualizaciones/", herramienta: true,
  titulo: "Los móviles con más años de actualizaciones (2026)",
  descripcion: "Los 20 móviles de nuestra lista que recibirán parches de seguridad durante más tiempo. Útil para elegir un móvil que te dure muchos años.",
  jsonld: [migasLd([["Inicio", "/"], ["Más actualizaciones", "/moviles-con-mas-actualizaciones/"]])],
  cuerpo: `<div class="contenedor">
  <h1 class="pagina-titulo">Los móviles con más años <span class="s">de actualizaciones</span></h1>
  <div class="prosa">
    <p>Si quieres que tu próximo móvil dure, fíjate en hasta cuándo recibe parches de seguridad, no solo en el precio. Estos son los 20 modelos de nuestra lista con el soporte más largo, ordenados de más a menos.</p>
    ${tablaModelos(ranking)}
    <p>Los Galaxy S24 y posteriores, los Pixel 8 y posteriores y los Xiaomi más recientes ya prometen entre 6 y 7 años. Además, desde el 20 de junio de 2025 el <a href="/blog/ley-europea-5-anos-actualizaciones-moviles/">Reglamento (UE) 2023/1670</a> obliga a seguir dando actualizaciones del sistema al menos 5 años después de que un modelo deje de venderse en la UE.</p>
  </div>
  ${adSlot}
  ${herramienta()}
</div>`
});

// Blog: índice y artículos
paginas["blog/index.html"] = pagina({
  ruta: "/blog/",
  titulo: "Blog: actualizaciones, WhatsApp y vida útil de los móviles",
  descripcion: "Noticias y guías sobre el fin de las actualizaciones de los móviles, los cortes de WhatsApp y cómo elegir un móvil que dure, con fuentes oficiales.",
  jsonld: [migasLd([["Inicio", "/"], ["Blog", "/blog/"]])],
  cuerpo: `<div class="contenedor">
  <h1 class="pagina-titulo">Blog <span class="s">de la vida de tu móvil</span></h1>
  <p class="prosa">Noticias y guías sobre actualizaciones, WhatsApp y cuándo cambiar de móvil. Cada dato enlaza a su fuente oficial.</p>
  ${listaArticulos(ARTICULOS)}
</div>`
});
for (const a of ARTICULOS) {
  const ruta = `/blog/${a.slug}/`;
  const modelos = (a.modelos || []).map((id) => MOVILES.find((x) => x.id === id));
  const otros = ARTICULOS.filter((x) => x.slug !== a.slug).slice(0, 3);
  paginas[`blog/${a.slug}/index.html`] = pagina({
    ruta, herramienta: true, titulo: a.titulo, descripcion: a.descripcion,
    jsonld: [
      { "@context": "https://schema.org", "@type": "Article", headline: a.titulo, description: a.descripcion, datePublished: a.fecha, dateModified: a.modificado || a.fecha, inLanguage: "es", author: { "@type": "Person", name: TITULAR.nombre }, publisher: { "@type": "Organization", name: MARCA }, mainEntityOfPage: URL_BASE + ruta },
      migasLd([["Inicio", "/"], ["Blog", "/blog/"], [a.titulo, ruta]])
    ],
    cuerpo: `<div class="contenedor">
  <nav class="migas" aria-label="Migas"><a href="/">Inicio</a> › <a href="/blog/">Blog</a></nav>
  <article class="prosa articulo">
    <h1 class="pagina-titulo">${esc(a.titulo)}</h1>
    <p class="nota">Por ${TITULAR.nombre}, ${V.fmtDia(a.fecha)}${a.modificado ? `. Actualizado el ${V.fmtDia(a.modificado)}` : ""}.</p>
    ${a.cuerpo}
    ${modelos.length ? `<h2>Móviles de este artículo</h2><div class="marcas">${chipsModelos(modelos)}</div>` : ""}
    ${(a.fuentes || []).length ? `<h2>Fuentes</h2><ul>${a.fuentes.map(([n, u]) => `<li><a href="${esc(u)}" rel="noopener">${esc(n)}</a></li>`).join("")}</ul>` : ""}
  </article>
  ${adSlot}
  ${herramienta()}
  ${otros.length ? `<section class="seccion"><h2>Sigue leyendo</h2>${listaArticulos(otros)}</section>` : ""}
</div>`
  });
}

// Páginas legales y de confianza
const legal = (archivo, titulo, descripcion, html, robots) => {
  paginas[archivo] = pagina({ ruta: "/" + archivo, titulo: titulo + " | " + MARCA, descripcion, robots, cuerpo: `<div class="contenedor prosa"><h1 class="pagina-titulo">${titulo}</h1>${html}</div>` });
};
legal("quienes-somos.html", "Quiénes somos y cómo calculamos", "Quién hace CaducaMóvil, de dónde salen las fechas de actualizaciones de cada móvil y cómo se calculan los tres niveles de precisión.", `
<p>${MARCA} es una web gratuita hecha por ${TITULAR.nombre}, desde Tarazona (Zaragoza). Nació de una pregunta que todos nos hacemos: ¿hasta cuándo me sirve este móvil? Las marcas publican la respuesta, pero cada una en un sitio y de una forma distinta. Aquí está todo junto y en castellano claro.</p>
<h2>De dónde salen las fechas</h2>
<ul>${Object.values(FUENTES).map((f) => `<li><a href="${f.url}" rel="noopener">${esc(f.nombre)}</a>. ${esc(f.criterio)}</li>`).join("")}
<li><a href="${WA.fuente}" rel="noopener">WhatsApp: sistemas operativos compatibles</a>. Versiones mínimas y fechas de corte.</li></ul>
<h2>Tres niveles de precisión</h2>
<p><strong>Oficial</strong>: la marca publica el mes exacto. <strong>Política oficial</strong>: la marca promete años de actualizaciones y los contamos desde el lanzamiento. <strong>Estimado</strong>: la marca no publica nada y lo deducimos de lo que ha hecho antes; siempre lo decimos.</p>
<h2>Independencia</h2>
<p>No tenemos relación con ninguna marca ni cobramos por aparecer. La web se mantiene con publicidad. Revisamos los datos cada mes; la última revisión fue el ${V.fmtDia(FECHA)}.</p>
<h2>¿Ves un error?</h2>
<p>Escríbenos a <a href="mailto:${EMAIL}">${EMAIL}</a> con el modelo y el enlace a la fuente oficial, y lo corregimos.</p>`);
legal("contacto.html", "Contacto", "Cómo contactar con CaducaMóvil para corregir un dato de actualizaciones o proponer un modelo de móvil nuevo.", `
<p>Para corregir un dato, proponer un modelo o cualquier otra cosa, escribe a <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<p>Si es una corrección, incluye el modelo y el enlace a la página oficial de la marca. Respondemos en unos días.</p>`);
legal("aviso-legal.html", "Aviso legal", "Datos del titular de CaducaMóvil, condiciones de uso de la información y aviso sobre las marcas citadas en la web.", `
<p>En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico:</p>
<ul><li>Titular: ${TITULAR.nombre}</li><li>NIF: ${TITULAR.nif}</li><li>Domicilio: ${TITULAR.domicilio}</li><li>Correo: <a href="mailto:${EMAIL}">${EMAIL}</a></li><li>Sitio web: ${URL_BASE.replace("https://", "")}</li></ul>
<h2>Uso de la información</h2>
<p>Las fechas son orientativas y salen de fuentes oficiales de cada marca, enlazadas en cada ficha. Cuando la marca no publica fechas, lo indicamos como estimación. Las marcas pueden cambiar sus políticas; ante la duda, consulta la fuente oficial. ${MARCA} no se hace responsable de decisiones tomadas solo con esta información.</p>
<h2>Marcas</h2>
<p>iPhone e iOS son marcas de Apple Inc.; Galaxy, de Samsung; Pixel y Android, de Google; Redmi y Xiaomi, de Xiaomi. Se citan solo para identificar los productos.</p>`);
legal("privacidad.html", "Política de privacidad", "Qué datos trata CaducaMóvil: ninguno de lo que buscas, que no sale de tu navegador; analítica solo si la aceptas.", `
<p>Responsable: ${TITULAR.nombre} (NIF ${TITULAR.nif}), <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<h2>Lo que buscas no sale de tu dispositivo</h2>
<p>La herramienta funciona en tu navegador. El modelo que escribes, el precio y el modelo que detecta tu navegador no se envían a ningún servidor.</p>
<h2>Analítica, solo con tu permiso</h2>
<p>Si aceptas las cookies analíticas, usamos Google Analytics 4 para contar visitas y consultas, sin señales de Google ni personalización de anuncios. Base legal: tu consentimiento (art. 6.1.a del RGPD). Puedes retirarlo en cualquier momento en <a href="/cookies.html">Cookies</a>. Google puede tratar datos fuera del EEE con las garantías del Marco de Privacidad de Datos UE-EE. UU.</p>
<p data-cmp-google hidden>Esta web muestra anuncios de Google AdSense. El aviso de consentimiento de Google te deja elegir qué aceptas.</p>
<h2>Tus derechos</h2>
<p>Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo al correo de arriba, y reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>`);
legal("cookies.html", "Política de cookies", "Qué cookies usa CaducaMóvil: solo tu elección guardada en el navegador y, si la aceptas, la analítica de Google.", `
<p data-cmp-propio>Solo guardamos tu elección sobre las cookies en tu navegador (almacenamiento local «cm:consent:v1», técnica y necesaria, 24 meses). Si aceptas la analítica, Google Analytics crea las cookies «_ga» y «_ga_*» (hasta 2 años) para contar visitas.</p>
<p data-cmp-google hidden>Las cookies las gestiona el aviso de consentimiento de Google: publicidad de AdSense y analítica de Google Analytics, según lo que elijas.</p>
<p><button type="button" class="btn btn--claro" data-consent-open hidden>Cambiar mi elección</button></p>`);

// 404
paginas["404.html"] = pagina({
  ruta: "/404.html", robots: "noindex", herramienta: true,
  titulo: "Página no encontrada | " + MARCA,
  descripcion: "Esta página no existe o ha cambiado de dirección. Busca tu móvil desde aquí para ver hasta cuándo se actualiza.",
  cuerpo: `<section class="contenedor hero"><h1 class="titular">Esta página <span class="s">no existe.</span></h1><p class="entradilla">Puede que el enlace esté mal escrito. Busca tu móvil aquí abajo.</p>${herramienta()}</section>`
});

// Sitemap, robots y favicon
const indexables = Object.keys(paginas).filter((k) => k !== "404.html").map((k) => "/" + k.replace(/index\.html$/, ""));
paginas["sitemap.xml"] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexables.map((u) => `  <url><loc>${URL_BASE}${u}</loc><lastmod>${FECHA}</lastmod></url>`).join("\n")}
</urlset>
`;
paginas["robots.txt"] = `User-agent: *\nAllow: /\n\nSitemap: ${URL_BASE}/sitemap.xml\n`;
paginas["favicon.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1a1a18"/><rect x="9" y="5" width="14" height="22" rx="4" fill="none" stroke="#f4f4f1" stroke-width="2.4"/><rect x="12" y="15" width="8" height="9" rx="1.6" fill="#1e9e58"/></svg>\n`;

// ---------------- Escribir o comprobar ----------------
const comprobar = process.argv.includes("--comprobar");
let distintas = 0;
for (const [rel, contenido] of Object.entries(paginas)) {
  const destino = path.join(RAIZ, rel);
  const actual = fs.existsSync(destino) ? fs.readFileSync(destino, "utf8") : null;
  if (comprobar) {
    if (actual !== contenido) { distintas++; console.log("DISTINTA: " + rel); }
    continue;
  }
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  if (actual !== contenido) fs.writeFileSync(destino, contenido);
}
// Comprobaciones SEO mínimas
for (const [rel, html] of Object.entries(paginas)) {
  if (!rel.endsWith(".html")) continue;
  const t = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const d = (html.match(/name="description" content="([^"]*)"/) || [])[1] || "";
  if (t.length > 70) console.log(`AVISO título largo (${t.length}): ${rel}`);
  if (d.length < 70 || d.length > 200) console.log(`AVISO descripción (${d.length}): ${rel}`);
  if ((html.match(/<h1/g) || []).length !== 1) console.log("AVISO h1: " + rel);
}
if (comprobar) {
  if (distintas) { console.log(`${distintas} página(s) desactualizada(s): ejecuta node tools/generar.js`); process.exit(1); }
  console.log(`OK: las ${Object.keys(paginas).length} páginas coinciden con los datos`);
} else {
  console.log(`Generadas ${Object.keys(paginas).length} páginas (${MOVILES.length} modelos)`);
}
