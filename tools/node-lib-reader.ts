/** Lê as bibliotecas de tipos do pacote `typescript` instalado (usado fora do navegador). */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { LibReader } from '../src/edu/runner/compile';

const require = createRequire(import.meta.url);
const libDir = dirname(require.resolve('typescript/lib/lib.d.ts'));
const cache = new Map<string, string | undefined>();

export const readNodeLib: LibReader = (fileName) => {
  if (!/^lib\.[\w.]+\.d\.ts$/.test(fileName)) return undefined;
  if (!cache.has(fileName)) {
    try {
      cache.set(fileName, readFileSync(join(libDir, fileName), 'utf8'));
    } catch {
      cache.set(fileName, undefined);
    }
  }
  return cache.get(fileName);
};
