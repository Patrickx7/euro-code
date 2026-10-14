import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Caminhos relativos: funciona no GitHub Pages (que serve o site em /euro-code/).
  base: './',
  build: {
    target: 'es2022',
    sourcemap: true,
    // As árvores fotográficas (EZ-Tree) trazem ~4 MB de texturas embutidas num pedaço carregado sob demanda.
    chunkSizeWarningLimit: 4500,
  },
  test: {
    include: ['src/**/*.test.ts', 'tools/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20_000,
  },
});
