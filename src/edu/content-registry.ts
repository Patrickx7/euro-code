/** Carrega todos os módulos de `content/` no bundle do jogo (descoberta automática pelo Vite). */
import type { ContentModule } from '../shared/content';

const found = import.meta.glob<ContentModule>('../../content/*/*/index.ts', {
  eager: true,
  import: 'default',
});

export const CONTENT_MODULES: readonly ContentModule[] = Object.values(found).sort(
  (a, b) => a.order - b.order,
);
