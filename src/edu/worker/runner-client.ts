/** Corrige exercícios JS/TS num Worker, com um "cão de guarda" para código que trava (loop infinito). */
import type { ExerciseRunResult, ExerciseSpec } from '../runner/run-exercise';
import type { RunRequest, RunResponse } from './protocol';

/** Tempo máximo de uma correção. A primeira inclui baixar o compilador do TypeScript. */
const FIRST_RUN_WATCHDOG_MS = 30_000;
const WATCHDOG_MS = 8_000;
let warmedUp = false;

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (r: ExerciseRunResult) => void; reject: (e: Error) => void }>();

function spawn(): Worker {
  const w = new Worker(new URL('./runner-worker.ts', import.meta.url), { type: 'module' });
  w.onmessage = (event: MessageEvent<RunResponse>) => {
    const data = event.data;
    const entry = pending.get(data.id);
    if (!entry) return;
    pending.delete(data.id);
    if (data.ok) entry.resolve(data.result);
    else entry.reject(new Error(data.error));
  };
  return w;
}

/** Mata o Worker (o código do jogador pode estar num loop infinito) e falha tudo o que estava pendente. */
function restart(reason: string): void {
  worker?.terminate();
  worker = null;
  for (const entry of pending.values()) entry.reject(new Error(reason));
  pending.clear();
}

export function runCodeExercise(spec: ExerciseSpec, code: string): Promise<ExerciseRunResult> {
  worker ??= spawn();
  const id = nextId++;
  const request: RunRequest = { id, spec, code };
  return new Promise<ExerciseRunResult>((resolve, reject) => {
    const timer = setTimeout(
      () => restart('Seu código travou (um loop infinito?) e foi interrompido.'),
      warmedUp ? WATCHDOG_MS : FIRST_RUN_WATCHDOG_MS,
    );
    pending.set(id, {
      resolve: (r) => {
        warmedUp = true;
        clearTimeout(timer);
        resolve(r);
      },
      reject: (e) => {
        clearTimeout(timer);
        reject(e);
      },
    });
    worker?.postMessage(request);
  });
}
