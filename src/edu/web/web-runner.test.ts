import { afterAll, describe, expect, it } from 'vitest';
import { closeWebRunner, runWebInChromium } from '../../../tools/web-runner';
import type { WebFiles } from '../../shared/content';
import { DEFAULT_WEB_VIEWPORT } from '../../shared/content';

const html = '<div class="caixa">Olá, cliente!</div>';
const centered: WebFiles = {
  html,
  css: 'body { margin: 0; height: 100vh; display: flex; align-items: center; justify-content: center; }\n.caixa { width: 200px; height: 100px; }',
  js: '',
};
const leftAligned: WebFiles = {
  ...centered,
  css: 'body { margin: 0; }\n.caixa { width: 200px; height: 100px; }',
};

const centerTests = [
  {
    description: 'a div está no centro da tela',
    code: "const b = box('.caixa');\nassert.near(b.centerX, viewport.width / 2);\nassert.near(b.centerY, viewport.height / 2);",
  },
];

describe('runWebInChromium (exercícios web)', { timeout: 60_000 }, () => {
  afterAll(closeWebRunner);

  it('aprova a div centralizada', async () => {
    const result = await runWebInChromium(centered, centerTests, DEFAULT_WEB_VIEWPORT);
    expect(result).toEqual({
      passed: true,
      tests: [{ description: 'a div está no centro da tela', passed: true }],
      pageErrors: [],
    });
  });

  it('reprova a div à esquerda com mensagem em português', async () => {
    const result = await runWebInChromium(leftAligned, centerTests, DEFAULT_WEB_VIEWPORT);
    expect(result.passed).toBe(false);
    expect(result.tests[0]?.message).toBe('Esperava cerca de 400 (±2), mas está em 100.');
  });

  it('usa o viewport pedido', async () => {
    const result = await runWebInChromium(centered, centerTests, { width: 400, height: 300 });
    expect(result.passed).toBe(true);
  });

  it('acusa erro no JavaScript da página e testes de DOM com clique', async () => {
    const counter: WebFiles = {
      html: '<button id="mais">+</button><span id="total">0</span>',
      css: '',
      js: "let n = 0;\ndocument.querySelector('#mais').addEventListener('click', () => {\n  n++;\n  document.querySelector('#total').textContent = String(n);\n});",
    };
    const clickTest = [
      {
        description: 'o botão soma 1',
        code: "click('#mais');\nclick('#mais');\nassert.strictEqual(document.querySelector('#total').textContent, '2');",
      },
    ];
    expect((await runWebInChromium(counter, clickTest, DEFAULT_WEB_VIEWPORT)).passed).toBe(true);

    const broken = { ...counter, js: `${counter.js}\nnaoExiste();` };
    const result = await runWebInChromium(broken, clickTest, DEFAULT_WEB_VIEWPORT);
    expect(result.passed).toBe(false);
    expect(result.pageErrors).toEqual(['ReferenceError: naoExiste is not defined']);
    expect(result.tests[0]?.message).toMatch(/^O JavaScript da página deu erro: ReferenceError/);
  });

  it('Promise rejeitada sem tratamento conta como erro da página', async () => {
    const files: WebFiles = { ...centered, js: "Promise.reject(new Error('API fora do ar'));" };
    const result = await runWebInChromium(files, centerTests, DEFAULT_WEB_VIEWPORT);
    expect(result.pageErrors).toEqual(['Error: API fora do ar']);
    expect(result.passed).toBe(false);
  });

  it('um código que fecha a tag <script> não quebra a página', async () => {
    const tricky: WebFiles = { ...centered, js: "const s = '</script><p>oi</p>';" };
    const result = await runWebInChromium(tricky, centerTests, DEFAULT_WEB_VIEWPORT);
    expect(result).toMatchObject({ passed: true, pageErrors: [] });
  });

  it('teste que nunca termina estoura o tempo', async () => {
    const result = await runWebInChromium(
      centered,
      [{ description: 'trava', code: 'await new Promise(() => {});' }],
      DEFAULT_WEB_VIEWPORT,
    );
    expect(result.tests[0]?.message).toContain('tempo esgotado');
  });
});
