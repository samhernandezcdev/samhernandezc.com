// Shiki theme pair for code blocks, derived from the design tokens: low-chroma
// hues (chroma <= 0.095, far below stock themes) on the warm-paper / graphite
// system, distinct enough to separate syntax. Every token color is >= 4.5:1 on
// --color-surface (the code background) in its theme. Used by astro.config.mjs;
// colors switch through light-dark() in code.css.

/** @param {"light" | "dark"} type @param {Record<string, string>} c */
function theme(type, c) {
  return {
    name: `portfolio-${type}`,
    type,
    colors: { "editor.background": c.bg, "editor.foreground": c.text },
    tokenColors: [
      { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: c.comment } },
      {
        scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control"],
        settings: { foreground: c.keyword },
      },
      { scope: ["keyword.operator", "punctuation"], settings: { foreground: c.text } },
      {
        scope: ["string", "string.quoted", "string.template", "punctuation.definition.string"],
        settings: { foreground: c.string },
      },
      {
        scope: ["entity.name.function", "support.function", "meta.function-call.generic"],
        settings: { foreground: c.function },
      },
      {
        scope: ["constant.numeric", "constant.language", "constant.character", "support.constant"],
        settings: { foreground: c.constant },
      },
      {
        scope: ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.other.inherited-class"],
        settings: { foreground: c.type },
      },
      { scope: ["variable.parameter", "variable", "meta.definition.variable"], settings: { foreground: c.text } },
      { scope: ["entity.name.tag", "entity.other.attribute-name"], settings: { foreground: c.keyword } },
      { scope: ["markup.heading", "markup.bold"], settings: { fontStyle: "bold" } },
    ],
  };
}

export const syntaxLight = theme("light", {
  bg: "#eeede9",
  text: "#211f1b",
  comment: "#6c6863",
  keyword: "#006950",
  string: "#885720",
  function: "#2d5883",
  constant: "#8d4e53",
  type: "#536531",
});

export const syntaxDark = theme("dark", {
  bg: "#22201d",
  text: "#eae7e2",
  comment: "#95928a",
  keyword: "#75cbae",
  string: "#deb67f",
  function: "#96bbe3",
  constant: "#e4a5a4",
  type: "#b3c792",
});
