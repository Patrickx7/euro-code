import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'front.m04.l04',
  moduleId: 'front.m04',
  order: 4,
  title: 'fetch e JSON: conversando com a API',
  concepts: [
    'API e JSON',
    'fetch',
    'Response: ok e status',
    'response.json()',
    'erros HTTP (404, 500)',
    'POST com method, headers e body',
    'JSON.stringify e JSON.parse',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Quase todo site de cliente busca dados de algum lugar: o cardápio, a agenda, o estoque. Esse "lugar" é uma **API**: um endereço no servidor que responde com dados, quase sempre em **JSON**.

## JSON

JSON é texto com cara de objeto JavaScript: \`{"nome": "Coxinha", "preco": 8}\`. Duas funções convertem:

- \`JSON.stringify(objeto)\`: objeto → texto (para **enviar**);
- \`JSON.parse(texto)\`: texto → objeto (para **usar**).

## fetch

\`fetch(url)\` faz o pedido e devolve uma **Promise** de uma **resposta** (\`Response\`). Os dados não vêm de uma vez: ler o corpo é outra espera, por isso \`response.json()\` **também** devolve uma Promise:

\`\`\`js
async function carregarCardapio() {
  const resposta = await fetch('https://api.bombocado.example/cardapio');
  const pratos = await resposta.json(); // dois awaits!
  console.log(pratos);
}
\`\`\`

## 404 e 500 não são "erro" para o fetch

O \`fetch\` só rejeita quando **nem chegou** no servidor (sem internet, endereço que não existe). Se o servidor respondeu "não achei" (**404**) ou "explodi" (**500**), para o \`fetch\` deu tudo certo: ele resolve normalmente. Quem confere é você:

- \`resposta.ok\`: \`true\` quando o status está entre 200 e 299;
- \`resposta.status\`: o número (200, 201, 404, 500...).

\`\`\`js
if (!resposta.ok) {
  aviso.textContent = 'Erro ' + resposta.status;
  return;
}
\`\`\`

Esquecer essa checagem é o motivo de tanto site mostrar "undefined" na tela quando a API do cliente cai. E ela **vai** cair.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<ul id="cardapio"></ul>
<p id="erro"></p>

<script>
  async function carregarCardapio() {
    const lista = document.querySelector('#cardapio');
    const erro = document.querySelector('#erro');
    try {
      const resposta = await fetch('https://api.bombocado.example/cardapio');
      if (!resposta.ok) {
        erro.textContent = 'Cardápio indisponível (erro ' + resposta.status + ')';
        return;
      }
      const pratos = await resposta.json();
      for (const prato of pratos) {
        const li = document.createElement('li');
        li.textContent = prato.nome + ' - R$ ' + prato.preco;
        lista.appendChild(li);
      }
    } catch (e) {
      erro.textContent = 'Sem conexão. Confere o wi-fi do cliente.';
    }
  }

  carregarCardapio();
</script>`,
      explanation:
        'Os três casos: sucesso (desenha a lista), erro HTTP (`!resposta.ok`, mostra o status) e falha de rede (o `fetch` rejeita e cai no `catch`).',
    },
    {
      kind: 'text',
      markdown: `## Enviando dados: POST

Por padrão o \`fetch\` faz um **GET** (buscar). Para **enviar** algo (um pedido, um formulário), passe um segundo argumento com as opções:

\`\`\`js
const resposta = await fetch('https://api.amassadinho.example/orcamentos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nome: 'Rita', servico: 'Martelinho de ouro' }),
});
\`\`\`

- \`method\`: \`'POST'\` para criar algo novo;
- \`headers\`: o \`'Content-Type': 'application/json'\` avisa o servidor que o corpo é JSON;
- \`body\`: **texto**. Mandar o objeto direto não funciona; passe por \`JSON.stringify\`.

A resposta de um POST costuma vir com status **201** (criado) e o que foi salvo, muitas vezes com um \`id\` novo. Erros comuns: **400** (você mandou algo errado, como um campo vazio), **401** (sem login), **500** (o servidor quebrou, não foi culpa sua... desta vez).`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<form id="form">
  <input id="nome" placeholder="Seu nome">
  <button>Pedir orçamento</button>
</form>
<p id="msg"></p>

<script>
  const form = document.querySelector('#form');
  const msg = document.querySelector('#msg');

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const nome = document.querySelector('#nome').value;
    const resposta = await fetch('https://api.amassadinho.example/orcamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    });
    const dados = await resposta.json();
    msg.textContent = resposta.ok ? 'Pedido #' + dados.id + ' recebido!' : 'Erro: ' + dados.erro;
  });
</script>`,
      explanation:
        '`preventDefault` impede o formulário de recarregar a página. O corpo vai como texto JSON, e a resposta (de sucesso ou de erro) também é lida com `.json()`.',
    },
  ],
  checkQuestionIds: ['front.m04.q26', 'front.m04.q27'],
  exerciseIds: ['front.m04.e07', 'front.m04.e08'],
  debugExerciseIds: ['front.m04.d04'],
};

const CARDAPIO_HTML = `<h1>Lanchonete Bom Bocado</h1>
<ul id="cardapio"></ul>
<p id="erro"></p>

<script>
  // API falsa (o jogo roda sem internet). Não mexa: ela finge ser o servidor da lanchonete.
  window.__chamadas = [];
  window.__cardapioFora = false;
  window.fetch = async (url, opcoes) => {
    window.__chamadas.push({ url: String(url), opcoes });
    await new Promise((r) => setTimeout(r, 20));
    const responder = (status, dados) => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => dados,
    });
    if (url === 'https://api.bombocado.example/cardapio') {
      if (window.__cardapioFora) return responder(500, { erro: 'Servidor explodiu' });
      return responder(200, [
        { nome: 'Coxinha', preco: 8 },
        { nome: 'X-Salada', preco: 22 },
        { nome: 'Suco de laranja', preco: 7 },
      ]);
    }
    return responder(404, { erro: 'Rota não encontrada' });
  };
</script>`;

const CARDAPIO_CSS = `body { font-family: sans-serif; }
#erro { color: rgb(180, 0, 0); }`;

const ORCAMENTO_HTML = `<h1>Funilaria Amassadinho</h1>
<form id="form">
  <input id="nome" placeholder="Seu nome" value="Rita">
  <input id="servico" placeholder="Serviço" value="Martelinho de ouro">
  <button>Pedir orçamento</button>
</form>
<p id="msg"></p>

<script>
  // API falsa (o jogo roda sem internet). Não mexa: ela finge ser o servidor da funilaria.
  window.__chamadas = [];
  window.fetch = async (url, opcoes = {}) => {
    window.__chamadas.push({ url: String(url), opcoes });
    await new Promise((r) => setTimeout(r, 20));
    const responder = (status, dados) => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => dados,
    });
    if (url !== 'https://api.amassadinho.example/orcamentos') return responder(404, { erro: 'Rota não encontrada' });
    if (opcoes.method !== 'POST') return responder(405, { erro: 'Use POST' });
    let pedido;
    try {
      pedido = JSON.parse(opcoes.body);
    } catch (e) {
      return responder(400, { erro: 'Corpo não é JSON' });
    }
    if (!pedido.nome) return responder(400, { erro: 'Nome obrigatório' });
    return responder(201, { id: 42, nome: pedido.nome, servico: pedido.servico });
  };
</script>`;

const ORCAMENTO_CSS = `body { font-family: sans-serif; }
input { display: block; margin-bottom: 8px; }`;

const ORCAMENTO_FORM_JS = `
document.querySelector('#form').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const nome = document.querySelector('#nome').value;
  const servico = document.querySelector('#servico').value;
  enviarOrcamento(nome, servico);
});
`;

const PET_HTML = `<h1>Clínica Veterinária Rabo Feliz</h1>
<p id="ficha">Carregando...</p>

<script>
  // API falsa (o jogo roda sem internet). Não mexa: ela finge ser o servidor da clínica.
  window.fetch = async (url) => {
    await new Promise((r) => setTimeout(r, 20));
    const pets = {
      3: { nome: 'Thor', especie: 'cachorro', tutor: 'Dona Cida' },
      5: { nome: 'Mingau', especie: 'gato', tutor: 'Bia' },
    };
    const id = String(url).split('/').pop();
    if (String(url).startsWith('https://api.rabofeliz.example/pets/') && pets[id]) {
      return { ok: true, status: 200, json: async () => pets[id] };
    }
    return { ok: false, status: 404, json: async () => ({ erro: 'Pet não encontrado' }) };
  };
</script>`;

const PET_CSS = `body { font-family: sans-serif; }`;

export const exercises: Exercise[] = [
  {
    id: 'front.m04.e07',
    lessonId: 'front.m04.l04',
    kind: 'implement',
    title: 'Cardápio direto da API',
    promptMarkdown: `A **Lanchonete Bom Bocado** cansou de atualizar o cardápio do site na mão. Agora ele vem da API. Escreva a função **async** \`carregarCardapio()\` que:

1. limpa a lista \`#cardapio\` e faz um GET em \`https://api.bombocado.example/cardapio\`;
2. se a resposta **não** for ok, coloca no \`#erro\` o texto \`Cardápio indisponível (erro 500)\` (com o status que veio) e para;
3. se for ok, lê o JSON (um array de \`{ nome, preco }\`) e cria um \`<li>\` para cada prato com o texto \`Coxinha - R$ 8\`.

O script já chama \`carregarCardapio()\` ao abrir a página. (Aqui o jogo roda sem internet: a API é de mentirinha, mas o \`fetch\` se usa igualzinho.)`,
    language: 'web',
    starterFiles: {
      html: CARDAPIO_HTML,
      css: CARDAPIO_CSS,
      js: `const lista = document.querySelector('#cardapio');
const erro = document.querySelector('#erro');

async function carregarCardapio() {
  // seu código aqui
}

carregarCardapio();
`,
    },
    solutionFiles: {
      html: CARDAPIO_HTML,
      css: CARDAPIO_CSS,
      js: `const lista = document.querySelector('#cardapio');
const erro = document.querySelector('#erro');

async function carregarCardapio() {
  lista.innerHTML = '';
  const resposta = await fetch('https://api.bombocado.example/cardapio');
  if (!resposta.ok) {
    erro.textContent = \`Cardápio indisponível (erro \${resposta.status})\`;
    return;
  }
  const pratos = await resposta.json();
  for (const prato of pratos) {
    const li = document.createElement('li');
    li.textContent = \`\${prato.nome} - R$ \${prato.preco}\`;
    lista.appendChild(li);
  }
}

carregarCardapio();
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'a página abre com o cardápio da API',
        code: `await wait(200);
const itens = [...document.querySelectorAll('#cardapio li')].map((li) => li.textContent);
assert.deepStrictEqual(itens, ['Coxinha - R$ 8', 'X-Salada - R$ 22', 'Suco de laranja - R$ 7']);`,
      },
      {
        description: 'busca no endereço certo da API',
        code: `await wait(200);
assert.ok(window.__chamadas.length > 0, 'O fetch não foi chamado.');
assert.strictEqual(window.__chamadas[0].url, 'https://api.bombocado.example/cardapio');`,
      },
      {
        description: 'carregar de novo não duplica a lista',
        code: `await wait(200);
await carregarCardapio();
assert.strictEqual(document.querySelectorAll('#cardapio li').length, 3, 'Limpe a lista antes de preencher.');`,
      },
      {
        description: 'com erro 500, mostra a mensagem e não desenha pratos',
        code: `await wait(200);
window.__cardapioFora = true;
try {
  await carregarCardapio();
} finally {
  window.__cardapioFora = false;
}
assert.strictEqual(document.querySelector('#erro').textContent, 'Cardápio indisponível (erro 500)');
assert.strictEqual(document.querySelectorAll('#cardapio li').length, 0, 'Com erro, a lista deveria ficar vazia.');`,
      },
    ],
    hints: [
      "`const resposta = await fetch('https://api.bombocado.example/cardapio');`",
      'Confira `resposta.ok` antes de ler os dados; o número do erro está em `resposta.status`.',
      '`const pratos = await resposta.json();` (o `json()` também é uma Promise).',
    ],
    followUpQuestionIds: ['front.m04.f19', 'front.m04.f20'],
    difficulty: 2,
  },
  {
    id: 'front.m04.e08',
    lessonId: 'front.m04.l04',
    kind: 'implement',
    title: 'Pedido de orçamento com POST',
    promptMarkdown: `A **Funilaria Amassadinho** quer receber pedidos de orçamento pelo site. O formulário já chama \`enviarOrcamento(nome, servico)\` no envio. Escreva essa função **async**:

1. faça um **POST** em \`https://api.amassadinho.example/orcamentos\` com o header \`'Content-Type': 'application/json'\` e o corpo \`{ nome, servico }\` em JSON;
2. leia o JSON da resposta;
3. se deu certo, coloque no \`#msg\`: \`Orçamento #42 recebido!\` (o número é o \`id\` que a API devolve);
4. se não, coloque \`Erro 400: Nome obrigatório\` (o status e o campo \`erro\` da resposta).`,
    language: 'web',
    starterFiles: {
      html: ORCAMENTO_HTML,
      css: ORCAMENTO_CSS,
      js: `const msg = document.querySelector('#msg');

async function enviarOrcamento(nome, servico) {
  // seu código aqui
}
${ORCAMENTO_FORM_JS}`,
    },
    solutionFiles: {
      html: ORCAMENTO_HTML,
      css: ORCAMENTO_CSS,
      js: `const msg = document.querySelector('#msg');

async function enviarOrcamento(nome, servico) {
  const resposta = await fetch('https://api.amassadinho.example/orcamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, servico }),
  });
  const dados = await resposta.json();
  if (resposta.ok) {
    msg.textContent = \`Orçamento #\${dados.id} recebido!\`;
  } else {
    msg.textContent = \`Erro \${resposta.status}: \${dados.erro}\`;
  }
}
${ORCAMENTO_FORM_JS}`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'envia um POST com JSON para a API',
        code: `await enviarOrcamento('Rita', 'Martelinho de ouro');
const chamada = window.__chamadas[window.__chamadas.length - 1];
assert.ok(chamada, 'O fetch não foi chamado.');
assert.strictEqual(chamada.url, 'https://api.amassadinho.example/orcamentos');
assert.ok(chamada.opcoes, 'Passe as opções (method, headers, body) no segundo argumento do fetch.');
assert.strictEqual(chamada.opcoes.method, 'POST');
const tipo = new Headers(chamada.opcoes.headers).get('content-type');
assert.strictEqual(tipo, 'application/json', 'Falta o header Content-Type: application/json.');
assert.strictEqual(typeof chamada.opcoes.body, 'string', 'O body precisa ser texto: use JSON.stringify.');
assert.deepStrictEqual(JSON.parse(chamada.opcoes.body), { nome: 'Rita', servico: 'Martelinho de ouro' });`,
      },
      {
        description: 'mostra o número do orçamento criado',
        code: `await enviarOrcamento('Rita', 'Martelinho de ouro');
assert.strictEqual(document.querySelector('#msg').textContent, 'Orçamento #42 recebido!');`,
      },
      {
        description: 'mostra o erro que a API devolve',
        code: `await enviarOrcamento('', 'Pintura');
assert.strictEqual(document.querySelector('#msg').textContent, 'Erro 400: Nome obrigatório');`,
      },
      {
        description: 'o formulário envia o pedido',
        code: `document.querySelector('#nome').value = 'Seu Valdir';
document.querySelector('#servico').value = 'Polimento';
click('#form button');
await wait(150);
const chamada = window.__chamadas[window.__chamadas.length - 1];
assert.ok(chamada && chamada.opcoes && typeof chamada.opcoes.body === 'string', 'O envio do formulário não fez o POST.');
assert.deepStrictEqual(JSON.parse(chamada.opcoes.body), { nome: 'Seu Valdir', servico: 'Polimento' });
assert.strictEqual(document.querySelector('#msg').textContent, 'Orçamento #42 recebido!');`,
      },
    ],
    hints: [
      "O segundo argumento do `fetch` é um objeto: `{ method: 'POST', headers: { ... }, body: ... }`.",
      'O `body` vai como texto: `JSON.stringify({ nome, servico })`.',
      'Leia `await resposta.json()` nos dois casos e decida com `resposta.ok`.',
    ],
    followUpQuestionIds: ['front.m04.f21', 'front.m04.f22'],
    difficulty: 3,
  },
  {
    id: 'front.m04.d04',
    lessonId: 'front.m04.l04',
    kind: 'debug',
    title: 'A ficha do pet "undefined"',
    promptMarkdown: `Na **Clínica Veterinária Rabo Feliz**, a ficha do pet aparece como \`undefined (undefined) - tutor: undefined\`. E quando o pet não existe (a API responde **404**), deveria aparecer \`Pet não encontrado\`.

Conserte \`mostrarPet(id)\` para mostrar \`Thor (cachorro) - tutor: Dona Cida\` e tratar o 404. A API está certa; o problema é no seu lado.`,
    language: 'web',
    starterFiles: {
      html: PET_HTML,
      css: PET_CSS,
      js: `async function mostrarPet(id) {
  const ficha = document.querySelector('#ficha');
  const resposta = await fetch(\`https://api.rabofeliz.example/pets/\${id}\`);
  const pet = resposta.json();
  ficha.textContent = \`\${pet.nome} (\${pet.especie}) - tutor: \${pet.tutor}\`;
}

mostrarPet(3);
`,
    },
    solutionFiles: {
      html: PET_HTML,
      css: PET_CSS,
      js: `async function mostrarPet(id) {
  const ficha = document.querySelector('#ficha');
  const resposta = await fetch(\`https://api.rabofeliz.example/pets/\${id}\`);
  if (!resposta.ok) {
    ficha.textContent = 'Pet não encontrado';
    return;
  }
  const pet = await resposta.json();
  ficha.textContent = \`\${pet.nome} (\${pet.especie}) - tutor: \${pet.tutor}\`;
}

mostrarPet(3);
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'a página abre com a ficha do Thor',
        code: `await wait(150);
assert.strictEqual(document.querySelector('#ficha').textContent, 'Thor (cachorro) - tutor: Dona Cida');`,
      },
      {
        description: 'mostra a ficha do Mingau',
        code: `await mostrarPet(5);
assert.strictEqual(document.querySelector('#ficha').textContent, 'Mingau (gato) - tutor: Bia');`,
      },
      {
        description: 'pet que não existe mostra "Pet não encontrado"',
        code: `await mostrarPet(99);
assert.strictEqual(document.querySelector('#ficha').textContent, 'Pet não encontrado');`,
      },
    ],
    hints: [
      '`resposta.json()` devolve uma Promise. Falta alguma coisa antes dele?',
      'Um 404 não faz o `fetch` rejeitar: confira `resposta.ok` antes de ler a ficha.',
    ],
    followUpQuestionIds: ['front.m04.f23', 'front.m04.f24'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m04.q26',
    lessonIds: ['front.m04.l04'],
    kind: 'multiple-choice',
    prompt: 'O que `await fetch(url)` entrega?',
    options: [
      'Um objeto de resposta (`Response`), com `ok`, `status` e o método `json()`',
      'Os dados já convertidos em objeto',
      'O texto HTML da página',
      '`true` se deu certo, `false` se deu errado',
    ],
    answerIndex: 0,
    explanation:
      'O `fetch` entrega a resposta. Para pegar os dados, ainda precisa de `await resposta.json()`.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q27',
    lessonIds: ['front.m04.l04'],
    kind: 'true-false',
    prompt: 'Se a API responder com status 404, a Promise do `fetch` é rejeitada e cai no `catch`.',
    answer: false,
    explanation:
      'O `fetch` só rejeita em falha de rede. Um 404 ou 500 é uma resposta válida: confira `resposta.ok` ou `resposta.status`.',
    difficulty: 2,
  },
  // ---- gerais ----
  {
    id: 'front.m04.q28',
    lessonIds: ['front.m04.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const texto = JSON.stringify({ cliente: 'Rita', valor: 300 });
console.log(texto);
console.log(typeof texto);`,
    expectedOutput: '{"cliente":"Rita","valor":300}\nstring',
    explanation:
      '`JSON.stringify` transforma o objeto em texto JSON (chaves com aspas duplas, sem espaços). É esse texto que vai no `body`.',
    difficulty: 2,
  },
  {
    id: 'front.m04.q29',
    lessonIds: ['front.m04.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const recebido = '{"prato":"Coxinha","preco":8}';
const dados = JSON.parse(recebido);
console.log(dados.preco * 2);`,
    expectedOutput: '16',
    explanation: '`JSON.parse` transforma o texto em objeto de verdade: `dados.preco` é o número 8.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q30',
    lessonIds: ['front.m04.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para mandar o objeto como texto JSON no corpo do POST.',
    code: `fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.___(pedido),
});`,
    acceptedAnswers: ['stringify'],
    explanation: 'O `body` precisa ser texto. `JSON.stringify` converte o objeto.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q31',
    lessonIds: ['front.m04.l04'],
    kind: 'multiple-choice',
    prompt: 'Quando `resposta.ok` é `true`?',
    options: [
      'Quando o status está entre 200 e 299',
      'Sempre que o servidor respondeu alguma coisa',
      'Só quando o status é exatamente 200',
      'Quando a resposta veio em menos de 1 segundo',
    ],
    answerIndex: 0,
    explanation: '200 (ok), 201 (criado), 204 (sem conteúdo)... toda a faixa 2xx conta como sucesso.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q32',
    lessonIds: ['front.m04.l04'],
    kind: 'multiple-choice',
    prompt:
      'O site manda o pedido, mas a API responde **400** com `{"erro":"Nome obrigatório"}`. De quem é a culpa, normalmente?',
    options: [
      'Do pedido que o site mandou (faltou um dado ou veio errado)',
      'Do servidor, que quebrou',
      'Da internet, que caiu',
      'Do navegador, que não suporta POST',
    ],
    answerIndex: 0,
    explanation:
      'Códigos 4xx dizem "o problema está no pedido" (400 dado errado, 401 sem login, 404 não existe). 5xx é o servidor que falhou.',
    difficulty: 2,
  },
  {
    id: 'front.m04.q33',
    lessonIds: ['front.m04.l04'],
    kind: 'multiple-choice',
    prompt: 'Por que `const dados = resposta.json();` (sem `await`) não entrega os dados?',
    options: [
      'Porque `json()` devolve uma Promise: sem `await`, `dados` é a Promise',
      'Porque `json()` só funciona em POST',
      'Porque precisa chamar `JSON.parse` antes',
      'Porque `json()` apaga a resposta',
    ],
    answerIndex: 0,
    explanation:
      'Ler o corpo da resposta também leva tempo. São dois `await`: um no `fetch` e outro no `json()`.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q34',
    lessonIds: ['front.m04.l04'],
    kind: 'true-false',
    prompt: 'Sem passar `method`, o `fetch` faz um GET.',
    answer: true,
    explanation: "GET é o padrão, para buscar dados. Para enviar, passe `method: 'POST'` (e o `body`).",
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m04.f19',
    lessonIds: ['front.m04.l04'],
    exerciseId: 'front.m04.e07',
    kind: 'multiple-choice',
    prompt: 'No seu `carregarCardapio`, quantos `await` aparecem no caminho de sucesso, e onde?',
    options: [
      'Dois: um no `fetch` e outro no `resposta.json()`',
      'Um só, no `fetch`',
      'Um só, no `resposta.json()`',
      'Nenhum: o `fetch` é síncrono',
    ],
    answerIndex: 0,
    explanation: 'O `fetch` espera a resposta chegar; o `json()` espera o corpo ser lido e convertido.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f20',
    lessonIds: ['front.m04.l04'],
    exerciseId: 'front.m04.e07',
    kind: 'true-false',
    prompt:
      'No seu `carregarCardapio`, quando a API responde 500, o `fetch` não rejeita: é o seu `if (!resposta.ok)` que mostra a mensagem de erro.',
    answer: true,
    explanation: 'Para o `fetch`, um 500 ainda é uma resposta. Quem decide que é erro é o seu código.',
    difficulty: 2,
  },
  {
    id: 'front.m04.f21',
    lessonIds: ['front.m04.l04'],
    exerciseId: 'front.m04.e08',
    kind: 'multiple-choice',
    prompt: 'No seu `enviarOrcamento`, por que o corpo vai com `JSON.stringify({ nome, servico })`?',
    options: [
      'Porque o `body` do `fetch` precisa ser texto, e a API espera texto JSON',
      'Para esconder os dados de quem olha a rede',
      'Porque o `fetch` não aceita variáveis',
      'Para o pedido ficar mais rápido',
    ],
    answerIndex: 0,
    explanation:
      'O servidor recebe texto. `JSON.stringify` transforma o objeto e o header `Content-Type` avisa que é JSON.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f22',
    lessonIds: ['front.m04.l04'],
    exerciseId: 'front.m04.e08',
    kind: 'multiple-choice',
    prompt: "No seu `enviarOrcamento('', 'Pintura')`, qual status a API devolve?",
    options: ['400', '201', '404', '500'],
    answerIndex: 0,
    explanation: 'Nome vazio é erro no pedido: 400. Por isso a mensagem fica "Erro 400: Nome obrigatório".',
    difficulty: 1,
  },
  {
    id: 'front.m04.f23',
    lessonIds: ['front.m04.l04'],
    exerciseId: 'front.m04.d04',
    kind: 'multiple-choice',
    prompt: 'No `mostrarPet` com defeito, por que a ficha mostrava `undefined` mesmo para o Thor?',
    options: [
      'Faltava `await` no `resposta.json()`: `pet` era uma Promise, sem `nome` nem `tutor`',
      'A URL da API estava errada',
      'O Thor não estava cadastrado',
      'Template string não funciona com `textContent`',
    ],
    answerIndex: 0,
    explanation: 'Uma Promise não tem a propriedade `nome`, então `pet.nome` dava `undefined`.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f24',
    lessonIds: ['front.m04.l04'],
    exerciseId: 'front.m04.d04',
    kind: 'multiple-choice',
    prompt: 'No `mostrarPet` consertado, o que faz a ficha mostrar "Pet não encontrado" para o id 99?',
    options: [
      'O `if (!resposta.ok)`, porque a API responde 404',
      'O `catch`, porque o `fetch` rejeita com 404',
      'O `resposta.json()`, que lança erro no 404',
      'O navegador, que mostra a mensagem sozinho',
    ],
    answerIndex: 0,
    explanation: 'O 404 chega como resposta normal, com `ok` falso. Quem trata é a sua checagem.',
    difficulty: 2,
  },
];
