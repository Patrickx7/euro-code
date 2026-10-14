import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'front.m01.l02',
  moduleId: 'front.m01',
  order: 2,
  title: 'Delegação de eventos e data-attributes',
  concepts: [
    'propagação (bubbling)',
    'delegação de eventos',
    'closest',
    'data-attributes',
    'dataset',
    'dataset é sempre string',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Imagine o app de freelas com 50 jobs, cada um com seu botão **Aceitar**. Você vai fazer 50 \`addEventListener\`? E quando chegar o job 51, depois que a página já abriu? Ele fica sem ouvinte e o botão não faz nada.

## O evento sobe

Quando você clica num botão, o evento não fica só nele. Ele **sobe** (_bubbling_) pelos pais: o \`<li>\`, o \`<ul>\`, o \`<body>\`, até o \`document\`. Qualquer um deles pode ouvir.

## Delegação: um ouvinte para todos

Então coloque **um** ouvinte no pai e descubra, pelo \`event.target\`, onde foi o clique:

\`\`\`js
lista.addEventListener('click', function (event) {
  const botao = event.target.closest('.aceitar');
  if (!botao) return; // clicou em outra coisa da lista
  // ...aceitar o job do botão
});
\`\`\`

\`elemento.closest(seletor)\` começa no próprio elemento e vai subindo pelos pais até achar um que combine com o seletor. Se não achar, devolve \`null\`. Ele resolve dois problemas de uma vez:

- se o clique caiu num \`<span>\` **dentro** do botão, o \`closest\` sobe até o botão;
- se o clique caiu fora de qualquer botão, ele devolve \`null\` e o \`return\` encerra.

Vantagens: um ouvinte só, e ele funciona para itens **criados depois**, porque quem ouve é o pai, que já existia.`,
    },
    {
      kind: 'text',
      markdown: `## data-attributes: dados pendurados no HTML

O botão sabe que foi clicado, mas qual job ele aceita? Guarde a informação no próprio HTML com atributos que começam com \`data-\`:

\`\`\`html
<li class="job" data-id="42" data-cliente="Bar do Tonhão" data-valor-hora="80">...</li>
\`\`\`

No JS, eles aparecem no objeto \`dataset\`:

- \`li.dataset.id\` é \`'42'\`;
- \`li.dataset.cliente\` é \`'Bar do Tonhão'\`;
- \`li.dataset.valorHora\` é \`'80'\`: o nome com hífen vira **camelCase**.

Também dá para escrever: \`li.dataset.status = 'aceito'\` cria o atributo \`data-status="aceito"\` (e o CSS pode estilizar com \`[data-status="aceito"]\`).

**Pegadinha clássica:** tudo que vem do \`dataset\` é **string**. \`0 + '300'\` dá \`'0300'\`. Antes de fazer conta, \`Number(li.dataset.valorHora)\`.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<ul id="entregas">
  <li data-bairro="Km 18"><button class="concluir">Concluir</button> Pizzaria Forno Frio</li>
  <li data-bairro="Granja Viana"><button class="concluir">Concluir</button> Haras Galope Manso</li>
</ul>
<p id="aviso"></p>

<script>
  document.querySelector('#entregas').addEventListener('click', function (event) {
    const botao = event.target.closest('.concluir');
    if (!botao) return;
    const item = botao.closest('li');
    item.classList.add('feito');
    document.querySelector('#aviso').textContent = 'Entrega concluída no ' + item.dataset.bairro;
  });
</script>`,
      explanation:
        'Um ouvinte só no `<ul>`. O `closest` acha o botão clicado e, a partir dele, o `<li>` com o `data-bairro`.',
    },
  ],
  checkQuestionIds: ['front.m01.q09', 'front.m01.q10'],
  exerciseIds: ['front.m01.e03', 'front.m01.e04'],
  debugExerciseIds: ['front.m01.d02'],
};

const JOBS_HTML = `<h2>Jobs disponíveis</h2>
<ul id="jobs">
  <li class="job" data-id="101" data-cliente="Pizzaria Forno Frio">
    <span class="descricao">Cardápio digital · Centro, Osasco</span>
    <button class="aceitar">Aceitar</button>
  </li>
  <li class="job" data-id="102" data-cliente="Oficina do Baixinho">
    <span class="descricao">Landing page · Jardim Santo Antônio, Osasco</span>
    <button class="aceitar">Aceitar</button>
  </li>
  <li class="job" data-id="103" data-cliente="Salão Tesoura Cega">
    <span class="descricao">Agenda online · Centro, Carapicuíba</span>
    <button class="aceitar">Aceitar</button>
  </li>
</ul>
<p>Último aceito: <strong id="ultimo">nenhum</strong></p>`;

const JOBS_CSS = `body { font-family: sans-serif; }
.job { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #ddd; width: 460px; }
.job.aceito { background: rgb(220, 245, 220); }`;

const ESTRELAS_HTML = `<p>Como foi trabalhar com a Pizzaria Forno Frio?</p>
<div id="estrelas">
  <button class="estrela" data-nota="1"><span class="icone">★</span></button>
  <button class="estrela" data-nota="2"><span class="icone">★</span></button>
  <button class="estrela" data-nota="3"><span class="icone">★</span></button>
  <button class="estrela" data-nota="4"><span class="icone">★</span></button>
  <button class="estrela" data-nota="5"><span class="icone">★</span></button>
</div>
<p id="nota">Sem nota</p>`;

const ESTRELAS_CSS = `body { font-family: sans-serif; }
#estrelas { display: flex; gap: 8px; padding: 8px; }
.estrela { font-size: 24px; color: rgb(180, 180, 180); background: none; border: none; }
.estrela.acesa { color: rgb(240, 180, 0); }`;

const SERVICOS_HTML = `<h2>Monte seu site</h2>
<div id="servicos">
  <button data-servico="Landing page" data-preco="300">Landing page</button>
  <button data-servico="Formulário de contato" data-preco="150">Formulário de contato</button>
  <button data-servico="Botão de ligar" data-preco="50">Botão de ligar</button>
</div>
<ul id="itens"></ul>
<p>Total: R$ <span id="total">0</span></p>`;

const SERVICOS_CSS = `body { font-family: sans-serif; }
#servicos button { margin-right: 8px; padding: 6px 10px; }`;

export const exercises: Exercise[] = [
  {
    id: 'front.m01.e03',
    lessonId: 'front.m01.l02',
    kind: 'implement',
    title: 'Aceitar jobs com um ouvinte só',
    promptMarkdown: `No seu app de freelas, os jobs chegam o dia inteiro, inclusive **depois** que a página abriu. Use **delegação**: um único ouvinte de clique no \`#jobs\`.

Quando o clique for num botão \`.aceitar\` (ou em algo dentro dele):

1. ache o \`.job\` (o \`<li>\`) desse botão e coloque nele a classe \`aceito\`;
2. desabilite o botão (\`disabled = true\`) e troque o texto dele para \`Aceito\`;
3. mostre em \`#ultimo\` o nome do cliente, que está no \`data-cliente\` do \`<li>\`.

Clique em outra parte do \`<li>\` não faz nada. Os testes vão criar um job novo depois que o seu código rodou.`,
    language: 'web',
    starterFiles: {
      html: JOBS_HTML,
      css: JOBS_CSS,
      js: `const lista = document.querySelector('#jobs');
const ultimo = document.querySelector('#ultimo');

// um único ouvinte de clique no #jobs
`,
    },
    solutionFiles: {
      html: JOBS_HTML,
      css: JOBS_CSS,
      js: `const lista = document.querySelector('#jobs');
const ultimo = document.querySelector('#ultimo');

lista.addEventListener('click', function (event) {
  const botao = event.target.closest('.aceitar');
  if (!botao) return;
  const job = botao.closest('.job');
  job.classList.add('aceito');
  botao.disabled = true;
  botao.textContent = 'Aceito';
  ultimo.textContent = job.dataset.cliente;
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'aceitar o job 102 marca o job, trava o botão e mostra o cliente',
        code: `click('#jobs [data-id="102"] .aceitar');
const job = document.querySelector('#jobs [data-id="102"]');
const botao = job.querySelector('.aceitar');
assert.ok(job.classList.contains('aceito'), 'O <li> do job deveria ganhar a classe "aceito".');
assert.strictEqual(botao.disabled, true, 'O botão deveria ficar desabilitado.');
assert.strictEqual(botao.textContent, 'Aceito', 'O texto do botão deveria virar "Aceito".');
assert.strictEqual(document.querySelector('#ultimo').textContent, 'Oficina do Baixinho');`,
      },
      {
        description: 'clicar na descrição do job não aceita nada',
        code: `click('#jobs [data-id="101"] .descricao');
assert.ok(!document.querySelector('#jobs [data-id="101"]').classList.contains('aceito'), 'Clicar na descrição não deveria aceitar o job.');
assert.strictEqual(document.querySelector('#ultimo').textContent, 'Oficina do Baixinho', 'O último aceito não deveria mudar.');`,
      },
      {
        description: 'um job criado depois também pode ser aceito',
        code: `const li = document.createElement('li');
li.className = 'job';
li.dataset.id = '104';
li.dataset.cliente = 'Academia Supino Torto';
const botao = document.createElement('button');
botao.className = 'aceitar';
botao.textContent = 'Aceitar';
li.append(botao);
document.querySelector('#jobs').append(li);
botao.click();
assert.ok(li.classList.contains('aceito'), 'O job novo não foi aceito. O ouvinte está no #jobs (delegação)?');
assert.strictEqual(document.querySelector('#ultimo').textContent, 'Academia Supino Torto');`,
      },
    ],
    hints: [
      "`lista.addEventListener('click', function (event) { ... })`, e dentro: `const botao = event.target.closest('.aceitar');`.",
      'Se `botao` for `null`, o clique não foi num botão de aceitar: `return`.',
      "A partir do botão, `botao.closest('.job')` acha o `<li>`; o cliente está em `.dataset.cliente`.",
    ],
    followUpQuestionIds: ['front.m01.f07', 'front.m01.f08'],
    difficulty: 2,
  },
  {
    id: 'front.m01.e04',
    lessonId: 'front.m01.l02',
    kind: 'implement',
    title: 'Avaliação em estrelas',
    promptMarkdown: `Depois de cada job, o app pede para você avaliar o cliente (a vingança é um prato que se serve em estrelas).

1. Crie a função \`avaliar(nota)\`, que recebe um **número** de 1 a 5 e:
   - coloca a classe \`acesa\` em toda \`.estrela\` cujo \`data-nota\` é menor ou igual a \`nota\`, e tira das outras;
   - escreve \`Nota: N de 5\` em \`#nota\` (ex.: \`Nota: 4 de 5\`).
2. Coloque **um** ouvinte de clique no \`#estrelas\`. Ao clicar numa estrela (ou no ★ dentro dela), chame \`avaliar\` com a nota dela convertida para número. Clique fora das estrelas não faz nada (nem dá erro).

Os testes também chamam \`avaliar(nota)\` direto.`,
    language: 'web',
    starterFiles: {
      html: ESTRELAS_HTML,
      css: ESTRELAS_CSS,
      js: `const estrelas = document.querySelectorAll('.estrela');

function avaliar(nota) {
  // seu código aqui
}

// ouvinte de clique no #estrelas
`,
    },
    solutionFiles: {
      html: ESTRELAS_HTML,
      css: ESTRELAS_CSS,
      js: `const estrelas = document.querySelectorAll('.estrela');

function avaliar(nota) {
  estrelas.forEach(function (estrela) {
    if (Number(estrela.dataset.nota) <= nota) {
      estrela.classList.add('acesa');
    } else {
      estrela.classList.remove('acesa');
    }
  });
  document.querySelector('#nota').textContent = 'Nota: ' + nota + ' de 5';
}

document.querySelector('#estrelas').addEventListener('click', function (event) {
  const estrela = event.target.closest('.estrela');
  if (!estrela) return;
  avaliar(Number(estrela.dataset.nota));
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'clicar no ★ da 4ª estrela acende 4 estrelas',
        code: `click('.estrela[data-nota="4"] .icone');
assert.strictEqual(document.querySelectorAll('.estrela.acesa').length, 4, 'Deveriam estar acesas 4 estrelas.');
assert.ok(!document.querySelector('.estrela[data-nota="5"]').classList.contains('acesa'), 'A 5ª estrela deveria ficar apagada.');
assert.strictEqual(document.querySelector('#nota').textContent, 'Nota: 4 de 5');`,
      },
      {
        description: 'clicar na 2ª estrela apaga as de cima',
        code: `click('.estrela[data-nota="2"]');
assert.strictEqual(document.querySelectorAll('.estrela.acesa').length, 2, 'Só as 2 primeiras deveriam ficar acesas.');
assert.ok(document.querySelector('.estrela[data-nota="1"]').classList.contains('acesa'));
assert.strictEqual(document.querySelector('#nota').textContent, 'Nota: 2 de 5');`,
      },
      {
        description: 'avaliar(5) acende todas',
        code: `avaliar(5);
assert.strictEqual(document.querySelectorAll('.estrela.acesa').length, 5);
assert.strictEqual(document.querySelector('#nota').textContent, 'Nota: 5 de 5');`,
      },
      {
        description: 'clicar no espaço entre as estrelas não muda nada nem dá erro',
        code: `click('#estrelas');
assert.strictEqual(document.querySelectorAll('.estrela.acesa').length, 5, 'Clicar fora das estrelas não deveria mudar a nota.');
assert.strictEqual(document.querySelector('#nota').textContent, 'Nota: 5 de 5');
assert.strictEqual(window.__freela.errors.length, 0, 'Clicar fora das estrelas deu erro: ' + window.__freela.errors[0] + '. Faltou checar se o closest devolveu null?');`,
      },
    ],
    hints: [
      'Em `avaliar`, percorra `estrelas` com `forEach` e compare `Number(estrela.dataset.nota) <= nota`.',
      "No ouvinte: `const estrela = event.target.closest('.estrela');` e `if (!estrela) return;`.",
      '`dataset.nota` é texto. Converta com `Number(...)` antes de chamar `avaliar`.',
    ],
    followUpQuestionIds: ['front.m01.f09', 'front.m01.f10'],
    difficulty: 2,
  },
  {
    id: 'front.m01.d02',
    lessonId: 'front.m01.l02',
    kind: 'debug',
    title: 'O orçamento de R$ 0300150',
    promptMarkdown: `Na página "Monte seu site", cada botão soma o preço do serviço no total. O cliente escolheu uma landing page e um formulário e o total apareceu como **R$ 0300150**. Ele achou caro.

Conserte a soma: o total precisa ser um número de verdade (\`300\`, \`450\`, \`500\`...).`,
    language: 'web',
    starterFiles: {
      html: SERVICOS_HTML,
      css: SERVICOS_CSS,
      js: `let total = 0;

document.querySelector('#servicos').addEventListener('click', function (event) {
  const botao = event.target.closest('button');
  if (!botao) return;

  total = total + botao.dataset.preco;

  const item = document.createElement('li');
  item.textContent = botao.dataset.servico;
  document.querySelector('#itens').append(item);
  document.querySelector('#total').textContent = total;
});
`,
    },
    solutionFiles: {
      html: SERVICOS_HTML,
      css: SERVICOS_CSS,
      js: `let total = 0;

document.querySelector('#servicos').addEventListener('click', function (event) {
  const botao = event.target.closest('button');
  if (!botao) return;

  total = total + Number(botao.dataset.preco);

  const item = document.createElement('li');
  item.textContent = botao.dataset.servico;
  document.querySelector('#itens').append(item);
  document.querySelector('#total').textContent = total;
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'escolher a landing page dá R$ 300',
        code: `click('[data-servico="Landing page"]');
assert.strictEqual(document.querySelector('#total').textContent, '300', 'O total deveria ser 300.');`,
      },
      {
        description: 'mais o formulário dá R$ 450',
        code: `click('[data-servico="Formulário de contato"]');
assert.strictEqual(document.querySelector('#total').textContent, '450', 'O total deveria ser 450.');`,
      },
      {
        description: 'mais o botão de ligar dá R$ 500 e a lista tem 3 itens',
        code: `click('[data-servico="Botão de ligar"]');
assert.strictEqual(document.querySelector('#total').textContent, '500');
assert.strictEqual(document.querySelectorAll('#itens li').length, 3);
assert.strictEqual(typeof total, 'number', 'A variável total deveria continuar sendo um número.');`,
      },
    ],
    hints: [
      "Que tipo tem `botao.dataset.preco`? E o que acontece com `0 + '300'`?",
      'Converta o preço com `Number(botao.dataset.preco)` antes de somar.',
    ],
    followUpQuestionIds: ['front.m01.f11', 'front.m01.f12'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m01.q09',
    lessonIds: ['front.m01.l02'],
    kind: 'fill-blank',
    prompt: 'O `<li data-cliente="Bar do Tonhão">` está na variável `li`. Complete para ler o cliente.',
    code: 'const cliente = li.dataset.___;',
    acceptedAnswers: ['cliente'],
    explanation: 'Cada atributo `data-xxx` vira `dataset.xxx`.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q10',
    lessonIds: ['front.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'O que é delegação de eventos?',
    options: [
      'Colocar um ouvinte só no elemento pai e descobrir, pelo `event.target`, qual filho foi clicado',
      'Copiar o mesmo `addEventListener` para cada botão da lista',
      'Pedir para outro dev escrever os eventos',
      'Usar `onclick` no HTML em vez de `addEventListener`',
    ],
    answerIndex: 0,
    explanation:
      'O evento sobe do filho até o pai. Um ouvinte no pai atende todos os filhos, inclusive os que nascerem depois.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'front.m01.q11',
    lessonIds: ['front.m01.l02'],
    kind: 'multiple-choice',
    code: '<button data-valor-hora="80">Contratar</button>',
    prompt: 'Como ler o `data-valor-hora` desse botão no JS?',
    options: [
      '`botao.dataset.valorHora`',
      "`botao.dataset['valor-hora']`",
      '`botao.dataset.dataValorHora`',
      '`botao.valorHora`',
    ],
    answerIndex: 0,
    explanation:
      'No `dataset`, o `data-` some e o nome com hífen vira camelCase: `valor-hora` → `valorHora`.',
    difficulty: 2,
  },
  {
    id: 'front.m01.q12',
    lessonIds: ['front.m01.l02'],
    kind: 'true-false',
    prompt: 'Valores lidos do `dataset` são sempre strings, mesmo quando no HTML parecem números.',
    answer: true,
    explanation: 'Atributos HTML são texto. Para fazer conta, converta com `Number(...)`.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q13',
    lessonIds: ['front.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'Por que a delegação funciona para itens adicionados na lista depois que a página carregou?',
    options: [
      'Porque o ouvinte está no pai, que já existia, e o clique no item novo sobe até ele',
      'Porque o navegador copia o ouvinte para os elementos novos',
      'Porque `createElement` registra os eventos sozinho',
      'Não funciona: itens novos precisam do próprio `addEventListener`',
    ],
    answerIndex: 0,
    explanation: 'O item novo não tem ouvinte nenhum, mas o evento dele sobe (bubbling) até o pai que tem.',
    difficulty: 2,
  },
  {
    id: 'front.m01.q14',
    lessonIds: ['front.m01.l02'],
    kind: 'multiple-choice',
    prompt: "O que `event.target.closest('.job')` devolve?",
    options: [
      'O próprio `target`, se ele for `.job`, ou o pai mais próximo que seja `.job`; `null` se não houver',
      'O primeiro `.job` da página',
      'Todos os `.job` dentro do `target`',
      'O `.job` mais próximo na tela, medindo a distância em pixels',
    ],
    answerIndex: 0,
    explanation: '`closest` começa no próprio elemento e sobe pelos ancestrais até achar o seletor.',
    difficulty: 2,
  },
  {
    id: 'front.m01.q15',
    lessonIds: ['front.m01.l02'],
    kind: 'true-false',
    prompt:
      "Com delegação no `<ul>`, um clique no espaço vazio da lista faz `event.target.closest('.aceitar')` devolver `null`.",
    answer: true,
    explanation:
      'Nem o `<ul>` nem os pais dele são `.aceitar`. Por isso o `if (!botao) return;` é obrigatório.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q16',
    lessonIds: ['front.m01.l02'],
    kind: 'predict-output',
    prompt: 'Simulando o que vem de um `dataset`: o que este código imprime?',
    code: "const dados = { preco: '300' };\nconsole.log(dados.preco + 50);\nconsole.log(Number(dados.preco) + 50);",
    expectedOutput: '30050\n350',
    explanation: 'Texto + número junta os textos (`"30050"`). Depois do `Number`, é soma de verdade.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m01.f07',
    lessonIds: ['front.m01.l02'],
    exerciseId: 'front.m01.e03',
    kind: 'multiple-choice',
    prompt: 'No seu código, por que o job 104, criado pelo teste depois, também pôde ser aceito?',
    options: [
      'Porque o ouvinte está no `#jobs` e o clique no botão novo sobe até ele',
      'Porque o teste copiou o ouvinte para o botão novo',
      'Porque o botão novo tem a classe `aceitar` e o navegador liga classes a eventos',
      'Porque o `<li>` tem `data-id`',
    ],
    answerIndex: 0,
    explanation: 'Esse é o ponto da delegação: o pai já existia e ouve os cliques de todos os filhos.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f08',
    lessonIds: ['front.m01.l02'],
    exerciseId: 'front.m01.e03',
    kind: 'fill-blank',
    prompt: 'Complete a linha do seu código que, a partir do botão, acha o `<li>` do job.',
    code: "const job = botao.___('.job');",
    acceptedAnswers: ['closest'],
    explanation: '`closest` sobe do botão até o ancestral `.job`, onde está o `data-cliente`.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f09',
    lessonIds: ['front.m01.l02'],
    exerciseId: 'front.m01.e04',
    kind: 'multiple-choice',
    prompt: "Nas estrelas, por que usar `event.target.closest('.estrela')` em vez de só `event.target`?",
    options: [
      'Porque o clique pode cair no `<span class="icone">`, que não tem `data-nota`',
      'Porque `event.target` não existe em botões',
      'Porque `closest` converte a nota para número',
      'Porque `event.target` sempre aponta para o `#estrelas`',
    ],
    answerIndex: 0,
    explanation:
      'O ★ é um `<span>` dentro do botão. O `closest` sobe até a `.estrela`, que tem o `data-nota`.',
    difficulty: 2,
  },
  {
    id: 'front.m01.f10',
    lessonIds: ['front.m01.l02'],
    exerciseId: 'front.m01.e04',
    kind: 'fill-blank',
    prompt: 'Complete a chamada do seu ouvinte das estrelas para passar a nota como número.',
    code: 'avaliar(___(estrela.dataset.nota));',
    acceptedAnswers: ['Number', 'parseInt', 'parseFloat'],
    explanation: '`dataset.nota` é string; `Number("4")` vira `4`.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f11',
    lessonIds: ['front.m01.l02'],
    exerciseId: 'front.m01.d02',
    kind: 'multiple-choice',
    prompt:
      'No código com defeito, o que aparecia no total depois de clicar em "Landing page" (300) e "Botão de ligar" (50)?',
    options: ['`030050`', '`350`', '`0350`', '`NaN`'],
    answerIndex: 0,
    explanation: '`0 + "300"` vira `"0300"`; `"0300" + "50"` vira `"030050"`. Texto só se junta.',
    difficulty: 2,
  },
  {
    id: 'front.m01.f12',
    lessonIds: ['front.m01.l02'],
    exerciseId: 'front.m01.d02',
    kind: 'true-false',
    prompt:
      'O defeito do orçamento estava no HTML: bastava escrever `data-preco=300`, sem aspas, para virar número.',
    answer: false,
    explanation:
      'Com ou sem aspas, atributo HTML é sempre texto. A conversão tem que ser no JS, com `Number`.',
    difficulty: 1,
  },
];
