# HANDOFF — samhernandezc.com

**Rediseño de posicionamiento · Fases F1 y F2**  
**Dirección:** Modernismo suizo con capa técnica  
**Estado:** Aprobado para implementación por fases

## FUENTES DE VERDAD
· Este documento define el alcance, las restricciones y las reglas de
  implementación.
· `docs/redesign/Handoff-Direccion-C.dc.html` es la referencia visual para
  composición, retícula, medidas, estados y comportamiento responsive.
· Ante una contradicción entre ambos documentos, no asumir una solución:
  reportarla antes de modificar código.
· F3-F6 están fuera del alcance actual.

## CONTEXTO
El sitio es un portafolio Astro 5 estático bilingüe. Hoy se presenta como
"Desarrollador de Software Full Stack" con estética de plantilla oscura.
Se reposiciona como Industrial Software & AI Engineer, con la plataforma
CPQ industrial de izaje como caso central. Dirección visual aprobada:
modernismo suizo (retícula estricta, una grotesca, mono solo para datos,
un acento) con tratamiento técnico de datos en el interior del caso.

## PROPUESTA DE VALOR (literal, no reformular)
ES  Ingeniería de software para decisiones industriales complejas.
EN  Software engineering for complex industrial decisions.
ES  Diseño sistemas CPQ, motores de cálculo, automatización de ingeniería
    y herramientas con IA para convertir reglas técnicas en procesos
    operativos confiables.

## ALCANCE DE ESTE TRABAJO
F1  Tema y fundamentos: tokens, radios, tipografía, retícula, primitivos.
F2  Posicionamiento: hero, bloque Configurar/Calcular/Decidir, header,
    footer, meta/SEO/JSON-LD, copy ES+EN.
F3-F6 (caso CPQ, diagrama, poda de secciones, capacidades, contacto)
    NO entran aquí. No adelantar trabajo de esas fases.

## INVARIANTES — romper cualquiera de estos es un fallo
1  No borrar archivos. Lo que sobra se marca como candidato y se verifica
   con ripgrep antes de proponer su eliminación, en un commit aparte.
2  No tocar el `<form hidden data-netlify="true">` de `Contact.astro` ni los
   atributos `name` (`name`, `email`, `description`, `bot-field`).
   Netlify Forms depende de ellos.
3  PageContent es un tipo compartido ES/EN: toda clave nueva existe en los
   dos idiomas o el build falla.
4  Conservar ClientRouter (View Transitions) y re-inicializar cualquier
   script nuevo en el evento astro:page-load.
5  Conservar del Header: focus trap, inert, cierre con Escape, bloqueo de
   scroll y el IntersectionObserver de sección activa.
6  Conservar SEO: hreflang, x-default, canonical, OG, Twitter.
7  Conservar el patrón html.js del reveal: sin JS, todo el contenido visible.
8  Cero dependencias nuevas. Única excepción admisible, y solo si el usuario
   la aprueba: @fontsource-variable/geist-mono. Por defecto, usar el stack
   de mono del sistema con font-variant-numeric: tabular-nums.
9  Mantener los nombres exactos de los PDF de CV en public/.
10 No hacer commits automáticos, no abrir PRs, no ejecutar git rm.

## SISTEMA VISUAL
Color      background #FAF8F4 · surface #F2EFE9 · surface-2 #E9E5DD
           border #DCD7CE · border-strong #C3BCB0 · muted-fg #6C6961
           foreground #1A1917 · accent #1D5A4A · accent-hover #16483B
           accent-soft #E7EFEA · warning #8A5A1E
           Declarar en OKLCH. Un solo acento, con uso escaso.
Forma      --radius 0.125rem. Bordes de 1px. Una sola sombra (menú móvil).
           Prohibido backdrop-filter, gradientes y glow.
Tipografía Geist Variable 400/500/600. Mono solo en datos, tecnologías,
           unidades, IDs, fórmulas y metadatos; nunca en prosa ni titulares.
           H1 clamp(2.25rem, 1.1rem + 3.6vw, 4.5rem), tracking −.028em.
           Prosa mínima 16px; mono mínima 11px.
Retícula   12 col / 1280 máx / margen 80 / gutter 24 (desktop)
           8 col / margen 40 / gutter 20 (tablet)
           4 col / margen 20 / gutter 16, retícula oculta (móvil)
           Visible solo en hero (col 8-12), diagrama y especificación.
Acciones   Una única intención comercial primaria en todo el sitio:
           "Hablemos de tu proceso", siempre con la misma etiqueta,
           estilo y destino `#contacto`. Puede repetirse en header,
           hero, cierre del caso y contacto.
Estados    Hover: color/borde a 120ms. Focus: anillo de 2px en acento con
           offset de 2px, nunca eliminado. Active: translateY(1px).
           Ningún estado añade sombra, escala ni blur.
Movimiento Un gesto: translateY(8px)+opacity, 240ms, cubic-bezier(.16,1,.3,1),
           una vez por bloque. Sin escalonados. Sin animaciones infinitas.
           Excepción informativa (F3): el diagrama traza sus aristas.
           prefers-reduced-motion: la página queda estática.

## CONTENIDO — REGLAS
· Tecnologías siempre contextuales: junto al problema que resolvieron.
  Nunca una nube de skills ni logos sueltos.
· Todo proyecto no implementado lleva estado visible en mono:
  PROTOTIPO / INVESTIGACIÓN / CONCEPTO / EN DESARROLLO.
· Prohibido usar capturas con información interna. Las interfaces del caso
  CPQ se reconstruyen en HTML con datos ficticios y nota de confidencialidad.
· El formulario debe admitir: consulta industrial, automatización,
  integraciones, oportunidad profesional y otros proyectos.
· Sin métricas de vanidad. Solo cifras verificables y atribuibles.

## ORDEN DE TRABAJO
F1.1 tokens → F1.2 verificación y candidatos → F1.3 primitivos, Section,
skip-link → validar el sitio antiguo en claro → F2.1 copy ES+EN →
F2.2 Hero → F2.3 Positioning + Header + Footer + BaseLayout/SEO →
revisar / y /en → npm run build.

## HECHO CUANDO
F1: build limpio, sitio antiguo legible en claro, sin gradientes/glow/blur
    en el CSS emitido, foco visible en todo control, ninguna eliminación
    sin búsqueda previa registrada.
F2: rg -ni "full stack" src = 0; hero y posicionamiento fieles a la spec en
    1440/1024/390; paridad ES/EN; head con OG y JSON-LD válidos; menú móvil
    conserva accesibilidad; cero scroll horizontal en los seis anchos.

## PENDIENTE DE DECISIÓN DEL USUARIO
· Mono: dependencia geist-mono o stack del sistema (por defecto, sistema).
· Imagen OG nueva: quién la genera.
· Textos definitivos del caso CPQ y sus datos ficticios (entran en F3).