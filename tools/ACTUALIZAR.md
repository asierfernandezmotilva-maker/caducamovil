# Actualización automática de CaducaMóvil (cada 3 días)

Instrucciones para la rutina en la nube (y para cualquier sesión que actualice la web a mano).
La web es estática: los datos están en `lib/moviles.js` y `lib/whatsapp.js`, y los artículos en `contenido/blog/`.
`node tools/generar.js` crea todas las páginas. Publicar = `git push` a `main` (GitHub Pages despliega solo).

## Reglas que no se saltan

- **Solo datos verificados en la fuente oficial** de la marca (o la tabla AER de Xiaomi). Nunca inventar una fecha.
  Si la marca no publica fechas, `precision: "estimado"` con el criterio de `FUENTES`.
- **Un artículo solo si aporta algo**: una novedad real (corte de WhatsApp, fin de soporte, lanzamiento, cambio de
  política, norma nueva) o una guía útil que aún no exista. Comprobar antes que el tema no está ya en `contenido/blog/`.
- Cada dato del artículo, con su fuente en `"fuentes"`. Castellano claro, frases cortas, sin relleno, 400–800 palabras.
- No tocar el aviso legal, los datos del titular, el consentimiento ni los anuncios.
- Si alguna prueba falla, **no publicar**: arreglar o dejarlo como estaba.

## Pasos de cada actualización

1. **Revisar fuentes** (y anotar qué ha cambiado):
   - WhatsApp: https://faq.whatsapp.com/1150261202542208/?locale=es_LA → `lib/whatsapp.js` (añadir cortes nuevos con fecha).
   - Apple: lista de iPhone compatibles con la última versión de iOS → `soMax` de los iPhone y la página de iOS.
   - Google Pixel: https://support.google.com/pixelphone/answer/4457705?hl=es
   - Samsung: https://security.samsungmobile.com/workScope.smsb (modelos que pasan a trimestral/semestral o salen de la lista).
   - Xiaomi: tabla AER del Xiaomi Security Center (https://trust.mi.com/security; copia legible en
     https://en.xiaomi-miui.gr/xiaomi-aer-security-updates-eol-2026-full-list/).
   - Noticias: buscar «dejará de recibir actualizaciones», «fin de soporte», «WhatsApp dejará de funcionar»,
     y lanzamientos nuevos de Samsung, Apple, Google, Xiaomi, Motorola, OPPO, realme y Honor.
2. **Datos**: corregir lo que haya cambiado y añadir de 1 a 5 modelos nuevos muy buscados con política oficial.
   Formato en el comentario de `lib/moviles.js`. Alias: nombres comerciales y códigos de modelo (p. ej. `SM-S931`).
   Una marca nueva necesita su entrada en `FUENTES` y en `SLUG_MARCA`/`NOMBRE_MARCA` de `tools/generar.js`.
3. **Artículo** (si procede): `contenido/blog/<slug>.html` con la cabecera
   `<!--{"titulo":"…","descripcion":"…","fecha":"AAAA-MM-DD","modelos":["id",…],"fuentes":[["Nombre","https://…"]]}-->`
   Título de 70 caracteres como mucho; descripción de 120 a 160. Si se actualiza un artículo viejo, añadir `"modificado"`.
4. **Fecha**: `updated` de `lib/manifest.js` = hoy.
5. **Comprobar**:
   ```bash
   node tools/test-vida-movil.js
   node tools/generar.js
   node tools/generar.js --comprobar
   cd tools && npm ci && npx playwright install --with-deps chromium && npx playwright test --project=escritorio --project=movil
   ```
6. **Publicar**: `git add -A && git commit -m "Actualización AAAA-MM-DD: …" && git push`.
   Mensaje del commit en castellano, con lo que ha cambiado.
7. **Si hay dominio propio** (lib/manifest.js sin `/caducamovil/`), avisar a Bing/Yandex con IndexNow (pendiente).
