import { expect, test, type Page } from '@playwright/test';
import centralizar from '../../content/core/m03-layout/index';

// O clássico: a pousada em Caucaia do Alto quer a div no meio. `?perto` põe o cliente logo à frente.
const JOB = 'core.m03.j01';
const GAME_URL = `/?qualidade=baixa&perto&job=${JOB}`;

test.describe.configure({ timeout: 480_000 });

async function replaceEditorText(page: Page, text: string) {
  await page.click('.nb-editor .cm-content');
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(text);
}

test('aceitar um job, dirigir até o cliente, resolver as tasks no notebook e entregar', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(GAME_URL);
  await expect(page.locator('#job-hud')).toContainText('Sem job', { timeout: 120_000 });

  await page.click('#phone-button');
  const card = page.locator(`.job-card[data-job="${JOB}"]`);
  await expect(card).toContainText('Pousada Recanto do Wi-Fi Fraco', { timeout: 60_000 });
  await card.locator('.job-card__accept').click();
  await expect(page.locator('#job-hud')).toContainText('pela estrada', { timeout: 60_000 });

  // O piloto automático leva o carro até o feixe de luz e para; o notebook abre sozinho.
  const notebook = page.locator('#notebook');
  await expect(notebook).toBeVisible({ timeout: 300_000 });
  await expect(notebook).toContainText('Dona Cida');

  const job = centralizar.jobs.find((j) => j.id === JOB);
  if (!job) throw new Error(`Job ${JOB} não existe no conteúdo.`);
  const exerciseById = new Map(centralizar.exercises.map((e) => [e.id, e]));

  // Primeiro, rodar o código inicial: os testes falham com uma mensagem em português.
  await page.click('[data-action=run]');
  await expect(page.locator('.nb-result.is-fail').first()).toBeVisible({ timeout: 60_000 });

  // Resolve a task atual e a que o cliente pedir "rapidinho" no meio.
  for (let round = 0; round < 4 && !(await page.isEnabled('[data-action=deliver]')); round++) {
    const title = (await page.textContent('.nb-panel h2')) ?? '';
    const exercise = [...exerciseById.values()].find((e) => title.startsWith(e.title));
    if (!exercise || exercise.language !== 'web') throw new Error(`Task inesperada: ${title}`);
    for (const file of exercise.editableFiles) {
      await page.click(
        `.nb-file:has-text("${{ html: 'index.html', css: 'style.css', js: 'script.js' }[file]}")`,
      );
      await replaceEditorText(page, exercise.solutionFiles[file]);
    }
    await page.click('[data-action=run]');
    await expect(page.locator('[data-action=run]')).toHaveText('Rodar testes', { timeout: 60_000 });
  }
  await expect(notebook).toContainText('É rapidinho');

  await page.click('[data-action=deliver]');
  await expect(page.locator('.nb-summary')).toContainText('Job entregue!');
  await page.click('[data-action=back]');
  await expect(page.locator('#hud-money')).toContainText('330', { timeout: 30_000 });
  await expect(page.locator('#job-hud')).toContainText('Sem job', { timeout: 60_000 });
  expect(errors).toEqual([]);
});
