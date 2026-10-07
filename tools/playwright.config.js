// Pruebas de extremo a extremo de CaducaMóvil (copiado de InfoContrato). Solo desarrollo: tools/ no se publica.
// Uso:  cd caducamovil/tools && npm ci && npx playwright test
//       CM_BASE=https://caducamovil.com npx playwright test   → contra la web publicada
const { defineConfig, devices } = require("@playwright/test");

const WIN = process.platform === "win32";
const CHROME = WIN ? { channel: "chrome" } : {};
const PYTHON = WIN ? "python" : "python3";

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: process.env.CM_BASE || "http://127.0.0.1:8141",
    locale: "es-ES",
    timezoneId: "Europe/Madrid",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "movil", use: { ...CHROME, viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: devices["Pixel 7"].userAgent } },
    { name: "escritorio", use: { ...CHROME, viewport: { width: 1280, height: 800 } } },
    { name: "iphone", use: { ...devices["iPhone 13"] } }
  ],
  webServer: { command: PYTHON + " servidor.py 8141", cwd: __dirname, url: "http://127.0.0.1:8141", reuseExistingServer: true, timeout: 30000 }
});
