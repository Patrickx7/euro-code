import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'front.m01.l03',
  moduleId: 'front.m01',
  order: 3,
  title: 'Estado na página: dados primeiro, tela depois',
  concepts: [
    'estado',
    'função render',
    'evento → estado → render',
    'filtros com filter',
    'contadores derivados',
    'dataset ligando a tela ao estado',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Até aqui, cada clique mexia direto na tela: põe uma classe aqui, troca um texto ali. Funciona até o cliente pedir "agora com filtro, contador e ordenação". Aí o seu código vira um monte de \`querySelector\` tentando adivinhar o que está na tela. A tela virou o seu banco de dados. Não faça isso.

## O padrão: estado + render

1. **Estado**: os dados ficam no JS, num array de objetos (e em variáveis como o filtro atual).

\`\`\`js
const tarefas = [
  { titulo: 'Trocar o logo', feita: true },
  { titulo: 'Arrumar o menu', feita: false },
];
\`\`\`

2. **render()**: uma função que lê o estado e **redesenha** aquele pedaço da página do zero: limpa o contêiner e cria tudo de novo.
3. **Eventos**: só mudam o estado e chamam \`render()\`.

> evento → muda o estado → \`render()\`

Contadores e totais não ganham variável própria: são **calculados** no \`render\` a partir do estado (\`tarefas.filter((t) => !t.feita).length\`). Assim nunca ficam dessincronizados.

Mudou o estado e esqueceu o \`render()\`? A tela não se atualiza sozinha. Esqueceu de limpar o contêiner no \`render\`? A lista duplica a cada chamada.`,
    },
    {
      kind: 'text',
      markdown: `## Filtros

O filtro é só mais um pedaço do estado:

\`\`\`js
let filtro = 'todos';

function visiveis() {
  if (filtro === 'todos') return jobs;
  return jobs.filter((job) => job.cidade === filtro);
}
\`\`\`

O \`filter\` devolve um **array novo**; o \`jobs\` original continua inteiro. Por isso dá para voltar para "Todos". (Se você apagasse itens do array para filtrar, eles sumiriam para sempre. O cliente ia ligar.)

## Ligando a tela ao estado

Quando o \`render\` cria um \`<li>\` para cada item, guarde nele de onde ele veio: \`li.dataset.indice = i\`. No clique (com delegação, já que os \`<li>\` são recriados a cada render), \`tarefas[Number(li.dataset.indice)]\` é o objeto certo para mudar.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<ul id="lista"></ul>
<p>Pendentes: <span id="pendentes"></span></p>

<script>
  const tarefas = [
    { titulo: 'Trocar o logo', feita: true },
    { titulo: 'Arrumar o menu', feita: false },
  ];
  const lista = document.querySelector('#lista');

  function render() {
    lista.textContent = '';
    tarefas.forEach(function (tarefa, i) {
      const li = document.createElement('li');
      li.textContent = tarefa.titulo;
      li.dataset.indice = i;
      if (tarefa.feita) li.classList.add('feita');
      lista.append(li);
    });
    document.querySelector('#pendentes').textContent = tarefas.filter((t) => !t.feita).length;
  }

  lista.addEventListener('click', function (event) {
    const li = event.target.closest('li');
    if (!li) return;
    const tarefa = tarefas[Number(li.dataset.indice)];
    tarefa.feita = !tarefa.feita; // muda o estado...
    render(); // ...e redesenha
  });

  render();
</script>`,
      explanation:
        'O clique não mexe em classe nenhuma: ele muda o objeto no array e chama `render()`, que redesenha a lista e recalcula as pendentes.',
    },
  ],
  checkQuestionIds: ['front.m01.q17', 'front.m01.q18'],
  exerciseIds: ['front.m01.e05', 'front.m01.e06'],
  debugExerciseIds: ['front.m01.d03'],
};

const TAREFAS_HTML = `<h2>Tasks do job: site da Oficina do Baixinho</h2>
<ul id="lista"></ul>
<p>Pendentes: <strong id="pendentes">0</strong></p>`;

const TAREFAS_CSS = `body { font-family: sans-serif; }
#lista li { cursor: pointer; padding: 4px 0; }
#lista li.feita { text-decoration: line-through; color: gray; }`;

const FILTRO_HTML = `<div id="filtros">
  <button data-filtro="todos" class="ativo">Todos</button>
  <button data-filtro="Osasco">Osasco</button>
  <button data-filtro="Cotia">Cotia</button>
  <button data-filtro="Barueri">Barueri</button>
</div>
<ul id="lista"></ul>
<p id="resumo"></p>`;

const FILTRO_CSS = `body { font-family: sans-serif; }
#filtros button { padding: 6px 12px; border: 1px solid #999; background: white; }
#filtros button.ativo { background: rgb(40, 90, 200); color: white; }`;

const FILTRO_ESTADO = `const jobs = [
  { cliente: 'Pizzaria Forno Frio', cidade: 'Osasco', valor: 180 },
  { cliente: 'Pet Shop Au Au', cidade: 'Osasco', valor: 120 },
  { cliente: 'Haras Galope Manso', cidade: 'Cotia', valor: 300 },
  { cliente: 'Oficina do Baixinho', cidade: 'Barueri', valor: 150 },
  { cliente: 'Doceria Açúcar Mascavo', cidade: 'Cotia', valor: 90 },
];
let filtro = 'todos';
const lista = document.querySelector('#lista');
`;

const FILTRO_RENDER_INICIO = `function render() {
  const visiveis = jobsVisiveis();
  lista.textContent = '';
  visiveis.forEach(function (job) {
    const li = document.createElement('li');
    li.textContent = job.cliente + ' · ' + job.cidade + ' · R$ ' + job.valor;
    lista.append(li);
  });
`;

const ORCAMENTOS_HTML = `<h2>Orçamentos enviados</h2>
<ul id="orcamentos"></ul>
<p>Total: <strong id="total">0</strong></p>
<form id="form-orcamento">
  <input id="cliente" placeholder="Nome do cliente" autocomplete="off">
  <button type="submit">Adicionar</button>
</form>`;

const ORCAMENTOS_CSS = `body { font-family: sans-serif; }
.aprovado { color: rgb(0, 130, 60); font-weight: bold; }`;

export const exercises: Exercise[] = [
  {
    id: 'front.m01.e05',
    lessonId: 'front.m01.l03',
    kind: 'implement',
    title: 'Lista de tasks com render()',
    promptMarkdown: `O estado das tasks já está no array \`tarefas\`, e o clique numa task já está pronto: ele muda o estado e chama \`render()\`. Falta você escrever o \`render()\`:

1. limpe o \`#lista\`;
2. para cada tarefa, crie um \`<li>\` com o \`titulo\`, guarde a posição em \`li.dataset.indice\` e coloque a classe \`feita\` se a tarefa estiver feita;
3. mostre em \`#pendentes\` quantas tarefas **não** estão feitas.

Os testes vão colocar tarefas novas no array e chamar \`render()\`.`,
    language: 'web',
    starterFiles: {
      html: TAREFAS_HTML,
      css: TAREFAS_CSS,
      js: `const tarefas = [
  { titulo: 'Trocar o logo', feita: true },
  { titulo: 'Arrumar o menu no celular', feita: false },
  { titulo: 'Colocar o telefone no rodapé', feita: false },
];
const lista = document.querySelector('#lista');
const pendentes = document.querySelector('#pendentes');

function render() {
  // seu código aqui
}

// Já pronto: o clique muda o estado e chama render()
lista.addEventListener('click', function (event) {
  const item = event.target.closest('li');
  if (!item) return;
  const tarefa = tarefas[Number(item.dataset.indice)];
  tarefa.feita = !tarefa.feita;
  render();
});

render();
`,
    },
    solutionFiles: {
      html: TAREFAS_HTML,
      css: TAREFAS_CSS,
      js: `const tarefas = [
  { titulo: 'Trocar o logo', feita: true },
  { titulo: 'Arrumar o menu no celular', feita: false },
  { titulo: 'Colocar o telefone no rodapé', feita: false },
];
const lista = document.querySelector('#lista');
const pendentes = document.querySelector('#pendentes');

function render() {
  lista.textContent = '';
  tarefas.forEach(function (tarefa, i) {
    const li = document.createElement('li');
    li.textContent = tarefa.titulo;
    li.dataset.indice = i;
    if (tarefa.feita) li.classList.add('feita');
    lista.append(li);
  });
  pendentes.textContent = tarefas.filter((t) => !t.feita).length;
}

// Já pronto: o clique muda o estado e chama render()
lista.addEventListener('click', function (event) {
  const item = event.target.closest('li');
  if (!item) return;
  const tarefa = tarefas[Number(item.dataset.indice)];
  tarefa.feita = !tarefa.feita;
  render();
});

render();
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'a lista começa com as 3 tasks e 2 pendentes',
        code: `const itens = document.querySelectorAll('#lista li');
assert.strictEqual(itens.length, 3, 'Deveria haver 3 <li> na lista.');
assert.strictEqual(itens[1].textContent, 'Arrumar o menu no celular');
assert.ok(itens[0].classList.contains('feita'), 'A primeira task está feita: faltou a classe "feita".');
assert.ok(!itens[1].classList.contains('feita'), 'A segunda task não está feita.');
assert.strictEqual(document.querySelector('#pendentes').textContent, '2');`,
      },
      {
        description: 'uma task nova no array aparece depois do render()',
        code: `tarefas.push({ titulo: 'Mudar a cor do botão (é rapidinho)', feita: false });
render();
const itens = document.querySelectorAll('#lista li');
assert.strictEqual(itens.length, 4, 'Depois do render, deveria haver 4 <li> (nem mais, nem menos). Você limpou a lista antes?');
assert.strictEqual(itens[3].textContent, 'Mudar a cor do botão (é rapidinho)');
assert.strictEqual(document.querySelector('#pendentes').textContent, '3');`,
      },
      {
        description: 'clicar numa task marca como feita e atualiza as pendentes',
        code: `click('#lista li:nth-child(2)');
assert.strictEqual(tarefas[1].feita, true, 'O clique deveria mudar tarefas[1]. Você guardou li.dataset.indice?');
assert.ok(document.querySelector('#lista li:nth-child(2)').classList.contains('feita'));
assert.strictEqual(document.querySelector('#pendentes').textContent, '2');`,
      },
      {
        description: 'chamar render() de novo não duplica nada',
        code: `render();
render();
assert.strictEqual(document.querySelectorAll('#lista li').length, 4, 'A lista duplicou. Limpe o #lista no começo do render.');`,
      },
    ],
    hints: [
      "Comece com `lista.textContent = '';` e depois `tarefas.forEach(function (tarefa, i) { ... })`.",
      'Dentro do `forEach`: `createElement`, `textContent`, `li.dataset.indice = i`, a classe se `tarefa.feita`, e `append`.',
      'Pendentes: `tarefas.filter((t) => !t.feita).length`.',
    ],
    followUpQuestionIds: ['front.m01.f13', 'front.m01.f14'],
    difficulty: 2,
  },
  {
    id: 'front.m01.e06',
    lessonId: 'front.m01.l03',
    kind: 'implement',
    title: 'Filtro de jobs por cidade',
    promptMarkdown: `O coworking quer um painel dos jobs abertos com filtro por cidade. O estado (\`jobs\` e \`filtro\`) já existe, e o \`render()\` já monta a lista. Falta:

1. **\`jobsVisiveis()\`**: devolve todos os jobs se \`filtro\` for \`'todos'\`; senão, só os da cidade do filtro. Não altere o array \`jobs\`.
2. **Resumo**: no fim do \`render()\`, escreva em \`#resumo\` o texto \`Jobs: N · Total: R$ X\` com a quantidade e a soma dos valores **visíveis** (ex.: \`Jobs: 2 · Total: R$ 390\`).
3. **Clique nos filtros** (um ouvinte no \`#filtros\`): mude \`filtro\` para o \`data-filtro\` do botão, deixe só esse botão com a classe \`ativo\` e chame \`render()\`.`,
    language: 'web',
    starterFiles: {
      html: FILTRO_HTML,
      css: FILTRO_CSS,
      js: `${FILTRO_ESTADO}
function jobsVisiveis() {
  return jobs; // respeite o filtro
}

${FILTRO_RENDER_INICIO}  // escreva o resumo aqui
}

// ouvinte de clique no #filtros

render();
`,
    },
    solutionFiles: {
      html: FILTRO_HTML,
      css: FILTRO_CSS,
      js: `${FILTRO_ESTADO}
function jobsVisiveis() {
  if (filtro === 'todos') return jobs;
  return jobs.filter((job) => job.cidade === filtro);
}

${FILTRO_RENDER_INICIO}  const total = visiveis.reduce((soma, job) => soma + job.valor, 0);
  document.querySelector('#resumo').textContent = 'Jobs: ' + visiveis.length + ' · Total: R$ ' + total;
}

document.querySelector('#filtros').addEventListener('click', function (event) {
  const botao = event.target.closest('button');
  if (!botao) return;
  filtro = botao.dataset.filtro;
  document.querySelectorAll('#filtros button').forEach(function (b) {
    b.classList.remove('ativo');
  });
  botao.classList.add('ativo');
  render();
});

render();
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'no começo mostra os 5 jobs e o resumo de todos',
        code: `assert.strictEqual(document.querySelectorAll('#lista li').length, 5);
assert.strictEqual(document.querySelector('#resumo').textContent, 'Jobs: 5 · Total: R$ 840');`,
      },
      {
        description: 'clicar em "Cotia" filtra a lista e o resumo',
        code: `click('#filtros [data-filtro="Cotia"]');
assert.strictEqual(filtro, 'Cotia', 'A variável filtro deveria mudar para "Cotia".');
assert.strictEqual(document.querySelectorAll('#lista li').length, 2, 'Só os 2 jobs de Cotia deveriam aparecer.');
assert.strictEqual(document.querySelector('#resumo').textContent, 'Jobs: 2 · Total: R$ 390');`,
      },
      {
        description: 'só o botão clicado fica com a classe ativo',
        code: `assert.ok(document.querySelector('#filtros [data-filtro="Cotia"]').classList.contains('ativo'));
assert.strictEqual(document.querySelectorAll('#filtros .ativo').length, 1, 'Só um botão deveria ter a classe "ativo".');`,
      },
      {
        description: 'jobsVisiveis() filtra sem estragar o array jobs',
        code: `const visiveis = jobsVisiveis();
assert.strictEqual(visiveis.length, 2);
assert.ok(visiveis.every((j) => j.cidade === 'Cotia'), 'jobsVisiveis() devolveu job de outra cidade.');
assert.strictEqual(jobs.length, 5, 'O array jobs perdeu itens: filtre sem apagar nada do estado.');`,
      },
      {
        description: 'um job novo de Cotia entra no filtro depois do render()',
        code: `jobs.push({ cliente: 'Academia Supino Torto', cidade: 'Cotia', valor: 200 });
render();
assert.strictEqual(document.querySelectorAll('#lista li').length, 3);
assert.strictEqual(document.querySelector('#resumo').textContent, 'Jobs: 3 · Total: R$ 590');`,
      },
      {
        description: 'voltar para "Todos" mostra tudo de novo',
        code: `click('#filtros [data-filtro="todos"]');
assert.strictEqual(document.querySelectorAll('#lista li').length, 6);
assert.strictEqual(document.querySelector('#resumo').textContent, 'Jobs: 6 · Total: R$ 1040');`,
      },
    ],
    hints: [
      "Em `jobsVisiveis`: `if (filtro === 'todos') return jobs;` e senão `jobs.filter((job) => job.cidade === filtro)`.",
      'Total: `visiveis.reduce((soma, job) => soma + job.valor, 0)`.',
      "No clique: `event.target.closest('button')`, depois `filtro = botao.dataset.filtro;`, troque a classe `ativo` e chame `render()`.",
    ],
    followUpQuestionIds: ['front.m01.f15', 'front.m01.f16'],
    difficulty: 3,
  },
  {
    id: 'front.m01.d03',
    lessonId: 'front.m01.l03',
    kind: 'debug',
    title: 'A lista de orçamentos que se multiplica',
    promptMarkdown: `Na lista de orçamentos enviados, toda vez que você adiciona um cliente, a lista **inteira** aparece de novo embaixo. Com 2 orçamentos e mais 1, aparecem 5 itens. Seu contador fica feliz, o cliente nem tanto.

Conserte o \`render()\` para mostrar cada orçamento uma vez só, não importa quantas vezes ele for chamado.`,
    language: 'web',
    starterFiles: {
      html: ORCAMENTOS_HTML,
      css: ORCAMENTOS_CSS,
      js: `const orcamentos = [
  { cliente: 'Pizzaria Forno Frio', aprovado: true },
  { cliente: 'Haras Galope Manso', aprovado: false },
];
const lista = document.querySelector('#orcamentos');
const campo = document.querySelector('#cliente');

function render() {
  orcamentos.forEach(function (orcamento) {
    const li = document.createElement('li');
    li.textContent = orcamento.cliente;
    if (orcamento.aprovado) li.classList.add('aprovado');
    lista.append(li);
  });
  document.querySelector('#total').textContent = orcamentos.length;
}

document.querySelector('#form-orcamento').addEventListener('submit', function (event) {
  event.preventDefault();
  const nome = campo.value.trim();
  if (nome === '') return;
  orcamentos.push({ cliente: nome, aprovado: false });
  campo.value = '';
  render();
});

render();
`,
    },
    solutionFiles: {
      html: ORCAMENTOS_HTML,
      css: ORCAMENTOS_CSS,
      js: `const orcamentos = [
  { cliente: 'Pizzaria Forno Frio', aprovado: true },
  { cliente: 'Haras Galope Manso', aprovado: false },
];
const lista = document.querySelector('#orcamentos');
const campo = document.querySelector('#cliente');

function render() {
  lista.textContent = '';
  orcamentos.forEach(function (orcamento) {
    const li = document.createElement('li');
    li.textContent = orcamento.cliente;
    if (orcamento.aprovado) li.classList.add('aprovado');
    lista.append(li);
  });
  document.querySelector('#total').textContent = orcamentos.length;
}

document.querySelector('#form-orcamento').addEventListener('submit', function (event) {
  event.preventDefault();
  const nome = campo.value.trim();
  if (nome === '') return;
  orcamentos.push({ cliente: nome, aprovado: false });
  campo.value = '';
  render();
});

render();
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'a lista começa com os 2 orçamentos',
        code: `assert.strictEqual(document.querySelectorAll('#orcamentos li').length, 2);
assert.ok(document.querySelector('#orcamentos li').classList.contains('aprovado'));`,
      },
      {
        description: 'adicionar um cliente deixa 3 itens, não 5',
        code: `document.querySelector('#cliente').value = 'Barbearia Navalha Cega';
document.querySelector('#form-orcamento').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
const itens = document.querySelectorAll('#orcamentos li');
assert.strictEqual(itens.length, 3, 'Deveria haver 3 orçamentos na tela, mas há ' + itens.length + '.');
assert.strictEqual(itens[2].textContent, 'Barbearia Navalha Cega');
assert.strictEqual(document.querySelector('#total').textContent, '3');`,
      },
      {
        description: 'chamar render() de novo não duplica',
        code: `render();
assert.strictEqual(document.querySelectorAll('#orcamentos li').length, 3, 'Cada render() deveria redesenhar a lista do zero.');`,
      },
    ],
    hints: [
      'O `render()` cria todos os `<li>` de novo. E os que já estavam lá, quem tira?',
      "Limpe o contêiner na primeira linha do `render()`: `lista.textContent = '';`.",
    ],
    followUpQuestionIds: ['front.m01.f17', 'front.m01.f18'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m01.q17',
    lessonIds: ['front.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'No padrão estado + render, o que um ouvinte de clique deve fazer?',
    options: [
      'Mudar o estado (o array, o filtro...) e chamar `render()`',
      'Procurar o `<li>` certo e trocar o texto dele na mão',
      'Recarregar a página',
      'Ler o estado contando os `<li>` da tela',
    ],
    answerIndex: 0,
    explanation: 'Evento → muda o estado → `render()`. Quem desenha a tela é sempre o `render`.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q18',
    lessonIds: ['front.m01.l03'],
    kind: 'true-false',
    prompt: 'Um `render()` que remonta a lista precisa limpar o contêiner antes de criar os itens de novo.',
    answer: true,
    explanation: 'Sem limpar, cada chamada empilha a lista inteira outra vez.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'front.m01.q19',
    lessonIds: ['front.m01.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: "const jobs = [\n  { cliente: 'Forno Frio', cidade: 'Osasco' },\n  { cliente: 'Galope Manso', cidade: 'Cotia' },\n  { cliente: 'Au Au', cidade: 'Osasco' },\n];\nconst filtro = 'Osasco';\nconst visiveis = jobs.filter((j) => j.cidade === filtro);\nconsole.log(visiveis.length);\nconsole.log(jobs.length);",
    expectedOutput: '2\n3',
    explanation: '`filter` devolve um array novo com 2 jobs; o `jobs` original continua com 3.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q20',
    lessonIds: ['front.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Onde deve sair o número de tasks pendentes mostrado na tela?',
    options: [
      'Do estado, calculado no `render`: `tarefas.filter((t) => !t.feita).length`',
      'De uma variável `pendentes` que cada clique soma ou subtrai',
      'Contando os `<li>` sem a classe `feita` na tela',
      'Do `textContent` antigo, mais 1',
    ],
    answerIndex: 0,
    explanation:
      'Valores derivados calculados do estado nunca ficam dessincronizados. Contas paralelas um dia erram.',
    difficulty: 2,
  },
  {
    id: 'front.m01.q21',
    lessonIds: ['front.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Por que filtrar com `jobs.filter(...)` em vez de apagar do array os jobs de outras cidades?',
    options: [
      'Porque `filter` devolve um array novo e o estado original fica inteiro para voltar a "Todos"',
      'Porque apagar itens de array dá erro em JavaScript',
      'Porque `filter` também atualiza a tela sozinho',
      'Tanto faz, os dois dão o mesmo resultado',
    ],
    answerIndex: 0,
    explanation: 'Se apagar, os jobs somem do estado e não voltam quando o filtro muda.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q22',
    lessonIds: ['front.m01.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para contar as tarefas que ainda não foram feitas.',
    code: 'const pendentes = tarefas.___((t) => !t.feita).length;',
    acceptedAnswers: ['filter'],
    explanation: '`filter` fica só com quem passa no teste; `.length` conta quantos ficaram.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q23',
    lessonIds: ['front.m01.l03'],
    kind: 'true-false',
    prompt:
      'Depois de `tarefas[0].feita = true`, a tela se atualiza sozinha, sem precisar chamar `render()`.',
    answer: false,
    explanation: 'O DOM não sabe que o array mudou. Quem leva o estado para a tela é o `render()`.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q24',
    lessonIds: ['front.m01.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: "const tarefas = [{ feita: true }, { feita: false }, { feita: false }];\nfunction resumo() {\n  const feitas = tarefas.filter((t) => t.feita).length;\n  return feitas + ' de ' + tarefas.length;\n}\nconsole.log(resumo());\ntarefas[1].feita = true;\nconsole.log(resumo());",
    expectedOutput: '1 de 3\n2 de 3',
    explanation: 'O resumo é calculado do estado na hora. Mudou o estado, a próxima chamada já reflete.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m01.f13',
    lessonIds: ['front.m01.l03'],
    exerciseId: 'front.m01.e05',
    kind: 'multiple-choice',
    prompt: 'No seu `render()`, para que serve `li.dataset.indice = i`?',
    options: [
      'Para o clique saber qual objeto do array `tarefas` mudar',
      'Para numerar os itens na tela',
      'Para o CSS riscar a tarefa',
      'Para impedir que a lista duplique',
    ],
    answerIndex: 0,
    explanation: 'O ouvinte lê `item.dataset.indice` e usa como posição em `tarefas`.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f14',
    lessonIds: ['front.m01.l03'],
    exerciseId: 'front.m01.e05',
    kind: 'true-false',
    prompt:
      'Mesmo com os `<li>` recriados a cada `render()`, o clique continua funcionando porque o ouvinte está no `#lista`.',
    answer: true,
    explanation: 'Delegação de novo: os `<li>` mudam, o `<ul>` que ouve continua o mesmo.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f15',
    lessonIds: ['front.m01.l03'],
    exerciseId: 'front.m01.e06',
    kind: 'multiple-choice',
    prompt: 'No seu painel, você clica em "Cotia" e depois em "Todos". Por que os jobs de Osasco voltam?',
    options: [
      'Porque `jobsVisiveis()` usa `filter`, que não tira nada do array `jobs`',
      'Porque o navegador guarda os `<li>` apagados',
      'Porque o botão "Todos" recarrega a página',
      'Porque o `reduce` devolve os jobs filtrados',
    ],
    answerIndex: 0,
    explanation: 'O estado ficou intacto; o filtro só escolhe o que mostrar.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f16',
    lessonIds: ['front.m01.l03'],
    exerciseId: 'front.m01.e06',
    kind: 'fill-blank',
    prompt: 'Complete o valor inicial da soma do resumo, para funcionar até com a lista vazia.',
    code: 'const total = visiveis.reduce((soma, job) => soma + job.valor, ___);',
    acceptedAnswers: ['0'],
    explanation: 'A soma começa em 0. Sem valor inicial, o `reduce` de uma lista vazia dá erro.',
    difficulty: 2,
  },
  {
    id: 'front.m01.f17',
    lessonIds: ['front.m01.l03'],
    exerciseId: 'front.m01.d03',
    kind: 'multiple-choice',
    prompt:
      'No código com defeito, a página abriu com 2 orçamentos e você adicionou mais 1. Quantos `<li>` havia na lista?',
    options: ['5', '3', '6', '2'],
    answerIndex: 0,
    explanation: 'O primeiro `render` criou 2; o segundo, sem limpar, criou mais 3 embaixo. Total: 5.',
    difficulty: 2,
  },
  {
    id: 'front.m01.f18',
    lessonIds: ['front.m01.l03'],
    exerciseId: 'front.m01.d03',
    kind: 'fill-blank',
    prompt: 'Complete a primeira linha do `render()` consertado.',
    code: "lista.___ = '';",
    acceptedAnswers: ['textContent', 'innerHTML'],
    explanation: 'Zerar o conteúdo do contêiner apaga os `<li>` antigos antes de criar os novos.',
    difficulty: 1,
  },
];
