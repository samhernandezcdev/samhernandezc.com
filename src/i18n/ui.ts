// UI strings for the site shell and homepage. English is canonical at `/`;
// the Spanish shell lives at `/es` (Home now; Work index and About later).
// Case studies and engineering notes stay English-only.

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Routes that exist in both languages. Case studies and notes are English-only. */
export const localizedRoutes = ["/", "/work", "/about"] as const;

export const homePaths: Record<Locale, string> = { en: "/", es: "/es" };
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
  "lang.switch": "ES",
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

  "work.title": "Selected work",
  "work.intro": "Systems I built, with the problem, my role and what changed.",
  "experience.title": "Selected experience",
  "experience.intro": "Recent roles and what I built in them.",
  "work.present": "present",
  "work.other": "Other work",
  "work.caseStudy": "Read the case study",
  "work.role": "Role",
  "work.outcome": "Outcome",

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

  "bkode.tagline": "Software engineering for businesses.",
  "bkode.prompt": "Need a product built?",

  "contact.title": "Contact",
  "contact.lead": "Open to backend and applied-AI engineering roles, remote.",
  "contact.email": "Email",
  "contact.copy": "Copy",
  "contact.copied": "Email address copied",
  "contact.linkedin": "LinkedIn",
  "contact.github": "GitHub",
  "contact.cv": "CV",
  "contact.cvEn": "English (PDF)",
  "contact.cvEs": "Spanish (PDF)",

  "status.research": "research",
  "status.designing": "designing",
  "status.building": "building",
  "status.production": "production",
  "status.archived": "archived",
  "source.open": "open source",
  "source.private": "private",

  "footer.rights": "Samuel Hernández",
} as const;

export type UIKey = keyof typeof en;

const es = {
  "meta.title": "Samuel Hernández — Ingeniero de Software (Backend, Python, IA aplicada)",
  "meta.description":
    "Ingeniero de software que construye sistemas backend con Python, FastAPI, PostgreSQL y TypeScript para software industrial y empresarial. Hoy enfocado en sistemas de IA evaluados y confiables.",

  "nav.label": "Principal",
  "nav.work": "Proyectos",
  "nav.notes": "Notas",
  "nav.about": "Sobre mí",
  "nav.resume": "CV",
  "nav.skipToContent": "Saltar al contenido",
  "nav.home": "Samuel Hernández, inicio",
  "lang.switch": "EN",
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

  "work.title": "Trabajo seleccionado",
  "work.intro": "Sistemas que construí: el problema, mi rol y qué cambió.",
  "experience.title": "Experiencia seleccionada",
  "experience.intro": "Roles recientes y lo que construí en ellos.",
  "work.present": "actual",
  "work.other": "Otros trabajos",
  "work.caseStudy": "Leer el caso de estudio",
  "work.role": "Rol",
  "work.outcome": "Resultado",

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

  "bkode.tagline": "Ingeniería de software para empresas.",
  "bkode.prompt": "¿Necesitas construir un producto?",

  "contact.title": "Contacto",
  "contact.lead": "Abierto a roles de ingeniería backend e IA aplicada, remotos.",
  "contact.email": "Correo",
  "contact.copy": "Copiar",
  "contact.copied": "Correo copiado",
  "contact.linkedin": "LinkedIn",
  "contact.github": "GitHub",
  "contact.cv": "CV",
  "contact.cvEn": "Inglés (PDF)",
  "contact.cvEs": "Español (PDF)",

  "status.research": "investigación",
  "status.designing": "diseño",
  "status.building": "en desarrollo",
  "status.production": "producción",
  "status.archived": "archivado",
  "source.open": "código abierto",
  "source.private": "privado",

  "footer.rights": "Samuel Hernández",
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
    used: ["Docker", "CI/CD", "Automated tests", "Database migrations"],
  },
] as const;
