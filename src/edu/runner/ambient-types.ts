/**
 * Declarações de tipo do ambiente simulado, usadas na checagem de exercícios TypeScript.
 * Precisam acompanhar o que o sandbox oferece de verdade (`sandbox.ts`, `memfs.ts`, `assert.ts`,
 * `event-emitter.ts`).
 */
export const AMBIENT_TYPES = String.raw`
interface Console {
  log(...data: unknown[]): void;
  info(...data: unknown[]): void;
  debug(...data: unknown[]): void;
  warn(...data: unknown[]): void;
  error(...data: unknown[]): void;
  dir(item: unknown): void;
  table(data: unknown): void;
  group(...label: unknown[]): void;
  groupEnd(): void;
  count(label?: string): void;
  countReset(label?: string): void;
  time(label?: string): void;
  timeEnd(label?: string): void;
  assert(condition: unknown, ...data: unknown[]): void;
}
declare var console: Console;
declare var __logs: string[];
declare var __errors: string[];

type TimerHandle = number;
declare function setTimeout<A extends unknown[]>(callback: (...args: A) => void, ms?: number, ...args: A): TimerHandle;
declare function clearTimeout(handle: TimerHandle | undefined): void;
declare function setInterval<A extends unknown[]>(callback: (...args: A) => void, ms?: number, ...args: A): TimerHandle;
declare function clearInterval(handle: TimerHandle | undefined): void;
declare function setImmediate<A extends unknown[]>(callback: (...args: A) => void, ...args: A): TimerHandle;
declare function clearImmediate(handle: TimerHandle | undefined): void;
declare function queueMicrotask(callback: () => void): void;
declare function structuredClone<T>(value: T): T;

declare var process: {
  argv: string[];
  env: Record<string, string | undefined>;
  exitCode: number | undefined;
  platform: string;
  exit(code?: number): never;
  cwd(): string;
  nextTick(callback: (...args: any[]) => void, ...args: any[]): void;
  stdout: { write(text: string): boolean };
  stderr: { write(text: string): boolean };
};
declare var require: (id: string) => any;
declare var module: { exports: any };
declare var exports: any;
declare var __filename: string;
declare var __dirname: string;

declare module 'assert' {
  function assert(value: unknown, message?: string | Error): asserts value;
  namespace assert {
    class AssertionError extends Error {
      actual: unknown;
      expected: unknown;
      code: 'ERR_ASSERTION';
    }
    type ErrorMatcher = RegExp | Function | ((err: unknown) => boolean) | object;
    function ok(value: unknown, message?: string | Error): asserts value;
    function equal(actual: unknown, expected: unknown, message?: string | Error): void;
    function notEqual(actual: unknown, expected: unknown, message?: string | Error): void;
    function strictEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
    function notStrictEqual(actual: unknown, expected: unknown, message?: string | Error): void;
    function deepEqual(actual: unknown, expected: unknown, message?: string | Error): void;
    function deepStrictEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
    function notDeepStrictEqual(actual: unknown, expected: unknown, message?: string | Error): void;
    function throws(fn: () => unknown, expected?: ErrorMatcher | string, message?: string): void;
    function doesNotThrow(fn: () => unknown, message?: string): void;
    function rejects(promise: Promise<unknown> | (() => Promise<unknown>), expected?: ErrorMatcher | string, message?: string): Promise<void>;
    function doesNotReject(promise: Promise<unknown> | (() => Promise<unknown>), message?: string): Promise<void>;
    function match(text: string, pattern: RegExp, message?: string | Error): void;
    function fail(message?: string): never;
  }
  export = assert;
}
declare module 'assert/strict' { import assert = require('assert'); export = assert; }
declare module 'node:assert' { import assert = require('assert'); export = assert; }
declare module 'node:assert/strict' { import assert = require('assert'); export = assert; }
declare const assert: typeof import('assert');

declare module 'fs' {
  namespace fs {
    type PathLike = string;
    type EncodingOption = 'utf8' | 'utf-8' | { encoding?: 'utf8' | 'utf-8' | null; flag?: string } | null;
    interface Stats {
      size: number;
      isFile(): boolean;
      isDirectory(): boolean;
    }
    interface ErrnoException extends Error {
      code?: string;
      errno?: number;
      syscall?: string;
      path?: string;
    }
    type NoParamCallback = (err: ErrnoException | null) => void;

    function existsSync(path: PathLike): boolean;
    function readFileSync(path: PathLike, options?: EncodingOption): string;
    function writeFileSync(path: PathLike, data: string, options?: EncodingOption): void;
    function appendFileSync(path: PathLike, data: string, options?: EncodingOption): void;
    function mkdirSync(path: PathLike, options?: { recursive?: boolean }): void;
    function readdirSync(path: PathLike): string[];
    function unlinkSync(path: PathLike): void;
    function rmSync(path: PathLike, options?: { recursive?: boolean; force?: boolean }): void;
    function renameSync(oldPath: PathLike, newPath: PathLike): void;
    function statSync(path: PathLike): Stats;

    function readFile(path: PathLike, options: EncodingOption, callback: (err: ErrnoException | null, data: string) => void): void;
    function readFile(path: PathLike, callback: (err: ErrnoException | null, data: string) => void): void;
    function writeFile(path: PathLike, data: string, options: EncodingOption, callback: NoParamCallback): void;
    function writeFile(path: PathLike, data: string, callback: NoParamCallback): void;
    function appendFile(path: PathLike, data: string, options: EncodingOption, callback: NoParamCallback): void;
    function appendFile(path: PathLike, data: string, callback: NoParamCallback): void;
    function mkdir(path: PathLike, options: { recursive?: boolean }, callback: NoParamCallback): void;
    function mkdir(path: PathLike, callback: NoParamCallback): void;
    function readdir(path: PathLike, callback: (err: ErrnoException | null, files: string[]) => void): void;
    function unlink(path: PathLike, callback: NoParamCallback): void;
    function rm(path: PathLike, options: { recursive?: boolean; force?: boolean }, callback: NoParamCallback): void;
    function rm(path: PathLike, callback: NoParamCallback): void;
    function rename(oldPath: PathLike, newPath: PathLike, callback: NoParamCallback): void;
    function stat(path: PathLike, callback: (err: ErrnoException | null, stats: Stats) => void): void;

    namespace promises {
      function readFile(path: PathLike, options?: EncodingOption): Promise<string>;
      function writeFile(path: PathLike, data: string, options?: EncodingOption): Promise<void>;
      function appendFile(path: PathLike, data: string, options?: EncodingOption): Promise<void>;
      function mkdir(path: PathLike, options?: { recursive?: boolean }): Promise<void>;
      function readdir(path: PathLike): Promise<string[]>;
      function unlink(path: PathLike): Promise<void>;
      function rm(path: PathLike, options?: { recursive?: boolean; force?: boolean }): Promise<void>;
      function rename(oldPath: PathLike, newPath: PathLike): Promise<void>;
      function stat(path: PathLike): Promise<Stats>;
      function access(path: PathLike): Promise<void>;
    }
  }
  export = fs;
}
declare module 'node:fs' { import fs = require('fs'); export = fs; }
declare module 'fs/promises' { import fs = require('fs'); export = fs.promises; }
declare module 'node:fs/promises' { import fs = require('fs'); export = fs.promises; }

declare module 'path' {
  namespace path {
    interface ParsedPath {
      root: string;
      dir: string;
      base: string;
      ext: string;
      name: string;
    }
    function join(...paths: string[]): string;
    function resolve(...paths: string[]): string;
    function normalize(path: string): string;
    function basename(path: string, suffix?: string): string;
    function dirname(path: string): string;
    function extname(path: string): string;
    function relative(from: string, to: string): string;
    function isAbsolute(path: string): boolean;
    function parse(path: string): ParsedPath;
    function format(pathObject: Partial<ParsedPath>): string;
    const sep: '/';
    const delimiter: ':';
    const posix: typeof path;
  }
  export = path;
}
declare module 'node:path' { import path = require('path'); export = path; }

declare namespace __EuroCodeSim {
  type Listener = (...args: any[]) => void;
  class EventEmitter {
    static defaultMaxListeners: number;
    on(eventName: string | symbol, listener: Listener): this;
    addListener(eventName: string | symbol, listener: Listener): this;
    prependListener(eventName: string | symbol, listener: Listener): this;
    once(eventName: string | symbol, listener: Listener): this;
    off(eventName: string | symbol, listener: Listener): this;
    removeListener(eventName: string | symbol, listener: Listener): this;
    removeAllListeners(eventName?: string | symbol): this;
    emit(eventName: string | symbol, ...args: any[]): boolean;
    listenerCount(eventName: string | symbol): number;
    listeners(eventName: string | symbol): Listener[];
    eventNames(): (string | symbol)[];
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
  }
}
declare module 'events' {
  class EventEmitter extends __EuroCodeSim.EventEmitter {}
  namespace EventEmitter {
    export import EventEmitter = __EuroCodeSim.EventEmitter;
    function once(emitter: __EuroCodeSim.EventEmitter, eventName: string | symbol): Promise<any[]>;
  }
  export = EventEmitter;
}
declare module 'node:events' { import EventEmitter = require('events'); export = EventEmitter; }
`;
