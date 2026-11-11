# Web de Kuri Studio

Web de presentación con asistente de IA, lista para publicar en un dominio propio con Netlify.

## Qué hay en la carpeta

- `index.html`, `styles.css`, `app.js`: la web, el chat y la galería.
- `trabajos.js`: **la lista de fotos de la sección Trabajos.** Para añadir fotos, mira «Añadir trabajos» más abajo.
- `assets/img/`: las fotos. **Sustitúyelas por las originales en buena calidad** con el mismo nombre de archivo.
- `privacidad.html`: plantilla de política de privacidad. **Completa lo marcado entre corchetes.**
- `netlify/functions/chat.mjs`: el servidor del asistente. Aquí está toda la información que conoce (servicios, precios, normas). **Si cambian precios, edítalos aquí.**
- `netlify.toml`: configuración de Netlify.
- `robots.txt` y `sitemap.xml`: para que Google encuentre la web.
- `build.mjs` y `package.json`: al publicar, Netlify comprime la web y cifra (ofusca) el código, así que lo que se ve desde el navegador es ilegible. Tú editas siempre los archivos normales de aquí; Netlify hace el resto solo.

## Cómo funciona el asistente

La web llama a `/api/chat`, una función que corre en los servidores de Netlify. Esa función añade la información del estudio y pregunta a Claude (la IA de Anthropic) con una clave secreta que nunca llega al navegador. Además:

- limita a 20 mensajes por persona cada 10 minutos y recorta mensajes muy largos;
- solo acepta peticiones desde vuestro dominio (variable `ALLOWED_ORIGINS`);
- si algo falla, el chat muestra el WhatsApp y el enlace de Booksy.

## Publicar paso a paso

### 1. Clave de la API de Claude
1. Crea una cuenta en https://console.anthropic.com y añade un método de pago.
2. En **API Keys**, crea una clave y guárdala (empieza por `sk-ant-`).
3. En **Limits**, pon un **límite de gasto mensual** (por ejemplo 10 €). Así nunca habrá sorpresas.

### 2. Subir la web a Netlify
La forma más sencilla es con GitHub:
1. Crea un repositorio en GitHub y sube el contenido de esta carpeta (los archivos, no la carpeta entera dentro de otra). La clave de la IA **no** va en el repositorio: se pone en Netlify, en el paso 3.
2. En https://app.netlify.com: **Add new site → Import an existing project → GitHub** y elige el repositorio. No hace falta configurar nada más; Netlify lee `netlify.toml`.

> Arrastrar la carpeta a Netlify (Netlify Drop) publica la web, pero **no** activa el asistente. Para el chat hace falta GitHub o la CLI (`npx netlify-cli deploy --prod`).

### 3. Variables de entorno
En Netlify: **Site configuration → Environment variables**, añade:

| Variable | Valor |
|---|---|
| `ANTHROPIC_API_KEY` | la clave del paso 1 |
| `ALLOWED_ORIGINS` | `https://kuristudio.es,https://www.kuristudio.es` |

Después, en **Deploys**, pulsa **Trigger deploy** para que se apliquen.

Mientras pruebas en la dirección `*.netlify.app`, añade también esa dirección a `ALLOWED_ORIGINS` (o deja la variable vacía temporalmente).

### 4. Conectar el dominio
En Netlify: **Domain management → Add a domain**, escribe `kuristudio.es` y sigue las instrucciones (cambiar los DNS en el proveedor donde comprasteis el dominio). El HTTPS se activa solo.

Deja `kuristudio.es` (sin www) como **dominio principal**. Netlify hará que `www.kuristudio.es` lleve ahí solo. Es la dirección que usa la web en sus datos para Google, así que tienen que coincidir.

### 5. Comprobar
Abre la web, pulsa «Pregúntale a Kuri» y haz un par de preguntas. Si responde con el mensaje de WhatsApp, revisa en Netlify **Logs → Functions** qué error aparece (normalmente la clave o `ALLOWED_ORIGINS`).

## Salir en Google

La web ya lleva lo básico: título y descripción con las palabras que busca la gente ("manicura Cáceres", "nail art", "cejas", "pestañas"…), la ficha del negocio para Google dentro del código, `sitemap.xml` y `robots.txt`. Lo que queda se hace fuera de la web, una sola vez.

### 1. Ficha de Google (lo más importante)
Es lo que sale en Google Maps y al buscar "uñas Cáceres". Para un estudio de barrio trae más clientas que la propia web.
1. Entra en https://business.google.com con la cuenta de Google de Cris.
2. Si ya existe la ficha de Kuri Studio, reclámala; si no, créala con **la misma dirección y teléfono que en la web** (C/ Obispo Segura Sáez, 5 · +34 695 16 81 91). Que coincidan ayuda a Google.
3. Categoría principal: **Salón de manicura y pedicura**. Secundarias: estudio de cejas, salón de belleza.
4. Pon como sitio web `https://kuristudio.es` y como enlace de reservas el de Booksy.
5. Sube fotos buenas del local y de trabajos, y el horario.
6. Pide a las clientas contentas una reseña también en Google (se puede sacar el enlace para reseñas desde la propia ficha y mandarlo por WhatsApp).

### 2. Google Search Console
Sirve para avisar a Google de que la web existe y ver por qué búsquedas aparece.
1. Entra en https://search.google.com/search-console y añade una propiedad de tipo **Dominio** con `kuristudio.es`.
2. Te dará un registro TXT para pegar en los DNS del dominio (donde lo comprasteis, o en Netlify si los DNS los lleva Netlify). Espera unos minutos y pulsa **Verificar**.
3. En **Sitemaps**, escribe `sitemap.xml` y envíalo.
4. Google tarda de unos días a un par de semanas en mostrar la web. Es normal.

### 3. Comprobar
- Datos del negocio: pega la dirección en https://search.google.com/test/rich-results. Debe salir "BeautySalon" sin errores.
- Vista previa al compartir: manda el enlace por WhatsApp a alguien y mira que salga la foto del local.

### Cuidado con
- **Las reseñas de Booksy no se ponen en los datos para Google.** Google no da estrellas por reseñas que publica el propio negocio y puede penalizarlo. En la web se ven igual, solo que no se marcan para Google.
- Si se cambia la dirección o el teléfono, cámbialos en la web y en la ficha de Google a la vez.
- Al añadir una página nueva a la web, añádela también a `sitemap.xml`.

## Añadir trabajos

1. Descarga las fotos (mejor las originales del móvil de Cris que las de Instagram, que pierden calidad). Recórtalas cuadradas, unos 1200 px, en `.jpg`.
2. Guárdalas en `assets/img/trabajos/`.
3. Abre `trabajos.js` y añade una línea por foto:
   `{ src: "assets/img/trabajos/uñas-azules.jpg", cat: "unas", alt: "Uñas azules con lunas" },`
   La categoría (`cat`) puede ser `unas`, `mirada` o `labios`. El `alt` describe la foto para Google y para personas con lector de pantalla.
4. Sube el cambio y Netlify publica solo.

Alternativa automática: servicios como Behold o SnapWidget generan un bloque que muestra las últimas publicaciones de Instagram y se actualiza solo. Es más cómodo, pero añade un servicio externo (algunos de pago) y hay que mencionarlo en la política de privacidad y cookies.

## Mantenimiento

- **Cambiar precios o servicios**: edita el texto `SYSTEM_PROMPT` en `netlify/functions/chat.mjs` y también las tarjetas de `index.html`. Al subir el cambio a GitHub, Netlify publica solo.
- **Cambiar de modelo**: añade la variable `ANTHROPIC_MODEL` con otro modelo. Por defecto usa uno rápido y económico.
- **Coste orientativo**: cada pregunta cuesta una fracción de céntimo. Consulta precios actuales en https://docs.claude.com.
