# CLAUDE.md

## Propósito del proyecto
Portafolio personal de Samuel Hernández (samhernandezc.bkode.lat). Está en rediseño: pasa de un sitio de freelance/landing a la identidad profesional de un Software Engineer orientado a backend, sistemas de datos y applied AI. El plan aprobado vive fuera del repo (plan de Claude); sus decisiones vigentes están resumidas abajo y detalladas en `.claude/skills/*/references/`.

## Decisiones confirmadas del rediseño
- Origen de producción y canónico: `https://samhernandezc.bkode.lat`, definido una sola vez en `src/lib/site.ts` (`SITE_ORIGIN`, usado por `site` en `astro.config.mjs`). No existe otro dominio en la arquitectura de release: no usar `samhernandezc.com` como canónico, alterno ni origen de redirect. BKODE es una marca separada en `https://bkode.lat`.
- Idiomas: inglés canónico en `/`; español solo para Home, Work index y About en `/es/*`. Case studies y notas solo en inglés.
- Identidad del empleador vs. confidencialidad: el historial laboral (CV, Experience, `Person.worksFor`) puede nombrar al empleador. El case study del sistema industrial va anonimizado: sin detalles de producto, URL de producción, fórmulas, esquema, reglas propietarias ni capturas privadas.
- Proyectos futuros: `visibility: draft` por defecto; como máximo un proyecto `building` público, y solo con evidencia (repo, README, arquitectura documentada, commits reales, vertical slice funcionando).
- Sin formulario de contacto en el diseño final: links directos (email, LinkedIn, GitHub, CV) + banner de BKODE.
- Nunca inventar métricas, usuarios, clientes, uso en producción ni decisiones técnicas.

## Skills del proyecto (`.claude/skills/`)
| Tarea | Skill |
|---|---|
| Cualquier cambio visual: layout, componentes, tokens, tipografía, temas, responsive, interacción | `portfolio-design` |
| Copy, case studies, experiencia, métricas, status/visibility de proyectos | `engineering-case-study` |
| Páginas, scripts, `client:*`, integraciones, dependencias, colecciones, config de Astro | `astro-architecture` |
| Después de cada fase de UI importante o antes de dar por terminado trabajo visual | `visual-review` (critica antes de editar) |

**Precedencia:** skills del proyecto > plugin `frontend-design` (instalado a nivel proyecto) > defaults genéricos de Claude. `frontend-design` aporta criterio, pero no redefine la identidad visual aprobada.

## Stack y arquitectura (estado actual, tras la Fase 3)
- Astro 7 estático (sin adaptador SSR; Node ≥ 22.12, declarado en `engines`) + MDX + Tailwind CSS 4 CSS-first. **Sin framework de cliente** (React, shadcn y las librerías de iconos se eliminaron en la Fase 3); iconos como SVG inline en `src/components/icons/`.
- TypeScript estricto (`astro/tsconfigs/strict`), alias `@/*` → `./src/*`.
- Sin backend propio ni formulario de contacto (solo enlaces). No hay `netlify.toml`/`vercel.json`: el hosting no está confirmado.
- i18n: inglés canónico en `/`, español en `/es`; ambos renderizan `src/components/home/HomePage.astro` con textos de `src/i18n/ui.ts`. `/en` redirige a `/` (`redirects` en `astro.config.mjs`).

## Estructura principal
- `src/pages/` — `index.astro` (EN), `es/index.astro` (ES), `work/index.astro` + `es/work/index.astro` (Work index), `work/[slug].astro` (case studies, EN only), `notes/index.astro` + `notes/[slug].astro` (notas, solo EN), `about.astro` + `es/about.astro` (Sobre mí), `rss.xml.ts` (feed de notas publicadas).
- `src/layouts/BaseLayout.astro` — `<html>`, design system, ThemeScript, skip link, meta SEO/OG, canonical, hreflang.
- `src/components/` — `site/` (Header, Footer, CommandPalette), `home/` (HomePage, Hero, HeroArtifact, SelectedWork, WorkRow, Capabilities, LatestNotes, BkodeBanner, Contact), `work/` (WorkIndex, WorkRow, Decision, SystemDiagram, HoistDemo), `article/` (ArticleShell: layout de lectura compartido), `notes/` (NoteRow, NoteCover), `about/` (AboutPage), `experience/` (ExperienceList), `system/` (ThemeScript, ThemeSwitch, DataTable, ThemeImage), `icons/` (Icon: paths de Lucide copiados, sin paquete; Flag; marcas GitHub/LinkedIn).
- `src/lib/hoist-model.ts` + `hoist-rules.ts` + `hoist-figure.mjs` — demo isométrica del case study industrial (contenedor offshore con juego de izaje de 4 patas). El modelo (componentes ES/EN, layout, escenarios) y las reglas ilustrativas son la única fuente de la figura, del panel y de las pruebas; `hoist-figure.mjs` dibuja el SVG en build con el kit Anatomy copiado en `src/lib/anatomy/` (MIT, con su LICENSE; solo frontmatter y pruebas, nunca un `<script>` de cliente). En el artículo, `HoistDemo.astro` es una tarjeta (figura limpia como `<img>`, valores, avisos, botón); el visor modal (`hoist-viewer.ts`, cargado con `import()` al abrir; markup en `hoist-viewer-markup.ts`) pide a endpoints estáticos de `src/pages/work/industrial-engineering-platform/` el fragmento `viewer.html` y cada vista `views/{0..3}-{a,b}.svg` solo cuando se solicita. El visor importa solo `hoist-rules` y lee el modelo como JSON. Todo es ilustrativo y sintético: sin dimensiones, capacidades, marcas, certificados ni normas; el reparto de carga de 4 patas no se calcula. `tests/hoist-demo.test.ts` (parte de `test:content`), `tests/e2e/hoist-demo.spec.mjs`, `hoist-legibility.spec.mjs`, `hoist-assets.spec.mjs` (toda URL de la demo existe en `dist/`, es del mismo origen, con `image/svg+xml` y XML sin atributos repetidos) y `hoist-devices.spec.mjs` (proyecto `chromium-pixel` en CI; `webkit-iphone` y `firefox` solo con `PW_DEVICES=1` tras `npx playwright install webkit firefox`; `PW_BASE_URL` apunta a un servidor ya levantado, p. ej. `astro preview --host` en la IP de la LAN). `scripts/hoist-owner-map.mjs` (herramienta dev, salida en `.claude/review/hoist-owner/`) compara el dueño de cada píxel del SVG con la superficie 3D más cercana; no es la auditoría de Anatomy.
- `src/i18n/ui.ts` — textos de UI/home EN/ES (paridad de claves por tipos). `src/lib/content.ts` — único acceso a colecciones (filtra borradores). `src/scripts/theme.ts` — estado del tema; solo lo importa `Header` (un segundo importador lo sacaría del script inline).
- `src/styles/system.css` + `src/styles/system/` — nuevo design system (tokens light/dark con `light-dark()`, primitivas, prose, código, diagramas). Reglas en el skill `portfolio-design`.
- `src/dev/` — páginas solo de desarrollo (`/dev/design-system`), inyectadas por la integración `dev-pages` únicamente en `astro dev`.
- `src/assets/` — imágenes importadas (optimizadas por Astro). `public/` — favicon y PDFs de CV, con nombres exactos `Samuel-Hernandez-CV-EN.pdf` y `Samuel-Hernandez-CV-ES.pdf` (el sitio los enlaza directamente; se generan con `npm run cv -- --publish`, no en el build).
- `cv/` — fuente editable de los CVs: `data/{en,es}.json` (copy independiente por idioma), `template/` (HTML + CSS compartidos, una columna, apto para ATS), `build.mjs` (Playwright → PDF). `cv/output/` es gitignored. Los hechos del rol industrial siguen la misma evidencia que el case study.
- `scripts/screenshot.mjs` — herramienta dev de `visual-review` (Playwright). No es parte del sitio.
- `scripts/hero-artifact.mjs` — generador dev del artefacto del Hero (three.js en Chromium headless). Escribe `src/assets/hero/artifact-{light,dark}.png` y `public/media/hero-artifact-{light,dark}.webm`. `three` y `webm-muxer` son devDependencies solo de este script; nada en `src/` las importa.
- `tests/e2e/` — pruebas de producto versionadas. Las capturas y scripts de `visual-review` viven en `.claude/review/` (gitignored) y no forman parte de la suite.
- `docs/` — contenido personal no relacionado, no enrutado. **Off-limits.**

## Comandos verificados
- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción.
- `npm run preview` — sirve el build.
- `node scripts/screenshot.mjs` — capturas desktop/mobile × light/dark de todas las rutas de `dist/` en `.claude/review/` (requiere build previo). Con `--dev --routes /dev/design-system` captura páginas solo-dev (en Git Bash anteponer `MSYS_NO_PATHCONV=1`).
- `npm run test:content` — pruebas del esquema de contenido (`node --test`).
- `npm run check` — `astro check` (tipos en `.astro`/`.ts`/`.tsx`).
- `npm run test:e2e` — Playwright sobre el build (`tests/e2e/`: interacción, axe en todas las rutas light/dark, metadata/SEO). Requiere `npm run build` antes y, la primera vez, `npx playwright install chromium`.
- `npm run test:budget` — falla si alguna página de `dist/` supera 6 KB gzip de JS propio.
- Secuencia de release (igual que CI en `.github/workflows/ci.yml`, solo verificación, sin deploy): `npm ci` → `check` → `build` → `test:content` → `test:e2e` → `test:budget`.
- `npm run cv` — genera los CVs en `cv/output/` y falla si alguno pasa de 2 páginas, desborda o no carga Geist. `npm run cv -- --publish` además copia los PDFs a `public/` con los nombres exactos. Nunca editar los PDFs a mano.
- `node scripts/og-image.mjs` — regenera `public/og-default.png` (1200×630) solo si cambian nombre, rol o dominio.
- `node scripts/hero-artifact.mjs` — regenera stills y loops del Hero (`--posters` solo stills; `--scene case` regenera la imagen del case study industrial en `src/assets/work/`). Solo si cambian la escena o los tokens de color; editar el script, nunca los archivos a mano.
- No existen `lint`, `test` ni `format`. No inventes comandos que no estén en `package.json`.

## Convenciones de código
- Componentes en PascalCase; utilidades/hooks en kebab-case o minúsculas.
- `interface Props` en `.astro`. Utilidades/datos: named exports.
- Usa `@/*` para imports entre carpetas de `src/` en código nuevo.
- Tailwind v4 CSS-first: nunca crear `tailwind.config.js`. Usar tokens, no valores arbitrarios.
- No agregar islas de framework (React/Vue/Preact). Interactividad = Astro + TS vanilla, justificada según `astro-architecture`.

## Verificaciones obligatorias
- Antes de terminar un cambio: `npm run check` y `npm run build`.
- Cambios visuales: revisar todas las rutas existentes (`/`, `/es`, `/work`, `/es/work`, `/about`, `/es/about`, `/notes`, la nota publicada y el case study) en desktop y mobile, light y dark; tras fases de UI, usar `visual-review`.
- Overflow móvil: medir con viewport fijo (390 y 320 px, sin emulación `isMobile`, que ensancha el layout para ocultar el desborde) que `scrollWidth === innerWidth`.
- Case studies: los hechos del caso industrial salen solo de la hoja de evidencia de la Fase 4A (resumida en el frontmatter del MDX). No agregar afirmaciones nuevas sin confirmación.
- Notas: escritura de ingeniería genérica; ejemplos sintéticos marcados como tales; nunca empleador, dominio de izaje, CRM/ERP ni detalles del caso confidencial; sin métricas ni anécdotas inventadas. Borrador por defecto (`draft: true`).
- Contenido nuevo: debe existir en ambos idiomas donde la página tenga versión ES.

## Estado de release (Fase 8)
- Diseño e interacciones congelados: solo se corrigen defectos, accesibilidad, rendimiento, metadata/SEO y contradicciones factuales.
- CVs: generados desde `cv/` (`npm run cv -- --publish`). No contienen proyectos personales sin evidencia de código ni IA aplicada como habilidad demostrada (solo como dirección en el resumen). Se publican junto con el sitio; no distribuirlos antes del despliegue (sus enlaces apuntan a rutas del rediseño).
- `/en` → `/` necesita un 301 real en el host (fuera del repo); el build solo emite un fallback noindex.

## Restricciones — qué NO hacer
- No modificar `docs/` ni crear documentación del proyecto ahí. El conocimiento para Claude va en `.claude/skills/*/references/`.
- Nada en `src/` puede importar `.claude/`, `scripts/` ni Playwright; las herramientas de Claude nunca son dependencias del sitio.
- No introducir `tailwind.config.js`, ESLint/Prettier ni test runners adicionales sin pedido explícito (Playwright existe solo como devDependency para capturas y, más adelante, smoke tests).
- No asumir plataforma de despliegue.
- No publicar proyectos sin evidencia ni métricas sin verificar.

## Git authorship

- Never add `Co-Authored-By` trailers for Claude, Anthropic, AI assistants, agents, or tools.
- Never add `Generated-By`, `Assisted-By`, or equivalent AI attribution.
- Commits must use the user's configured Git author identity only.
- Do not mention Claude, Anthropic, AI generation, or agent assistance in commit messages.
- This applies to every commit in this repository.
- Do not push unless explicitly requested.

## Supuestos señalados
- No hay referencias a `import.meta.env` todavía; documentar variables de entorno aquí cuando existan.
- Hosting no confirmado (Netlify Forms ya no se usa).
