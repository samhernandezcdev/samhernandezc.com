# CLAUDE.md

## Propósito del proyecto
Portafolio personal de Samuel Hernández (samhernandezc.com): sitio estático bilingüe (ES/EN) que presenta su perfil profesional, servicios, skills, proyectos, CV y contacto.

## Stack y arquitectura
- Astro 5 (estático, `astro build` sin adaptador SSR) + React 19 (islas `client:*` solo donde hay interactividad real) + Tailwind CSS 4 (config CSS-first, sin `tailwind.config.js`) + shadcn/ui (estilo `radix-nova`) + lucide (iconos).
- TypeScript estricto (`astro/tsconfigs/strict`), alias `@/*` → `./src/*`.
- Sin backend/API propio. El formulario de contacto (`ContactForm.tsx`) envía a Netlify Forms vía `fetch`; no hay `netlify.toml`/`vercel.json` en el repo, así que no asumir una plataforma de despliegue confirmada más allá de eso.
- i18n manual (no usa `astro:i18n` nativo): dos páginas (`/` y `/en`) fijan `language` y comparten `HomePage.astro`, seleccionando el diccionario de `src/i18n/pages.ts`.

## Estructura principal
- `src/pages/` — file-based routing: `index.astro` (ES), `en.astro` (EN).
- `src/layouts/BaseLayout.astro` — único layout: `<html>`, meta SEO/OG/Twitter, hreflang, `ClientRouter`, script de reveal-on-scroll.
- `src/components/pages/HomePage.astro` — orquesta Header + secciones + Footer.
- `src/components/layout/` — `Header.tsx` (React, interactivo), `Footer.astro`, `Section.astro` (wrapper genérico de secciones).
- `src/components/sections/` — bloques de la landing (Hero, Services, Skills, Projects, Resume, Availability y Contact), generados como HTML estático durante el build.
- `src/components/features/ContactForm.tsx` — único componente React fuera de layout/ui, interactivo.
- `src/components/ui/` — primitivos shadcn (button, field, label, separator).
- `src/hooks/`, `src/lib/utils.ts` — hooks y helpers (`cn()`).
- `src/i18n/pages.ts` — **fuente única de verdad del contenido** bilingüe, tipada (`Language`, `PageContent`).
- `src/styles/global.css` — tema Tailwind v4 (`@theme inline`, variables OKLCH), utilidades custom.
- `src/assets/` — imágenes importadas como módulos ES para optimización de Astro.
- `public/` — estáticos servidos directo (favicon, PDFs de CV; ver `public/README.md` para nombres exactos requeridos).

**Notas importantes:**
- `src/data/{projects,services,skills}.ts` existe pero **no se importa en ningún lado** — es código desconectado del build. La fuente real de contenido es siempre `src/i18n/pages.ts`. No lo uses como referencia ni asumas que alimenta el sitio.
- `docs/` (`docs/index.corashonita.astro`, `docs/style.corashonita.css`) es contenido personal no relacionado con el portafolio, no enrutado por Astro. No lo trates como documentación del proyecto ni lo modifiques salvo pedido explícito del usuario.

## Comandos verificados
- `npm run dev` — servidor local de desarrollo (`astro dev`).
- `npm run build` — build de producción (`astro build`).
- `npm run preview` — sirve el build localmente.
- No existen `lint`, `test` ni `format` en `package.json`, y no hay ESLint/Prettier/test runner configurados. No inventes ni ejecutes comandos que no estén en `package.json`.

## Convenciones de código
- Componentes en PascalCase (`Header.tsx`, `Hero.astro`); utilidades y hooks en minúsculas/kebab-case (`utils.ts`, `use-mobile.tsx`).
- Componentes React: `export default function X(...)`. Utilidades y datos: named exports.
- Props tipadas explícitamente: `interface Props` en archivos `.astro`, `type XProps` en archivos `.tsx`.
- El repo mezcla imports relativos y alias `@/` en el mismo archivo; usa `@/*` para imports entre carpetas de `src/` en código nuevo, pero no es obligatorio corregir lo existente salvo que se pida.

## Reglas de componentes y estilos
- Tailwind v4 utility-first; el tema vive en `src/styles/global.css` (`@theme inline`, OKLCH). No crear `tailwind.config.js` — este proyecto usa configuración CSS-first.
- Los primitivos de `src/components/ui/` siguen el patrón shadcn (cva + cn + radix-ui). Si se agregan nuevos, seguir el mismo patrón en vez de estilos ad-hoc.
- Server-render en Astro por defecto; usar `client:*` solo cuando el componente necesita estado o eventos reales (como ya hacen `Header.tsx` y `ContactForm.tsx`).

## Manejo de contenido y recursos
- Todo el texto visible (ES/EN) vive en `src/i18n/pages.ts`, tipado con `PageContent`. Los cambios de copy van ahí, no hardcodeados en componentes.
- Imágenes nuevas van en `src/assets/` e importadas como módulos ES para que Astro las optimice; `public/` es solo para estáticos servidos tal cual (PDFs, favicon).
- Los PDFs de CV deben llevar exactamente los nombres documentados en `public/README.md` (`Samuel-Hernandez-CV-ES.pdf`, `Samuel-Hernandez-CV-EN.pdf`).

## Criterios de calidad / verificaciones obligatorias
- Antes de dar por terminado un cambio, correr `npm run build` para confirmar que el sitio compila (no hay typecheck ni lint separados disponibles).
- Para cambios visuales, levantar `npm run dev` y revisar ambas rutas (`/` y `/en`), dado el esquema de i18n manual.
- Si se agrega contenido nuevo, verificar que exista en ambos idiomas dentro de `src/i18n/pages.ts` — `PageContent` es compartido y no hay fallback automático entre idiomas.

## Restricciones — qué NO hacer
- No modificar ni tratar como documentación del proyecto `docs/index.corashonita.astro` ni `docs/style.corashonita.css` salvo instrucción explícita del usuario.
- No usar `src/data/*.ts` como fuente de contenido — está desconectado del build.
- No introducir `tailwind.config.js`, configuración de ESLint/Prettier, ni test runners sin pedido explícito del usuario — no existen hoy en el repo.
- No asumir una plataforma de despliegue específica: no hay `netlify.toml`/`vercel.json` en el repo; solo está confirmada la integración con Netlify Forms para el formulario de contacto.

## Supuestos señalados explícitamente
- No se confirmó si el proyecto usa variables de entorno (no se hallaron referencias a `import.meta.env` durante el análisis); si aparecen en el futuro, documentar aquí una vez confirmado.
- La plataforma de hosting real no está confirmada por configuración; Netlify es una inferencia por el uso de Netlify Forms, no un hecho verificado.
