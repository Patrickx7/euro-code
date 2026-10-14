/**
 * Ambiente que imita o Node para rodar o código do jogador: `console`, `process`, `require`,
 * timers e os módulos `fs`, `path`, `events` e `assert`.
 *
 * Importante: isto NÃO isola o código. No jogo, o sandbox roda dentro de um Web Worker, que é
 * encerrado se o tempo estourar (um loop infinito síncrono só para assim).
 */
import pathPosix from 'path-browserify';
import { BALANCE } from '../../shared/balance';
import { AssertionError, createAssert } from './assert';
import { transpile, type CodeDiagnostic } from './compile';
import { createEventsModule } from './event-emitter';
import { formatLogArgs, inspect, quoteString } from './inspect';
import { createMemFs, SANDBOX_CWD } from './memfs';

export interface SandboxOptions {
  /** Caminho do arquivo principal, ex.: "/app/main.js". */
  mainFile: string;
  /** Outros arquivos do projeto (caminhos relativos a /app), carregados com `require`/`import`. */
  extraFiles?: Record<string, string>;
  fsSeed?: Record<string, string>;
  argv?: string[];
  timeoutMs?: number;
}

export interface ScriptOutcome {
  stdout: string[];
  stderr: string[];
  /** Mensagem do erro não tratado, ou `null` se terminou bem. */
  error: string | null;
  compileErrors: CodeDiagnostic[];
  exitCode: number;
  timedOut: boolean;
  /** Se o script chamou `__reachedEnd()` (o corretor usa para saber se o teste rodou até o fim). */
  reachedEnd: boolean;
  files: Record<string, string>;
}

class ExitSignal extends Error {
  constructor(readonly code: number) {
    super(`process.exit(${code})`);
  }
}

const AsyncFunction = (async () => {
  await Promise.resolve();
}).constructor as new (...args: string[]) => (...args: unknown[]) => Promise<unknown>;

const NODE_PATH = '/usr/local/bin/node';

export function formatError(err: unknown): string {
  if (err instanceof AssertionError) return err.message;
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return `Uncaught ${inspect(err)}`;
}

function wrapBody(code: string, strict: boolean): string {
  return `${strict ? '"use strict";\n' : ''}${code}`;
}

/** Executa um script completo e espera os timers pendentes terminarem, como o Node faria. */
export async function runInSandbox(source: string, options: SandboxOptions): Promise<ScriptOutcome> {
  const timeoutMs = options.timeoutMs ?? BALANCE.education.runTimeoutMs;
  const outLines: string[] = [];
  const errLines: string[] = [];
  const buffers = { out: '', err: '' };
  let groupIndent = '';

  let exited = false;
  /** Se a execução chegou ao fim do script (quem roda os testes chama `__reachedEnd()` no final). */
  let reachedEnd = false;
  const writeRaw = (stream: 'out' | 'err', text: string) => {
    // Depois de process.exit(), o processo morreu: nada mais é impresso (mesmo se um catch pegou o sinal).
    if (exited) return;
    buffers[stream] += text;
    const parts = buffers[stream].split('\n');
    buffers[stream] = parts.pop() ?? '';
    (stream === 'out' ? outLines : errLines).push(...parts);
  };
  const writeLine = (stream: 'out' | 'err', text: string) => {
    const indented = groupIndent
      ? text
          .split('\n')
          .map((l) => groupIndent + l)
          .join('\n')
      : text;
    writeRaw(stream, `${indented}\n`);
  };

  // ---- timers rastreados, para saber quando o "processo" terminaria ----
  const timers = new Map<number, ReturnType<typeof globalThis.setTimeout>>();
  let nextTimerId = 1;
  let uncaught: unknown = undefined;
  let hasUncaught = false;
  let exitCode: number | null = null;
  let onIdle: (() => void) | null = null;

  const isIdle = () => timers.size === 0 || hasUncaught || exitCode !== null;
  let idleCheckPending = false;
  /**
   * O "processo" termina quando não há mais timers. A conferência espera a fila de microtarefas
   * esvaziar (um `await` pendente ainda pode criar timers ou imprimir algo), como o Node.
   */
  const checkIdle = () => {
    if (!onIdle || idleCheckPending || !isIdle()) return;
    idleCheckPending = true;
    globalThis.setTimeout(() => {
      idleCheckPending = false;
      if (onIdle && isIdle()) onIdle();
    }, 0);
  };
  const handleThrown = (err: unknown) => {
    if (err instanceof ExitSignal) {
      exitCode ??= err.code;
    } else if (!hasUncaught) {
      hasUncaught = true;
      uncaught = err;
    }
    checkIdle();
  };
  const addTimer = <A extends unknown[]>(
    callback: (...args: A) => void,
    ms: number,
    args: A,
    repeat: boolean,
  ): number => {
    if (typeof callback !== 'function') {
      throw new TypeError('The "callback" argument must be of type function.');
    }
    const id = nextTimerId++;
    const run = () => {
      if (!repeat) timers.delete(id);
      if (exitCode !== null || hasUncaught) return;
      try {
        callback(...args);
      } catch (err) {
        handleThrown(err);
      }
      checkIdle();
    };
    const delay = Math.max(0, Number(ms) || 0);
    timers.set(
      id,
      repeat ? globalThis.setInterval(run, Math.max(1, delay)) : globalThis.setTimeout(run, delay),
    );
    return id;
  };
  const clearTimer = (id: unknown) => {
    const handle = timers.get(id as number);
    if (handle === undefined) return;
    globalThis.clearTimeout(handle);
    globalThis.clearInterval(handle);
    timers.delete(id as number);
    checkIdle();
  };
  const clearAllTimers = () => {
    for (const handle of timers.values()) {
      globalThis.clearTimeout(handle);
      globalThis.clearInterval(handle);
    }
    timers.clear();
  };

  const timerGlobals = {
    setTimeout: <A extends unknown[]>(cb: (...a: A) => void, ms = 0, ...args: A) =>
      addTimer(cb, ms, args, false),
    setInterval: <A extends unknown[]>(cb: (...a: A) => void, ms = 0, ...args: A) =>
      addTimer(cb, ms, args, true),
    setImmediate: <A extends unknown[]>(cb: (...a: A) => void, ...args: A) => addTimer(cb, 0, args, false),
    clearTimeout: clearTimer,
    clearInterval: clearTimer,
    clearImmediate: clearTimer,
    queueMicrotask: (cb: () => void) =>
      queueMicrotask(() => {
        try {
          cb();
        } catch (err) {
          handleThrown(err);
        }
      }),
  };

  // ---- console ----
  const counts = new Map<string, number>();
  const timeLabels = new Map<string, number>();
  const consoleObject = {
    log: (...args: unknown[]) => writeLine('out', formatLogArgs(args)),
    info: (...args: unknown[]) => writeLine('out', formatLogArgs(args)),
    debug: (...args: unknown[]) => writeLine('out', formatLogArgs(args)),
    warn: (...args: unknown[]) => writeLine('err', formatLogArgs(args)),
    error: (...args: unknown[]) => writeLine('err', formatLogArgs(args)),
    dir: (value: unknown) =>
      writeLine('out', typeof value === 'string' ? quoteString(value) : inspect(value)),
    table: (value: unknown) => writeLine('out', inspect(value)),
    group: (...label: unknown[]) => {
      if (label.length > 0) writeLine('out', formatLogArgs(label));
      groupIndent += '  ';
    },
    groupEnd: () => {
      groupIndent = groupIndent.slice(2);
    },
    count: (label = 'default') => {
      const n = (counts.get(label) ?? 0) + 1;
      counts.set(label, n);
      writeLine('out', `${label}: ${n}`);
    },
    countReset: (label = 'default') => counts.delete(label),
    time: (label = 'default') => timeLabels.set(label, performance.now()),
    timeEnd: (label = 'default') => {
      const start = timeLabels.get(label);
      if (start === undefined) return;
      timeLabels.delete(label);
      writeLine('out', `${label}: ${(performance.now() - start).toFixed(3)}ms`);
    },
    assert: (condition: unknown, ...data: unknown[]) => {
      if (!condition) {
        writeLine('err', data.length > 0 ? `Assertion failed: ${formatLogArgs(data)}` : 'Assertion failed');
      }
    },
  };

  // ---- process ----
  const processObject = {
    argv: [NODE_PATH, options.mainFile, ...(options.argv ?? [])],
    // No Node, tudo que entra em process.env vira texto.
    env: new Proxy<Record<string, string | undefined>>(
      {},
      {
        set(target, key, value) {
          target[key as string] = String(value);
          return true;
        },
      },
    ),
    exitCode: undefined as number | undefined,
    platform: 'linux',
    exit(code?: number): never {
      const finalCode = code ?? processObject.exitCode ?? 0;
      exitCode ??= finalCode;
      exited = true;
      throw new ExitSignal(finalCode);
    },
    cwd: () => SANDBOX_CWD,
    nextTick: (cb: (...args: unknown[]) => void, ...args: unknown[]) =>
      timerGlobals.queueMicrotask(() => cb(...args)),
    stdout: { write: (text: unknown) => (writeRaw('out', String(text)), true) },
    stderr: { write: (text: unknown) => (writeRaw('err', String(text)), true) },
  };

  // ---- módulos ----
  const memfs = createMemFs(options.fsSeed, (task) => {
    addTimer(task, 0, [], false);
  });
  const pathModule: Record<string, unknown> = {
    ...pathPosix,
    resolve: (...paths: string[]) => pathPosix.resolve(SANDBOX_CWD, ...paths),
  };
  pathModule.posix = pathModule;
  const builtins: Record<string, unknown> = {
    fs: memfs.module,
    'fs/promises': memfs.promises,
    path: pathModule,
    events: createEventsModule(),
    assert: createAssert(false),
    'assert/strict': createAssert(true),
  };

  const extraFiles = new Map(
    Object.entries(options.extraFiles ?? {}).map(([name, code]) => [
      pathPosix.resolve(SANDBOX_CWD, name),
      code,
    ]),
  );
  const moduleCache = new Map<string, { exports: unknown }>();

  const resolveFile = (fromDir: string, id: string): string | undefined => {
    const base = pathPosix.resolve(fromDir, id);
    const candidates = [base, `${base}.js`, `${base}.ts`, `${base}/index.js`, `${base}/index.ts`];
    if (base.endsWith('.js')) candidates.push(base.replace(/\.js$/, '.ts'));
    return candidates.find((c) => extraFiles.has(c));
  };

  const makeRequire =
    (fromDir: string) =>
    (id: unknown): unknown => {
      const name = String(id);
      const builtinName = name.replace(/^node:/, '');
      if (builtinName in builtins) return builtins[builtinName];
      if (name.startsWith('./') || name.startsWith('../') || name.startsWith('/')) {
        const file = resolveFile(fromDir, name);
        if (file) return loadExtraModule(file);
      }
      const localWithoutDot = /^[a-z]/i.test(name) && resolveFile(fromDir, `./${name}`) !== undefined;
      const hint = localWithoutDot
        ? ` (para arquivos do projeto, comece com "./": require('./${name}'))`
        : /^[a-z]/.test(name)
          ? ` (no simulador do jogo só existem: ${Object.keys(builtins).join(', ')})`
          : '';
      const err = new Error(`Cannot find module '${name}'${hint}`) as Error & { code: string };
      err.code = 'MODULE_NOT_FOUND';
      throw err;
    };

  const sharedGlobals = {
    console: consoleObject,
    process: processObject,
    ...timerGlobals,
  };

  const loadExtraModule = (file: string): unknown => {
    const cached = moduleCache.get(file);
    if (cached) return cached.exports;
    const compiled = transpile(extraFiles.get(file) ?? '', file);
    if (compiled.errors.length > 0) {
      const first = compiled.errors[0];
      throw new SyntaxError(`${file}:${first?.line}: ${first?.message}`);
    }
    const module = { exports: {} as unknown };
    moduleCache.set(file, module);
    const scope: Record<string, unknown> = {
      ...sharedGlobals,
      require: makeRequire(pathPosix.dirname(file)),
      module,
      exports: module.exports,
      __filename: file,
      __dirname: pathPosix.dirname(file),
    };
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executar o código do jogador é o objetivo.
    const fn = new Function(...Object.keys(scope), wrapBody(compiled.code, compiled.strict)) as (
      ...args: unknown[]
    ) => void;
    fn(...Object.values(scope));
    return module.exports;
  };

  const finish = (
    error: string | null,
    timedOut: boolean,
    compileErrors: CodeDiagnostic[] = [],
  ): ScriptOutcome => {
    clearAllTimers();
    if (buffers.out) outLines.push(buffers.out);
    if (buffers.err) errLines.push(buffers.err);
    return {
      stdout: outLines,
      stderr: errLines,
      error,
      compileErrors,
      exitCode: exitCode ?? (error ? 1 : (processObject.exitCode ?? 0)),
      timedOut,
      reachedEnd,
      files: memfs.snapshot(),
    };
  };

  const compiled = transpile(source, options.mainFile);
  if (compiled.errors.length > 0) {
    const first = compiled.errors[0];
    return finish(`SyntaxError: ${first?.message} (linha ${first?.line})`, false, compiled.errors);
  }

  const mainModule = { exports: {} as unknown };
  const scope: Record<string, unknown> = {
    ...sharedGlobals,
    require: makeRequire(SANDBOX_CWD),
    module: mainModule,
    exports: mainModule.exports,
    __filename: options.mainFile,
    __dirname: SANDBOX_CWD,
    assert: createAssert(true),
    __logs: outLines,
    __errors: errLines,
    __reachedEnd: () => {
      reachedEnd = true;
    },
  };

  let timeoutHandle: ReturnType<typeof globalThis.setTimeout> | undefined;
  const timeout = new Promise<'timeout'>((resolve) => {
    timeoutHandle = globalThis.setTimeout(() => resolve('timeout'), timeoutMs);
  });

  try {
    let main: Promise<unknown>;
    try {
      main = new AsyncFunction(...Object.keys(scope), wrapBody(compiled.code, compiled.strict))(
        ...Object.values(scope),
      );
    } catch (err) {
      // Erros de sintaxe que o transpilador deixou passar.
      return finish(formatError(err), false);
    }
    const mainResult = await Promise.race([
      main.then(
        () => 'done' as const,
        (err: unknown) => {
          handleThrown(err);
          return 'done' as const;
        },
      ),
      timeout,
    ]);
    if (mainResult === 'timeout')
      return finish('O código demorou demais para terminar (tempo esgotado).', true);

    const idle = new Promise<'idle'>((resolve) => {
      onIdle = () => resolve('idle');
      checkIdle();
    });
    const idleResult = await Promise.race([idle, timeout]);
    if (idleResult === 'timeout') {
      return finish('O programa não terminou: ainda há timers ativos (esqueceu um clearInterval?).', true);
    }
    return finish(hasUncaught ? formatError(uncaught) : null, false);
  } finally {
    globalThis.clearTimeout(timeoutHandle);
  }
}
