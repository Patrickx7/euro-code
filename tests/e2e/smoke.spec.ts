import { expect, test } from '@playwright/test';

test('o jogo carrega, desenha a cena e o relógio do jogo anda', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${msg.text()} (${msg.location().url})`);
  });

  await page.goto('/');
  await expect(page).toHaveTitle('Euro Code');
  await expect(page.locator('#hud-level')).toHaveText('1');
  await expect(page.locator('#hud-money')).toContainText('5.000');
  await expect(page.locator('#hud-speed')).toHaveText('70 km/h');

  const firstClock = await page.locator('#hud-clock').textContent();
  await expect
    .poll(async () => page.locator('#hud-clock').textContent(), { timeout: 15_000 })
    .not.toBe(firstClock);

  // O loop está desenhando quadros.
  await expect
    .poll(async () => Number(await page.evaluate(() => document.body.dataset.frames ?? '0')), {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);

  const canvasBox = await page.locator('#game').boundingBox();
  expect(canvasBox?.width).toBeGreaterThan(300);
  expect(errors).toEqual([]);
});

test('o canvas não está em branco', async ({ page }) => {
  await page.goto('/');
  await expect
    .poll(async () => Number(await page.evaluate(() => document.body.dataset.frames ?? '0')))
    .toBeGreaterThan(0);
  const screenshot = await page.locator('#game').screenshot();
  // Uma tela de uma cor só comprime para poucos bytes; a cena com estrada e prédios é bem maior.
  expect(screenshot.byteLength).toBeGreaterThan(8_000);
});
