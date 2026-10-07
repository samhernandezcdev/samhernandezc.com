import { links } from "@/i18n/ui";

// JSON-LD builders. Only public, already-stated facts: no employer details
// beyond the About page's current role, no private URLs, standards, ERP brand
// or source code (the industrial implementation is private).

/** Stable identifier so pages can reference the same Person. */
export const personId = (site: URL) => new URL("/#person", site).href;

export function person(site: URL, worksFor?: string) {
  return {
    "@type": "Person",
    "@id": personId(site),
    name: "Samuel Hernández",
    jobTitle: "Software Engineer",
    url: site.href,
    sameAs: [links.github, links.linkedin],
    ...(worksFor && { worksFor: { "@type": "Organization", name: worksFor } }),
  };
}

export function website(site: URL, inLanguage: string) {
  return {
    "@type": "WebSite",
    "@id": new URL("/#website", site).href,
    name: "Samuel Hernández",
    url: site.href,
    inLanguage,
    author: { "@id": personId(site) },
  };
}

export function caseStudy(site: URL, page: { name: string; description: string; url: string; keywords: string[] }) {
  return {
    "@type": "CreativeWork",
    name: page.name,
    description: page.description,
    url: page.url,
    inLanguage: "en",
    genre: "Case study",
    keywords: page.keywords.join(", "),
    author: { "@type": "Person", "@id": personId(site), name: "Samuel Hernández" },
  };
}

export const graph = (...nodes: object[]) => JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });
