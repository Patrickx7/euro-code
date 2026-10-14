/** Empacota o runtime dos exercícios web (`src/edu/web/page-runtime.ts`) num script único (IIFE). */
import { buildSync } from 'esbuild';
import { join } from 'node:path';

export function bundlePageRuntime(): string {
  const result = buildSync({
    entryPoints: [join(import.meta.dirname, '..', 'src', 'edu', 'web', 'page-runtime.ts')],
    bundle: true,
    format: 'iife',
    target: 'es2022',
    write: false,
    minify: true,
  });
  return result.outputFiles[0]?.text ?? '';
}
