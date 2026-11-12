# Kuri Studio · web

Web de presentación para **Kuri Studio**, el estudio de uñas, mirada y tratamientos faciales de **Cris (Cristina Rabasa)** en Cáceres. La estoy haciendo para una amiga. Las reservas se hacen en **Booksy**; esta web es el escaparate y lleva a reservar allí.

## Datos del negocio (reales, verificados)

- Dominio: **https://kuristudio.es** (sin www, es el principal).

- Dirección: C/ Obispo Segura Sáez, 5, 10001 Cáceres. Solo con cita previa.
- WhatsApp: +34 695 16 81 91 · Instagram y Threads: @kuristudio.caceres
- Booksy: https://booksy.com/es-es/160805_kuri-studio_salon-de-unas_58866_caceres
  (en la web se usa `https://kuristudio.booksy.com/a`, que es el enlace de su Instagram; ver pendientes)
- 5,0 en Booksy con 154 reseñas, **todas de 5 estrellas**.
- Material totalmente esterilizado y productos libres de HEMA y TPO.
- Acepta tarjeta, hay wifi, se permiten mascotas. Vende tarjetas regalo y cupones de sesiones en Booksy.
- Cris imparte **formación de uñas personalizada** (se adapta a cada alumna): preparación de la uña, manicura combinada, nivelación y nail art. **Próximamente** formación de laminado de cejas y lifting de pestañas (aún no la ha dado).

## Estructura

```
index.html                  La página (todo el contenido está en HTML para el SEO)
styles.css                  Estilos. Colores y fuentes en :root
app.js                      Chat, galería, ventanas de la carta, test y carrusel de reseñas
servicios.js                Carta completa (sale en las ventanas de cada categoría)
trabajos.js                 Lista de fotos de la sección Trabajos
asistente-local.js          Respuestas de Kuri sin IA, por si la IA falla (precios sacados de servicios.js)
netlify/functions/chat.mjs  Servidor del asistente IA (lleva la clave y lo que sabe el asistente)
netlify.toml                Configuración de Netlify (ejecuta npm run build y publica dist/)
build.mjs, package.json     Comprimen y ofuscan la web al publicar. dist/ no se sube a GitHub
robots.txt, sitemap.xml     Para Google. Si se añade una página, va también al sitemap
privacidad.html             Política de privacidad (plantilla con huecos entre corchetes)
assets/img/                 Fotos (recortadas de capturas de pantalla, baja calidad)
```

## Secciones de la web (en orden)

Portada → franja de servicios → Servicios (4 tarjetas que abren ventanas con la carta completa) → Test "¿Qué manicura es para ti?" → Así es tu cita → Soy Cris → Formación → Trabajos (galería con filtros y visor) → Reseñas (carrusel) → Tarjeta regalo → Dudas frecuentes → Visítanos → Pie. Botón flotante del asistente "Pregúntale a Kuri".

## Diseño

- Estética sacada de su local e Instagram: verde esmeralda profundo, dorado (como su letrero), mármol, terciopelo.
- Tokens en `:root`: `--ink #0A1D19`, `--forest #10302A`, `--ivory #F2ECE0`, `--gold #D4B26A`.
- Fuentes: Bodoni Moda (serif, en cursiva para titulares) y Jost (texto).
- Motivo recurrente: la estrella de cuatro puntas ✦ (de sus stories y su tatuaje).
- Animaciones suaves y siempre con `prefers-reduced-motion` respetado.
- Responsive: en móvil, las ventanas de la carta salen desde abajo como en las apps.

## Asistente IA

- El navegador llama a `/api/chat` → función de Netlify → API de Claude (Anthropic).
- La clave va en la variable de entorno `ANTHROPIC_API_KEY` de Netlify, **nunca en el repositorio**.
- `ALLOWED_ORIGINS` limita qué dominios pueden usar el chat. Modelo por defecto: `claude-haiku-5-5` (cambiable con `ANTHROPIC_MODEL`).
- Límite de 20 mensajes por IP cada 10 minutos, mensajes recortados a 600 caracteres, `max_tokens` 400.
- Lo que sabe está en `SYSTEM_PROMPT` dentro de `chat.mjs`. No inventa horarios, huecos, promociones ni datos de las formaciones; para eso manda a Booksy o al WhatsApp.
- Es un **bot de ayuda**: resuelve ella las dudas y solo manda al WhatsApp de Cris cuando hace falta (formación, salud, pagos que no sean tarjeta, quejas, diseños de nail art concretos, o si piden hablar con Cris).
- Si la IA falla (sin saldo, clave mal, caída), contesta `asistente-local.js` por palabras clave. Si se añade un tema ahí, que sea un dato real.
- Cuando falla, la función devuelve un `reason` (`clave_no_valida`, `sin_saldo`, `modelo_no_encontrado`...) que también sale en Netlify → Logs → Functions.
- `app.js` admite `window.KURI_ASK` para la vista previa en claude.ai; en producción no existe y va por fetch.

## Normas que hemos seguido

- **No inventar nada del negocio**: ni reseñas, ni precios, ni horarios, ni cursos. Si falta un dato, se pregunta a Cris.
- Las reseñas son reales, copiadas de Booksy, solo con el nombre de pila. Si una estaba cortada, se marca con "…" o "[…]".
- Si cambia un precio, hay que cambiarlo en **tres sitios**: `index.html` (tarjetas), `servicios.js` y `SYSTEM_PROMPT` en `chat.mjs`.
- No usar fotos con caras de clientas sin permiso.
- **Comentarios del código**: en español, cortos y con tono humano, como notas para quien venga después (`// Manicura`, `/* Hace que toda la tarjeta sea clicable */`). Nada de separadores decorativos tipo `─── Sección ───`.
- Antes de darme archivos para descargar, quiero **ver el resultado**. Aquí, eso significa probarlo en local (ver abajo) y enseñarme capturas o decirme qué abrir.

## Probar en local

```bash
npx netlify-cli dev
```

Abre la web en http://localhost:8888 con la función del chat funcionando. Para que el chat responda en local, crea un `.env` (está en `.gitignore`) con `ANTHROPIC_API_KEY=...`.

Sin el chat, basta con abrir `index.html` en el navegador.

## Publicar

- Se edita siempre el código de la raíz, que es el limpio y con notas. Netlify ejecuta `build.mjs` y publica `dist/`: HTML y CSS comprimidos, JS ofuscado, sin README ni CLAUDE.md.
- Si se añade un archivo nuevo que tenga que salir en la web, hay que añadirlo a las listas de arriba de `build.mjs`.
- Probar la versión publicada en local: `npm install && npm run build` y abrir `dist/index.html`.
- El repositorio de GitHub es **público**: cualquiera puede ver el código limpio ahí. Para que no, ponerlo privado en GitHub (Settings → General → Change visibility).

GitHub → Netlify (importar el repositorio) → variables de entorno → conectar el dominio. Pasos detallados en `README.md`.

## SEO

- En `index.html`: título, descripción, `canonical`, etiquetas para compartir (`og:`) y datos de negocio `BeautySalon` en JSON-LD. Todo con direcciones completas de `https://kuristudio.es`.
- **No poner las reseñas de Booksy como `aggregateRating`** en el JSON-LD: Google no lo permite para reseñas del propio negocio.
- No añadir al JSON-LD nada sin confirmar (horario, coordenadas, formas de pago aparte de tarjeta).
- Pasos de la ficha de Google y Search Console en `README.md`.

## Pendiente

- [ ] **Formación**: temas de uñas confirmados (personalizada). Falta: precio, duración, si hay certificado, material o modelo. Cuando empiece la de cejas y pestañas, quitar el "Próximamente" en `index.html` y en `chat.mjs`.
- [ ] **Fotos originales**: ya hay originales de Cris (`cris.jpg`, `cris-formacion.jpg`, `formacion-paleta.jpg`, `cita-preparacion.jpg`, `cita-diseno.jpg`; se guardan a 1000 px y sin datos de ubicación). El resto siguen siendo recortes de capturas y se ven pixeladas. Sustituirlas por las originales con el mismo nombre en `assets/img/` (o en `assets/img/trabajos/` las nuevas).
- [ ] **Enlace de Booksy**: comprobar que `kuristudio.booksy.com/a` funciona; si no, usar el enlace largo de arriba.
- [ ] **Horario**: no está en la web. Pedírselo a Cris (en Booksy sale por días) y añadirlo a Visítanos, al asistente y como `openingHoursSpecification` en el JSON-LD.
- [ ] **Ficha de Google y Search Console**: hacerlas cuando el dominio esté conectado (pasos en `README.md`).
- [ ] **Privacidad**: completar titular, NIF y email en `privacidad.html`.
- [ ] **Test de manicura**: que Cris lo pruebe con varias respuestas y diga si recomendaría otra cosa en algún caso (lógica en `decide()` de `app.js`).
- [ ] **Permiso** de la clienta de las fotos de antes y después del laminado (sección Reseñas).
- [ ] La reseña del 22 de abril es mía; está firmada como "Clienta habitual".
- [ ] Ideas aún sin hacer: versión en inglés, bloque "¿Primera vez?", antes y después deslizable, apartado de uñas Press On si las vende, consejos de cuidado.
