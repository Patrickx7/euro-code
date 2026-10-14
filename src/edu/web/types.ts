import type { WebFiles } from '../../shared/content';

export interface WebTestResult {
  description: string;
  passed: boolean;
  /** Motivo da falha, em português. */
  message?: string;
}

export interface WebRunResult {
  passed: boolean;
  tests: WebTestResult[];
  /** Erros de JavaScript lançados pela página. */
  pageErrors: string[];
}

/** Roda os testes de um exercício web numa página real (Chromium no validador, iframe no jogo). */
export type WebRunner = (
  files: WebFiles,
  tests: { description: string; code: string }[],
  viewport: { width: number; height: number },
) => Promise<WebRunResult>;

/** O que o runtime de testes deixa em `window.__freela` dentro da página do exercício. */
export interface FreelaPageApi {
  run(tests: { description: string; code: string }[], timeoutMs?: number): Promise<WebTestResult[]>;
  errors: string[];
}

declare global {
  interface Window {
    __freela: FreelaPageApi;
  }
}
