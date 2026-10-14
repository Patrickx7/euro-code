import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'front.m01.l04',
  moduleId: 'front.m01',
  order: 4,
  title: 'Componentes: abas, modal e acordeão',
  concepts: [
    'atributo hidden',
    'aria-expanded',
    'aria-selected e aria-controls',
    'abas (tabs)',
    'modal',
    'acordeão',
    'atributos são strings',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Todo site de cliente tem os mesmos três bichos: **abas**, **modal** (a janelinha por cima da página) e **acordeão** (perguntas que abrem e fecham). Não precisa de biblioteca: é HTML + CSS + o que você já sabe de eventos. O segredo é guardar o estado do componente em **atributos** que o navegador e os leitores de tela entendem.

## hidden

\`painel.hidden = true\` esconde o elemento (como um \`display: none\`); \`painel.hidden = false\` mostra de novo. No HTML, é só escrever \`<div hidden>\`.

Cuidado: se o seu CSS der \`display: flex\` para o elemento, o CSS ganha e o \`hidden\` para de esconder. Resolva com uma regra \`[hidden] { display: none; }\` (ou mais específica, como \`.fundo[hidden]\`).

## ARIA: o estado para quem não vê a tela

Leitores de tela não enxergam a sua classe \`.aberto\`. Eles leem atributos **ARIA**:

- \`aria-expanded="true"\` / \`"false"\`: no botão que abre e fecha alguma coisa (acordeão, menu);
- \`aria-controls="id-do-painel"\`: diz qual elemento o botão controla (e o seu JS pode usar para achar o painel!);
- \`aria-selected="true"\`: na aba ativa, junto com \`role="tab"\` e \`role="tabpanel"\`;
- \`role="dialog"\` e \`aria-modal="true"\`: na caixa do modal.

**Atributo é sempre string.** \`getAttribute('aria-expanded')\` devolve \`'true'\` ou \`'false'\`, nunca o booleano. Compare com \`=== 'true'\`.`,
    },
    {
      kind: 'text',
      markdown: `## Os três padrões

**Abas:** ao clicar numa aba, desative **todas** (\`aria-selected="false"\` e painel com \`hidden\`) e ative só a clicada. O painel certo é o do \`aria-controls\` da aba.

**Acordeão:** cada botão alterna o **próprio** painel: lê \`aria-expanded\`, inverte e mostra ou esconde o painel.

**Modal:** abrir é tirar o \`hidden\` do fundo escuro. Fechar tem três caminhos, e o cliente vai testar os três:

1. o botão **×**;
2. a tecla **Escape**: ouvinte de \`keydown\` no \`document\`;
3. clique **no fundo**, fora da caixa: ouvinte no fundo com \`if (event.target === fundo)\`. Clique dentro da caixa tem \`target\` no conteúdo, então não fecha.

Use \`<button>\` para tudo que é clicável: ele recebe foco, funciona com Enter e espaço e o leitor de tela anuncia "botão". Uma \`<div>\` clicável não faz nada disso.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<h3>
  <button class="pergunta" aria-expanded="false" aria-controls="resp-prazo">Qual o prazo?</button>
</h3>
<div id="resp-prazo" hidden>Depende de quantas vezes o escopo mudar.</div>

<script>
  document.querySelector('.pergunta').addEventListener('click', function (event) {
    const botao = event.currentTarget;
    const painel = document.getElementById(botao.getAttribute('aria-controls'));
    const aberto = botao.getAttribute('aria-expanded') === 'true';

    botao.setAttribute('aria-expanded', String(!aberto));
    painel.hidden = aberto; // estava aberto? esconde
  });
</script>`,
      explanation:
        "O estado mora no `aria-expanded`. O `aria-controls` aponta o painel. Repare na comparação com a string `'true'`.",
    },
  ],
  checkQuestionIds: ['front.m01.q25', 'front.m01.q26'],
  exerciseIds: ['front.m01.e07', 'front.m01.e08'],
  debugExerciseIds: ['front.m01.d04'],
};

const ABAS_HTML = `<div class="abas" role="tablist">
  <button role="tab" id="aba-sites" aria-controls="painel-sites" aria-selected="true">Sites</button>
  <button role="tab" id="aba-lojas" aria-controls="painel-lojas" aria-selected="false">Lojas virtuais</button>
  <button role="tab" id="aba-manutencao" aria-controls="painel-manutencao" aria-selected="false">Manutenção</button>
</div>
<section role="tabpanel" id="painel-sites">Sites a partir de R$ 800. Prazo: "pra ontem" custa o dobro.</section>
<section role="tabpanel" id="painel-lojas" hidden>Lojas com até 50 produtos. Fotos por conta do cliente (sem foto do celular na garagem).</section>
<section role="tabpanel" id="painel-manutencao" hidden>Pacote mensal com 4 horas de "é rapidinho".</section>`;

const ABAS_CSS = `body { font-family: sans-serif; }
.abas { display: flex; gap: 4px; border-bottom: 1px solid #ccc; }
[role="tab"] { padding: 8px 12px; border: none; background: none; }
[role="tab"][aria-selected="true"] { border-bottom: 3px solid rgb(0, 120, 90); font-weight: bold; }
[role="tabpanel"] { padding: 12px; }`;

const MODAL_HTML = `<button id="abrir" aria-haspopup="dialog">Pedir orçamento</button>
<div id="modal" class="fundo" hidden>
  <div class="caixa" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
    <h2 id="titulo-modal">Pedir orçamento</h2>
    <p>Descreva o job. Se for "rapidinho", descreva em dobro.</p>
    <button id="fechar" aria-label="Fechar">×</button>
  </div>
</div>`;

const MODAL_CSS = `body { font-family: sans-serif; margin: 0; }
.fundo { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; }
.fundo[hidden] { display: none; }
.caixa { background: white; padding: 24px; width: 300px; position: relative; }
#fechar { position: absolute; top: 8px; right: 8px; }`;

const FAQ_HTML = `<div id="faq">
  <h3><button class="pergunta" aria-expanded="false" aria-controls="r1">Vocês fazem site em 1 dia?</button></h3>
  <div id="r1" hidden>Fazemos. Ele só não fica pronto em 1 dia.</div>
  <h3><button class="pergunta" aria-expanded="false" aria-controls="r2">Quanto custa "só mudar uma cor"?</button></h3>
  <div id="r2" hidden>Depende da cor e de quantas vezes você vai mudar de ideia.</div>
  <h3><button class="pergunta" aria-expanded="false" aria-controls="r3">Aceitam pagamento em permuta?</button></h3>
  <div id="r3" hidden>Só se for pizza.</div>
</div>`;

const FAQ_CSS = `body { font-family: sans-serif; }
.pergunta { width: 100%; text-align: left; padding: 8px; }`;

export const exercises: Exercise[] = [
  {
    id: 'front.m01.e07',
    lessonId: 'front.m01.l04',
    kind: 'implement',
    title: 'Abas da página de serviços',
    promptMarkdown: `A página de serviços tem três abas. O HTML e o CSS estão prontos; falta o JS.

1. Crie a função \`ativarAba(aba)\`, que recebe o **botão** de uma aba e:
   - coloca \`aria-selected="true"\` nela e \`aria-selected="false"\` em todas as outras \`[role="tab"]\`;
   - mostra o painel indicado no \`aria-controls\` dela (\`hidden = false\`) e esconde os outros \`[role="tabpanel"]\`.
2. Coloque **um** ouvinte de clique no \`.abas\` que chama \`ativarAba\` com a aba clicada.

Os testes também chamam \`ativarAba(...)\` direto.`,
    language: 'web',
    starterFiles: {
      html: ABAS_HTML,
      css: ABAS_CSS,
      js: `const abas = document.querySelectorAll('[role="tab"]');
const paineis = document.querySelectorAll('[role="tabpanel"]');

function ativarAba(aba) {
  // seu código aqui
}

// ouvinte de clique no .abas
`,
    },
    solutionFiles: {
      html: ABAS_HTML,
      css: ABAS_CSS,
      js: `const abas = document.querySelectorAll('[role="tab"]');
const paineis = document.querySelectorAll('[role="tabpanel"]');

function ativarAba(aba) {
  abas.forEach(function (outra) {
    outra.setAttribute('aria-selected', 'false');
  });
  paineis.forEach(function (painel) {
    painel.hidden = true;
  });
  aba.setAttribute('aria-selected', 'true');
  document.getElementById(aba.getAttribute('aria-controls')).hidden = false;
}

document.querySelector('.abas').addEventListener('click', function (event) {
  const aba = event.target.closest('[role="tab"]');
  if (!aba) return;
  ativarAba(aba);
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'clicar em "Lojas virtuais" mostra o painel das lojas',
        code: `click('#aba-lojas');
assert.strictEqual(document.querySelector('#aba-lojas').getAttribute('aria-selected'), 'true');
assert.strictEqual(document.querySelector('#aba-sites').getAttribute('aria-selected'), 'false', 'A aba antiga deveria ficar com aria-selected="false".');
assert.strictEqual(document.querySelector('#painel-lojas').hidden, false, 'O painel das lojas deveria aparecer.');
assert.strictEqual(document.querySelector('#painel-sites').hidden, true, 'O painel de sites deveria sumir.');
assert.strictEqual(style('#painel-sites').display, 'none');`,
      },
      {
        description: 'ativarAba() com a aba de manutenção deixa só ela ativa',
        code: `ativarAba(document.querySelector('#aba-manutencao'));
assert.strictEqual(document.querySelectorAll('[aria-selected="true"]').length, 1, 'Só uma aba pode ter aria-selected="true".');
assert.strictEqual(document.querySelector('#aba-manutencao').getAttribute('aria-selected'), 'true');
const visiveis = [...document.querySelectorAll('[role="tabpanel"]')].filter((p) => !p.hidden);
assert.strictEqual(visiveis.length, 1, 'Só um painel deveria estar visível.');
assert.strictEqual(visiveis[0].id, 'painel-manutencao');`,
      },
      {
        description: 'voltar para "Sites" funciona',
        code: `click('#aba-sites');
assert.strictEqual(document.querySelector('#painel-sites').hidden, false);
assert.strictEqual(document.querySelector('#painel-manutencao').hidden, true);
assert.strictEqual(document.querySelector('#aba-manutencao').getAttribute('aria-selected'), 'false');`,
      },
    ],
    hints: [
      "Primeiro desligue tudo: `aria-selected` como `'false'` em todas as abas e `hidden = true` em todos os painéis. Depois ligue só a aba recebida.",
      "O painel da aba: `document.getElementById(aba.getAttribute('aria-controls'))`.",
      'No ouvinte: `event.target.closest(\'[role="tab"]\')`.',
    ],
    followUpQuestionIds: ['front.m01.f19', 'front.m01.f20'],
    difficulty: 2,
  },
  {
    id: 'front.m01.e08',
    lessonId: 'front.m01.l04',
    kind: 'implement',
    title: 'Modal de orçamento',
    promptMarkdown: `O cliente quer o botão **Pedir orçamento** abrindo uma janelinha "bem chique, com o fundo escurinho".

1. Crie \`abrirModal()\` (tira o \`hidden\` do \`#modal\`) e \`fecharModal()\` (põe de volta).
2. Clique em \`#abrir\` abre; clique em \`#fechar\` fecha.
3. **Escape** fecha: ouvinte de \`keydown\` no \`document\`.
4. Clique **no fundo escuro** (o próprio \`#modal\`) fecha; clique dentro da \`.caixa\` não fecha.

Os testes também chamam \`abrirModal()\` direto.`,
    language: 'web',
    starterFiles: {
      html: MODAL_HTML,
      css: MODAL_CSS,
      js: `const modal = document.querySelector('#modal');

function abrirModal() {
  // seu código aqui
}

function fecharModal() {
  // seu código aqui
}

// ouvintes: #abrir, #fechar, Escape e clique no fundo
`,
    },
    solutionFiles: {
      html: MODAL_HTML,
      css: MODAL_CSS,
      js: `const modal = document.querySelector('#modal');

function abrirModal() {
  modal.hidden = false;
}

function fecharModal() {
  modal.hidden = true;
}

document.querySelector('#abrir').addEventListener('click', abrirModal);
document.querySelector('#fechar').addEventListener('click', fecharModal);

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') fecharModal();
});

modal.addEventListener('click', function (event) {
  if (event.target === modal) fecharModal();
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'o modal começa fechado',
        code: `assert.strictEqual(style('#modal').display, 'none', 'O modal deveria começar escondido.');`,
      },
      {
        description: '"Pedir orçamento" abre o modal',
        code: `click('#abrir');
assert.strictEqual(document.querySelector('#modal').hidden, false, 'O #modal deveria perder o hidden.');
assert.strictEqual(style('#modal').display, 'flex');`,
      },
      {
        description: 'clicar dentro da caixa não fecha',
        code: `click('#titulo-modal');
assert.strictEqual(document.querySelector('#modal').hidden, false, 'Clique dentro da caixa não deveria fechar. Compare event.target com o fundo.');`,
      },
      {
        description: 'o × fecha o modal',
        code: `click('#fechar');
assert.strictEqual(document.querySelector('#modal').hidden, true, 'O botão × deveria fechar o modal.');`,
      },
      {
        description: 'Escape fecha o modal',
        code: `abrirModal();
assert.strictEqual(document.querySelector('#modal').hidden, false, 'abrirModal() deveria abrir o modal.');
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
assert.strictEqual(document.querySelector('#modal').hidden, true, 'Escape deveria fechar o modal.');`,
      },
      {
        description: 'clicar no fundo escuro fecha o modal',
        code: `abrirModal();
click('#modal');
assert.strictEqual(document.querySelector('#modal').hidden, true, 'Clique no fundo deveria fechar o modal.');`,
      },
    ],
    hints: [
      'Abrir e fechar é só `modal.hidden = false` e `modal.hidden = true`.',
      "Escape: `document.addEventListener('keydown', ...)` e `event.key === 'Escape'`.",
      'Fundo: ouvinte de clique no `modal` com `if (event.target === modal)`. Clique na caixa tem outro `target`.',
    ],
    followUpQuestionIds: ['front.m01.f21', 'front.m01.f22'],
    difficulty: 2,
  },
  {
    id: 'front.m01.d04',
    lessonId: 'front.m01.l04',
    kind: 'debug',
    title: 'O acordeão que não fecha',
    promptMarkdown: `No FAQ do site, as perguntas abrem, mas **nunca mais fecham**. O cliente clicou umas vinte vezes e ligou para reclamar.

Conserte para que o segundo clique numa pergunta feche a resposta e volte o \`aria-expanded\` para \`"false"\`.`,
    language: 'web',
    starterFiles: {
      html: FAQ_HTML,
      css: FAQ_CSS,
      js: `document.querySelector('#faq').addEventListener('click', function (event) {
  const botao = event.target.closest('.pergunta');
  if (!botao) return;

  const resposta = document.getElementById(botao.getAttribute('aria-controls'));
  const aberto = botao.getAttribute('aria-expanded') === true;

  botao.setAttribute('aria-expanded', String(!aberto));
  resposta.hidden = aberto;
});
`,
    },
    solutionFiles: {
      html: FAQ_HTML,
      css: FAQ_CSS,
      js: `document.querySelector('#faq').addEventListener('click', function (event) {
  const botao = event.target.closest('.pergunta');
  if (!botao) return;

  const resposta = document.getElementById(botao.getAttribute('aria-controls'));
  const aberto = botao.getAttribute('aria-expanded') === 'true';

  botao.setAttribute('aria-expanded', String(!aberto));
  resposta.hidden = aberto;
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'o primeiro clique abre a resposta',
        code: `click('[aria-controls="r1"]');
assert.strictEqual(document.querySelector('[aria-controls="r1"]').getAttribute('aria-expanded'), 'true');
assert.strictEqual(document.querySelector('#r1').hidden, false);`,
      },
      {
        description: 'o segundo clique fecha a resposta',
        code: `click('[aria-controls="r1"]');
assert.strictEqual(document.querySelector('[aria-controls="r1"]').getAttribute('aria-expanded'), 'false', 'Depois do segundo clique, aria-expanded deveria voltar a "false".');
assert.strictEqual(document.querySelector('#r1').hidden, true, 'Depois do segundo clique, a resposta deveria sumir.');`,
      },
      {
        description: 'cada pergunta abre e fecha só a própria resposta',
        code: `click('[aria-controls="r2"]');
assert.strictEqual(document.querySelector('#r2').hidden, false);
assert.strictEqual(document.querySelector('#r1').hidden, true, 'Abrir a pergunta 2 não deveria abrir a 1.');
click('[aria-controls="r2"]');
assert.strictEqual(document.querySelector('#r2').hidden, true);`,
      },
    ],
    hints: [
      'O que `getAttribute` devolve: o booleano `true` ou o texto `"true"`?',
      "Compare com a string: `=== 'true'`.",
    ],
    followUpQuestionIds: ['front.m01.f23', 'front.m01.f24'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m01.q25',
    lessonIds: ['front.m01.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual atributo avisa ao leitor de tela que o painel controlado por um botão está aberto?',
    options: ['`aria-expanded="true"`', '`class="aberto"`', '`hidden="false"`', '`role="aberto"`'],
    answerIndex: 0,
    explanation:
      '`aria-expanded` no botão diz se o que ele controla está expandido. Classes o leitor de tela ignora.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q26',
    lessonIds: ['front.m01.l04'],
    kind: 'true-false',
    prompt: '`painel.hidden = true` esconde o elemento, e `painel.hidden = false` mostra de novo.',
    answer: true,
    explanation: 'O atributo `hidden` funciona como um `display: none` que o JS liga e desliga.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'front.m01.q27',
    lessonIds: ['front.m01.l04'],
    kind: 'multiple-choice',
    code: '<button aria-expanded="true">Detalhes</button>',
    prompt: "O que `botao.getAttribute('aria-expanded')` devolve?",
    options: ["A string `'true'`", 'O booleano `true`', 'O número `1`', '`undefined`'],
    answerIndex: 0,
    explanation: "Atributos HTML são sempre texto. Por isso a comparação certa é `=== 'true'`.",
    difficulty: 1,
  },
  {
    id: 'front.m01.q28',
    lessonIds: ['front.m01.l04'],
    kind: 'multiple-choice',
    prompt:
      'O ouvinte de clique está no fundo escuro do modal (`fundo`). Que condição fecha o modal só quando o clique foi fora da caixa?',
    options: [
      '`event.target === fundo`',
      '`event.currentTarget === fundo`',
      "`event.type === 'click'`",
      '`fundo.hidden === false`',
    ],
    answerIndex: 0,
    explanation:
      'Clique na caixa tem `target` no conteúdo. Já o `currentTarget` é sempre o `fundo`, então fecharia com qualquer clique.',
    difficulty: 2,
  },
  {
    id: 'front.m01.q29',
    lessonIds: ['front.m01.l04'],
    kind: 'true-false',
    prompt:
      'Se o CSS der `display: flex` ao elemento, o atributo `hidden` pode deixar de escondê-lo; por isso vale uma regra como `.fundo[hidden] { display: none; }`.',
    answer: true,
    explanation:
      'O `display` do seu CSS vence o estilo padrão do `hidden`. A regra com `[hidden]` devolve o controle.',
    difficulty: 2,
  },
  {
    id: 'front.m01.q30',
    lessonIds: ['front.m01.l04'],
    kind: 'multiple-choice',
    prompt: 'Num componente de abas, o que acontece com as outras abas quando o usuário clica numa delas?',
    options: [
      'Ficam com `aria-selected="false"` e os painéis delas recebem `hidden`',
      'Continuam ativas, só a clicada muda de cor',
      'São removidas do HTML',
      'Ganham `aria-expanded="true"`',
    ],
    answerIndex: 0,
    explanation: 'Só uma aba fica ativa por vez. Desligue todas e ligue a clicada.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q31',
    lessonIds: ['front.m01.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para marcar a aba como a ativa.',
    code: "aba.setAttribute('___', 'true');",
    acceptedAnswers: ['aria-selected'],
    explanation: 'Abas (`role="tab"`) usam `aria-selected` para indicar a ativa.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q32',
    lessonIds: ['front.m01.l04'],
    kind: 'multiple-choice',
    prompt:
      'Por que o título clicável de um acordeão deve ser um `<button>` e não uma `<div>` com ouvinte de clique?',
    options: [
      'O `<button>` recebe foco, funciona com Enter e espaço e é anunciado como botão pelo leitor de tela',
      'Porque `<div>` não aceita `addEventListener`',
      'Porque `<button>` já vem com o `hidden` embutido',
      'Não há diferença nenhuma',
    ],
    answerIndex: 0,
    explanation: 'Uma `<div>` também recebe clique, mas quem usa teclado ou leitor de tela fica de fora.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m01.f19',
    lessonIds: ['front.m01.l04'],
    exerciseId: 'front.m01.e07',
    kind: 'multiple-choice',
    prompt: 'Na sua `ativarAba`, como você descobre qual painel mostrar?',
    options: [
      'Pelo `aria-controls` da aba, que tem o `id` do painel',
      'Pela posição da aba, contando os botões',
      'Pelo texto da aba',
      'Pelo `aria-selected` do painel',
    ],
    answerIndex: 0,
    explanation: '`aria-controls` liga a aba ao painel, e o JS aproveita a mesma informação.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f20',
    lessonIds: ['front.m01.l04'],
    exerciseId: 'front.m01.e07',
    kind: 'true-false',
    prompt:
      'No seu código, depois de clicar em "Lojas virtuais", podem existir duas abas com `aria-selected="true"`.',
    answer: false,
    explanation: 'A `ativarAba` desliga todas antes de ligar a clicada. Sempre sobra só uma.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f21',
    lessonIds: ['front.m01.l04'],
    exerciseId: 'front.m01.e08',
    kind: 'multiple-choice',
    prompt: 'No seu modal, por que o clique no título dentro da `.caixa` não fechou?',
    options: [
      'Porque o `event.target` era o título, diferente do `#modal`, e a condição `event.target === modal` falhou',
      'Porque títulos não disparam clique',
      'Porque a `.caixa` tem `hidden`',
      'Porque o Escape bloqueou o clique',
    ],
    answerIndex: 0,
    explanation:
      'O clique subiu até o fundo, mas começou no título. Só fecha quando começa no próprio fundo.',
    difficulty: 2,
  },
  {
    id: 'front.m01.f22',
    lessonIds: ['front.m01.l04'],
    exerciseId: 'front.m01.e08',
    kind: 'fill-blank',
    prompt: 'Complete o evento que o seu modal ouve no `document` para fechar com Escape.',
    code: "document.addEventListener('___', function (event) {\n  if (event.key === 'Escape') fecharModal();\n});",
    acceptedAnswers: ['keydown', 'keyup'],
    explanation: '`keydown` dispara quando a tecla é apertada; `event.key` diz qual foi.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f23',
    lessonIds: ['front.m01.l04'],
    exerciseId: 'front.m01.d04',
    kind: 'multiple-choice',
    prompt: 'No acordeão com defeito, quanto valia `aberto` depois que a resposta já estava aberta?',
    options: [
      '`false`, porque `getAttribute` devolve a string `"true"`, que nunca é `=== true`',
      '`true`, como esperado',
      '`"true"`',
      '`undefined`',
    ],
    answerIndex: 0,
    explanation:
      'Comparar string com booleano usando `===` sempre dá `false`. Então o código sempre "abria".',
    difficulty: 2,
  },
  {
    id: 'front.m01.f24',
    lessonIds: ['front.m01.l04'],
    exerciseId: 'front.m01.d04',
    kind: 'fill-blank',
    prompt: 'Complete a linha consertada do acordeão.',
    code: "const aberto = botao.getAttribute('aria-expanded') === ___;",
    acceptedAnswers: ["'true'", '"true"'],
    explanation: "Compare com o texto `'true'`, que é o que o atributo guarda.",
    difficulty: 1,
  },
];
