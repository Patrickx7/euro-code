/**
 * Subconjunto do módulo `assert` do Node, com mensagens em português para o jogador.
 * `createAssert(true)` equivale a `node:assert/strict`.
 */
import { inspect } from './inspect';

export class AssertionError extends Error {
  override name = 'AssertionError';
  readonly code = 'ERR_ASSERTION';
  constructor(
    message: string,
    readonly actual?: unknown,
    readonly expected?: unknown,
  ) {
    super(message);
  }
}

function sameValueLoose(a: unknown, b: unknown): boolean {
  return a == b || (Number.isNaN(a) && Number.isNaN(b));
}

export function isDeepEqual(
  a: unknown,
  b: unknown,
  strict: boolean,
  seen = new Map<object, object>(),
): boolean {
  if (strict ? Object.is(a, b) : sameValueLoose(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (seen.get(a) === b) return true;
  seen.set(a, b);

  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }
  if (a instanceof RegExp || b instanceof RegExp) {
    return a instanceof RegExp && b instanceof RegExp && a.source === b.source && a.flags === b.flags;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Map || b instanceof Map) {
    if (!(a instanceof Map && b instanceof Map) || a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !isDeepEqual(value, b.get(key), strict, seen)) return false;
    }
    return true;
  }
  if (a instanceof Set || b instanceof Set) {
    if (!(a instanceof Set && b instanceof Set) || a.size !== b.size) return false;
    const remaining = [...b];
    for (const value of a) {
      const index = remaining.findIndex((other) => isDeepEqual(value, other, strict, seen));
      if (index < 0) return false;
      remaining.splice(index, 1);
    }
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      isDeepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], strict, seen),
  );
}

type ErrorMatcher = RegExp | (new (...args: never[]) => unknown) | ((err: unknown) => boolean) | object;

function checkThrown(err: unknown, expected: ErrorMatcher | undefined, message?: string): void {
  if (expected === undefined) return;
  let ok: boolean;
  if (expected instanceof RegExp) {
    ok = expected.test(err instanceof Error ? err.message : String(err));
  } else if (typeof expected === 'function') {
    // Igual ao Node: classe de erro → instanceof; outra função → validador que deve retornar true.
    const isErrorClass = expected === Error || Object.prototype.isPrototypeOf.call(Error, expected);
    if (expected.prototype !== undefined && err instanceof (expected as new () => unknown)) ok = true;
    else if (isErrorClass) ok = false;
    else ok = (expected as (e: unknown) => boolean)(err) === true;
  } else {
    ok = Object.entries(expected).every(([key, value]) => {
      const actual = (err as Record<string, unknown>)[key];
      return value instanceof RegExp ? value.test(String(actual)) : isDeepEqual(actual, value, true);
    });
  }
  if (!ok) {
    throw new AssertionError(
      message ?? `O erro lançado não é o esperado. Recebido: ${inspect(err)}`,
      err,
      expected,
    );
  }
}

export function createAssert(strict: boolean) {
  const fail = (
    defaultMessage: string,
    message: string | Error | undefined,
    actual?: unknown,
    expected?: unknown,
  ): never => {
    if (message instanceof Error) throw message;
    throw new AssertionError(message ?? defaultMessage, actual, expected);
  };

  const ok = (value: unknown, message?: string | Error): void => {
    if (!value) fail(`Esperava um valor verdadeiro, mas recebeu ${inspect(value)}.`, message, value, true);
  };

  const strictEqual = (actual: unknown, expected: unknown, message?: string | Error): void => {
    if (!Object.is(actual, expected)) {
      fail(`Esperava ${inspect(expected)}, mas recebeu ${inspect(actual)}.`, message, actual, expected);
    }
  };

  const notStrictEqual = (actual: unknown, expected: unknown, message?: string | Error): void => {
    if (Object.is(actual, expected)) {
      fail(`Esperava um valor diferente de ${inspect(expected)}.`, message, actual, expected);
    }
  };

  const deepStrictEqual = (actual: unknown, expected: unknown, message?: string | Error): void => {
    if (!isDeepEqual(actual, expected, true)) {
      fail(`Esperava ${inspect(expected)}, mas recebeu ${inspect(actual)}.`, message, actual, expected);
    }
  };

  const notDeepStrictEqual = (actual: unknown, expected: unknown, message?: string | Error): void => {
    if (isDeepEqual(actual, expected, true)) {
      fail(`Esperava um valor diferente de ${inspect(expected)}.`, message, actual, expected);
    }
  };

  const equal = strict
    ? strictEqual
    : (actual: unknown, expected: unknown, message?: string | Error): void => {
        if (!sameValueLoose(actual, expected)) {
          fail(`Esperava ${inspect(expected)}, mas recebeu ${inspect(actual)}.`, message, actual, expected);
        }
      };

  const notEqual = strict
    ? notStrictEqual
    : (actual: unknown, expected: unknown, message?: string | Error): void => {
        if (sameValueLoose(actual, expected)) {
          fail(`Esperava um valor diferente de ${inspect(expected)}.`, message, actual, expected);
        }
      };

  const deepEqual = strict
    ? deepStrictEqual
    : (actual: unknown, expected: unknown, message?: string | Error): void => {
        if (!isDeepEqual(actual, expected, false)) {
          fail(`Esperava ${inspect(expected)}, mas recebeu ${inspect(actual)}.`, message, actual, expected);
        }
      };

  const throws = (fn: () => unknown, expected?: ErrorMatcher | string, message?: string): void => {
    if (typeof expected === 'string') {
      message = expected;
      expected = undefined;
    }
    try {
      fn();
    } catch (err) {
      checkThrown(err, expected, message);
      return;
    }
    fail('Esperava que a função lançasse um erro, mas ela não lançou.', message);
  };

  const doesNotThrow = (fn: () => unknown, message?: string): void => {
    try {
      fn();
    } catch (err) {
      fail(`Esperava que a função não lançasse erro, mas ela lançou: ${inspect(err)}`, message, err);
    }
  };

  const rejects = async (
    promiseOrFn: Promise<unknown> | (() => Promise<unknown>),
    expected?: ErrorMatcher | string,
    message?: string,
  ): Promise<void> => {
    if (typeof expected === 'string') {
      message = expected;
      expected = undefined;
    }
    try {
      await (typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn);
    } catch (err) {
      checkThrown(err, expected, message);
      return;
    }
    fail('Esperava que a Promise fosse rejeitada, mas ela foi resolvida.', message);
  };

  const doesNotReject = async (
    promiseOrFn: Promise<unknown> | (() => Promise<unknown>),
    message?: string,
  ): Promise<void> => {
    try {
      await (typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn);
    } catch (err) {
      fail(`Esperava que a Promise fosse resolvida, mas ela foi rejeitada: ${inspect(err)}`, message, err);
    }
  };

  const match = (text: string, pattern: RegExp, message?: string | Error): void => {
    if (typeof text !== 'string' || !pattern.test(text)) {
      fail(`Esperava que ${inspect(text)} combinasse com ${String(pattern)}.`, message, text, pattern);
    }
  };

  const failFn = (message = 'Falhou.'): never => fail(message, undefined);

  return Object.assign(ok, {
    ok,
    equal,
    notEqual,
    strictEqual,
    notStrictEqual,
    deepEqual,
    deepStrictEqual,
    notDeepStrictEqual,
    throws,
    doesNotThrow,
    rejects,
    doesNotReject,
    match,
    fail: failFn,
    AssertionError,
  });
}

export type AssertModule = ReturnType<typeof createAssert>;
