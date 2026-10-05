// Shared UI strings for the redesigned site (EN canonical at `/`, ES shell at
// `/es` for Home, Work index and About). Not wired to the current pages yet;
// the live copy still comes from ./pages.ts until the redesign replaces it.

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Routes that exist in both languages. Case studies and notes are English-only. */
export const localizedRoutes = ["/", "/work", "/about"] as const;

const en = {
  "nav.work": "Work",
  "nav.notes": "Notes",
  "nav.about": "About",
  "nav.resume": "Resume",
  "nav.skipToContent": "Skip to content",
  "lang.switch": "Español",
  "lang.englishOnly": "Available in English only",
  "status.research": "research",
  "status.designing": "designing",
  "status.building": "building",
  "status.production": "production",
  "status.archived": "archived",
  "source.open": "open source",
  "source.private": "private",
} as const;

type UIKey = keyof typeof en;

const es = {
  "nav.work": "Proyectos",
  "nav.notes": "Notas",
  "nav.about": "Sobre mí",
  "nav.resume": "CV",
  "nav.skipToContent": "Saltar al contenido",
  "lang.switch": "English",
  "lang.englishOnly": "Disponible solo en inglés",
  "status.research": "investigación",
  "status.designing": "diseño",
  "status.building": "en desarrollo",
  "status.production": "producción",
  "status.archived": "archivado",
  "source.open": "código abierto",
  "source.private": "privado",
} as const satisfies Record<UIKey, string>;

export const ui: Record<Locale, Record<UIKey, string>> = { en, es };

export function t(locale: Locale, key: UIKey): string {
  return ui[locale][key];
}
