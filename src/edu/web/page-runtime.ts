/**
 * Roda dentro da página do exercício web (HTML/CSS/JS do jogador) e executa os testes do cliente.
 *
 * Vai empacotado como script e entra na página ANTES do código do jogador, para registrar erros de
 * JavaScript. No validador (Node + Playwright) e no jogo (iframe isolado), quem chama é
 * `window.__freela.run(testes)`.
 */
import { AssertionError, createAssert } from '../runner/assert';
import type { WebTestResult } from './types';

type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
};

function element(selector: string): Element {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Elemento "${selector}" não encontrado na página.`);
  return el;
}

function box(selector: string): Box {
  const r = element(selector).getBoundingClientRect();
  return {
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
    centerX: r.left + r.width / 2,
    centerY: r.top + r.height / 2,
  };
}

function style(selector: string): CSSStyleDeclaration {
  return getComputedStyle(element(selector));
}

function click(selector: string): void {
  (element(selector) as HTMLElement).click();
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const strictAssert = createAssert(true);
const assert = Object.assign(strictAssert, {
  /** `assert.near(atual, esperado, tolerância)`: para medidas de layout, que nunca batem no pixel. */
  near(actual: number, expected: number, tolerance = 2, message?: string): void {
    if (typeof actual !== 'number' || Math.abs(actual - expected) > tolerance) {
      throw new AssertionError(
        message ??
          `Esperava cerca de ${expected} (±${tolerance}), mas está em ${Math.round(actual * 10) / 10}.`,
        actual,
        expected,
      );
    }
  },
});

const pageErrors: string[] = [];
window.addEventListener('error', (event) => {
  pageErrors.push(
    event.error instanceof Error ? `${event.error.name}: ${event.error.message}` : event.message,
  );
});

const AsyncFunction = (async () => {
  await Promise.resolve();
}).constructor as new (...args: string[]) => (...args: unknown[]) => Promise<void>;

async function run(
  tests: { description: string; code: string }[],
  timeoutMs = 3000,
): Promise<WebTestResult[]> {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const scope = { assert, document, window, box, style, click, wait, viewport };
  const results: WebTestResult[] = [];
  for (const test of tests) {
    if (pageErrors.length > 0) {
      results.push({
        description: test.description,
        passed: false,
        message: `O JavaScript da página deu erro: ${pageErrors[0]}`,
      });
      continue;
    }
    try {
      const fn = new AsyncFunction(...Object.keys(scope), test.code);
      let timer: ReturnType<typeof setTimeout> | undefined;
      await Promise.race([
        fn(...Object.values(scope)),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('O teste demorou demais (tempo esgotado).')), timeoutMs);
        }),
      ]).finally(() => clearTimeout(timer));
      results.push({ description: test.description, passed: true });
    } catch (err) {
      const message =
        err instanceof AssertionError
          ? err.message
          : err instanceof Error
            ? `${err.name}: ${err.message}`
            : String(err);
      results.push({ description: test.description, passed: false, message });
    }
  }
  return results;
}

window.__freela = { run, errors: pageErrors };
