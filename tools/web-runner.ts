/**
 * Executa exercícios web (HTML/CSS/JS) no Chromium do Playwright, para o validador de conteúdo e os
 * testes. O runtime de testes (`src/edu/web/page-runtime.ts`) é empacotado com esbuild.
 */
import { chromium, type Browser } from '@playwright/test';
import { existsSync } from 'node:fs';
import { buildWebPage } from '../src/edu/web/page';
import type { WebRunner } from '../src/edu/web/types';
import { bundlePageRuntime } from './page-runtime-bundle';

const CLOUD_CHROMIUM = '/opt/pw-browsers/chromium';
let runtimeScript: string | null = null;
let browserPromise: Promise<Browser> | null = null;

export function pageRuntimeScript(): string {
  runtimeScript ??= bundlePageRuntime();
  return runtimeScript;
}

function browser(): Promise<Browser> {
  browserPromise ??= chromium.launch({
    executablePath: !process.env.CI && existsSync(CLOUD_CHROMIUM) ? CLOUD_CHROMIUM : undefined,
  });
  return browserPromise;
}

export const runWebInChromium: WebRunner = async (files, tests, viewport) => {
  const context = await (await browser()).newContext({ viewport });
  const page = await context.newPage();
  try {
    await page.setContent(buildWebPage(files, pageRuntimeScript()), { waitUntil: 'load' });
    const results = await page.evaluate((t) => window.__freela.run(t), tests);
    const pageErrors = await page.evaluate(() => window.__freela.errors);
    return { passed: results.every((r) => r.passed), tests: results, pageErrors };
  } finally {
    await context.close();
  }
};

export async function closeWebRunner(): Promise<void> {
  if (browserPromise) await (await browserPromise).close();
  browserPromise = null;
}
