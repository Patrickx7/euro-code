/**
 * Sistema de arquivos em memória com a API do módulo `fs` do Node (subconjunto).
 * Os arquivos são sempre texto: `readFileSync` devolve string mesmo sem encoding.
 */
import pathPosix from 'path-browserify';

export const SANDBOX_CWD = '/app';

type Callback<T> = (err: NodeLikeError | null, value?: T) => void;

export interface NodeLikeError extends Error {
  code: string;
  errno: number;
  syscall: string;
  path: string;
}

const ERRNO: Record<string, number> = { ENOENT: -2, EEXIST: -17, EISDIR: -21, ENOTDIR: -20, ENOTEMPTY: -39 };
const DESCRIPTIONS: Record<string, string> = {
  ENOENT: 'no such file or directory',
  EEXIST: 'file already exists',
  EISDIR: 'illegal operation on a directory',
  ENOTDIR: 'not a directory',
  ENOTEMPTY: 'directory not empty',
};

function fsError(code: string, syscall: string, path: string): NodeLikeError {
  const err = new Error(`${code}: ${DESCRIPTIONS[code]}, ${syscall} '${path}'`) as NodeLikeError;
  err.code = code;
  err.errno = ERRNO[code] ?? -1;
  err.syscall = syscall;
  err.path = path;
  return err;
}

function toText(data: unknown): string {
  return typeof data === 'string' ? data : String(data);
}

export interface Stats {
  size: number;
  isFile(): boolean;
  isDirectory(): boolean;
}

export function createMemFs(
  seed: Record<string, string> = {},
  /** Agenda os callbacks das versões assíncronas (o sandbox usa timers rastreados). */
  schedule: (task: () => void) => void = (task) => setTimeout(task, 0),
) {
  const files = new Map<string, string>();
  const dirs = new Set<string>(['/', SANDBOX_CWD]);

  const abs = (p: unknown): string => pathPosix.resolve(SANDBOX_CWD, String(p));

  const ensureParent = (path: string, syscall: string) => {
    const parent = pathPosix.dirname(path);
    if (!dirs.has(parent)) throw fsError('ENOENT', syscall, path);
  };

  const mkdirp = (dir: string) => {
    let current = dir;
    const missing: string[] = [];
    while (!dirs.has(current)) {
      missing.push(current);
      current = pathPosix.dirname(current);
    }
    for (const d of missing.reverse()) dirs.add(d);
  };

  for (const [name, content] of Object.entries(seed)) {
    const path = abs(name);
    mkdirp(pathPosix.dirname(path));
    files.set(path, content);
  }

  const sync = {
    existsSync(p: unknown): boolean {
      const path = abs(p);
      return files.has(path) || dirs.has(path);
    },
    readFileSync(p: unknown, _options?: unknown): string {
      const path = abs(p);
      if (dirs.has(path)) throw fsError('EISDIR', 'read', path);
      const content = files.get(path);
      if (content === undefined) throw fsError('ENOENT', 'open', path);
      return content;
    },
    writeFileSync(p: unknown, data: unknown, _options?: unknown): void {
      const path = abs(p);
      if (dirs.has(path)) throw fsError('EISDIR', 'open', path);
      ensureParent(path, 'open');
      files.set(path, toText(data));
    },
    appendFileSync(p: unknown, data: unknown, _options?: unknown): void {
      const path = abs(p);
      if (dirs.has(path)) throw fsError('EISDIR', 'open', path);
      ensureParent(path, 'open');
      files.set(path, (files.get(path) ?? '') + toText(data));
    },
    mkdirSync(p: unknown, options?: { recursive?: boolean }): void {
      const path = abs(p);
      if (options?.recursive) {
        if (files.has(path)) throw fsError('EEXIST', 'mkdir', path);
        mkdirp(path);
        return;
      }
      if (files.has(path) || dirs.has(path)) throw fsError('EEXIST', 'mkdir', path);
      ensureParent(path, 'mkdir');
      dirs.add(path);
    },
    readdirSync(p: unknown): string[] {
      const path = abs(p);
      if (files.has(path)) throw fsError('ENOTDIR', 'scandir', path);
      if (!dirs.has(path)) throw fsError('ENOENT', 'scandir', path);
      const names = new Set<string>();
      for (const entry of [...files.keys(), ...dirs]) {
        if (entry !== path && pathPosix.dirname(entry) === path) names.add(pathPosix.basename(entry));
      }
      return [...names].sort();
    },
    unlinkSync(p: unknown): void {
      const path = abs(p);
      if (dirs.has(path)) throw fsError('EISDIR', 'unlink', path);
      if (!files.delete(path)) throw fsError('ENOENT', 'unlink', path);
    },
    rmSync(p: unknown, options?: { recursive?: boolean; force?: boolean }): void {
      const path = abs(p);
      if (files.delete(path)) return;
      if (dirs.has(path)) {
        const prefix = `${path}/`;
        const children = [...files.keys(), ...dirs].filter((e) => e.startsWith(prefix));
        if (children.length > 0 && !options?.recursive) throw fsError('ENOTEMPTY', 'rm', path);
        for (const child of children) {
          files.delete(child);
          dirs.delete(child);
        }
        dirs.delete(path);
        return;
      }
      if (!options?.force) throw fsError('ENOENT', 'rm', path);
    },
    renameSync(from: unknown, to: unknown): void {
      const source = abs(from);
      const target = abs(to);
      const content = files.get(source);
      if (content === undefined) throw fsError('ENOENT', 'rename', source);
      ensureParent(target, 'rename');
      files.delete(source);
      files.set(target, content);
    },
    statSync(p: unknown): Stats {
      const path = abs(p);
      const content = files.get(path);
      const isDir = dirs.has(path);
      if (content === undefined && !isDir) throw fsError('ENOENT', 'stat', path);
      return {
        size: content?.length ?? 0,
        isFile: () => content !== undefined,
        isDirectory: () => isDir,
      };
    },
  };

  type SyncApi = typeof sync;
  type AsyncOf<K extends keyof SyncApi> = (
    ...args: Parameters<SyncApi[K]>
  ) => Promise<ReturnType<SyncApi[K]>>;

  const promisify =
    <K extends keyof SyncApi>(name: K): AsyncOf<K> =>
    (...args) =>
      new Promise((resolve, reject) => {
        schedule(() => {
          try {
            resolve((sync[name] as (...a: unknown[]) => ReturnType<SyncApi[K]>)(...args));
          } catch (err) {
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        });
      });

  const promises = {
    readFile: promisify('readFileSync'),
    writeFile: promisify('writeFileSync'),
    appendFile: promisify('appendFileSync'),
    mkdir: promisify('mkdirSync'),
    readdir: promisify('readdirSync'),
    unlink: promisify('unlinkSync'),
    rm: promisify('rmSync'),
    rename: promisify('renameSync'),
    stat: promisify('statSync'),
    access: (p: unknown): Promise<void> =>
      new Promise((resolve, reject) => {
        schedule(() => (sync.existsSync(p) ? resolve() : reject(fsError('ENOENT', 'access', abs(p)))));
      }),
  };

  /** Versões com callback no estilo `fs.readFile(caminho, 'utf8', (err, dados) => ...)`. */
  const withCallback =
    (name: keyof SyncApi) =>
    (...args: unknown[]): void => {
      const callback = args.pop() as Callback<unknown>;
      if (typeof callback !== 'function') {
        throw new TypeError('The "cb" argument must be of type function.');
      }
      schedule(() => {
        let result: unknown;
        try {
          result = (sync[name] as (...a: unknown[]) => unknown)(...args);
        } catch (err) {
          callback(err as NodeLikeError);
          return;
        }
        callback(null, result);
      });
    };

  const callbacks = {
    readFile: withCallback('readFileSync'),
    writeFile: withCallback('writeFileSync'),
    appendFile: withCallback('appendFileSync'),
    mkdir: withCallback('mkdirSync'),
    readdir: withCallback('readdirSync'),
    unlink: withCallback('unlinkSync'),
    rm: withCallback('rmSync'),
    rename: withCallback('renameSync'),
    stat: withCallback('statSync'),
  };

  return {
    module: { ...sync, ...callbacks, promises },
    promises,
    /** Cópia de todos os arquivos, para inspeção em testes e na interface. */
    snapshot(): Record<string, string> {
      return Object.fromEntries(files);
    },
  };
}

export type MemFs = ReturnType<typeof createMemFs>;
