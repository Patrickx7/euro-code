import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m06.l01',
  moduleId: 'core.m06',
  order: 1,
  title: 'O DOM: achar e mudar elementos da página',
  concepts: ['DOM', 'document', 'querySelector', 'querySelectorAll', 'textContent', 'null'],
  sections: [
    {
      kind: 'text',
      markdown: `Até agora o seu JavaScript conversava só com o console. Agora ele vai mexer na **página**.

Quando o navegador lê o HTML, ele monta uma árvore de objetos na memória: o **DOM** (_Document Object Model_). Cada tag vira um objeto que o JavaScript consegue achar, ler e mudar. A porta de entrada é o objeto \`document\`.

Detalhe importante: o JS **não edita o arquivo .html**. Ele muda a árvore que está na memória do navegador. Recarregou a página? Volta tudo ao original. (Igual cliente que pede alteração por telefone e depois jura que nunca pediu.)`,
    },
    {
      kind: 'text',
      markdown: `## Achando elementos

\`document.querySelector(seletor)\` recebe um **seletor CSS**, o mesmo que você já usa no CSS, e devolve o **primeiro** elemento que combina:

- \`document.querySelector('h1')\`: a primeira tag \`<h1>\`;
- \`document.querySelector('.preco')\`: o primeiro elemento com a classe \`preco\`;
- \`document.querySelector('#status')\`: o elemento com \`id="status"\`;
- \`document.querySelector('.cardapio li')\`: o primeiro \`<li>\` dentro de \`.cardapio\`.

Se nada combinar, ele devolve \`null\`. E \`null.textContent\` estoura o famoso erro _"Cannot read properties of null"_. Quando aparecer, confira o seletor: quase sempre é um \`.\` ou um \`#\` esquecido.

Para pegar **todos** os elementos que combinam, use \`document.querySelectorAll(seletor)\`. Ele devolve uma lista (\`NodeList\`) com \`.length\`, acesso por índice (\`lista[0]\`) e \`forEach\`.`,
    },
    {
      kind: 'text',
      markdown: `## Lendo e mudando o texto

A propriedade \`textContent\` guarda o texto de dentro do elemento. Dá para ler e para trocar:

- ler: \`const nome = titulo.textContent;\`
- trocar: \`titulo.textContent = 'Job aceito!';\`

Atenção: \`textContent\` é **sempre uma string**. Se a página mostra \`80\`, você recebe \`'80'\`, e \`'80' + 20\` dá \`'8020'\`. Para fazer conta, converta antes com \`Number(...)\`. Na hora de escrever, pode atribuir um número: ele vira texto sozinho.

Por que o \`<script>\` costuma ficar no fim do \`<body>\`? Porque o JS só acha elementos que o navegador **já leu**. Nos exercícios, o seu código roda no fim da página, então todo o HTML já existe.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<h1 id="status">Job pendente</h1>
<p class="cliente">Padaria Pão de Ontem</p>

<script>
  const statusJob = document.querySelector('#status');
  console.log(statusJob.textContent); // "Job pendente"
  statusJob.textContent = 'Job aceito!';

  const cliente = document.querySelector('.cliente');
  cliente.textContent = cliente.textContent + ' (paga no Pix)';
</script>`,
      explanation:
        'O `querySelector` acha o elemento pelo seletor CSS; o `textContent` lê e troca o texto dele. A página passa a mostrar "Job aceito!".',
    },
    {
      kind: 'example',
      language: 'html',
      code: `<ul>
  <li class="task">Trocar o logo</li>
  <li class="task">Arrumar o rodapé</li>
  <li class="task">Mudar o telefone</li>
</ul>
<p id="resumo"></p>

<script>
  const tasks = document.querySelectorAll('.task');
  document.querySelector('#resumo').textContent = tasks.length + ' tasks pra hoje';

  tasks.forEach(function (task) {
    task.textContent = 'Feito: ' + task.textContent;
  });
</script>`,
      explanation:
        'O `querySelectorAll` devolve todos os `.task`. Com `.length` você conta; com `forEach` você passa por cada um.',
    },
  ],
  checkQuestionIds: ['core.m06.q01', 'core.m06.q02'],
  exerciseIds: ['core.m06.e01', 'core.m06.e02'],
  debugExerciseIds: ['core.m06.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m06.e01',
    lessonId: 'core.m06.l01',
    kind: 'implement',
    title: 'Atualize o painel do freela',
    promptMarkdown: `Você aceitou o job do **Pet Shop Au Au Osasco**, mas o seu painel ainda mostra o cliente como \`???\` e o status como \`pendente\`.

Usando \`document.querySelector\` e \`textContent\`:

1. troque o texto de \`#cliente\` para \`Pet Shop Au Au Osasco\`;
2. troque o texto de \`#status\` para \`aceito\`.

Não mexa no título da página.`,
    language: 'web',
    starterFiles: {
      html: `<h1>Painel do Freela</h1>
<p>Cliente: <span id="cliente">???</span></p>
<p>Status: <span id="status">pendente</span></p>`,
      css: `body { font-family: sans-serif; }
#status { font-weight: bold; }`,
      js: `// Ache os elementos com document.querySelector e troque o textContent deles.
`,
    },
    solutionFiles: {
      html: `<h1>Painel do Freela</h1>
<p>Cliente: <span id="cliente">???</span></p>
<p>Status: <span id="status">pendente</span></p>`,
      css: `body { font-family: sans-serif; }
#status { font-weight: bold; }`,
      js: `const cliente = document.querySelector('#cliente');
cliente.textContent = 'Pet Shop Au Au Osasco';

const statusJob = document.querySelector('#status');
statusJob.textContent = 'aceito';
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'o cliente aparece como "Pet Shop Au Au Osasco"',
        code: `assert.strictEqual(
  document.querySelector('#cliente').textContent,
  'Pet Shop Au Au Osasco',
  'O texto de #cliente deveria ser "Pet Shop Au Au Osasco".',
);`,
      },
      {
        description: 'o status aparece como "aceito"',
        code: `assert.strictEqual(
  document.querySelector('#status').textContent,
  'aceito',
  'O texto de #status deveria ser "aceito".',
);`,
      },
      {
        description: 'o título continua "Painel do Freela"',
        code: `assert.strictEqual(
  document.querySelector('h1').textContent,
  'Painel do Freela',
  'O título <h1> mudou; mexa só no cliente e no status.',
);`,
      },
    ],
    hints: [
      "Para achar pelo id, o seletor começa com `#`: `document.querySelector('#cliente')`.",
      "Depois de achar o elemento, atribua o texto novo: `elemento.textContent = '...';`.",
    ],
    followUpQuestionIds: ['core.m06.f01', 'core.m06.f02'],
    difficulty: 1,
  },
  {
    id: 'core.m06.e02',
    lessonId: 'core.m06.l01',
    kind: 'implement',
    title: 'Resumo das tasks',
    promptMarkdown: `A lista de tasks do site da agência cresce todo dia ("é rapidinho", dizem). Monte um resumo automático.

Crie a função \`atualizarResumo()\` que:

1. conta quantos elementos \`.task\` existem e escreve esse número em \`#total\`;
2. conta quantos têm também a classe \`feita\` (seletor \`.task.feita\`) e escreve em \`#feitas\`.

No fim do script, **chame** \`atualizarResumo()\` uma vez. Os testes vão adicionar tasks novas e chamar a sua função de novo, então nada de escrever os números na mão!`,
    language: 'web',
    starterFiles: {
      html: `<h2>Tasks do site</h2>
<ul id="tasks">
  <li class="task feita">Trocar o logo</li>
  <li class="task">Arrumar o rodapé</li>
  <li class="task feita">Mudar o telefone</li>
  <li class="task">Colocar o mapa</li>
  <li class="task feita">Corrigir o título</li>
</ul>
<p>Total: <span id="total">0</span></p>
<p>Feitas: <span id="feitas">0</span></p>`,
      css: `body { font-family: sans-serif; }
.feita { text-decoration: line-through; color: gray; }`,
      js: `function atualizarResumo() {
  // conte as tasks com document.querySelectorAll e escreva em #total e #feitas
}

atualizarResumo();
`,
    },
    solutionFiles: {
      html: `<h2>Tasks do site</h2>
<ul id="tasks">
  <li class="task feita">Trocar o logo</li>
  <li class="task">Arrumar o rodapé</li>
  <li class="task feita">Mudar o telefone</li>
  <li class="task">Colocar o mapa</li>
  <li class="task feita">Corrigir o título</li>
</ul>
<p>Total: <span id="total">0</span></p>
<p>Feitas: <span id="feitas">0</span></p>`,
      css: `body { font-family: sans-serif; }
.feita { text-decoration: line-through; color: gray; }`,
      js: `function atualizarResumo() {
  const todas = document.querySelectorAll('.task');
  const feitas = document.querySelectorAll('.task.feita');
  document.querySelector('#total').textContent = todas.length;
  document.querySelector('#feitas').textContent = feitas.length;
}

atualizarResumo();
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'o total mostra 5 tasks',
        code: `assert.strictEqual(document.querySelector('#total').textContent, '5', '#total deveria mostrar 5.');`,
      },
      {
        description: 'as feitas mostram 3 tasks',
        code: `assert.strictEqual(document.querySelector('#feitas').textContent, '3', '#feitas deveria mostrar 3.');`,
      },
      {
        description: 'chamar atualizarResumo() de novo conta as tasks novas',
        code: `assert.strictEqual(typeof atualizarResumo, 'function', 'Crie a função atualizarResumo().');
const nova = document.createElement('li');
nova.className = 'task feita';
nova.textContent = 'Task surpresa do cliente';
document.querySelector('#tasks').append(nova);
const outra = document.createElement('li');
outra.className = 'task';
outra.textContent = 'Mais uma "rapidinha"';
document.querySelector('#tasks').append(outra);
atualizarResumo();
assert.strictEqual(document.querySelector('#total').textContent, '7', 'Com 2 tasks novas, #total deveria mostrar 7.');
assert.strictEqual(document.querySelector('#feitas').textContent, '4', 'Com 1 task feita nova, #feitas deveria mostrar 4.');`,
      },
    ],
    hints: [
      "`document.querySelectorAll('.task')` devolve uma lista; o tamanho dela está em `.length`.",
      'Para "tem as duas classes", junte os seletores sem espaço: `.task.feita`.',
      'Faça a contagem **dentro** da função, para ela recontar toda vez que for chamada.',
    ],
    followUpQuestionIds: ['core.m06.f03', 'core.m06.f04'],
    difficulty: 2,
  },
  {
    id: 'core.m06.d01',
    lessonId: 'core.m06.l01',
    kind: 'debug',
    title: 'O orçamento que não soma',
    promptMarkdown: `O orçamento da Padaria Pão de Ontem deveria mostrar **R$ 100** no total (R$ 80 do serviço + R$ 20 de deslocamento até o Centro de Osasco).

Mas a página quebra antes de calcular. Encontre e conserte o(s) defeito(s) do script.`,
    language: 'web',
    starterFiles: {
      html: `<h2>Orçamento</h2>
<p>Serviço: R$ <span class="valor">80</span></p>
<p>Deslocamento: R$ <span class="deslocamento">20</span></p>
<p>Total: R$ <span id="total">0</span></p>`,
      css: `body { font-family: sans-serif; }
#total { font-weight: bold; }`,
      js: `const valor = document.querySelector('valor');
const deslocamento = document.querySelector('.deslocamento');
const total = document.querySelector('#total');

total.textContent = valor.textContent + deslocamento.textContent;
`,
    },
    solutionFiles: {
      html: `<h2>Orçamento</h2>
<p>Serviço: R$ <span class="valor">80</span></p>
<p>Deslocamento: R$ <span class="deslocamento">20</span></p>
<p>Total: R$ <span id="total">0</span></p>`,
      css: `body { font-family: sans-serif; }
#total { font-weight: bold; }`,
      js: `const valor = document.querySelector('.valor');
const deslocamento = document.querySelector('.deslocamento');
const total = document.querySelector('#total');

total.textContent = Number(valor.textContent) + Number(deslocamento.textContent);
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'o total mostra 100',
        code: `assert.strictEqual(
  document.querySelector('#total').textContent,
  '100',
  'O total deveria ser 100. Se apareceu "8020", os textos foram grudados em vez de somados.',
);`,
      },
      {
        description: 'os valores de serviço e deslocamento continuam na tela',
        code: `assert.strictEqual(document.querySelector('.valor').textContent, '80');
assert.strictEqual(document.querySelector('.deslocamento').textContent, '20');`,
      },
    ],
    hints: [
      '"Cannot read properties of null" quer dizer que um `querySelector` não achou nada. Confira os seletores: classe começa com `.`.',
      "`textContent` é texto. `'80' + '20'` dá `'8020'`; use `Number(...)` antes de somar.",
    ],
    followUpQuestionIds: ['core.m06.f05', 'core.m06.f06'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'core.m06.q01',
    lessonIds: ['core.m06.l01'],
    kind: 'multiple-choice',
    prompt: "O que `document.querySelector('.preco')` devolve?",
    options: [
      'O primeiro elemento com a classe `preco`',
      'Todos os elementos com a classe `preco`',
      'O texto de dentro do elemento `.preco`',
      'O elemento com `id="preco"`',
    ],
    answerIndex: 0,
    explanation: '`querySelector` devolve só o primeiro que combina. Para todos, use `querySelectorAll`.',
    difficulty: 1,
  },
  {
    id: 'core.m06.q02',
    lessonIds: ['core.m06.l01'],
    kind: 'true-false',
    prompt:
      'Quando o JavaScript muda o `textContent` de um elemento, o arquivo `.html` no servidor é alterado.',
    answer: false,
    explanation:
      'O JS muda o DOM, a cópia da página na memória do navegador. Recarregou a página, volta o HTML original.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'core.m06.q03',
    lessonIds: ['core.m06.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para pegar o elemento com `id="status"`.',
    code: "const statusJob = document.querySelector('___');",
    acceptedAnswers: ['#status'],
    explanation: 'No seletor CSS, id começa com `#` e classe com `.`.',
    difficulty: 1,
  },
  {
    id: 'core.m06.q04',
    lessonIds: ['core.m06.l01'],
    kind: 'multiple-choice',
    prompt: 'Se nenhum elemento combinar com o seletor, o que `document.querySelector` devolve?',
    options: ['`null`', '`undefined`', 'Uma lista vazia', 'Uma string vazia'],
    answerIndex: 0,
    explanation:
      'Devolve `null`. Por isso o erro "Cannot read properties of null" aparece logo depois, ao usar o resultado.',
    difficulty: 1,
  },
  {
    id: 'core.m06.q05',
    lessonIds: ['core.m06.l01'],
    kind: 'predict-output',
    prompt: 'O texto `80` foi lido de um `textContent`. O que este código imprime?',
    code: "const texto = '80';\nconsole.log(texto + 20);\nconsole.log(Number(texto) + 20);",
    expectedOutput: '8020\n100',
    explanation: 'Com string, `+` gruda os textos. Convertendo com `Number`, vira soma de verdade.',
    difficulty: 1,
  },
  {
    id: 'core.m06.q06',
    lessonIds: ['core.m06.l01'],
    kind: 'multiple-choice',
    prompt: 'Qual código conta quantos `<li>` existem dentro de `#tasks`?',
    options: [
      "document.querySelectorAll('#tasks li').length",
      "document.querySelector('#tasks li').length",
      "document.querySelectorAll('#tasks').length",
      "document.querySelector('li').textContent",
    ],
    answerIndex: 0,
    explanation:
      '`querySelectorAll` com o seletor `#tasks li` pega todos os `<li>` dentro de `#tasks`; `.length` diz quantos são.',
    difficulty: 2,
  },
  {
    id: 'core.m06.q07',
    lessonIds: ['core.m06.l01'],
    kind: 'true-false',
    prompt:
      'Um `<script>` colocado no `<head>`, sem nada especial, consegue achar com `querySelector` um botão que só aparece no `<body>`.',
    answer: false,
    explanation:
      'O navegador lê a página de cima para baixo. Quando o script do `<head>` roda, o botão ainda não existe e o resultado é `null`. Por isso o script costuma ir no fim do `<body>`.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'core.m06.f01',
    lessonIds: ['core.m06.l01'],
    exerciseId: 'core.m06.e01',
    kind: 'multiple-choice',
    prompt: 'No seu painel, por que o seletor do cliente foi `#cliente` e não `.cliente`?',
    options: [
      'Porque o `<span>` tem `id="cliente"`, e id se seleciona com `#`',
      'Porque `#` pega todos os elementos da página',
      'Porque `.cliente` só funciona dentro do CSS',
      'Tanto faz, os dois acham o mesmo elemento',
    ],
    answerIndex: 0,
    explanation:
      'O HTML usa `id="cliente"`. `.cliente` procuraria uma classe, que não existe ali, e daria `null`.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f02',
    lessonIds: ['core.m06.l01'],
    exerciseId: 'core.m06.e01',
    kind: 'true-false',
    prompt:
      'Depois do seu código, se você recarregar a página do painel, o status volta a mostrar "pendente".',
    answer: true,
    explanation:
      'O JS mudou o DOM na memória; o HTML original continua com "pendente" até o script rodar de novo.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f03',
    lessonIds: ['core.m06.l01'],
    exerciseId: 'core.m06.e02',
    kind: 'multiple-choice',
    prompt: 'Na sua `atualizarResumo()`, o que o seletor `.task.feita` (sem espaço) pega?',
    options: [
      'Elementos que têm as duas classes, `task` e `feita`',
      'Elementos `.feita` que estão dentro de um `.task`',
      'Elementos que têm `task` ou `feita`',
      'Só o primeiro `.task` da lista',
    ],
    answerIndex: 0,
    explanation:
      'Classes juntas, sem espaço, exigem as duas no mesmo elemento. Com espaço, seria "dentro de".',
    difficulty: 2,
  },
  {
    id: 'core.m06.f04',
    lessonIds: ['core.m06.l01'],
    exerciseId: 'core.m06.e02',
    kind: 'true-false',
    prompt:
      'Se o `querySelectorAll` ficasse fora da função, guardado numa variável lá no começo, a contagem continuaria certa depois que o teste adicionou tasks novas.',
    answer: false,
    explanation:
      'A lista do `querySelectorAll` é uma foto do momento em que foi feita. Para contar as tasks novas, a busca precisa rodar de novo, dentro da função.',
    difficulty: 2,
  },
  {
    id: 'core.m06.f05',
    lessonIds: ['core.m06.l01'],
    exerciseId: 'core.m06.d01',
    kind: 'multiple-choice',
    prompt:
      'No orçamento quebrado, por que `document.querySelector(\'valor\')` não achou o `<span class="valor">`?',
    options: [
      'Sem o ponto, o seletor procura uma tag chamada `<valor>`',
      'Porque `querySelector` não funciona com `<span>`',
      'Porque o script rodou antes do HTML',
      'Porque o texto era um número',
    ],
    answerIndex: 0,
    explanation: 'Seletor sem `.` ou `#` é nome de tag. Não existe `<valor>`, então veio `null`.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f06',
    lessonIds: ['core.m06.l01'],
    exerciseId: 'core.m06.d01',
    kind: 'fill-blank',
    prompt: 'Complete a linha que você consertou para o total dar 100.',
    code: 'total.textContent = ___(valor.textContent) + Number(deslocamento.textContent);',
    acceptedAnswers: ['Number'],
    explanation: "Sem converter, `'80' + 20` vira `'8020'`.",
    difficulty: 1,
  },
];
