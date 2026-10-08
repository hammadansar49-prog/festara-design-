import { defineConfig } from "@playwright/test";

// Uses the Edge already installed on the machine, so no browser download is needed.
export default defineConfig({
  testDir: "e2e",
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000", channel: "msedge" },
  webServer: process.env.BASE_URL ? undefined : { command: "npx next dev -p 3000", url: "http://localhost:3000", reuseExistingServer: true },
});
