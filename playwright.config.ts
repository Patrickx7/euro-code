import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

// Nas sessões na nuvem o Chromium já está instalado em /opt/pw-browsers (não rode `playwright install`).
const cloudChromium = '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: !process.env.CI && existsSync(cloudChromium) ? cloudChromium : undefined,
      // WebGL por software, para rodar em máquinas sem GPU (nuvem e CI).
      args: [
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--ignore-gpu-blocklist',
      ],
    },
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
