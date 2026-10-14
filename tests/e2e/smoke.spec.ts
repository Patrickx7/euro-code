import { expect, test } from '@playwright/test';

// Qualidade baixa: nas máquinas da nuvem e da CI o WebGL roda por software.
const GAME_URL = '/?qualidade=baixa';

test.describe.configure({ timeout: 300_000 });

test('o jogo carrega, desenha a cena e o relógio do jogo anda', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${msg.text()} (${msg.location().url})`);
  });

  await page.goto(GAME_URL);
  await expect(page).toHaveTitle('Freela na Estrada');
  await expect(page.locator('#hud-seniority')).toHaveText('Estagiário');
  await expect(page.locator('#hud-car')).toHaveText('Quadradinho 1.0');
  await expect(page.locator('#hud-money')).toContainText('300');
  await expect(page.locator('#hud-fuel')).toHaveText('10.5 L');

  const firstClock = await page.locator('#hud-clock').textContent();
  await expect
    .poll(async () => page.locator('#hud-clock').textContent(), { timeout: 150_000 })
    .not.toBe(firstClock);

  // O modelo 3D do carro carregou (sem erro de rede nem de decodificação).
  await expect
    .poll(async () => page.evaluate(() => document.body.dataset.carLoaded), { timeout: 60_000 })
    .toBe('true');

  // O loop está desenhando quadros.
  await expect
    .poll(async () => Number(await page.evaluate(() => document.body.dataset.frames ?? '0')), {
      timeout: 60_000,
    })
    .toBeGreaterThan(0);

  // O piloto automático sai andando; quando o jogador aperta uma tecla, assume o volante.
  const speedOf = async () => Number((await page.locator('#hud-speed').textContent())?.replace(/\D/g, ''));
  await expect.poll(speedOf, { timeout: 60_000 }).toBeGreaterThan(0);
  await expect(page.locator('#controls-mode')).toHaveText('Piloto automático');
  await page.keyboard.down('Space');
  await expect(page.locator('#controls-mode')).toHaveText('Você dirige', { timeout: 30_000 });
  // Freando (e, depois de parar, engatando a ré, que vai até 18 km/h).
  await expect.poll(speedOf, { timeout: 60_000 }).toBeLessThanOrEqual(18);
  await page.keyboard.up('Space');

  const canvasBox = await page.locator('#game').boundingBox();
  expect(canvasBox?.width).toBeGreaterThan(300);
  expect(errors).toEqual([]);
});

test('o canvas não está em branco', async ({ page }) => {
  await page.goto(GAME_URL);
  await expect
    .poll(async () => Number(await page.evaluate(() => document.body.dataset.frames ?? '0')), {
      timeout: 60_000,
    })
    .toBeGreaterThan(0);
  const screenshot = await page.locator('#game').screenshot();
  // Uma tela de uma cor só comprime para poucos bytes; a cena com morros, árvores, estrada e o carro é bem maior.
  expect(screenshot.byteLength).toBeGreaterThan(8_000);
});
