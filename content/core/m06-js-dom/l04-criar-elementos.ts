import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m06.l04',
  moduleId: 'core.m06',
  order: 4,
  title: 'Criar elementos e ler formulários',
  concepts: ['createElement', 'append', 'lista a partir de array', 'input.value', 'formulário simples'],
  sections: [
    {
      kind: 'text',
      markdown: `Até agora você mexeu em elementos que já estavam no HTML. Mas e quando o cliente cadastra 40 produtos? Ninguém escreve 40 \`<li>\` na mão. O JS **cria** os elementos.

## createElement e append

1. \`const item = document.createElement('li');\` cria um \`<li>\` novinho, ainda fora da página;
2. configure como quiser: \`item.textContent = 'Sonho';\`, \`item.classList.add('produto');\`;
3. \`lista.append(item);\` coloca ele no fim de \`lista\`. Só agora ele aparece na tela.

Juntando com o que você já sabe de arrays, montar uma lista é um \`forEach\` (ou \`for\`) que cria um elemento por item.

Para **remontar** a lista do zero, limpe antes: \`lista.textContent = '';\` apaga tudo que estava dentro. Sem isso, cada chamada empilha os itens de novo.`,
    },
    {
      kind: 'text',
      markdown: `## Lendo o que o usuário digitou

Campos \`<input>\` guardam o que foi digitado na propriedade \`value\`:

- ler: \`const nome = campo.value;\`
- limpar: \`campo.value = '';\`

Três cuidados que salvam o seu fim de semana:

1. \`value\` é **sempre string**, até num \`<input type="number">\`. Para fazer conta, use \`Number(campo.value)\`.
2. Leia o \`value\` **dentro** da função do evento. Se você ler lá em cima, quando a página abre, vai guardar o campo vazio para sempre.
3. Use \`.trim()\` para tirar espaços sobrando: \`'  Sonho '.trim()\` vira \`'Sonho'\`. E \`Number('')\` dá \`0\`, não erro.

Evite montar HTML com o texto do usuário (\`innerHTML = campo.value\`): se alguém digitar uma tag, ela vira HTML de verdade. Com \`createElement\` e \`textContent\`, texto é só texto.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<ul id="doces"></ul>

<script>
  const doces = ['Sonho', 'Bolo de fubá', 'Pudim'];
  const lista = document.querySelector('#doces');

  doces.forEach(function (doce) {
    const item = document.createElement('li');
    item.textContent = doce;
    lista.append(item);
  });
</script>`,
      explanation: 'Um `<li>` criado para cada item do array. A lista cresce sozinha quando o array cresce.',
    },
    {
      kind: 'example',
      language: 'html',
      code: `<input id="km" type="number" placeholder="Km até o cliente">
<button id="calcular">Calcular gasolina</button>
<p>Gasolina: R$ <span id="gasolina">0</span></p>

<script>
  const km = document.querySelector('#km');

  document.querySelector('#calcular').addEventListener('click', function () {
    const distancia = Number(km.value); // lido na hora do clique
    document.querySelector('#gasolina').textContent = distancia * 0.6;
  });
</script>`,
      explanation:
        'O `value` é lido dentro do clique, então pega o que está digitado naquele momento. O `Number` transforma a string em número.',
    },
  ],
  checkQuestionIds: ['core.m06.q22', 'core.m06.q23'],
  exerciseIds: ['core.m06.e07', 'core.m06.e08'],
  debugExerciseIds: ['core.m06.d04'],
};

const VITRINE_HTML = `<h1>Doces do dia</h1>
<ul id="produtos"></ul>`;

const VITRINE_CSS = `body { font-family: sans-serif; }
.produto { padding: 4px 0; border-bottom: 1px dashed #ccc; }`;

const ORCAMENTO_HTML = `<h2>Orçamento rápido</h2>
<p><label>Horas de trabalho <input id="horas" type="number" value="0"></label></p>
<p><label>Km até o cliente <input id="km" type="number" value="0"></label></p>
<button id="calcular">Calcular</button>
<p>Total: R$ <span id="total">0</span></p>`;

const ORCAMENTO_CSS = `body { font-family: sans-serif; }
#total { font-weight: bold; }`;

const TASKS_HTML = `<h2>Tasks do job</h2>
<input id="nova" placeholder="Nova task">
<button id="adicionar">Adicionar</button>
<ul id="lista"></ul>
<p><span id="qtd">0</span> task(s)</p>`;

const TASKS_CSS = `body { font-family: sans-serif; }`;

export const exercises: Exercise[] = [
  {
    id: 'core.m06.e07',
    lessonId: 'core.m06.l04',
    kind: 'implement',
    title: 'Vitrine montada a partir de um array',
    promptMarkdown: `O Seu Zé muda os doces do dia toda manhã e não quer "chamar o menino do site" para isso. Monte a lista pelo JS.

Crie a função \`montarLista(itens)\` que:

1. limpa o \`#produtos\`;
2. para cada texto do array \`itens\`, cria um \`<li>\` com a classe \`produto\` e esse texto;
3. coloca cada \`<li>\` dentro de \`#produtos\`.

No fim, chame \`montarLista(doces)\`. Os testes vão chamar a sua função de novo com outro array.`,
    language: 'web',
    starterFiles: {
      html: VITRINE_HTML,
      css: VITRINE_CSS,
      js: `const doces = ['Sonho', 'Bolo de fubá', 'Pão de queijo', 'Pudim'];
const lista = document.querySelector('#produtos');

function montarLista(itens) {
  // seu código aqui
}

montarLista(doces);
`,
    },
    solutionFiles: {
      html: VITRINE_HTML,
      css: VITRINE_CSS,
      js: `const doces = ['Sonho', 'Bolo de fubá', 'Pão de queijo', 'Pudim'];
const lista = document.querySelector('#produtos');

function montarLista(itens) {
  lista.textContent = '';
  itens.forEach(function (texto) {
    const item = document.createElement('li');
    item.classList.add('produto');
    item.textContent = texto;
    lista.append(item);
  });
}

montarLista(doces);
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'a lista mostra os 4 doces, na ordem',
        code: `const itens = document.querySelectorAll('#produtos li');
assert.strictEqual(itens.length, 4, 'Deveria haver 4 <li> dentro de #produtos.');
const textos = [];
itens.forEach(function (li) { textos.push(li.textContent); });
assert.deepStrictEqual(textos, ['Sonho', 'Bolo de fubá', 'Pão de queijo', 'Pudim']);`,
      },
      {
        description: 'cada item tem a classe produto',
        code: `assert.strictEqual(document.querySelectorAll('#produtos li.produto').length, 4, 'Todo <li> deveria ter a classe "produto".');`,
      },
      {
        description: 'chamar de novo troca a lista em vez de empilhar',
        code: `assert.strictEqual(typeof montarLista, 'function', 'Crie a função montarLista(itens).');
montarLista(['Coxinha', 'Café pingado']);
const itens = document.querySelectorAll('#produtos li');
assert.strictEqual(itens.length, 2, 'Com 2 itens, a lista deveria ter só 2 <li>. Você limpou a lista antes?');
assert.strictEqual(itens[0].textContent, 'Coxinha');
assert.strictEqual(itens[1].textContent, 'Café pingado');`,
      },
    ],
    hints: [
      "Comece a função com `lista.textContent = '';` para apagar o que já estava lá.",
      "Dentro de um `forEach`: `document.createElement('li')`, depois `classList.add`, `textContent` e `lista.append(item)`.",
    ],
    followUpQuestionIds: ['core.m06.f19', 'core.m06.f20'],
    difficulty: 2,
  },
  {
    id: 'core.m06.e08',
    lessonId: 'core.m06.l04',
    kind: 'implement',
    title: 'Formulário de orçamento',
    promptMarkdown: `Chega de fazer orçamento de cabeça no semáforo. Monte uma calculadora:

Ao clicar em \`#calcular\`, leia as \`#horas\` e os \`#km\` digitados e mostre em \`#total\`:

**total = horas × 40 + km × 2**

(Sim, R$ 40 a hora. Você é estagiário.)`,
    language: 'web',
    starterFiles: {
      html: ORCAMENTO_HTML,
      css: ORCAMENTO_CSS,
      js: `const horas = document.querySelector('#horas');
const km = document.querySelector('#km');
const total = document.querySelector('#total');

// quando clicar em #calcular, calcule e mostre o total
`,
    },
    solutionFiles: {
      html: ORCAMENTO_HTML,
      css: ORCAMENTO_CSS,
      js: `const horas = document.querySelector('#horas');
const km = document.querySelector('#km');
const total = document.querySelector('#total');

document.querySelector('#calcular').addEventListener('click', function () {
  const valor = Number(horas.value) * 40 + Number(km.value) * 2;
  total.textContent = valor;
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: '3 horas e 10 km dão R$ 140',
        code: `document.querySelector('#horas').value = '3';
document.querySelector('#km').value = '10';
click('#calcular');
assert.strictEqual(document.querySelector('#total').textContent, '140', '3 × 40 + 10 × 2 = 140.');`,
      },
      {
        description: 'mudando os campos e clicando de novo, o total é recalculado',
        code: `document.querySelector('#horas').value = '1';
document.querySelector('#km').value = '25';
click('#calcular');
assert.strictEqual(document.querySelector('#total').textContent, '90', '1 × 40 + 25 × 2 = 90. Você lê os campos dentro do clique?');`,
      },
      {
        description: 'sem clicar, o total não muda',
        code: `document.querySelector('#horas').value = '10';
assert.strictEqual(document.querySelector('#total').textContent, '90', 'O total só deveria mudar no clique em Calcular.');`,
      },
    ],
    hints: [
      "Registre um `addEventListener('click', ...)` no botão `#calcular`.",
      'Dentro do clique, leia `horas.value` e `km.value` e converta com `Number(...)`.',
    ],
    followUpQuestionIds: ['core.m06.f21', 'core.m06.f22'],
    difficulty: 2,
  },
  {
    id: 'core.m06.d04',
    lessonId: 'core.m06.l04',
    kind: 'debug',
    title: 'A lista de tasks que só adiciona vazio',
    promptMarkdown: `Você fez um app para anotar as tasks que o cliente vai lembrando ("ah, e o rodapé também"). Mas todo item novo aparece **vazio**, não importa o que você digite.

Conserte o script: ao clicar em \`#adicionar\`, o texto digitado em \`#nova\` deve virar um \`<li>\` em \`#lista\`, o campo deve ser limpo e \`#qtd\` deve mostrar quantas tasks existem.`,
    language: 'web',
    starterFiles: {
      html: TASKS_HTML,
      css: TASKS_CSS,
      js: `const campo = document.querySelector('#nova');
const lista = document.querySelector('#lista');
const qtd = document.querySelector('#qtd');
const texto = campo.value;

document.querySelector('#adicionar').addEventListener('click', function () {
  const item = document.createElement('li');
  item.textContent = texto;
  lista.append(item);
  campo.value = '';
  qtd.textContent = lista.querySelectorAll('li').length;
});
`,
    },
    solutionFiles: {
      html: TASKS_HTML,
      css: TASKS_CSS,
      js: `const campo = document.querySelector('#nova');
const lista = document.querySelector('#lista');
const qtd = document.querySelector('#qtd');

document.querySelector('#adicionar').addEventListener('click', function () {
  const texto = campo.value;
  const item = document.createElement('li');
  item.textContent = texto;
  lista.append(item);
  campo.value = '';
  qtd.textContent = lista.querySelectorAll('li').length;
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'adicionar "Trocar o logo" cria um item com esse texto',
        code: `document.querySelector('#nova').value = 'Trocar o logo';
click('#adicionar');
const itens = document.querySelectorAll('#lista li');
assert.strictEqual(itens.length, 1, 'Deveria haver 1 item na lista.');
assert.strictEqual(itens[0].textContent, 'Trocar o logo', 'O item deveria ter o texto digitado.');`,
      },
      {
        description: 'o campo fica vazio depois de adicionar',
        code: `assert.strictEqual(document.querySelector('#nova').value, '', 'O campo deveria ser limpo.');`,
      },
      {
        description: 'uma segunda task entra com o texto certo e o contador mostra 2',
        code: `document.querySelector('#nova').value = 'Arrumar o rodapé';
click('#adicionar');
const itens = document.querySelectorAll('#lista li');
assert.strictEqual(itens.length, 2, 'Deveria haver 2 itens na lista.');
assert.strictEqual(itens[1].textContent, 'Arrumar o rodapé', 'O segundo item deveria ter o texto digitado.');
assert.strictEqual(document.querySelector('#qtd').textContent, '2', '#qtd deveria mostrar 2.');`,
      },
    ],
    hints: [
      'Em que momento `campo.value` é lido? O que estava digitado nesse momento?',
      'Leia o `value` dentro da função do clique, para pegar o que está no campo agora.',
    ],
    followUpQuestionIds: ['core.m06.f23', 'core.m06.f24'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'core.m06.q22',
    lessonIds: ['core.m06.l04'],
    kind: 'true-false',
    prompt: "Logo depois de `document.createElement('li')`, o novo item já aparece na tela.",
    answer: false,
    explanation:
      'O elemento nasce fora da página. Ele só aparece quando você o coloca em algum lugar, com `append`.',
    difficulty: 1,
  },
  {
    id: 'core.m06.q23',
    lessonIds: ['core.m06.l04'],
    kind: 'multiple-choice',
    prompt: 'O usuário digitou `5` num `<input type="number">`. Qual é o valor de `campo.value`?',
    options: ["A string '5'", 'O número 5', '`undefined`', '`null`'],
    answerIndex: 0,
    explanation: '`value` é sempre texto. Converta com `Number(campo.value)` antes de fazer conta.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'core.m06.q24',
    lessonIds: ['core.m06.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para colocar o `item` no fim da `lista`.',
    code: 'lista.___(item);',
    acceptedAnswers: ['append', 'appendChild'],
    explanation: '`append` (ou o mais antigo `appendChild`) coloca o elemento dentro, no fim.',
    difficulty: 1,
  },
  {
    id: 'core.m06.q25',
    lessonIds: ['core.m06.l04'],
    kind: 'predict-output',
    prompt: 'Simulando o que vem de campos de formulário, o que este código imprime?',
    code: "const vazio = '';\nconst horas = ' 3 ';\nconsole.log(Number(vazio));\nconsole.log(Number(horas.trim()) * 40);\nconsole.log(Number('três'));",
    expectedOutput: '0\n120\nNaN',
    explanation: "`Number('')` dá 0; `trim` tira os espaços; texto que não é número vira `NaN`.",
    difficulty: 2,
  },
  {
    id: 'core.m06.q26',
    lessonIds: ['core.m06.l04'],
    kind: 'multiple-choice',
    prompt:
      'Uma função monta a lista de produtos com `append`. Chamada duas vezes com o mesmo array de 3 itens, a lista fica com 6. O que faltou?',
    options: [
      "Limpar a lista antes, com lista.textContent = ''",
      'Usar `querySelectorAll` em vez de `querySelector`',
      'Chamar `createElement` só uma vez',
      'Colocar a classe `produto` nos itens',
    ],
    answerIndex: 0,
    explanation: '`append` sempre acrescenta. Para remontar do zero, apague o conteúdo antes.',
    difficulty: 2,
  },
  {
    id: 'core.m06.q27',
    lessonIds: ['core.m06.l04', 'core.m06.l03'],
    kind: 'true-false',
    prompt:
      'Para pegar o que está digitado no momento do clique, o `campo.value` deve ser lido dentro da função do evento.',
    answer: true,
    explanation: 'Lido fora, o valor é o do momento em que a página abriu (geralmente vazio).',
    difficulty: 1,
  },
  {
    id: 'core.m06.q28',
    lessonIds: ['core.m06.l04'],
    kind: 'multiple-choice',
    prompt:
      'Por que usar `item.textContent = campo.value` em vez de `lista.innerHTML += campo.value` com o texto do usuário?',
    options: [
      'Com `textContent`, o que o usuário digita é sempre tratado como texto, nunca como HTML',
      'Porque `innerHTML` não existe em `<ul>`',
      'Porque `textContent` deixa o texto em negrito',
      'Não há diferença nenhuma',
    ],
    answerIndex: 0,
    explanation:
      'Com `innerHTML`, uma tag digitada vira HTML de verdade na página. `textContent` mostra o texto como ele é.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'core.m06.f19',
    lessonIds: ['core.m06.l04'],
    exerciseId: 'core.m06.e07',
    kind: 'multiple-choice',
    prompt: "Na sua `montarLista`, quantas vezes `document.createElement('li')` roda com o array de 4 doces?",
    options: ['4 vezes, uma por item', '1 vez só', '8 vezes', 'Nenhuma: os `<li>` já estavam no HTML'],
    answerIndex: 0,
    explanation: 'O `forEach` passa por cada item e cria um `<li>` para cada um.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f20',
    lessonIds: ['core.m06.l04'],
    exerciseId: 'core.m06.e07',
    kind: 'true-false',
    prompt:
      'Se o Seu Zé colocar mais um doce no array `doces`, a sua `montarLista` mostra ele sem você mexer na função.',
    answer: true,
    explanation:
      'A função cria um `<li>` por item, seja quantos forem. É o ganho de montar a lista a partir dos dados.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f21',
    lessonIds: ['core.m06.l04'],
    exerciseId: 'core.m06.e08',
    kind: 'multiple-choice',
    prompt: 'No seu orçamento, com 2 horas e 15 km, qual total aparece?',
    options: ['R$ 110', 'R$ 80', 'R$ 30', 'R$ 2152'],
    answerIndex: 0,
    explanation: '2 × 40 + 15 × 2 = 80 + 30 = 110.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f22',
    lessonIds: ['core.m06.l04'],
    exerciseId: 'core.m06.e08',
    kind: 'fill-blank',
    prompt: 'Complete a conversão que você fez ao ler as horas do formulário.',
    code: 'const h = ___(horas.value);',
    acceptedAnswers: ['Number', 'parseFloat', 'parseInt'],
    explanation: '`horas.value` é string; `Number(...)` transforma em número antes da conta.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f23',
    lessonIds: ['core.m06.l04'],
    exerciseId: 'core.m06.d04',
    kind: 'multiple-choice',
    prompt: 'No app de tasks com defeito, por que todo item novo aparecia vazio?',
    options: [
      'O `campo.value` era lido uma vez, quando a página abriu e o campo estava vazio',
      'O `createElement` não aceita texto',
      "O `campo.value = ''` apagava o texto do `<li>`",
      'O `append` coloca só elementos vazios',
    ],
    answerIndex: 0,
    explanation:
      "A variável `texto` guardou o valor do campo no carregamento: `''`. Ler dentro do clique resolve.",
    difficulty: 2,
  },
  {
    id: 'core.m06.f24',
    lessonIds: ['core.m06.l04'],
    exerciseId: 'core.m06.d04',
    kind: 'true-false',
    prompt:
      "No app de tasks consertado, limpar o campo com `campo.value = ''` depois do `append` apaga o texto do `<li>` que acabou de ser criado.",
    answer: false,
    explanation: 'O texto foi copiado para o `<li>` com `textContent`. Limpar o campo não mexe no item.',
    difficulty: 2,
  },
];
