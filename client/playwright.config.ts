import { defineConfig, devices } from "@playwright/test";

const WEB_PORT = Number(process.env.WEB_PORT ?? "5173");

/* Browser harness for design-auditor: axe + snapshots, Chromium-first.
 * - baseURL follows WEB_PORT (same knob as `make web`).
 * - webServer serves the production build (already validated by `tsc -b`).
 * - Snapshots: animations disabled + reduced motion + fixed viewport, so the
 *   Motion adoption (PR3) can't flake baselines. Baselines update ONLY on
 *   ubuntu CI (`make web-e2e-update`), never from a local Windows run.
 * - Authed routes need a running API (`make db-up && make migrate && make api`);
 *   anonymous routes (landing, login) run backend-less via offline fallback.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  snapshotPathTemplate: "{testDir}/__snapshots__/{testFileName}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      stylePath: undefined,
      maxDiffPixelRatio: 0.01,
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        reducedMotion: "reduce",
      },
    },
  ],
  webServer: {
    command: `npm run preview -- --port ${WEB_PORT} --strictPort`,
    port: WEB_PORT,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
