/**
 * Worker que corrige exercícios JS/TS fora da thread do jogo. O compilador do TypeScript e as
 * bibliotecas de tipos só são baixados aqui, na primeira correção.
 */
import { runExercise } from '../runner/run-exercise';
import type { RunRequest, RunResponse } from './protocol';

const libLoaders = import.meta.glob<string>(
  ['/node_modules/typescript/lib/lib.es*.d.ts', '/node_modules/typescript/lib/lib.decorators*.d.ts'],
  { query: '?raw', import: 'default' },
);
let libs: Promise<Map<string, string>> | null = null;

/** O type-check pede as libs de forma síncrona: carregamos todas antes. */
function loadLibs(): Promise<Map<string, string>> {
  libs ??= Promise.all(
    Object.entries(libLoaders).map(
      async ([path, load]) => [path.split('/').pop() ?? path, await load()] as const,
    ),
  ).then((entries) => new Map(entries));
  return libs;
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { id, spec, code } = event.data;
  let response: RunResponse;
  try {
    const lib = spec.language === 'ts' ? await loadLibs() : new Map<string, string>();
    const result = await runExercise(spec, code, { readLib: (name) => lib.get(name) });
    response = { id, ok: true, result };
  } catch (err) {
    response = { id, ok: false, error: err instanceof Error ? err.message : String(err) };
  }
  self.postMessage(response);
};
