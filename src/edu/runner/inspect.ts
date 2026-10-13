/**
 * Formatação de valores parecida com a do `console.log` do Node (`util.inspect`).
 * Cobre os casos comuns das aulas. O validador de conteúdo compara a saída com a do Node de verdade.
 */

const MAX_DEPTH = 2;
const MAX_ARRAY_ITEMS = 100;
const BREAK_LENGTH = 72;
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

interface Context {
  seen: object[];
  circular: Map<object, number>;
}

export function inspect(value: unknown): string {
  const ctx: Context = { seen: [], circular: new Map() };
  const text = formatValue(value, 0, ctx, 0);
  return ctx.circular.has(value as object) ? `<ref *1> ${text}` : text;
}

export function quoteString(text: string): string {
  const escaped = text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
  if (!text.includes("'")) return `'${escaped}'`;
  if (!text.includes('"')) return `"${escaped}"`;
  if (!text.includes('`') && !text.includes('${')) return `\`${escaped}\``;
  return `'${escaped.replace(/'/g, "\\'")}'`;
}

function formatPrimitive(value: unknown): string | null {
  switch (typeof value) {
    case 'string':
      return quoteString(value);
    case 'number':
      return Object.is(value, -0) ? '-0' : String(value);
    case 'bigint':
      return `${value}n`;
    case 'boolean':
      return String(value);
    case 'undefined':
      return 'undefined';
    case 'symbol':
      return value.toString();
    default:
      return value === null ? 'null' : null;
  }
}

function formatFunction(fn: (...args: unknown[]) => unknown): string {
  const source = Function.prototype.toString.call(fn);
  if (source.startsWith('class')) {
    const parent = Object.getPrototypeOf(fn) as { name?: string } | null;
    const extendsPart = parent?.name ? ` extends ${parent.name}` : '';
    return `[class ${fn.name || '(anonymous)'}${extendsPart}]`;
  }
  const kind = fn.constructor.name === 'Function' ? 'Function' : fn.constructor.name;
  return fn.name ? `[${kind}: ${fn.name}]` : `[${kind} (anonymous)]`;
}

function formatKey(key: string | symbol): string {
  if (typeof key === 'symbol') return `[${key.toString()}]`;
  return IDENTIFIER.test(key) ? key : quoteString(key);
}

function constructorName(value: object): string | null {
  const proto = Object.getPrototypeOf(value) as { constructor?: { name?: string } } | null;
  if (proto === null) return null;
  return proto.constructor?.name ?? 'Object';
}

function wrap(prefix: string, open: string, close: string, entries: string[], indent: number): string {
  if (entries.length === 0) return `${prefix}${open}${close}`;
  const single = `${prefix}${open} ${entries.join(', ')} ${close}`;
  if (single.length + indent <= BREAK_LENGTH && !entries.some((e) => e.includes('\n'))) {
    return single;
  }
  const pad = ' '.repeat(indent + 2);
  return `${prefix}${open}\n${pad}${entries.join(`,\n${pad}`)}\n${' '.repeat(indent)}${close}`;
}

function formatValue(value: unknown, depth: number, ctx: Context, indent: number): string {
  const primitive = formatPrimitive(value);
  if (primitive !== null) return depth === 0 && typeof value === 'string' ? value : primitive;

  if (typeof value === 'function') {
    return formatFunction(value as (...args: unknown[]) => unknown);
  }

  const obj = value as object;
  if (ctx.seen.includes(obj)) {
    if (!ctx.circular.has(obj)) ctx.circular.set(obj, ctx.circular.size + 1);
    return `[Circular *${ctx.circular.get(obj)}]`;
  }

  if (obj instanceof Date) return Number.isNaN(obj.getTime()) ? 'Invalid Date' : obj.toISOString();
  if (obj instanceof RegExp) return obj.toString();
  if (obj instanceof Error) return obj.stack?.split('\n')[0] ?? `${obj.name}: ${obj.message}`;
  if (obj instanceof Promise) return 'Promise { <pending> }';
  if (obj instanceof WeakMap) return 'WeakMap { <items unknown> }';
  if (obj instanceof WeakSet) return 'WeakSet { <items unknown> }';

  const name = constructorName(obj);
  if (depth > MAX_DEPTH) {
    if (Array.isArray(obj)) return '[Array]';
    return `[${name ?? 'Object: null prototype'}]`;
  }

  ctx.seen.push(obj);
  try {
    const child = (v: unknown) => formatValue(v, depth + 1, ctx, indent + 2);

    if (Array.isArray(obj)) {
      const entries: string[] = [];
      let holes = 0;
      const flushHoles = () => {
        if (holes > 0) entries.push(`<${holes} empty item${holes > 1 ? 's' : ''}>`);
        holes = 0;
      };
      const shown = Math.min(obj.length, MAX_ARRAY_ITEMS);
      for (let i = 0; i < shown; i++) {
        if (!(i in obj)) {
          holes++;
          continue;
        }
        flushHoles();
        entries.push(child(obj[i]));
      }
      flushHoles();
      if (obj.length > MAX_ARRAY_ITEMS) {
        const rest = obj.length - MAX_ARRAY_ITEMS;
        entries.push(`... ${rest} more item${rest > 1 ? 's' : ''}`);
      }
      const prefix = name === 'Array' ? '' : `${name ?? '[Array: null prototype]'}(${obj.length}) `;
      return wrap(prefix, '[', ']', [...entries, ...extraKeys(obj, child, true)], indent);
    }

    if (obj instanceof Map) {
      const entries = [...obj].map(([k, v]) => `${child(k)} => ${child(v)}`);
      return wrap(`Map(${obj.size}) `, '{', '}', entries, indent);
    }

    if (obj instanceof Set) {
      const entries = [...obj].map((v) => child(v));
      return wrap(`Set(${obj.size}) `, '{', '}', entries, indent);
    }

    let prefix = '';
    if (name === null) prefix = '[Object: null prototype] ';
    else if (name !== 'Object') prefix = `${name} `;
    return wrap(prefix, '{', '}', extraKeys(obj, child, false), indent);
  } finally {
    ctx.seen.pop();
  }
}

function extraKeys(obj: object, child: (v: unknown) => string, isArray: boolean): string[] {
  const entries: string[] = [];
  const keys: (string | symbol)[] = [
    ...Object.keys(obj),
    ...Object.getOwnPropertySymbols(obj).filter((s) => Object.getOwnPropertyDescriptor(obj, s)?.enumerable),
  ];
  for (const key of keys) {
    if (isArray && typeof key === 'string' && /^\d+$/.test(key)) continue;
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (!desc) continue;
    let text: string;
    if (desc.get && desc.set) text = '[Getter/Setter]';
    else if (desc.get) text = '[Getter]';
    else if (desc.set) text = '[Setter]';
    else text = child(desc.value);
    entries.push(`${formatKey(key)}: ${text}`);
  }
  return entries;
}

/** Equivalente ao `util.format` usado pelo `console.log`. */
export function formatLogArgs(args: unknown[]): string {
  if (args.length === 0) return '';
  const [first, ...rest] = args;
  const parts: string[] = [];
  if (typeof first === 'string' && first.includes('%')) {
    let index = 0;
    const formatted = first.replace(/%([sdifjoOc%])/g, (match, spec: string) => {
      if (spec === '%') return '%';
      if (index >= rest.length) return match;
      const arg = rest[index++];
      switch (spec) {
        case 's':
          return typeof arg === 'string' ? arg : formatValue(arg, 1, { seen: [], circular: new Map() }, 0);
        case 'd':
        case 'i': {
          if (typeof arg === 'bigint') return `${arg}n`;
          const n = Number(arg);
          return String(spec === 'i' ? Math.trunc(n) : n);
        }
        case 'f':
          return String(Number.parseFloat(String(arg)));
        case 'j':
          try {
            return JSON.stringify(arg);
          } catch {
            return '[Circular]';
          }
        case 'c':
          return '';
        default:
          return inspect(arg);
      }
    });
    parts.push(formatted);
    parts.push(...rest.slice(index).map((a) => inspect(a)));
  } else {
    parts.push(...args.map((a) => inspect(a)));
  }
  return parts.join(' ');
}
