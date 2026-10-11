// Renders one CV data file (cv/data/*.json) into a print-ready HTML document.
// Single column in reading order so ATS parsers and PDF text extraction see the
// same sequence a person does. All copy comes from the data file.

const esc = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Keeps hyphenated tokens (NOM-024-STPS-2001, multi-tenant) on one line: a break
// after the hyphen reads as "STPS- 2001" in extracted text.
const text = (value) => esc(value).replace(/[\p{L}\p{N}.]+(?:-[\p{L}\p{N}.]+)+/gu, '<span class="nobr">$&</span>');

const link = ({ text, href }) => `<a href="${esc(href)}">${esc(text)}</a>`;

const bullets = (items) => `<ul>${items.map((item) => `<li>${text(item)}</li>`).join("")}</ul>`;

const section = (id, title, body) =>
  `<section aria-labelledby="${id}"><h2 id="${id}">${esc(title)}</h2>${body}</section>`;

const job = (entry) => `
  <article class="entry">
    <div class="entry-head">
      <h3><span class="role">${esc(entry.role)}</span><span class="sep"> · </span><span class="org">${esc(entry.org)}</span></h3>
      <p class="period">${esc(entry.period)}</p>
    </div>
    ${entry.intro ? `<p class="intro">${text(entry.intro)}</p>` : ""}
    ${bullets(entry.bullets)}
  </article>`;

const project = (entry) => `
  <article class="entry">
    <h3>${esc(entry.name)}</h3>
    <p class="where">${esc(entry.meta)}</p>
    ${(entry.links ?? []).map((l) => `<p class="where">${link(l)}</p>`).join("")}
    ${bullets(entry.bullets)}
    ${(entry.after ?? []).map((l) => `<p class="where after">${link(l)}</p>`).join("")}
  </article>`;

export function render(cv, { css }) {
  const contacts = cv.contacts.map(link).join('<span class="sep"> | </span>');
  const skills = cv.skills
    .map((s) => `<li><strong>${esc(s.group)}:</strong> ${text(s.items)}</li>`)
    .join("");
  const education = cv.education
    .map(
      (e) => `
      <div class="entry-head">
        <h3>${esc(e.title)}</h3>
        <p class="period">${esc(e.period)}</p>
      </div>
      <p class="where">${esc(e.detail)}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="${cv.lang}">
<head>
<meta charset="utf-8">
<title>${esc(cv.title)}</title>
<meta name="author" content="${esc(cv.name)}">
<style>${css}</style>
</head>
<body>
<header>
  <h1>${esc(cv.name)}</h1>
  <p class="headline">${esc(cv.headline)}</p>
  <p class="contact">${esc(cv.location)}<span class="sep"> | </span>${contacts}</p>
</header>
<main>
${section("summary", cv.labels.summary, cv.summary.map((p) => `<p>${text(p)}</p>`).join(""))}
${section("experience", cv.labels.experience, cv.experience.map(job).join(""))}
${section("projects", cv.labels.projects, cv.projects.map(project).join(""))}
${section("skills", cv.labels.skills, `<ul class="skills">${skills}</ul>`)}
${section("education", cv.labels.education, `<div class="entry">${education}</div><p class="languages">${esc(cv.languages)}</p>`)}
</main>
</body>
</html>`;
}
