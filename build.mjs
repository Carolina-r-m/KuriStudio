// Prepara la versión que se publica: copia la web a dist/ comprimida y con el JS ofuscado.
// El código de verdad (limpio y con notas) es el de la raíz; dist/ se genera solo en Netlify.
// Para probarlo en tu ordenador: npm install && npm run build, y abre dist/index.html.
import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { minify as minifyHtml } from "html-minifier-terser";
import CleanCSS from "clean-css";
import JavaScriptObfuscator from "javascript-obfuscator";

const OUT = "dist";

// Lo que se publica. README, CLAUDE.md, build.mjs y demás se quedan fuera
const PAGES = ["index.html", "privacidad.html"];
const SCRIPTS = ["servicios.js", "trabajos.js", "app.js"];
const COPY = ["assets", "robots.txt", "sitemap.xml"];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// HTML: sin comentarios ni espacios. El texto se queda tal cual para que Google lo lea
for (const f of PAGES) {
  const html = await readFile(f, "utf8");
  const out = await minifyHtml(html, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
  });
  await writeFile(`${OUT}/${f}`, out);
}

// CSS: todo en una línea
const css = new CleanCSS({ level: 2 }).minify(await readFile("styles.css", "utf8"));
if (css.errors.length) throw new Error(css.errors.join("\n"));
await writeFile(`${OUT}/styles.css`, css.styles);

// JS: ofuscado (nombres cambiados y textos escondidos). Las variables window.KURI_* se respetan
for (const f of SCRIPTS) {
  const js = await readFile(f, "utf8");
  const out = JavaScriptObfuscator.obfuscate(js, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: false,
    stringArray: true,
    stringArrayEncoding: ["base64"],
    stringArrayThreshold: 0.75,
    splitStrings: true,
    splitStringsChunkLength: 8,
    identifierNamesGenerator: "hexadecimal",
    renameGlobals: false,
    selfDefending: false,
  });
  await writeFile(`${OUT}/${f}`, out.getObfuscatedCode());
}

for (const f of COPY) await cp(f, `${OUT}/${f}`, { recursive: true });

console.log("Web lista en dist/");
