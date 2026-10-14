import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { MINI_API } from './mini-api';

export const lesson: Lesson = {
  id: 'fullstack.m01.l01',
  moduleId: 'fullstack.m01',
  order: 1,
  title: 'O caminho de uma requisição e o contrato da API',
  concepts: [
    'ciclo requisição → resposta',
    'formulário → fetch → rota → validação → resposta → tela',
    'contrato de API (método, caminho, corpo, status)',
    'mudança que quebra e mudança que não quebra',
    'versionar a API (/v1, /v2)',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Até agora você era **ou** front **ou** back. Quando algo dava errado, o dev front dizia "a API está quebrada" e o dev back respondia "no meu terminal funciona". Agora você é sênior full stack: **os dois são você**. A discussão continua, só que dentro da sua cabeça, às duas da manhã.

## O caminho de um pedido

Quando o cliente clica em **Enviar**, o dado atravessa o sistema inteiro:

1. **Formulário**: o JavaScript da página lê os campos (\`input.value\` é **sempre texto**);
2. **fetch**: monta a requisição (método, caminho, cabeçalhos e corpo em JSON) e manda pela rede;
3. **Rota**: no servidor, o roteador acha quem cuida de \`POST /api/v1/pedidos\`;
4. **Validação**: o back confere tudo que chegou (nunca confie no cliente!);
5. **Resposta**: o back devolve um **status** (201, 400, 404, 500...) e um corpo JSON;
6. **Tela**: o front lê o status, lê o JSON e atualiza o DOM.

Um bug pode morar em **qualquer** desses passos. O segredo do full stack é saber em qual deles olhar primeiro, em vez de culpar "o outro lado".`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<form id="form">
  <input id="prato" value="Feijoada">
  <input id="quantidade" type="number" value="2">
  <button>Pedir</button>
</form>
<p id="resultado"></p>

<script>
  document.querySelector('#form').addEventListener('submit', async (evento) => {
    evento.preventDefault();                                   // 1. formulário
    const corpo = {
      prato: document.querySelector('#prato').value,
      quantidade: Number(document.querySelector('#quantidade').value), // texto → número
    };
    const resposta = await fetch('/api/v1/pedidos', {          // 2. fetch
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    const dados = await resposta.json();                       // 5. resposta
    document.querySelector('#resultado').textContent =         // 6. tela
      resposta.status === 201 ? 'Pedido #' + dados.pedido.id + ' anotado!' : dados.erros.join('; ');
  });
</script>`,
      explanation:
        'O lado do front: ler o formulário, converter o que precisa, enviar JSON e decidir o que mostrar pelo **status**.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `app.post('/api/v1/pedidos', (req) => {                    // 3. rota
  const corpo = req.body as { prato?: unknown; quantidade?: unknown };
  const erros: string[] = [];                                  // 4. validação
  if (typeof corpo.prato !== 'string' || corpo.prato.trim() === '') erros.push('prato é obrigatório');
  if (typeof corpo.quantidade !== 'number' || corpo.quantidade < 1) erros.push('quantidade inválida');
  if (erros.length > 0) return { status: 400, body: { erros } };
  const pedido = { id: proximoId++, prato: corpo.prato, quantidade: corpo.quantidade };
  return { status: 201, body: { pedido } };                    // 5. resposta
});`,
      explanation:
        'O lado do back, no "Express de bolso" deste módulo: o handler **devolve** `{ status, body }`. Repare que o front lê `dados.pedido.id` e `dados.erros`: os dois lados precisam combinar esse formato.',
    },
    {
      kind: 'text',
      markdown: `## O contrato da API

Esse "combinado" entre front e back tem nome: **contrato da API**. Para cada rota, ele diz:

- **método e caminho**: \`POST /api/v1/pedidos\`;
- **corpo da requisição**: \`{ prato: string, quantidade: number }\`;
- **respostas possíveis**: \`201 → { pedido: { id, prato, quantidade } }\` e \`400 → { erros: string[] }\`.

O **status faz parte do contrato**. Se o back trocar 201 por 200, um front que confere \`status === 201\` quebra, mesmo com o JSON igualzinho.

## Mudar sem quebrar

Nem toda mudança é igual:

- **Não quebra**: acrescentar um campo novo na resposta (quem não conhece, ignora) ou um campo **opcional** no pedido.
- **Quebra**: renomear (\`preco\` → \`valor\`), remover, mudar o tipo (\`350.5\` → \`{ centavos: 35050 }\`), mudar o status ou tornar obrigatório um campo novo.

O site você publica e pronto. Mas o **app no celular do motoboy** só atualiza quando ele lembrar (ou seja, nunca). Por isso, para uma mudança que quebra, crie uma **nova versão** da rota: \`/v2/...\` com o formato novo, e \`/v1/...\` continua respondendo do jeito antigo até ninguém mais usar.`,
    },
    {
      kind: 'example',
      language: 'ts',
      code: `// v1: o app antigo espera o preço em reais, como número
app.get('/v1/fretes/:id', (req) => {
  const frete = acharFrete(Number(req.params.id));
  if (!frete) return { status: 404, body: { erro: 'Frete não encontrado' } };
  return { status: 200, body: { id: frete.id, preco: frete.precoReais } };
});

// v2: o app novo quer centavos e moeda (mudança que quebra → versão nova)
app.get('/v2/fretes/:id', (req) => {
  const frete = acharFrete(Number(req.params.id));
  if (!frete) return { status: 404, body: { erro: 'Frete não encontrado' } };
  return { status: 200, body: { id: frete.id, preco: { centavos: Math.round(frete.precoReais * 100), moeda: 'BRL' } } };
});`,
      explanation:
        'Os mesmos dados, dois formatos. Quem usa a v1 não percebe nada; quem quer o formato novo chama a v2.',
    },
  ],
  checkQuestionIds: ['fullstack.m01.q01', 'fullstack.m01.q02'],
  exerciseIds: ['fullstack.m01.e01', 'fullstack.m01.e02'],
  debugExerciseIds: ['fullstack.m01.d01'],
};

// ---------- e01: frete v2 (TS, back) ----------

const FRETE_BASE = `import { criarApp } from './mini-api';

interface Frete {
  id: number;
  destino: string;
  precoReais: number;
}

const fretes: Frete[] = [
  { id: 1, destino: 'Alphaville, Barueri', precoReais: 350.5 },
  { id: 2, destino: 'Centro, Carapicuíba', precoReais: 120 },
  { id: 3, destino: 'Granja Viana, Cotia', precoReais: 89.9 },
];

const app = criarApp();

// Contrato v1: o app dos motoristas usa e NÃO vai atualizar tão cedo. Não mexa!
app.get('/v1/fretes/:id', (req) => {
  const frete = fretes.find((f) => f.id === Number(req.params.id));
  if (!frete) return { status: 404, body: { erro: 'Frete não encontrado' } };
  return { status: 200, body: { id: frete.id, destino: frete.destino, preco: frete.precoReais } };
});
`;

// ---------- e02: formulário da marmitaria (web, front) ----------

const MARMITA_HTML = `<h1>Marmitaria Panela Cheia</h1>
<form id="form">
  <label>Prato <input id="prato" value="Feijoada"></label>
  <label>Quantidade <input id="quantidade" type="number" value="2"></label>
  <label>Bairro <input id="bairro" value="Vila Yara"></label>
  <button>Pedir</button>
</form>
<p id="resultado"></p>

<script>
  // API falsa (o jogo roda sem internet). Não mexa: ela é o back-end da marmitaria.
  window.__chamadas = [];
  window.fetch = async (url, opcoes = {}) => {
    window.__chamadas.push({ url: String(url), opcoes });
    await new Promise((r) => setTimeout(r, 20));
    const responder = (status, dados) => ({ ok: status >= 200 && status < 300, status, json: async () => dados });
    if (url !== '/api/v1/pedidos') return responder(404, { erro: 'Rota não encontrada' });
    if (opcoes.method !== 'POST') return responder(405, { erro: 'Use POST' });
    let corpo;
    try {
      corpo = JSON.parse(opcoes.body);
    } catch (e) {
      return responder(400, { erros: ['o corpo precisa ser JSON'] });
    }
    const erros = [];
    if (typeof corpo.prato !== 'string' || corpo.prato.trim() === '') erros.push('prato é obrigatório');
    if (typeof corpo.quantidade !== 'number') erros.push('quantidade deve ser um número');
    else if (corpo.quantidade < 1) erros.push('quantidade deve ser maior que zero');
    if (typeof corpo.bairro !== 'string' || corpo.bairro.trim() === '') erros.push('bairro é obrigatório');
    if (erros.length > 0) return responder(400, { erros });
    return responder(201, { pedido: { id: 7, previsao: '40 min' } });
  };
</script>`;

const MARMITA_CSS = `body { font-family: sans-serif; }
label { display: block; margin-bottom: 8px; }`;

const MARMITA_LISTENER = `
document.querySelector('#form').addEventListener('submit', (evento) => {
  evento.preventDefault();
  enviarPedido();
});
`;

// ---------- d01: entregas do dia (web, front) ----------

const ENTREGAS_HTML = `<h1>Panela Cheia: entregas do dia</h1>
<p id="total"></p>
<ul id="entregas"></ul>

<script>
  // API falsa (o jogo roda sem internet). Não mexa: ela segue o contrato documentado.
  // GET /api/v1/entregas → 200 { itens: [{ id, cliente, bairro }], total: number }
  // (a API pagina: manda as 3 próximas entregas, mas "total" é o número do dia inteiro)
  window.__chamadas = [];
  window.fetch = async (url) => {
    window.__chamadas.push({ url: String(url) });
    await new Promise((r) => setTimeout(r, 20));
    if (url !== '/api/v1/entregas') {
      return { ok: false, status: 404, json: async () => ({ erro: 'Rota não encontrada' }) };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        itens: [
          { id: 1, cliente: 'Seu Arlindo', bairro: 'Km 18' },
          { id: 2, cliente: 'Dona Neide', bairro: 'Jardim Belval' },
          { id: 3, cliente: 'Escritório Contábil Débito & Crédito', bairro: 'Centro' },
        ],
        total: 5,
      }),
    };
  };
</script>`;

const ENTREGAS_CSS = `body { font-family: sans-serif; }`;

export const exercises: Exercise[] = [
  {
    id: 'fullstack.m01.e01',
    lessonId: 'fullstack.m01.l01',
    kind: 'implement',
    title: 'Frete v2 sem quebrar o app velho',
    promptMarkdown: `A **Transportes Pé na Tábua** vai lançar um site novo, e o front quer o preço do frete em **centavos**, com a moeda. Só que o app dos motoristas usa a rota \`GET /v1/fretes/:id\`, que devolve \`preco\` em reais, e ninguém sabe quando eles vão atualizar.

Crie a rota \`GET /v2/fretes/:id\` **sem mexer na v1**:

- achou: status **200** e \`{ id, destino, preco: { centavos, moeda: 'BRL' } }\` (ex.: \`350.5\` reais → \`35050\` centavos, sempre um número inteiro);
- não achou: status **404** e \`{ erro: 'Frete não encontrado' }\`.

O handler devolve a resposta com \`return { status, body }\` (veja o comentário no topo de \`mini-api.ts\`).`,
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: { 'mini-api.ts': MINI_API },
    starterCode: `${FRETE_BASE}
// Contrato v2: crie a rota aqui
`,
    solution: `${FRETE_BASE}
// Contrato v2: preço em centavos, com moeda
app.get('/v2/fretes/:id', (req) => {
  const frete = fretes.find((f) => f.id === Number(req.params.id));
  if (!frete) return { status: 404, body: { erro: 'Frete não encontrado' } };
  return {
    status: 200,
    body: {
      id: frete.id,
      destino: frete.destino,
      preco: { centavos: Math.round(frete.precoReais * 100), moeda: 'BRL' },
    },
  };
});
`,
    tests: [
      {
        description: 'a v2 devolve o preço em centavos e a moeda',
        code: `const r = await app.handle({ method: 'GET', path: '/v2/fretes/1' });
assert.strictEqual(r.status, 200);
assert.deepStrictEqual(r.body, { id: 1, destino: 'Alphaville, Barueri', preco: { centavos: 35050, moeda: 'BRL' } });`,
      },
      {
        description: 'os centavos saem inteiros (R$ 89,90 → 8990)',
        code: `const r = await app.handle({ method: 'GET', path: '/v2/fretes/3' });
assert.deepStrictEqual(r.body, { id: 3, destino: 'Granja Viana, Cotia', preco: { centavos: 8990, moeda: 'BRL' } });`,
      },
      {
        description: 'frete que não existe na v2 responde 404 com a mensagem do contrato',
        code: `const r = await app.handle({ method: 'GET', path: '/v2/fretes/99' });
assert.strictEqual(r.status, 404);
assert.deepStrictEqual(r.body, { erro: 'Frete não encontrado' });`,
      },
      {
        description: 'a v1 continua igualzinha para o app dos motoristas',
        code: `const r = await app.handle({ method: 'GET', path: '/v1/fretes/2' });
assert.strictEqual(r.status, 200);
assert.deepStrictEqual(r.body, { id: 2, destino: 'Centro, Carapicuíba', preco: 120 });`,
      },
    ],
    hints: [
      "Copie a ideia da v1: `app.get('/v2/fretes/:id', (req) => { ... })`, buscando o frete do mesmo jeito.",
      "Mude só o formato do `body`: `preco: { centavos: ..., moeda: 'BRL' }`.",
      '`89.9 * 100` dá `8990.000000000001` (coisa de ponto flutuante). Use `Math.round` para ficar inteiro.',
    ],
    followUpQuestionIds: ['fullstack.m01.f01', 'fullstack.m01.f02'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.e02',
    lessonId: 'fullstack.m01.l01',
    kind: 'implement',
    title: 'Do formulário à tela',
    promptMarkdown: `A **Marmitaria Panela Cheia** (Carapicuíba) quer receber pedidos pelo site. O back-end já está pronto e o contrato é este:

\`\`\`
POST /api/v1/pedidos
Corpo:  { prato: string, quantidade: number, bairro: string }
201 →   { pedido: { id: number, previsao: string } }
400 →   { erros: string[] }
\`\`\`

O formulário já chama \`enviarPedido()\` no envio. Escreva essa função **async**:

1. leia \`#prato\`, \`#quantidade\` e \`#bairro\` e mande um **POST** com o corpo do contrato em JSON (com o cabeçalho \`'Content-Type': 'application/json'\`). Atenção: \`quantidade\` é **número** no contrato;
2. se a resposta for **201**, mostre em \`#resultado\`: \`Pedido #7 confirmado! Chega em 40 min\` (o \`id\` e a \`previsao\` que vieram);
3. se for **400**, mostre os erros separados por \`; \` (ex.: \`prato é obrigatório; quantidade deve ser maior que zero\`).`,
    language: 'web',
    starterFiles: {
      html: MARMITA_HTML,
      css: MARMITA_CSS,
      js: `const resultado = document.querySelector('#resultado');

async function enviarPedido() {
  // seu código aqui
}
${MARMITA_LISTENER}`,
    },
    solutionFiles: {
      html: MARMITA_HTML,
      css: MARMITA_CSS,
      js: `const resultado = document.querySelector('#resultado');

async function enviarPedido() {
  const corpo = {
    prato: document.querySelector('#prato').value,
    quantidade: Number(document.querySelector('#quantidade').value),
    bairro: document.querySelector('#bairro').value,
  };
  const resposta = await fetch('/api/v1/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  const dados = await resposta.json();
  if (resposta.status === 201) {
    resultado.textContent = 'Pedido #' + dados.pedido.id + ' confirmado! Chega em ' + dados.pedido.previsao;
  } else if (resposta.status === 400) {
    resultado.textContent = dados.erros.join('; ');
  }
}
${MARMITA_LISTENER}`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'manda um POST com o corpo do contrato (quantidade como número)',
        code: `await enviarPedido();
const chamada = window.__chamadas[window.__chamadas.length - 1];
assert.ok(chamada, 'O fetch não foi chamado.');
assert.strictEqual(chamada.url, '/api/v1/pedidos');
assert.strictEqual(chamada.opcoes.method, 'POST');
assert.strictEqual(new Headers(chamada.opcoes.headers).get('content-type'), 'application/json');
assert.strictEqual(typeof chamada.opcoes.body, 'string', 'O body precisa ser texto: use JSON.stringify.');
assert.deepStrictEqual(JSON.parse(chamada.opcoes.body), { prato: 'Feijoada', quantidade: 2, bairro: 'Vila Yara' });`,
      },
      {
        description: 'com 201, mostra o número do pedido e a previsão',
        code: `await enviarPedido();
assert.strictEqual(document.querySelector('#resultado').textContent, 'Pedido #7 confirmado! Chega em 40 min');`,
      },
      {
        description: 'com 400, mostra os erros que o back mandou',
        code: `document.querySelector('#prato').value = '';
document.querySelector('#quantidade').value = '0';
try {
  await enviarPedido();
} finally {
  document.querySelector('#prato').value = 'Feijoada';
  document.querySelector('#quantidade').value = '2';
}
assert.strictEqual(
  document.querySelector('#resultado').textContent,
  'prato é obrigatório; quantidade deve ser maior que zero',
);`,
      },
      {
        description: 'o envio do formulário faz o pedido sem recarregar a página',
        code: `document.querySelector('#bairro').value = 'Jardim das Flores';
const evento = new Event('submit', { cancelable: true });
document.querySelector('#form').dispatchEvent(evento);
assert.ok(evento.defaultPrevented, 'O formulário recarregaria a página.');
await wait(150);
const chamada = window.__chamadas[window.__chamadas.length - 1];
assert.ok(chamada && typeof chamada.opcoes.body === 'string', 'O envio não fez o POST.');
assert.strictEqual(JSON.parse(chamada.opcoes.body).bairro, 'Jardim das Flores');`,
      },
    ],
    hints: [
      '`input.value` é sempre texto. Para o contrato, use `Number(...)` na quantidade.',
      "No `fetch`: `{ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) }`.",
      "Leia `await resposta.json()` e decida pelo `resposta.status` (201 ou 400). Os erros são um array: `dados.erros.join('; ')`.",
    ],
    followUpQuestionIds: ['fullstack.m01.f03', 'fullstack.m01.f04'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.d01',
    lessonId: 'fullstack.m01.l01',
    kind: 'debug',
    title: 'A lista de entregas que não aparece',
    promptMarkdown: `O motoboy da **Panela Cheia** abre a página de entregas e... nada. No console: \`TypeError: entregas.forEach is not a function\`. O "você do front" jura que a API mudou; o "você do back" mostra o contrato, documentado desde o primeiro dia:

\`\`\`
GET /api/v1/entregas
200 → { itens: [{ id, cliente, bairro }], total: number }
\`\`\`

A API pagina: \`itens\` traz só as próximas entregas, e \`total\` é o número do dia inteiro. Conserte \`carregarEntregas()\` para seguir o contrato: um \`<li>\` \`Seu Arlindo - Km 18\` para cada item e, em \`#total\`, \`5 entregas hoje\` (o \`total\` da resposta).`,
    language: 'web',
    starterFiles: {
      html: ENTREGAS_HTML,
      css: ENTREGAS_CSS,
      js: `async function carregarEntregas() {
  const lista = document.querySelector('#entregas');
  const total = document.querySelector('#total');
  lista.innerHTML = '';
  const resposta = await fetch('/api/v1/entregas');
  const entregas = await resposta.json();
  entregas.forEach((entrega) => {
    const li = document.createElement('li');
    li.textContent = entrega.cliente + ' - ' + entrega.bairro;
    lista.appendChild(li);
  });
  total.textContent = entregas.length + ' entregas hoje';
}

carregarEntregas();
`,
    },
    solutionFiles: {
      html: ENTREGAS_HTML,
      css: ENTREGAS_CSS,
      js: `async function carregarEntregas() {
  const lista = document.querySelector('#entregas');
  const total = document.querySelector('#total');
  lista.innerHTML = '';
  const resposta = await fetch('/api/v1/entregas');
  const dados = await resposta.json();
  dados.itens.forEach((entrega) => {
    const li = document.createElement('li');
    li.textContent = entrega.cliente + ' - ' + entrega.bairro;
    lista.appendChild(li);
  });
  total.textContent = dados.total + ' entregas hoje';
}

carregarEntregas();
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'a página abre com as entregas da API',
        code: `await wait(150);
const itens = [...document.querySelectorAll('#entregas li')].map((li) => li.textContent);
assert.deepStrictEqual(itens, [
  'Seu Arlindo - Km 18',
  'Dona Neide - Jardim Belval',
  'Escritório Contábil Débito & Crédito - Centro',
]);`,
      },
      {
        description: 'o total do dia vem do campo "total" do contrato',
        code: `await wait(150);
assert.strictEqual(document.querySelector('#total').textContent, '5 entregas hoje');`,
      },
      {
        description: 'carregar de novo não duplica a lista',
        code: `await carregarEntregas();
assert.strictEqual(document.querySelectorAll('#entregas li').length, 3);`,
      },
    ],
    hints: [
      'O que `resposta.json()` entrega aqui não é um array: é um objeto com duas chaves.',
      'A lista está em `dados.itens`; o total do dia, em `dados.total` (não é o tamanho da lista).',
    ],
    followUpQuestionIds: ['fullstack.m01.f05', 'fullstack.m01.f06'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'fullstack.m01.q01',
    lessonIds: ['fullstack.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Qual é a ordem do caminho de um pedido feito por um formulário?',
    options: [
      'formulário → fetch → rota → validação → resposta → tela',
      'fetch → formulário → validação → tela → rota → resposta',
      'rota → formulário → fetch → tela → validação → resposta',
      'formulário → tela → validação → fetch → resposta → rota',
    ],
    answerIndex: 0,
    explanation:
      'O front lê o formulário e faz o `fetch`; no back, a rota recebe, valida e responde; o front lê a resposta e atualiza a tela.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q02',
    lessonIds: ['fullstack.m01.l01'],
    kind: 'true-false',
    prompt: 'Acrescentar um campo novo na resposta da API costuma quebrar o front que já existe.',
    answer: false,
    explanation:
      'Quem não conhece o campo novo simplesmente o ignora. O que quebra é renomear, remover, mudar o tipo ou o status.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'fullstack.m01.q03',
    lessonIds: ['fullstack.m01.l01'],
    kind: 'multiple-choice',
    prompt:
      'Qual destas mudanças na resposta de `GET /v1/produtos/:id` **quebra** o front que já usa a rota?',
    options: [
      'Renomear o campo `preco` para `valor`',
      'Acrescentar o campo `estoque`',
      'Responder mais rápido',
      'Mudar a ordem das chaves no JSON',
    ],
    answerIndex: 0,
    explanation:
      'O front lê `dados.preco`; depois da mudança ele recebe `undefined`. Campo novo e ordem das chaves não afetam quem já lê os campos antigos.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q04',
    lessonIds: ['fullstack.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Você lançou a rota `/v2/fretes` com um formato novo. Por que manter a `/v1/fretes` funcionando?',
    options: [
      'Porque há clientes (como um app instalado no celular) que ainda usam o formato antigo e não atualizam na hora',
      'Porque o navegador só aceita rotas com v1',
      'Porque duas versões deixam a API mais rápida',
      'Não precisa: é só apagar a v1 no mesmo dia',
    ],
    answerIndex: 0,
    explanation:
      'O site você publica e pronto, mas app instalado depende do usuário atualizar. A v1 fica até ninguém mais usar.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q05',
    lessonIds: ['fullstack.m01.l01'],
    kind: 'true-false',
    prompt:
      'Se o back passa a responder 200 em vez de 201 ao criar um pedido, um front que confere `resposta.status === 201` pode quebrar, mesmo com o JSON igual.',
    answer: true,
    explanation: 'O status é parte do contrato, tanto quanto o formato do JSON.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q06',
    lessonIds: ['fullstack.m01.l01'],
    kind: 'predict-output',
    prompt: 'O front esqueceu de converter o campo do formulário. O que o back recebe?',
    code: `const enviado = { quantidade: '3' }; // veio de input.value
const recebido = JSON.parse(JSON.stringify(enviado));
console.log(typeof recebido.quantidade);
console.log(recebido.quantidade + 1);`,
    expectedOutput: 'string\n31',
    explanation:
      '`input.value` é texto, e o JSON preserva o tipo: o back recebe `"3"`. Somar 1 a um texto concatena. Por isso o contrato diz `number` e o front usa `Number(...)`.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q07',
    lessonIds: ['fullstack.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'O que um contrato de API precisa dizer para cada rota?',
    options: [
      'Método e caminho, formato do corpo enviado e as respostas possíveis (status e formato do JSON)',
      'Só o caminho; o resto cada lado descobre testando',
      'Em que linguagem o back foi escrito',
      'Quantas pessoas trabalham no projeto',
    ],
    answerIndex: 0,
    explanation:
      'Com isso o front sabe o que mandar e o que esperar, e o back sabe o que aceitar e o que devolver.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q08',
    lessonIds: ['fullstack.m01.l01'],
    kind: 'multiple-choice',
    prompt:
      'O front quebra com `TypeError: dados.map is not a function` logo depois de `const dados = await resposta.json()`. Qual a causa mais provável?',
    options: [
      'A API responde um objeto (ex.: `{ itens: [...], total: 5 }`) e o front trata como array',
      'O `fetch` não funciona com arrays',
      'Faltou `JSON.stringify` na resposta',
      'O navegador está sem internet',
    ],
    answerIndex: 0,
    explanation:
      '`map` e `forEach` são de arrays. Antes de culpar o back, confira o contrato: a lista provavelmente está dentro de uma chave.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q09',
    lessonIds: ['fullstack.m01.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para criar a nova versão da rota sem mexer na antiga.',
    code: `app.get('/v1/fretes/:id', handlerAntigo);
app.get('/___/fretes/:id', handlerNovo);`,
    acceptedAnswers: ['v2'],
    explanation:
      'O formato novo ganha um caminho novo (`/v2/...`); a `/v1/...` continua servindo quem ainda usa.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'fullstack.m01.f01',
    lessonIds: ['fullstack.m01.l01'],
    exerciseId: 'fullstack.m01.e01',
    kind: 'multiple-choice',
    prompt: 'Na sua rota v2, por que o `Math.round` é necessário?',
    options: [
      'Porque `89.9 * 100` dá `8990.000000000001`, e centavos precisam ser inteiros',
      'Porque o JSON não aceita números com vírgula',
      'Porque a v1 também arredonda',
      'Para deixar o frete mais barato',
    ],
    answerIndex: 0,
    explanation:
      'Números com casas decimais não são exatos no computador. Arredondar garante um inteiro de centavos.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.f02',
    lessonIds: ['fullstack.m01.l01'],
    exerciseId: 'fullstack.m01.e01',
    kind: 'true-false',
    prompt:
      'No seu código, trocar o `preco` da **v1** para o formato com centavos também teria sido uma boa ideia, já que é o formato novo.',
    answer: false,
    explanation:
      'Isso quebraria o app dos motoristas, que lê `preco` como número. Mudança que quebra vai para a versão nova.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.f03',
    lessonIds: ['fullstack.m01.l01'],
    exerciseId: 'fullstack.m01.e02',
    kind: 'multiple-choice',
    prompt: 'No seu `enviarPedido`, o que acontecia se a quantidade fosse mandada sem `Number(...)`?',
    options: [
      'O back recebia `"2"` (texto) e respondia 400 com "quantidade deve ser um número"',
      'O JSON convertia sozinho para número',
      'O fetch dava erro antes de enviar',
      'Nada: texto e número são a mesma coisa no JSON',
    ],
    answerIndex: 0,
    explanation: '`input.value` é sempre texto, e o JSON leva o tipo como está. O contrato pede `number`.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.f04',
    lessonIds: ['fullstack.m01.l01'],
    exerciseId: 'fullstack.m01.e02',
    kind: 'multiple-choice',
    prompt: 'No seu `enviarPedido`, de onde vem o número do pedido mostrado na tela?',
    options: [
      'De `dados.pedido.id`, na resposta 201 do back',
      'De um contador no front',
      'Do campo `#quantidade`',
      'Do status da resposta',
    ],
    answerIndex: 0,
    explanation: 'Quem cria o pedido (e o id) é o back. O front só mostra o que o contrato devolve.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.f05',
    lessonIds: ['fullstack.m01.l01'],
    exerciseId: 'fullstack.m01.d01',
    kind: 'multiple-choice',
    prompt: 'No `carregarEntregas` com defeito, por que `entregas.forEach` dava erro?',
    options: [
      'Porque `entregas` era o objeto `{ itens, total }`, e objeto não tem `forEach`',
      'Porque a API estava fora do ar',
      'Porque faltava `await` no `fetch`',
      'Porque `forEach` não funciona com `<li>`',
    ],
    answerIndex: 0,
    explanation: 'O contrato sempre disse que a lista vem em `itens`. O bug era do front, não do back.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.f06',
    lessonIds: ['fullstack.m01.l01'],
    exerciseId: 'fullstack.m01.d01',
    kind: 'true-false',
    prompt:
      'No seu conserto, usar `dados.itens.length` no lugar de `dados.total` daria o mesmo número de entregas do dia.',
    answer: false,
    explanation:
      'A API pagina: `itens` traz só 3 entregas, mas o dia tem 5. O total certo é o campo `total` do contrato.',
    difficulty: 2,
  },
];
