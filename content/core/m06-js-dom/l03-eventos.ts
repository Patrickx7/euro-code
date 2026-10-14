import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m06.l03',
  moduleId: 'core.m06',
  order: 3,
  title: 'Eventos: a página reage ao clique',
  concepts: [
    'eventos',
    'addEventListener',
    'click',
    'função de callback',
    'estado em variável',
    'classList.toggle',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Até aqui o seu script rodava uma vez, quando a página abria, e pronto. Agora ele vai **esperar o usuário**.

Um **evento** é algo que acontece na página: um clique, uma tecla, um campo que mudou. Você avisa o navegador "quando acontecer isso, chama esta função":

\`\`\`js
botao.addEventListener('click', aceitarJob);
\`\`\`

- o primeiro argumento é o **nome do evento** (\`'click'\`, \`'input'\`, \`'keydown'\`...);
- o segundo é a **função** que o navegador vai chamar depois, a cada clique.

Repare: é \`aceitarJob\`, **sem parênteses**. Com \`aceitarJob()\` você chama a função **na hora**, ao carregar a página, e entrega o resultado dela (\`undefined\`) para o \`addEventListener\`. O botão fica "funcionando" uma vez só, antes de qualquer clique. Clássico.

Também vale escrever a função ali mesmo:

\`\`\`js
botao.addEventListener('click', function () {
  statusJob.textContent = 'Aceito';
});
\`\`\``,
    },
    {
      kind: 'text',
      markdown: `## Guardando estado: o contador

Para contar cliques, a variável precisa ficar **fora** da função. Se ela nascer dentro, volta a zero a cada clique:

1. \`let feitas = 0;\` fora da função;
2. dentro do evento: \`feitas = feitas + 1;\`;
3. mostre na tela: \`contador.textContent = feitas;\`.

## Mostrar e esconder

Menu que abre e fecha é só \`classList.toggle\` dentro de um evento de clique. O CSS decide como fica "aberto". E de brinde: \`toggle\` devolve \`true\` se a classe ficou e \`false\` se saiu, ótimo para trocar o texto do botão.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<p>Cafés tomados hoje: <span id="cafes">0</span></p>
<button id="mais">+1 café</button>

<script>
  const cafes = document.querySelector('#cafes');
  let total = 0;

  document.querySelector('#mais').addEventListener('click', function () {
    total = total + 1;
    cafes.textContent = total;
  });
</script>`,
      explanation:
        'A variável `total` fica fora da função, então o valor sobrevive entre um clique e outro. Cada clique soma 1 e atualiza a tela.',
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  .detalhes { display: none; }
  .detalhes.aberto { display: block; }
</style>

<button id="ver">Ver detalhes</button>
<p class="detalhes">Pagamento em 30 dias. (Ou 60. Ou quando o cliente lembrar.)</p>

<script>
  const detalhes = document.querySelector('.detalhes');
  const ver = document.querySelector('#ver');

  ver.addEventListener('click', function () {
    const aberto = detalhes.classList.toggle('aberto');
    if (aberto) {
      ver.textContent = 'Esconder detalhes';
    } else {
      ver.textContent = 'Ver detalhes';
    }
  });
</script>`,
      explanation:
        'Cada clique alterna a classe `aberto`. O valor devolvido pelo `toggle` diz qual texto o botão deve ter.',
    },
  ],
  checkQuestionIds: ['core.m06.q15', 'core.m06.q16'],
  exerciseIds: ['core.m06.e05', 'core.m06.e06'],
  debugExerciseIds: ['core.m06.d03'],
};

const CONTADOR_HTML = `<h2>Tasks feitas hoje: <span id="contador">0</span></h2>
<button id="feita">+1 task</button>
<button id="zerar">Zerar</button>`;

const CONTADOR_CSS = `body { font-family: sans-serif; }
button { padding: 8px 16px; margin-right: 8px; }`;

const MENU_HTML = `<header>
  <span class="logo">Pão de Ontem</span>
  <button class="botao-menu">Menu</button>
</header>
<nav class="menu">
  <a href="#paes">Pães</a>
  <a href="#doces">Doces</a>
  <a href="#encomendas">Encomendas</a>
</nav>`;

const MENU_CSS = `body { font-family: sans-serif; margin: 0; }
header { display: flex; justify-content: space-between; padding: 12px; background: rgb(139, 69, 19); color: white; }
.menu { display: none; }
.menu.aberto { display: block; }
.menu a { display: block; padding: 8px 12px; }`;

const JOB_HTML = `<div class="job">
  <h2>Cardápio novo da Lanchonete X-Tudão</h2>
  <p>Pagamento: R$ 60 (e um lanche)</p>
  <p>Status: <strong id="status">Pendente</strong></p>
  <button id="aceitar">Aceitar job</button>
</div>`;

const JOB_CSS = `body { font-family: sans-serif; }
.job { border: 1px solid #ccc; padding: 12px; width: 320px; }`;

export const exercises: Exercise[] = [
  {
    id: 'core.m06.e05',
    lessonId: 'core.m06.l03',
    kind: 'implement',
    title: 'Contador de tasks feitas',
    promptMarkdown: `Seu chefe na agência quer ver, em tempo real, quantas tasks você fechou hoje (para ter certeza de que você não está só tomando café).

1. Cada clique em \`#feita\` soma 1 e mostra o novo total em \`#contador\`.
2. Um clique em \`#zerar\` volta o contador para \`0\`. Depois de zerar, a contagem recomeça do 1.`,
    language: 'web',
    starterFiles: {
      html: CONTADOR_HTML,
      css: CONTADOR_CSS,
      js: `const contador = document.querySelector('#contador');
let feitas = 0;

// adicione os eventos de clique nos botões #feita e #zerar
`,
    },
    solutionFiles: {
      html: CONTADOR_HTML,
      css: CONTADOR_CSS,
      js: `const contador = document.querySelector('#contador');
let feitas = 0;

document.querySelector('#feita').addEventListener('click', function () {
  feitas = feitas + 1;
  contador.textContent = feitas;
});

document.querySelector('#zerar').addEventListener('click', function () {
  feitas = 0;
  contador.textContent = feitas;
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'o contador começa em 0',
        code: `assert.strictEqual(document.querySelector('#contador').textContent, '0', 'Antes de qualquer clique, o contador deveria mostrar 0.');`,
      },
      {
        description: 'um clique em "+1 task" mostra 1',
        code: `click('#feita');
assert.strictEqual(document.querySelector('#contador').textContent, '1', 'Depois de 1 clique, o contador deveria mostrar 1.');`,
      },
      {
        description: 'mais dois cliques mostram 3',
        code: `click('#feita');
click('#feita');
assert.strictEqual(document.querySelector('#contador').textContent, '3', 'Depois de 3 cliques, o contador deveria mostrar 3.');`,
      },
      {
        description: '"Zerar" volta o contador para 0',
        code: `click('#zerar');
assert.strictEqual(document.querySelector('#contador').textContent, '0', 'Depois de zerar, o contador deveria mostrar 0.');`,
      },
      {
        description: 'depois de zerar, a contagem recomeça do 1',
        code: `click('#feita');
assert.strictEqual(
  document.querySelector('#contador').textContent,
  '1',
  'Depois de zerar e clicar uma vez, deveria mostrar 1. Você zerou a variável ou só o texto?',
);`,
      },
    ],
    hints: [
      "`document.querySelector('#feita').addEventListener('click', function () { ... })`.",
      'Dentro do clique: some 1 em `feitas` e escreva `feitas` no `contador.textContent`.',
      'No "Zerar", volte a **variável** para 0, não só o texto da tela.',
    ],
    followUpQuestionIds: ['core.m06.f13', 'core.m06.f14'],
    difficulty: 2,
  },
  {
    id: 'core.m06.e06',
    lessonId: 'core.m06.l03',
    kind: 'implement',
    title: 'Menu da padaria que abre e fecha',
    promptMarkdown: `No celular, o menu do site da Padaria Pão de Ontem fica escondido. O CSS já esconde o \`.menu\` e mostra quando ele tem a classe \`aberto\`.

Faça o clique no \`.botao-menu\`:

1. alternar a classe \`aberto\` no \`.menu\`;
2. trocar o texto do botão para \`Fechar\` quando o menu abrir, e de volta para \`Menu\` quando fechar.`,
    language: 'web',
    viewport: { width: 375, height: 640 },
    starterFiles: {
      html: MENU_HTML,
      css: MENU_CSS,
      js: `const botao = document.querySelector('.botao-menu');
const menu = document.querySelector('.menu');

// seu código aqui
`,
    },
    solutionFiles: {
      html: MENU_HTML,
      css: MENU_CSS,
      js: `const botao = document.querySelector('.botao-menu');
const menu = document.querySelector('.menu');

botao.addEventListener('click', function () {
  const aberto = menu.classList.toggle('aberto');
  if (aberto) {
    botao.textContent = 'Fechar';
  } else {
    botao.textContent = 'Menu';
  }
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'o menu começa fechado',
        code: `assert.strictEqual(style('.menu').display, 'none', 'O menu deveria começar escondido.');
assert.strictEqual(document.querySelector('.botao-menu').textContent, 'Menu', 'O botão deveria começar com o texto "Menu".');`,
      },
      {
        description: 'um clique abre o menu e o botão vira "Fechar"',
        code: `click('.botao-menu');
assert.ok(document.querySelector('.menu').classList.contains('aberto'), 'Depois do clique, o .menu deveria ter a classe "aberto".');
assert.strictEqual(style('.menu').display, 'block', 'O menu deveria aparecer.');
assert.strictEqual(document.querySelector('.botao-menu').textContent, 'Fechar', 'Com o menu aberto, o botão deveria dizer "Fechar".');`,
      },
      {
        description: 'outro clique fecha o menu e o botão volta para "Menu"',
        code: `click('.botao-menu');
assert.ok(!document.querySelector('.menu').classList.contains('aberto'), 'O segundo clique deveria tirar a classe "aberto".');
assert.strictEqual(style('.menu').display, 'none', 'O menu deveria sumir de novo.');
assert.strictEqual(document.querySelector('.botao-menu').textContent, 'Menu', 'Com o menu fechado, o botão deveria dizer "Menu".');`,
      },
    ],
    hints: [
      "`menu.classList.toggle('aberto')` coloca ou tira a classe a cada chamada.",
      'O `toggle` devolve `true` quando a classe ficou. Use isso num `if` para escolher o texto do botão.',
    ],
    followUpQuestionIds: ['core.m06.f15', 'core.m06.f16'],
    difficulty: 2,
  },
  {
    id: 'core.m06.d03',
    lessonId: 'core.m06.l03',
    kind: 'debug',
    title: 'O job que se aceita sozinho',
    promptMarkdown: `No seu app de freelas, o job da Lanchonete X-Tudão aparece como **Aceito** antes de você clicar em qualquer coisa. E o botão já vem desabilitado. Você não quer aceitar sem ler (de novo).

Conserte para que o status só mude para \`Aceito\` (e o botão só fique desabilitado) **depois do clique** em \`#aceitar\`.`,
    language: 'web',
    starterFiles: {
      html: JOB_HTML,
      css: JOB_CSS,
      js: `const botao = document.querySelector('#aceitar');
const statusJob = document.querySelector('#status');

function aceitarJob() {
  statusJob.textContent = 'Aceito';
  botao.disabled = true;
}

botao.addEventListener('click', aceitarJob());
`,
    },
    solutionFiles: {
      html: JOB_HTML,
      css: JOB_CSS,
      js: `const botao = document.querySelector('#aceitar');
const statusJob = document.querySelector('#status');

function aceitarJob() {
  statusJob.textContent = 'Aceito';
  botao.disabled = true;
}

botao.addEventListener('click', aceitarJob);
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'antes do clique, o job continua "Pendente"',
        code: `assert.strictEqual(document.querySelector('#status').textContent, 'Pendente', 'O status mudou sem ninguém clicar. A função foi chamada na hora?');
assert.strictEqual(document.querySelector('#aceitar').disabled, false, 'O botão já começou desabilitado.');`,
      },
      {
        description: 'depois do clique, o job fica "Aceito"',
        code: `click('#aceitar');
assert.strictEqual(document.querySelector('#status').textContent, 'Aceito', 'Depois do clique, o status deveria ser "Aceito".');`,
      },
      {
        description: 'depois do clique, o botão fica desabilitado',
        code: `assert.strictEqual(document.querySelector('#aceitar').disabled, true, 'Depois de aceitar, o botão deveria ficar desabilitado.');`,
      },
    ],
    hints: [
      'Olhe o segundo argumento do `addEventListener`. Você está entregando a função ou o resultado dela?',
      'Com parênteses, `aceitarJob()` roda na hora. Sem parênteses, `aceitarJob` é a função, que o navegador chama no clique.',
    ],
    followUpQuestionIds: ['core.m06.f17', 'core.m06.f18'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'core.m06.q15',
    lessonIds: ['core.m06.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para rodar `salvar` a cada clique no botão.',
    code: "botao.___('click', salvar);",
    acceptedAnswers: ['addEventListener'],
    explanation:
      '`addEventListener(evento, função)` registra a função para ser chamada quando o evento acontecer.',
    difficulty: 1,
  },
  {
    id: 'core.m06.q16',
    lessonIds: ['core.m06.l03'],
    kind: 'multiple-choice',
    prompt:
      "Qual a diferença entre `addEventListener('click', salvar)` e `addEventListener('click', salvar())`?",
    options: [
      'O primeiro entrega a função para rodar no clique; o segundo roda `salvar` na hora e entrega o resultado',
      'Nenhuma, os dois fazem a mesma coisa',
      'O segundo roda `salvar` duas vezes por clique',
      'O primeiro dá erro, porque falta o parêntese',
    ],
    answerIndex: 0,
    explanation: 'Sem parênteses é a função em si. Com parênteses é uma chamada, que acontece imediatamente.',
    difficulty: 2,
  },
  // ---- gerais ----
  {
    id: 'core.m06.q17',
    lessonIds: ['core.m06.l03'],
    kind: 'multiple-choice',
    code: `const botao = document.querySelector('#mais');
botao.addEventListener('click', function () {
  let cliques = 0;
  cliques = cliques + 1;
  document.querySelector('#total').textContent = cliques;
});`,
    prompt: 'O que `#total` mostra depois de 3 cliques?',
    options: ['1', '3', '0', 'NaN'],
    answerIndex: 0,
    explanation:
      'A variável nasce dentro da função, então volta a 0 em todo clique e sempre termina em 1. Ela devia ficar fora.',
    difficulty: 2,
  },
  {
    id: 'core.m06.q18',
    lessonIds: ['core.m06.l03'],
    kind: 'true-false',
    prompt:
      "A função passada para `addEventListener('click', ...)` roda uma vez a cada clique, quantas vezes o usuário clicar.",
    answer: true,
    explanation: 'O ouvinte continua registrado. Cada clique chama a função de novo.',
    difficulty: 1,
  },
  {
    id: 'core.m06.q19',
    lessonIds: ['core.m06.l03'],
    kind: 'multiple-choice',
    prompt: "O menu está com a classe `aberto`. O que `menu.classList.toggle('aberto')` devolve?",
    options: [
      '`false`, porque a classe saiu',
      '`true`, porque a classe existia',
      '`undefined`',
      'O próprio menu',
    ],
    answerIndex: 0,
    explanation: '`toggle` devolve se a classe ficou no elemento depois da troca. Ela saiu, então `false`.',
    difficulty: 2,
  },
  {
    id: 'core.m06.q20',
    lessonIds: ['core.m06.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual evento avisa a cada letra digitada num campo de texto?',
    options: ["'input'", "'click'", "'load'", "'submit'"],
    answerIndex: 0,
    explanation: 'O evento `input` dispara sempre que o valor do campo muda.',
    difficulty: 1,
  },
  {
    id: 'core.m06.q21',
    lessonIds: ['core.m06.l03'],
    kind: 'true-false',
    prompt:
      'Num contador de cliques, a variável que guarda o total deve ser declarada fora da função do evento.',
    answer: true,
    explanation: 'Fora da função ela sobrevive entre os cliques; dentro, recomeça do zero a cada chamada.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'core.m06.f13',
    lessonIds: ['core.m06.l03'],
    exerciseId: 'core.m06.e05',
    kind: 'multiple-choice',
    prompt:
      'No seu contador, por que o botão "Zerar" precisa fazer `feitas = 0` e não só `contador.textContent = 0`?',
    options: [
      'Senão a tela mostra 0, mas o próximo clique continua a conta de onde a variável parou',
      'Porque `textContent` não aceita números',
      'Porque o navegador apaga a variável sozinho',
      'Não precisa: só trocar o texto já zera tudo',
    ],
    answerIndex: 0,
    explanation:
      'A tela só mostra o valor; quem guarda a conta é a variável `feitas`. As duas precisam voltar a 0.',
    difficulty: 2,
  },
  {
    id: 'core.m06.f14',
    lessonIds: ['core.m06.l03'],
    exerciseId: 'core.m06.e05',
    kind: 'fill-blank',
    prompt: 'Complete a linha do seu contador que soma uma task.',
    code: 'feitas = ___ + 1;',
    acceptedAnswers: ['feitas'],
    explanation:
      'O novo valor é o valor antigo mais 1. (Também dá para escrever `feitas++` ou `feitas += 1`.)',
    difficulty: 1,
  },
  {
    id: 'core.m06.f15',
    lessonIds: ['core.m06.l03'],
    exerciseId: 'core.m06.e06',
    kind: 'multiple-choice',
    prompt: 'No menu da padaria, quem decide que o menu aberto tem `display: block`?',
    options: [
      'O CSS, na regra `.menu.aberto`; o JS só coloca e tira a classe',
      'O JS, com `menu.style.display`',
      'O próprio botão, por ser um `<button>`',
      'O `toggle`, que muda o `display` sozinho',
    ],
    answerIndex: 0,
    explanation: 'O visual fica no CSS. O seu JS só alterna a classe `aberto`.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f16',
    lessonIds: ['core.m06.l03'],
    exerciseId: 'core.m06.e06',
    kind: 'true-false',
    prompt: 'No seu código do menu, quando o usuário clica pela terceira vez, o menu fica aberto de novo.',
    answer: true,
    explanation: '1º clique abre, 2º fecha, 3º abre. O `toggle` só alterna.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f17',
    lessonIds: ['core.m06.l03'],
    exerciseId: 'core.m06.d03',
    kind: 'multiple-choice',
    prompt: 'No código com defeito, quando a função `aceitarJob` rodava?',
    options: [
      'Uma vez, assim que a página carregava, por causa do `aceitarJob()`',
      'A cada clique no botão',
      'Nunca',
      'Duas vezes por clique',
    ],
    answerIndex: 0,
    explanation:
      '`aceitarJob()` é uma chamada: roda na hora. O `addEventListener` recebia `undefined` e o clique não fazia nada.',
    difficulty: 2,
  },
  {
    id: 'core.m06.f18',
    lessonIds: ['core.m06.l03'],
    exerciseId: 'core.m06.d03',
    kind: 'fill-blank',
    prompt: 'Complete a linha consertada do job.',
    code: "botao.addEventListener('click', ___);",
    acceptedAnswers: ['aceitarJob'],
    explanation: 'Passe a função, sem parênteses. O navegador chama ela quando o clique acontecer.',
    difficulty: 1,
  },
];
