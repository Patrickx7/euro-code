import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { bundlePageRuntime } from './tools/page-runtime-bundle';

/** `import script from 'virtual:page-runtime'`: o runtime dos exercícios web, pronto para injetar no iframe. */
function pageRuntime(): Plugin {
  const id = 'virtual:page-runtime';
  return {
    name: 'freela-page-runtime',
    resolveId: (source) => (source === id ? `\0${id}` : null),
    load: (resolved) =>
      resolved === `\0${id}` ? `export default ${JSON.stringify(bundlePageRuntime())};` : null,
  };
}

export default defineConfig({
  // Caminhos relativos: funciona no GitHub Pages (que serve o site em /euro-code/).
  base: './',
  plugins: [pageRuntime()],
  build: {
    target: 'es2022',
    sourcemap: true,
    // As árvores fotográficas (EZ-Tree) trazem ~4 MB de texturas embutidas num pedaço carregado sob demanda.
    chunkSizeWarningLimit: 4500,
  },
  worker: { format: 'es' },
  test: {
    include: ['src/**/*.test.ts', 'tools/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20_000,
  },
});
