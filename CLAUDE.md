# CLAUDE.md

## Propósito del proyecto
Portafolio personal de Samuel Hernández (samhernandezc.com). Está en rediseño: pasa de un sitio de freelance/landing a la identidad profesional de un Software Engineer orientado a backend, sistemas de datos y applied AI. El plan aprobado vive fuera del repo (plan de Claude); sus decisiones vigentes están resumidas abajo y detalladas en `.claude/skills/*/references/`.

## Decisiones confirmadas del rediseño
- Dominio canónico: `https://samhernandezc.com` (`samhernandezc.bkode.lat` → 301 a futuro, configurado en el host). BKODE es una marca separada en `https://bkode.lat`.
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

## Stack y arquitectura (estado actual, antes de la Fase 0)
- Astro 5 estático (sin adaptador SSR) + React 19 (islas en `Header.tsx` y `ContactForm.tsx`) + Tailwind CSS 4 CSS-first + shadcn/ui + lucide. El rediseño elimina React/shadcn (Fase 3) y sube a Astro 7 (Fase 0, requiere Node ≥ 22.12).
- TypeScript estricto (`astro/tsconfigs/strict`), alias `@/*` → `./src/*`.
- Sin backend propio. `ContactForm.tsx` envía a Netlify Forms (se elimina en la Fase 3). No hay `netlify.toml`/`vercel.json`: el hosting no está confirmado.
- i18n manual actual: `/` (ES) y `/en` (EN) comparten `HomePage.astro` con el diccionario de `src/i18n/pages.ts`.

## Estructura principal
- `src/pages/` — `index.astro` (ES), `en.astro` (EN).
- `src/layouts/BaseLayout.astro` — `<html>`, meta SEO/OG/Twitter, hreflang, `ClientRouter`, reveal-on-scroll.
- `src/components/` — `pages/HomePage.astro`, `layout/` (Header.tsx, LanguageSwitch.tsx, Footer, Section), `sections/` (Hero, Services, Skills, Projects, Resume, Availability, Contact), `features/ContactForm.tsx`, `ui/` (shadcn).
- `src/i18n/pages.ts` — fuente actual del contenido bilingüe (se reemplaza por Content Collections + `src/i18n/ui.ts` en la Fase 1).
- `src/styles/global.css` — tema Tailwind v4 (`@theme inline`, OKLCH).
- `src/assets/` — imágenes importadas (optimizadas por Astro). `public/` — favicon y PDFs de CV (nombres exactos en `public/README.md`).
- `scripts/screenshot.mjs` — herramienta dev de `visual-review` (Playwright). No es parte del sitio.
- `docs/` — contenido personal no relacionado, no enrutado. **Off-limits.**

## Comandos verificados
- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción.
- `npm run preview` — sirve el build.
- `node scripts/screenshot.mjs` — capturas desktop/mobile × light/dark de todas las rutas de `dist/` en `.claude/review/` (requiere build previo).
- No existen `lint`, `test`, `format` ni `check` todavía (`check` llega en la Fase 0). No inventes comandos que no estén en `package.json`.

## Convenciones de código
- Componentes en PascalCase; utilidades/hooks en kebab-case o minúsculas.
- `interface Props` en `.astro`; `type XProps` en `.tsx`. React: `export default function X`. Utilidades/datos: named exports.
- Usa `@/*` para imports entre carpetas de `src/` en código nuevo.
- Tailwind v4 CSS-first: nunca crear `tailwind.config.js`. Usar tokens, no valores arbitrarios.
- No agregar nuevos primitivos shadcn ni islas React: el rediseño los elimina. Interactividad nueva = Astro + TS vanilla, justificada según `astro-architecture`.

## Verificaciones obligatorias
- Antes de terminar un cambio: `npm run build`.
- Cambios visuales: revisar todas las rutas existentes (hoy `/` y `/en`) en desktop y mobile; tras fases de UI, usar `visual-review`.
- Contenido nuevo: debe existir en ambos idiomas donde la página tenga versión ES.

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
- Hosting no confirmado; Netlify es solo una inferencia por Netlify Forms.
