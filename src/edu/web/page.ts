import type { WebFiles } from '../../shared/content';

/**
 * Monta o documento do exercício web: o runtime de testes vem primeiro (para pegar erros do JS do
 * jogador), depois o CSS, o HTML e o JS do jogador. `html` é o conteúdo do <body>.
 */
export function buildWebPage(files: WebFiles, runtimeScript: string): string {
  // Evita que um "</script>" dentro do código feche a tag antes da hora.
  const safe = (code: string) => code.replace(/<\/script/gi, '<\\/script');
  return [
    '<!doctype html>',
    '<html lang="pt-BR">',
    '<head>',
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `<script>${safe(runtimeScript)}</script>`,
    `<style>${files.css.replace(/<\/style/gi, '<\\/style')}</style>`,
    '</head>',
    '<body>',
    files.html,
    `<script>${safe(files.js)}</script>`,
    '</body>',
    '</html>',
  ].join('\n');
}
