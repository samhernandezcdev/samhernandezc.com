// Product QA tests: interaction, accessibility (axe) and metadata, run against
// the production build served by `astro preview`. Build first:
//   npm run build && npm run test:e2e
// Claude's visual-review captures live in .claude/review/ (gitignored) and are
// not part of this suite.
import { defineConfig, devices } from "@playwright/test";

const PORT = 4322;
// PW_BASE_URL points the suite at a server that is already running (for example
// `astro preview --host` on the LAN address, to check what a phone would load).
const BASE = process.env.PW_BASE_URL ?? `http://127.0.0.1:${PORT}`;
// The demo on real device profiles. Pixel 7 is Chromium and runs in CI; the
// WebKit (iPhone 13) and Firefox projects need `npx playwright install webkit
// firefox` and run only with PW_DEVICES=1.
const DEMO = /hoist-devices\.spec\.mjs/;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: BASE,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", testIgnore: DEMO },
    { name: "chromium-pixel", testMatch: DEMO, use: { ...devices["Pixel 7"] } },
    ...(process.env.PW_DEVICES
      ? [
          { name: "webkit-iphone", testMatch: DEMO, use: { ...devices["iPhone 13"] } },
          { name: "firefox", testMatch: DEMO, use: { ...devices["Desktop Firefox"], trace: "off" } },
        ]
      : []),
  ],
  webServer: process.env.PW_BASE_URL ? undefined : {
    command: `npx astro preview --host 127.0.0.1 --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
