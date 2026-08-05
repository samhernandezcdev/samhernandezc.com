# CLAUDE.md

## Propósito del proyecto
Portafolio personal de Samuel Hernández (samhernandezc.com): sitio estático bilingüe (ES/EN) que presenta su perfil como Industrial Software & AI Engineer, su caso principal de software CPQ industrial, trabajo complementario, capacidades técnicas, CV y contacto.

## Rediseño aprobado del portafolio

El portafolio está en proceso de reposicionamiento desde un perfil genérico de desarrollo full stack hacia:

**Industrial Software & AI Engineer**

La dirección visual aprobada es modernismo suizo con una capa técnica para datos, reglas, cálculos y casos de ingeniería.

Antes de modificar componentes visuales, estilos, contenido, navegación, SEO o estructura de la página principal, leer completamente:

- docs/redesign/DESIGN_HANDOFF.md
- docs/redesign/Handoff-Direccion-C.dc.html

### Prioridad de las fuentes
- DESIGN_HANDOFF.md es la fuente de verdad para alcance, restricciones, invariantes y criterios de aceptación.
- `docs/redesign/Handoff-Direccion-C.dc.html` es únicamente una referencia visual.
- El código actual es la fuente de verdad para comportamiento existente, rutas, integraciones y dependencias.
- Ante una contradicción entre documentación y código, no asumir una solución: reportar la discrepancia antes de modificar archivos.
- No copiar directamente sus estilos inline ni sus componentes personalizados.
- Traducir la especificación visual al sistema existente de Astro, Tailwind CSS 4 y tokens de `global.css`.

### Fases autorizadas

El rediseño está dividido en fases:

- **F1:** tema y fundamentos.
- **F2:** posicionamiento, hero, navegación, bloque Configurar/Calcular/Decidir y SEO.
- **F3:** caso CPQ y flujo técnico.
- **F4:** reorganización y poda de proyectos y secciones.
- **F5:** capacidades, perfil y contacto.
- **F6:** paridad bilingüe, accesibilidad, responsive y QA final.

Implementar únicamente la fase solicitada explícitamente por el usuario.

No adelantar trabajo de fases posteriores aunque aparezca documentado o diseñado en los archivos de handoff.

### Restricciones del rediseño
- No eliminar archivos sin verificar primero todas sus referencias con ripgrep.
- No ejecutar git rm.
- No hacer commits ni abrir pull requests salvo instrucción explícita.
- No instalar dependencias nuevas sin aprobación explícita.
- Por defecto, usar el stack monoespaciado del sistema; no instalar @fontsource-variable/geist-mono.
- No modificar los nombres de los PDF de CV.
- No tocar el `<form hidden data-netlify="true">` de `Contact.astro`.
- No modificar los atributos `name`, `email`, `description` y `bot-field`.
- No usar capturas con información interna o confidencial.
- Las interfaces del caso CPQ deben reconstruirse con datos ficticios y una nota de confidencialidad.
- No presentar proyectos conceptuales como proyectos terminados; mostrar siempre su estado real.
- No introducir gradientes, glow, glassmorphism, backdrop-filter, partículas o animaciones decorativas.
- No crear una sección tradicional de skills con nubes de tecnologías o logos sin contexto.
- Las tecnologías deben aparecer junto al problema o componente para el que fueron utilizadas.

### Posicionamiento aprobado

Propuesta de valor en español:

Ingeniería de software para decisiones industriales complejas.

Descripción en español:

Diseño sistemas CPQ, motores de cálculo, automatización de ingeniería y herramientas con IA para convertir reglas técnicas en procesos operativos confiables.

Propuesta de valor en inglés:

Software engineering for complex industrial decisions.

No reformular estos textos salvo instrucción explícita del usuario.

### CTA comercial

Existe una única intención comercial primaria:

Hablemos de tu proceso

Puede repetirse en cabecera, hero, cierre del caso y contacto, siempre con:

la misma etiqueta;
el mismo estilo;
el mismo destino #contacto.

Las acciones como ver el caso, descargar el CV, GitHub y LinkedIn son secundarias o terciarias.

### Reglas visuales obligatorias

- Fondo principal claro y cálido.
- Acento primario: `#1D5A4A`.
- Texto principal: `#1A1917`.
- Radio máximo general: `4px`.
- Bordes de `1px`.
- Respetar `prefers-reduced-motion`.
- Mantener objetivos táctiles de al menos `44×44px`.
- Una única sombra, reservada para el menú móvil.
- Geist Variable para prosa y titulares.
- Monoespaciada solo para datos, unidades, tecnologías, fórmulas, estados e identificadores.
- Retícula visible únicamente donde lo indique el handoff.
- Movimiento limitado a transiciones funcionales y un único patrón de reveal.

### Archivos fuera de alcance durante F1 y F2

No modificar durante F1 o F2, salvo instrucción explícita:

- `src/components/sections/Contact.astro`
- `src/components/features/ContactForm.tsx`
- `src/components/sections/Services.astro`
- `src/components/sections/Skills.astro`
- `src/components/sections/Projects.astro`
- `src/components/sections/Resume.astro`
- `src/components/sections/Availability.astro`
- `src/data/*.ts`
- Los PDF de `public/`

No implementar `CaseCPQ.astro`, el flujo técnico ni la reconstrucción del configurador antes de autorizar F3.

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
- `src/data/{projects,services,skills}.ts` existe pero **no se importa en ningún lado**. Es código desconectado del build. La fuente real de contenido es siempre `src/i18n/pages.ts`.
- `docs/redesign/` contiene la especificación oficial del rediseño y debe leerse antes de modificar la interfaz.
- `docs/index.corashonita.astro` y `docs/style.corashonita.css` son contenido personal no relacionado con el portafolio. No modificarlos salvo pedido explícito.

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
