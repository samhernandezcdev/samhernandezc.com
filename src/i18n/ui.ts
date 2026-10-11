// UI strings for the site shell and homepage. English is canonical at `/`;
// the Spanish shell lives at `/es` (Home now; Work index and About later).
// Case studies and engineering notes stay English-only.

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Routes that exist in both languages. Case studies and notes are English-only. */
export const localizedRoutes = ["/", "/work", "/about"] as const;

export const homePaths: Record<Locale, string> = { en: "/", es: "/es" };
export const workPaths: Record<Locale, string> = { en: "/work", es: "/es/work" };
export const aboutPaths: Record<Locale, string> = { en: "/about", es: "/es/about" };
export const htmlLang: Record<Locale, string> = { en: "en", es: "es" };
export const ogLocale: Record<Locale, string> = { en: "en_US", es: "es_MX" };

export const links = {
  email: "sam.hernandezc103@gmail.com",
  github: "https://github.com/samhernandezcdev",
  linkedin: "https://www.linkedin.com/in/samueldhernandezc",
  bkode: "https://bkode.lat",
  cv: { en: "/Samuel-Hernandez-CV-EN.pdf", es: "/Samuel-Hernandez-CV-ES.pdf" },
} as const;

const en = {
  "meta.title": "Samuel Hernández — Software Engineer (Backend, Python, Applied AI)",
  "meta.description":
    "Software engineer building backend systems with Python, FastAPI, PostgreSQL and TypeScript for industrial and business software. Now focused on evaluated, reliable AI systems.",

  "nav.label": "Main",
  "nav.work": "Work",
  "nav.notes": "Notes",
  "nav.about": "About",
  "nav.resume": "Resume",
  "nav.skipToContent": "Skip to content",
  "nav.home": "Samuel Hernández, home",
  "lang.switchLabel": "Ver el sitio en español",
  "lang.englishOnly": "Available in English only",
  "external.newTab": "opens in a new tab",

  "hero.name": "Samuel Hernández",
  "hero.role": "Software Engineer",
  "hero.thesis":
    "I build backend systems for problems where correctness matters: engineering calculations, business rules and data that has to stay consistent. Now applying that to AI systems that need to be evaluated, observed and trusted.",
  "hero.spec.label": "Profile",
  "hero.spec.experience": "Experience",
  "hero.spec.experienceValue": "4+ years, industrial and business software",
  "hero.spec.stack": "Stack",
  "hero.spec.focus": "Focus",
  "hero.spec.focusValue": "backend reliability and evaluated AI systems",
  "hero.spec.location": "Based in",
  "hero.spec.locationValue": "Villahermosa, Mexico. Remote",
  "hero.cta.github": "GitHub",
  "hero.cta.cv": "CV",
  "hero.artifact.pause": "Pause animation",
  "hero.artifact.play": "Play animation",

  "work.title": "Selected work",
  "work.intro": "Systems I built, with the problem, my role and what changed.",
  "experience.title": "Selected experience",
  "experience.intro": "Recent roles and what I built in them.",
  "work.present": "present",
  "work.other": "Other work",
  "work.caseStudy": "Read the case study",
  "work.role": "Role",
  "work.outcome": "Outcome",

  "workIndex.metaTitle": "Work · Samuel Hernández",
  "workIndex.metaDescription":
    "Software systems Samuel Hernández has built, with lifecycle status, role, problem and stack. Case studies cover architecture, engineering decisions and trade-offs.",
  "workIndex.title": "Work",
  "workIndex.intro":
    "Systems I have built, with their lifecycle status. Case studies explain the problem, my role, the architecture and the engineering decisions.",
  "caseStudy.label": "Case study",
  "caseStudy.role": "Role",
  "caseStudy.focus": "Focus",
  "caseStudy.stack": "Stack",
  "caseStudy.status": "Status",
  "caseStudy.contents": "On this page",
  "caseStudy.allWork": "All work",
  "caseStudy.draft": "Draft preview. This case study is not published.",

  "engineer.title": "What I engineer",
  "engineer.exploring": "Exploring",
  "engineer.backend.title": "Backend systems",
  "engineer.backend.body": "APIs and services that encode business and engineering rules.",
  "engineer.data.title": "Data & persistence",
  "engineer.data.body": "Relational models that keep data consistent as the rules change.",
  "engineer.ai.title": "Applied AI",
  "engineer.ai.body": "Checking what AI systems produce against reference answers before trusting it.",
  "engineer.reliability.title": "Reliability & delivery",
  "engineer.reliability.body": "Reproducible builds, tests and deployments that behave the same everywhere.",

  "notes.title": "Engineering notes",
  "notes.readingTime": "min read",
  "notes.metaTitle": "Engineering notes · Samuel Hernández",
  "notes.metaDescription":
    "Engineering notes by Samuel Hernández on backend systems, correctness, data-intensive systems, reliability and applied AI engineering.",
  "notes.intro": "Writing on backend systems, correctness, reliability and applied AI engineering.",
  "notes.empty": "No notes are published yet.",
  "notes.all": "All notes",
  "notes.published": "Published",
  "notes.updated": "Updated",
  "notes.tags": "Topics",
  "notes.rss": "RSS feed",

  "bkode.title": "Independent software work has its own home.",
  "bkode.body": "BKODE brings together my commercial software projects and client work, separate from this engineering portfolio.",
  "bkode.cta": "Visit BKODE",

  "contact.title": "Contact",
  "contact.lead": "Open to backend and software engineering roles, including work on applied AI systems. Remote.",
  "contact.email": "Email",
  "contact.copy": "Copy address",
  "contact.copiedShort": "Copied",
  "contact.copied": "Email address copied",
  "contact.copyFailedShort": "Selected",
  "contact.copyFailed": "Could not copy automatically. The address is selected; copy it with Ctrl+C or ⌘C.",
  "contact.write": "Write an email",
  "contact.profiles": "Profiles",
  "contact.cv": "CV",

  "status.research": "research",
  "status.designing": "designing",
  "status.building": "building",
  "status.production": "production",
  "status.archived": "archived",
  "source.open": "open source",
  "source.private": "private",

  "search.label": "Search",
  "search.dialog": "Search the site",
  "search.placeholder": "Search pages, work, notes…",
  "search.empty": "No matching commands",
  "search.results": "results",
  "search.navigate": "navigate",
  "search.select": "select",
  "search.close": "close",
  "search.typePage": "page",
  "search.typeWork": "work",
  "search.typeNote": "note",
  "search.typeAction": "action",
  "search.minutes": "min",
  "palette.home": "Home",
  "palette.email": "Email",
  "palette.cv": "CV (PDF)",
  "palette.theme": "Theme",
  "palette.themeLight": "Light",
  "palette.themeDark": "Dark",
  "palette.themeSystem": "System",
  "palette.hint": "Ctrl K",
  "header.tools": "Site tools",
  "lang.menu": "Language",
  "lang.current": "EN",
  "lang.english": "English",
  "lang.spanish": "Español",
  "lang.spanishHome": "Español (página de inicio)",
  "theme.switch": "Dark theme",
  "theme.following": "Preference: System (follows your device)",
  "theme.fixed": "Preference:",

  "footer.rights": "Samuel Hernández",

  "notFound.metaTitle": "Page not found · Samuel Hernández",
  "notFound.title": "Page not found",
  "notFound.lead": "This address does not match a page on this site. It may have moved, or the link may be mistyped.",
  "notFound.home": "Go to the homepage",
  "notFound.work": "See the work",
  "notFound.search": "Or search the site from the header (Ctrl K).",
  "notFound.spanish": "Ir al inicio en español",
} as const;

export type UIKey = keyof typeof en;

const es = {
  "meta.title": "Samuel Hernández — Ingeniero de Software (Backend, Python, IA aplicada)",
  "meta.description":
    "Ingeniero de software: sistemas backend con Python, FastAPI, PostgreSQL y TypeScript para software industrial y empresarial, hoy hacia IA evaluada y confiable.",

  "nav.label": "Principal",
  "nav.work": "Proyectos",
  "nav.notes": "Notas",
  "nav.about": "Sobre mí",
  "nav.resume": "CV",
  "nav.skipToContent": "Saltar al contenido",
  "nav.home": "Samuel Hernández, inicio",
  "lang.switchLabel": "View the site in English",
  "lang.englishOnly": "Disponible solo en inglés",
  "external.newTab": "se abre en una pestaña nueva",

  "hero.name": "Samuel Hernández",
  "hero.role": "Ingeniero de Software",
  "hero.thesis":
    "Construyo sistemas backend para problemas donde la exactitud importa: cálculos de ingeniería, reglas de negocio y datos que deben mantenerse consistentes. Hoy aplico ese enfoque a sistemas de IA que necesitan ser evaluados, observados y confiables.",
  "hero.spec.label": "Perfil",
  "hero.spec.experience": "Experiencia",
  "hero.spec.experienceValue": "4+ años, software industrial y empresarial",
  "hero.spec.stack": "Stack",
  "hero.spec.focus": "Enfoque",
  "hero.spec.focusValue": "confiabilidad backend y sistemas de IA evaluados",
  "hero.spec.location": "Ubicación",
  "hero.spec.locationValue": "Villahermosa, México. Remoto",
  "hero.cta.github": "GitHub",
  "hero.cta.cv": "CV",
  "hero.artifact.pause": "Pausar animación",
  "hero.artifact.play": "Reproducir animación",

  "work.title": "Trabajo seleccionado",
  "work.intro": "Sistemas que construí: el problema, mi rol y qué cambió.",
  "experience.title": "Experiencia seleccionada",
  "experience.intro": "Roles recientes y lo que construí en ellos.",
  "work.present": "actual",
  "work.other": "Otros trabajos",
  "work.caseStudy": "Leer el caso de estudio",
  "work.role": "Rol",
  "work.outcome": "Resultado",

  "workIndex.metaTitle": "Proyectos · Samuel Hernández",
  "workIndex.metaDescription":
    "Sistemas de software que Samuel Hernández ha construido, con su estado, rol, problema y stack. Los casos de estudio cubren arquitectura, decisiones de ingeniería y trade-offs.",
  "workIndex.title": "Proyectos",
  "workIndex.intro":
    "Sistemas que he construido y su estado actual. Los casos de estudio explican el problema, mi rol, la arquitectura y las decisiones de ingeniería.",
  "caseStudy.label": "Caso de estudio",
  "caseStudy.role": "Rol",
  "caseStudy.focus": "Enfoque",
  "caseStudy.stack": "Stack",
  "caseStudy.status": "Estado",
  "caseStudy.contents": "En esta página",
  "caseStudy.allWork": "Todos los proyectos",
  "caseStudy.draft": "Vista previa de borrador. Este caso de estudio no está publicado.",

  "engineer.title": "Qué construyo",
  "engineer.exploring": "Explorando",
  "engineer.backend.title": "Sistemas backend",
  "engineer.backend.body": "APIs y servicios que codifican reglas de negocio y de ingeniería.",
  "engineer.data.title": "Datos y persistencia",
  "engineer.data.body": "Modelos relacionales que mantienen los datos consistentes cuando cambian las reglas.",
  "engineer.ai.title": "IA aplicada",
  "engineer.ai.body": "Comparar lo que producen los sistemas de IA contra respuestas de referencia antes de confiar en ello.",
  "engineer.reliability.title": "Confiabilidad y entrega",
  "engineer.reliability.body": "Builds, pruebas y despliegues reproducibles que se comportan igual en todos los entornos.",

  "notes.title": "Notas de ingeniería",
  "notes.readingTime": "min de lectura",
  "notes.metaTitle": "Notas de ingeniería · Samuel Hernández",
  "notes.metaDescription":
    "Notas de ingeniería de Samuel Hernández sobre sistemas backend, corrección, sistemas de datos, confiabilidad e IA aplicada. En inglés.",
  "notes.intro": "Notas sobre sistemas backend, corrección, confiabilidad e IA aplicada. En inglés.",
  "notes.empty": "Aún no hay notas publicadas.",
  "notes.all": "Todas las notas",
  "notes.published": "Publicado",
  "notes.updated": "Actualizado",
  "notes.tags": "Temas",
  "notes.rss": "Feed RSS",

  "bkode.title": "El trabajo independiente de software tiene su propio espacio.",
  "bkode.body": "BKODE reúne mis proyectos comerciales de software y trabajo para clientes, separados de este portafolio de ingeniería.",
  "bkode.cta": "Visitar BKODE",

  "contact.title": "Contacto",
  "contact.lead": "Abierto a oportunidades de backend e ingeniería de software, incluyendo trabajo con sistemas de IA aplicada. Remoto.",
  "contact.email": "Correo",
  "contact.copy": "Copiar correo",
  "contact.copiedShort": "Copiado",
  "contact.copied": "Correo copiado",
  "contact.copyFailedShort": "Seleccionado",
  "contact.copyFailed": "No se pudo copiar automáticamente. El correo está seleccionado; cópialo con Ctrl+C o ⌘C.",
  "contact.write": "Escribir un correo",
  "contact.profiles": "Perfiles",
  "contact.cv": "CV",

  "status.research": "investigación",
  "status.designing": "diseño",
  "status.building": "en desarrollo",
  "status.production": "producción",
  "status.archived": "archivado",
  "source.open": "código abierto",
  "source.private": "privado",

  "search.label": "Buscar",
  "search.dialog": "Buscar en el sitio",
  "search.placeholder": "Buscar en el sitio…",
  "search.empty": "No hay resultados",
  "search.results": "resultados",
  "search.navigate": "navegar",
  "search.select": "abrir",
  "search.close": "cerrar",
  "search.typePage": "página",
  "search.typeWork": "proyecto",
  "search.typeNote": "nota",
  "search.typeAction": "acción",
  "search.minutes": "min",
  "palette.home": "Inicio",
  "palette.email": "Correo",
  "palette.cv": "CV (PDF)",
  "palette.theme": "Tema",
  "palette.themeLight": "Claro",
  "palette.themeDark": "Oscuro",
  "palette.themeSystem": "Sistema",
  "palette.hint": "Ctrl K",
  "header.tools": "Herramientas del sitio",
  "lang.menu": "Idioma",
  "lang.current": "ES",
  "lang.english": "English",
  "lang.spanish": "Español",
  "lang.spanishHome": "Español (página de inicio)",
  "theme.switch": "Tema oscuro",
  "theme.following": "Preferencia: Sistema (sigue tu dispositivo)",
  "theme.fixed": "Preferencia:",

  "footer.rights": "Samuel Hernández",

  "notFound.metaTitle": "Página no encontrada · Samuel Hernández",
  "notFound.title": "Página no encontrada",
  "notFound.lead": "Esta dirección no corresponde a ninguna página del sitio. Puede haberse movido o el enlace puede tener un error.",
  "notFound.home": "Ir a la página de inicio",
  "notFound.work": "Ver los proyectos",
  "notFound.search": "O busca en el sitio desde el encabezado (Ctrl K).",
  "notFound.spanish": "Ir al inicio en español",
} as const satisfies Record<UIKey, string>;

export const ui: Record<Locale, Record<UIKey, string>> = { en, es };

export function t(locale: Locale, key: UIKey): string {
  return ui[locale][key];
}

/**
 * "What I engineer": technologies are limited to what the CV and content model
 * support. `used` = production or working experience; `exploring` = current
 * direction, not yet claimed as experience.
 */
export const capabilities = [
  {
    id: "backend",
    used: ["Python", "FastAPI", "TypeScript", "REST APIs", "ASP.NET Core"],
  },
  {
    id: "data",
    used: ["PostgreSQL", "SQL Server", "Relational modeling", "Multi-tenant schemas"],
  },
  {
    id: "ai",
    used: ["Evaluation harnesses"],
    exploring: ["Retrieval", "Agents", "Structured outputs"],
  },
  {
    id: "reliability",
    used: ["Docker", "Automated tests", "Database migrations"],
  },
] as const;
