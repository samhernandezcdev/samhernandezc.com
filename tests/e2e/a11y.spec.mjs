// Automated accessibility checks (axe-core, WCAG 2.2 A/AA rules) for every
// public route in light and dark, plus the open search dialog and header menus.
// Complements, never replaces, the manual checks listed in README.md.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ROUTES } from "./helpers.mjs";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const summarize = (violations) =>
  violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 4).join(" | ")}`);

for (const scheme of ["light", "dark"]) {
  test.describe(`axe, ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const route of [...ROUTES, "/this-page-does-not-exist"]) {
      test(`${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: "networkidle" });
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        expect(summarize(violations)).toEqual([]);
      });
    }

    test("open search dialog", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });
      await page.click("[data-palette-open]");
      await page.keyboard.type("rules");
      const { violations } = await new AxeBuilder({ page }).include("[data-palette]").withTags(TAGS).analyze();
      expect(summarize(violations)).toEqual([]);
    });

    test("open header menus", async ({ page }) => {
      await page.goto("/work", { waitUntil: "networkidle" });
      for (const menu of ["[data-lang-menu]", "[data-theme-menu]"]) {
        await page.click(`${menu} summary`);
        const { violations } = await new AxeBuilder({ page }).include(menu).withTags(TAGS).analyze();
        expect(summarize(violations), menu).toEqual([]);
        await page.keyboard.press("Escape");
      }
    });
  });
}
