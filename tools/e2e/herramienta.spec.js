// Pruebas de la herramienta y de las páginas. Fecha fija: 7 de octubre de 2026.
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

const HOY = new Date("2026-10-07T10:00:00+02:00");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(HOY);
  // Sin banner de cookies para no tapar la herramienta (el banner se prueba aparte)
  await page.addInitScript(() => localStorage.setItem("cm:consent:v1", JSON.stringify({ analitica: false, fecha: new Date().toISOString() })));
});

function erroresDeConsola(page) {
  const errores = [];
  page.on("pageerror", (e) => errores.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g/.test(m.text())) errores.push(m.text()); });
  return errores;
}

test("buscar un modelo muestra semáforo, batería y fechas", async ({ page }) => {
  const errores = erroresDeConsola(page);
  await page.goto("/");
  await page.getByLabel("¿Qué móvil tienes?").fill("s23 ultra");
  await page.getByLabel("¿Qué móvil tienes?").press("Enter");
  const r = page.locator("#cm-resultado .resultado");
  await expect(r.getByRole("heading")).toHaveText("Galaxy S23, S23+ y S23 Ultra");
  await expect(r.locator(".semaforo")).toHaveText("Sigue");
  await expect(r).toContainText("febrero de 2028");
  await expect(r.locator(".bateria-cifra")).toContainText("1,3 años");
  await expect(page.locator(".mascota").first()).toHaveAttribute("data-cara", "verde");
  expect(errores).toEqual([]);
});

test("las sugerencias llevan al resultado y un iPhone 6 sale en rojo sin WhatsApp", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("¿Qué móvil tienes?").fill("iphone 6");
  await page.getByRole("button", { name: "iPhone 6 y 6 Plus" }).click();
  const r = page.locator("#cm-resultado .resultado");
  await expect(r.locator(".semaforo")).toHaveText("Cámbialo ya");
  await expect(r).toContainText("WhatsApp ya no funciona");
  await expect(page.locator(".mascota").first()).toHaveAttribute("data-cara", "rojo");
});

test("un modelo que no tenemos da una indicación clara", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("¿Qué móvil tienes?").fill("nokia 3310");
  await expect(page.locator("#cm-sugerencias")).toContainText("Todavía no tenemos ese modelo");
});

test("comparar ordena de más a menos vida", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Comparar" }).click();
  await page.getByLabel("Primer móvil").selectOption("galaxy-s21");
  await page.getByLabel("Segundo móvil").selectOption("iphone-13");
  await page.getByLabel("Tercero (opcional)").selectOption("galaxy-a54");
  const filas = page.locator("#cm-comparar-resultado tbody tr");
  await expect(filas).toHaveCount(3);
  await expect(filas.nth(0)).toContainText("iPhone 13");
  await expect(filas.nth(2)).toContainText("Galaxy S21");
});

test("segunda mano calcula el coste por año", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Segunda mano" }).click();
  await page.getByLabel("Modelo").selectOption("galaxy-a54");
  await page.getByLabel("Precio que te piden (€)").fill("300");
  await expect(page.locator("#cm-sm-resultado")).toContainText("unos 200 € por cada año");
  await page.getByLabel("Modelo").selectOption("galaxy-s21");
  await expect(page.locator("#cm-sm-resultado")).toContainText("No lo compres para uso diario");
});

test("las pestañas se manejan con el teclado", async ({ page, isMobile }) => {
  test.skip(isMobile, "teclado físico solo en escritorio");
  await page.goto("/");
  await page.getByRole("tab", { name: "Buscar" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Comparar" })).toBeFocused();
  await expect(page.locator("#p-comparar")).toBeVisible();
  await expect(page.locator("#p-buscar")).toBeHidden();
});

test("la ficha de un modelo muestra su resultado directamente", async ({ page }) => {
  await page.goto("/modelo/pixel-7/");
  await expect(page.locator("h1")).toHaveText("¿Hasta cuándo tendrá actualizaciones el Pixel 7?");
  const r = page.locator("#cm-resultado .resultado");
  await expect(r.locator(".semaforo")).toHaveText("Cámbialo pronto");
  await expect(r).toContainText("octubre de 2027");
  expect(await page.locator('script[type="application/ld+json"]').first().evaluate((s) => s.textContent)).toContain("FAQPage");
});

test("el blog lista los artículos y cada uno abre con su título y fuentes", async ({ page }) => {
  await page.goto("/caducamovil/blog/");
  const enlaces = page.locator(".articulos a");
  expect(await enlaces.count()).toBeGreaterThanOrEqual(6);
  await page.getByRole("link", { name: /WhatsApp dejará de funcionar el 30 de noviembre/ }).click();
  await expect(page.locator("h1")).toContainText("WhatsApp dejará de funcionar el 30 de noviembre");
  await expect(page.getByRole("heading", { name: "Fuentes" })).toBeVisible();
  await expect(page).toHaveURL(/\/caducamovil\/blog\/whatsapp-ios-15-5-30-noviembre\/$/);
});

test("todas las páginas del sitemap cargan con un h1 y sin errores", async ({ page, request }, info) => {
  test.skip(info.project.name !== "escritorio", "basta con un navegador");
  const xml = await (await request.get("/sitemap.xml")).text();
  const rutas = [...xml.matchAll(/<loc>https:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
  expect(rutas.length).toBeGreaterThan(60);
  const errores = erroresDeConsola(page);
  for (const ruta of rutas) {
    const resp = await page.goto(ruta);
    expect(resp.status(), ruta).toBe(200);
    await expect(page.locator("h1"), ruta).toHaveCount(1);
  }
  expect(errores).toEqual([]);
});

test("accesibilidad: sin fallos graves en portada, ficha y WhatsApp", async ({ page }) => {
  for (const ruta of ["/", "/modelo/galaxy-a54/", "/whatsapp-dejara-de-funcionar/"]) {
    await page.goto(ruta);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const graves = r.violations.filter((v) => ["serious", "critical"].includes(v.impact));
    expect(graves.map((v) => v.id + ": " + v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")), ruta).toEqual([]);
  }
});

test("el banner de cookies aparece y recuerda la decisión", async ({ browser }, info) => {
  const ctx = await browser.newContext({ baseURL: info.project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto("/");
  const banner = page.getByRole("dialog", { name: "Cookies" });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Rechazar" }).click();
  await expect(banner).toBeHidden();
  await page.reload();
  await expect(page.getByRole("dialog", { name: "Cookies" })).toHaveCount(0);
  await ctx.close();
});
