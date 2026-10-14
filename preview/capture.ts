/**
 * Gera as imagens da prévia visual.
 *   npx tsx preview/capture.ts <pasta-de-saída> [página?query ...]
 * Ex.: npx tsx preview/capture.ts /tmp/out "realism.html?time=golden" "realism.html?time=dusk"
 */
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createServer } from 'vite';

const [outDir = 'preview-out', ...pages] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const server = await createServer({ server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();

const cloudChromium = '/opt/pw-browsers/chromium';
const browser = await chromium.launch({
  executablePath: existsSync(cloudChromium) ? cloudChromium : undefined,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
});

try {
  for (const page of pages.length > 0 ? pages : ['realism.html?time=golden']) {
    const tab = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    const errors: string[] = [];
    tab.on('pageerror', (err) => errors.push(err.message));
    tab.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await tab.goto(`http://localhost:5199/preview/${page}`);
    await tab.waitForFunction(() => document.body.dataset.ready === '1', undefined, { timeout: 540_000 });
    await tab.waitForTimeout(500);
    const name = page
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/-html-?/, '-')
      .replace(/-$/, '');
    const file = join(outDir, `${name}.png`);
    await tab.screenshot({ path: file });
    console.log(file, errors.length > 0 ? `ERROS: ${errors.join(' | ')}` : '');
    await tab.close();
  }
} finally {
  await browser.close();
  await server.close();
}
