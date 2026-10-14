/**
 * Roda exercícios web no jogo: a página do jogador vai num iframe isolado (`sandbox` sem
 * `allow-same-origin`), que também serve de preview. Os testes chegam por mensagem.
 */
import runtimeScript from 'virtual:page-runtime';
import type { WebFiles } from '../../shared/content';
import { buildWebPage } from './page';
import type { WebRunResult, WebTestResult } from './types';

const RUN_TIMEOUT_MS = 15_000;

/** Coloca a página num iframe (substituindo o anterior) e espera carregar. */
export function mountPage(
  container: HTMLElement,
  files: WebFiles,
  viewport: { width: number; height: number },
) {
  container.replaceChildren();
  const iframe = document.createElement('iframe');
  // Sem allow-same-origin: o código do jogador não alcança o jogo. Sem allow-forms: submit não navega.
  iframe.sandbox.add('allow-scripts');
  iframe.title = 'Prévia da página';
  iframe.width = String(viewport.width);
  iframe.height = String(viewport.height);
  iframe.srcdoc = buildWebPage(files, runtimeScript);
  container.append(iframe);
  const loaded = new Promise<void>((resolve) =>
    iframe.addEventListener('load', () => resolve(), { once: true }),
  );
  return { iframe, loaded };
}

export async function runWebInIframe(
  container: HTMLElement,
  files: WebFiles,
  tests: { description: string; code: string }[],
  viewport: { width: number; height: number },
): Promise<WebRunResult> {
  const { iframe, loaded } = mountPage(container, files, viewport);
  await loaded;
  const nonce = Math.random().toString(36).slice(2);
  return new Promise<WebRunResult>((resolve) => {
    const timer = setTimeout(() => {
      window.removeEventListener('message', onMessage);
      resolve({
        passed: false,
        tests: tests.map((t) => ({ description: t.description, passed: false, message: 'A página travou.' })),
        pageErrors: [],
      });
    }, RUN_TIMEOUT_MS);
    function onMessage(event: MessageEvent<unknown>) {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data as {
        type?: unknown;
        nonce?: unknown;
        results?: unknown;
        errors?: unknown;
      } | null;
      if (data?.type !== 'freela:results' || data.nonce !== nonce) return;
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      const results = data.results as WebTestResult[];
      resolve({
        passed: results.every((r) => r.passed),
        tests: results,
        pageErrors: data.errors as string[],
      });
    }
    window.addEventListener('message', onMessage);
    iframe.contentWindow?.postMessage({ type: 'freela:run', nonce, tests }, '*');
  });
}
