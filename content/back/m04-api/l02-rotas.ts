import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { MINI_API } from './mini-api';

export const lesson: Lesson = {
  id: 'back.m04.l02',
  moduleId: 'back.m04',
  order: 2,
  title: 'Rotas: caminho, parâmetros e query string',
  concepts: ['roteador', 'parâmetros de rota', 'query string', 'CRUD em memória', 'status 204'],
  sections: [
    {
      kind: 'text',
      markdown:
        'Com uma rota só, um `if` no método resolve. Mas o cliente sempre quer "só mais um endpoint", e logo ' +
        'você tem dez. O **roteador** é uma tabela que liga **método + caminho** a um **handler**:\n\n' +
        '- `GET /pedidos` → lista os pedidos;\n' +
        '- `POST /pedidos` → cria um pedido;\n' +
        '- e, se nada combinar, **404**.\n\n' +
        'Repare: `GET /pedidos` e `POST /pedidos` têm o mesmo caminho, mas são rotas **diferentes**. O método ' +
        'faz parte da chave.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const rotas = {
  'GET /cardapio': () => ({ status: 200, body: ['carne', 'queijo'] }),
  'GET /horario': () => ({ status: 200, body: { abre: '10h', fecha: '22h' } }),
};

function rotear(req) {
  const handler = rotas[req.method + ' ' + req.path];
  if (!handler) return { status: 404, body: { erro: 'Rota não encontrada' } };
  return handler(req);
}

console.log(rotear({ method: 'GET', path: '/horario' }).body.fecha);
console.log(rotear({ method: 'POST', path: '/cardapio' }).status);`,
      explanation: 'A chave junta método e caminho. `POST /cardapio` não está na tabela, então dá 404.',
    },
    {
      kind: 'text',
      markdown:
        'E o pedido 7? E o 8? Não dá para cadastrar uma rota por pedido. Para isso existem os **parâmetros de ' +
        'rota**: no padrão `/pedidos/:id`, o `:id` é um "buraco" que aceita qualquer valor. Para o caminho ' +
        "`/pedidos/42`, o roteador entrega `req.params = { id: '42' }`.\n\n" +
        'Já a **query string** (o que vem depois do `?`) serve para filtros e opções: ' +
        "`/pedidos?bairro=Centro&status=aberto` vira `req.query = { bairro: 'Centro', status: 'aberto' }`.\n\n" +
        "**Atenção:** parâmetros e query chegam **sempre como texto**. O `id` de `/pedidos/42` é `'42'`, " +
        'não `42`. Se seus ids são números, converta com `Number(req.params.id)` antes de comparar com `===`.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const padrao = '/pedidos/:id'.split('/');
const caminho = '/pedidos/42'.split('/');
console.log(padrao[2], '->', caminho[2]);

const id = caminho[2];
console.log(typeof id, id === 42, Number(id) === 42);`,
      explanation:
        'Quebrando os dois por `/`, cada pedaço do padrão se alinha com um pedaço do caminho. O valor chega como ' +
        'texto; só `Number(id)` bate com o número 42.',
    },
    {
      kind: 'text',
      markdown:
        'Nos exercícios você vai usar o `mini-api.js`, um "Express de bolso" que já vem no projeto:\n\n' +
        "```js\nconst { criarApp } = require('./mini-api');\nconst app = criarApp();\n\n" +
        "app.get('/pedidos/:id', (req, res) => {\n" +
        '  // req.params, req.query, req.body, req.headers\n' +
        '  res.status(200).json({ id: req.params.id });\n' +
        '});\n\n' +
        "const resposta = await app.handle({ method: 'GET', path: '/pedidos/7' });\n" +
        "// { status: 200, body: { id: '7' } }\n```\n\n" +
        '- `app.get`, `app.post`, `app.put`, `app.delete` registram rotas;\n' +
        '- `res.status(codigo)` define o status (o padrão é 200) e `res.json(dados)` envia o corpo;\n' +
        '- `res.status(204).end()` responde **204 No Content**: deu certo e não há nada para mostrar ' +
        '(comum depois de um `DELETE`);\n' +
        '- se nenhuma rota combinar, o `mini-api` responde 404 sozinho.\n\n' +
        'Com isso dá para montar um **CRUD** (Create, Read, Update, Delete) guardando os dados num array em ' +
        'memória. Quando o servidor reinicia, os dados somem, mas para começar está ótimo.',
    },
  ],
  checkQuestionIds: ['back.m04.q08'],
  exerciseIds: ['back.m04.e02', 'back.m04.e03'],
  debugExerciseIds: ['back.m04.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m04.e02',
    lessonId: 'back.m04.l02',
    kind: 'implement',
    title: 'Casar a rota com o caminho',
    promptMarkdown:
      'Todo roteador tem, lá no fundo, uma função que descobre se um caminho combina com um padrão. Escreva ' +
      'a sua: `casarRota(padrao, caminho)`.\n\n' +
      "- Se combinar, devolve um objeto com os parâmetros: `casarRota('/pedidos/:id', '/pedidos/42')` → " +
      "`{ id: '42' }`.\n" +
      '- Padrão sem parâmetros que combina devolve `{}`.\n' +
      '- Se não combinar (pedaço fixo diferente ou quantidade de pedaços diferente), devolve `null`.\n\n' +
      'Os valores ficam como texto, igualzinho ao Express.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function casarRota(padrao, caminho) {
  // dica: quebre os dois com split('/')
  return null;
}
`,
    solution: `function casarRota(padrao, caminho) {
  const partesPadrao = padrao.split('/');
  const partesCaminho = caminho.split('/');
  if (partesPadrao.length !== partesCaminho.length) return null;

  const params = {};
  for (let i = 0; i < partesPadrao.length; i++) {
    const parte = partesPadrao[i];
    if (parte.startsWith(':')) {
      params[parte.slice(1)] = partesCaminho[i];
    } else if (parte !== partesCaminho[i]) {
      return null;
    }
  }
  return params;
}
`,
    tests: [
      {
        description: "'/pedidos/:id' com '/pedidos/42' dá { id: '42' }",
        code: "assert.deepStrictEqual(casarRota('/pedidos/:id', '/pedidos/42'), { id: '42' });",
      },
      {
        description: 'funciona com dois parâmetros',
        code: "assert.deepStrictEqual(casarRota('/clientes/:cliente/pedidos/:id', '/clientes/ze/pedidos/7'), { cliente: 'ze', id: '7' });",
      },
      {
        description: 'padrão sem parâmetros que combina devolve {}',
        code: "assert.deepStrictEqual(casarRota('/cardapio', '/cardapio'), {});",
      },
      {
        description: 'pedaço fixo diferente devolve null',
        code: "assert.strictEqual(casarRota('/pedidos/:id', '/cardapio/42'), null);",
      },
      {
        description: 'quantidade de pedaços diferente devolve null',
        code: `assert.strictEqual(casarRota('/pedidos/:id', '/pedidos'), null);
assert.strictEqual(casarRota('/pedidos/:id', '/pedidos/42/itens'), null);`,
      },
    ],
    hints: [
      "`'/pedidos/42'.split('/')` dá `['', 'pedidos', '42']`. Compare os dois arrays posição por posição.",
      'Se os arrays têm tamanhos diferentes, já pode devolver `null`.',
      'Pedaço que começa com `:` é parâmetro: guarde `params[parte.slice(1)] = valor`. Os outros precisam ser iguais.',
    ],
    followUpQuestionIds: ['back.m04.f05', 'back.m04.f06'],
    difficulty: 2,
  },
  {
    id: 'back.m04.e03',
    lessonId: 'back.m04.l02',
    kind: 'implement',
    title: 'CRUD de pedidos da pastelaria',
    promptMarkdown:
      'A Pastelaria Massa Fina quer o back-end do delivery. Usando o `mini-api`, complete as rotas (o ' +
      '`GET /pedidos` já está pronto):\n\n' +
      '- `GET /pedidos/:id`: responde 200 com o pedido; se não existir, **404** com ' +
      "`{ erro: 'Pedido não encontrado' }`.\n" +
      "- `POST /pedidos`: cria `{ id, sabor, bairro, status: 'aberto' }` com `id = proximoId++` e `sabor` e " +
      '`bairro` de `req.body`. Responde **201** com o pedido.\n' +
      '- `DELETE /pedidos/:id`: remove o pedido e responde **204** (`res.status(204).end()`); se não existir, ' +
      '**404** com a mesma mensagem.\n\n' +
      'Lembre que `req.params.id` é texto e os ids da lista são números.',
    language: 'js',
    moduleSystem: 'commonjs',
    extraFiles: { 'mini-api.js': MINI_API },
    starterCode: `const { criarApp } = require('./mini-api');

const app = criarApp();
const pedidos = [
  { id: 1, sabor: 'carne', bairro: 'Centro', status: 'aberto' },
  { id: 2, sabor: 'queijo', bairro: 'Vila Yara', status: 'entregue' },
];
let proximoId = 3;

app.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

// GET /pedidos/:id

// POST /pedidos

// DELETE /pedidos/:id
`,
    solution: `const { criarApp } = require('./mini-api');

const app = criarApp();
const pedidos = [
  { id: 1, sabor: 'carne', bairro: 'Centro', status: 'aberto' },
  { id: 2, sabor: 'queijo', bairro: 'Vila Yara', status: 'entregue' },
];
let proximoId = 3;

app.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

app.get('/pedidos/:id', (req, res) => {
  const pedido = pedidos.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });
  res.json(pedido);
});

app.post('/pedidos', (req, res) => {
  const novo = { id: proximoId++, sabor: req.body.sabor, bairro: req.body.bairro, status: 'aberto' };
  pedidos.push(novo);
  res.status(201).json(novo);
});

app.delete('/pedidos/:id', (req, res) => {
  const indice = pedidos.findIndex((p) => p.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ erro: 'Pedido não encontrado' });
  pedidos.splice(indice, 1);
  res.status(204).end();
});
`,
    tests: [
      {
        description: 'GET /pedidos/2 responde 200 com o pedido 2',
        code: `const res = await app.handle({ method: 'GET', path: '/pedidos/2' });
assert.deepStrictEqual(res, {
  status: 200,
  body: { id: 2, sabor: 'queijo', bairro: 'Vila Yara', status: 'entregue' },
});`,
      },
      {
        description: 'GET /pedidos/99 responde 404',
        code: `const res = await app.handle({ method: 'GET', path: '/pedidos/99' });
assert.deepStrictEqual(res, { status: 404, body: { erro: 'Pedido não encontrado' } });`,
      },
      {
        description: 'POST /pedidos cria o pedido 3 com status "aberto" e responde 201',
        code: `const res = await app.handle({ method: 'POST', path: '/pedidos', body: { sabor: 'palmito', bairro: 'Km 18' } });
assert.deepStrictEqual(res, {
  status: 201,
  body: { id: 3, sabor: 'palmito', bairro: 'Km 18', status: 'aberto' },
});
const lista = await app.handle({ method: 'GET', path: '/pedidos' });
assert.strictEqual(lista.body.length, 3);`,
      },
      {
        description: 'dois POSTs seguidos ganham ids 3 e 4',
        code: `await app.handle({ method: 'POST', path: '/pedidos', body: { sabor: 'carne', bairro: 'Bela Vista' } });
const res = await app.handle({ method: 'POST', path: '/pedidos', body: { sabor: 'queijo', bairro: 'Quitaúna' } });
assert.strictEqual(res.body.id, 4);`,
      },
      {
        description: 'DELETE /pedidos/1 responde 204 e o pedido some',
        code: `const res = await app.handle({ method: 'DELETE', path: '/pedidos/1' });
assert.deepStrictEqual(res, { status: 204, body: null });
const depois = await app.handle({ method: 'GET', path: '/pedidos/1' });
assert.strictEqual(depois.status, 404);`,
      },
      {
        description: 'DELETE de pedido que não existe responde 404',
        code: `const res = await app.handle({ method: 'DELETE', path: '/pedidos/42' });
assert.deepStrictEqual(res, { status: 404, body: { erro: 'Pedido não encontrado' } });`,
      },
    ],
    hints: [
      'Para buscar: `pedidos.find((p) => p.id === Number(req.params.id))`.',
      'Para não seguir depois do 404, use `return res.status(404).json(...)`.',
      'Para remover, descubra o índice com `findIndex` (dá `-1` se não achar) e use `pedidos.splice(indice, 1)`.',
    ],
    followUpQuestionIds: ['back.m04.f07', 'back.m04.f08'],
    difficulty: 3,
  },
  {
    id: 'back.m04.d02',
    lessonId: 'back.m04.l02',
    kind: 'debug',
    title: 'O pedido que nunca é encontrado',
    promptMarkdown:
      'O freela anterior largou essa API pela metade. Duas reclamações da pastelaria:\n\n' +
      '1. `GET /pedidos/1` responde 404, mas o pedido 1 está lá na lista!\n' +
      '2. `GET /pedidos` sem filtro devolve uma lista **vazia**. Sem `?bairro=`, deveria devolver todos; com ' +
      '`?bairro=Centro`, só os do Centro.\n\n' +
      'Conserte as duas rotas.',
    language: 'js',
    moduleSystem: 'commonjs',
    extraFiles: { 'mini-api.js': MINI_API },
    starterCode: `const { criarApp } = require('./mini-api');

const app = criarApp();
const pedidos = [
  { id: 1, sabor: 'carne', bairro: 'Centro' },
  { id: 2, sabor: 'queijo', bairro: 'Km 18' },
  { id: 3, sabor: 'palmito', bairro: 'Centro' },
];

app.get('/pedidos', (req, res) => {
  const filtrados = pedidos.filter((p) => p.bairro === req.query.bairro);
  res.json(filtrados);
});

app.get('/pedidos/:id', (req, res) => {
  const pedido = pedidos.find((p) => p.id === req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });
  res.json(pedido);
});
`,
    solution: `const { criarApp } = require('./mini-api');

const app = criarApp();
const pedidos = [
  { id: 1, sabor: 'carne', bairro: 'Centro' },
  { id: 2, sabor: 'queijo', bairro: 'Km 18' },
  { id: 3, sabor: 'palmito', bairro: 'Centro' },
];

app.get('/pedidos', (req, res) => {
  if (!req.query.bairro) return res.json(pedidos);
  const filtrados = pedidos.filter((p) => p.bairro === req.query.bairro);
  res.json(filtrados);
});

app.get('/pedidos/:id', (req, res) => {
  const pedido = pedidos.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });
  res.json(pedido);
});
`,
    tests: [
      {
        description: 'GET /pedidos/1 encontra o pedido 1',
        code: `const res = await app.handle({ method: 'GET', path: '/pedidos/1' });
assert.deepStrictEqual(res, { status: 200, body: { id: 1, sabor: 'carne', bairro: 'Centro' } });`,
      },
      {
        description: 'GET /pedidos/7 continua dando 404',
        code: `const res = await app.handle({ method: 'GET', path: '/pedidos/7' });
assert.strictEqual(res.status, 404);`,
      },
      {
        description: 'GET /pedidos sem filtro devolve os 3 pedidos',
        code: `const res = await app.handle({ method: 'GET', path: '/pedidos' });
assert.strictEqual(res.status, 200);
assert.strictEqual(res.body.length, 3);`,
      },
      {
        description: 'GET /pedidos?bairro=Centro devolve os pedidos 1 e 3',
        code: `const res = await app.handle({ method: 'GET', path: '/pedidos', query: { bairro: 'Centro' } });
assert.deepStrictEqual(res.body.map((p) => p.id), [1, 3]);`,
      },
    ],
    hints: [
      'O que `typeof req.params.id` devolve? E `typeof p.id`? O `===` não converte tipos.',
      'Sem `?bairro=`, `req.query.bairro` é `undefined`, e nenhum pedido tem bairro `undefined`.',
      'Se não veio filtro, responda a lista inteira antes de filtrar.',
    ],
    followUpQuestionIds: ['back.m04.f09', 'back.m04.f10'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m04.q08',
    lessonIds: ['back.m04.l02'],
    kind: 'multiple-choice',
    prompt: 'Na rota `/pedidos/:id`, o que é o `:id`?',
    options: [
      'Um parâmetro: um "buraco" que aceita qualquer valor naquela posição do caminho',
      'Um texto fixo: o caminho precisa ter literalmente ":id"',
      'Um filtro da query string',
      'O id do usuário logado',
    ],
    answerIndex: 0,
    explanation: "Para `/pedidos/42`, o roteador entrega `req.params.id` valendo `'42'`.",
    difficulty: 1,
  },
  {
    id: 'back.m04.q09',
    lessonIds: ['back.m04.l02'],
    kind: 'multiple-choice',
    prompt: 'O app chama `GET /pedidos?bairro=Centro&status=aberto`. O que chega em `req.query`?',
    options: [
      "{ bairro: 'Centro', status: 'aberto' }",
      "{ id: 'Centro' }",
      "'bairro=Centro&status=aberto'",
      '{}',
    ],
    answerIndex: 0,
    explanation:
      'Cada par `chave=valor` depois do `?` vira uma propriedade de `req.query`, sempre como texto.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q10',
    lessonIds: ['back.m04.l02'],
    kind: 'true-false',
    prompt: '`GET /pedidos` e `POST /pedidos` têm o mesmo caminho, então caem no mesmo handler.',
    answer: false,
    explanation: 'O método faz parte da rota. São duas rotas diferentes: uma lista, a outra cria.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q11',
    lessonIds: ['back.m04.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const rotas = { 'GET /pedidos': 'listar', 'POST /pedidos': 'criar' };
function qualHandler(metodo, caminho) {
  return rotas[metodo + ' ' + caminho] || 'nenhum (404)';
}
console.log(qualHandler('POST', '/pedidos'));
console.log(qualHandler('PUT', '/pedidos'));`,
    expectedOutput: 'criar\nnenhum (404)',
    explanation: "A chave `'PUT /pedidos'` não existe na tabela, então o `||` cai no texto do 404.",
    difficulty: 1,
  },
  {
    id: 'back.m04.q12',
    lessonIds: ['back.m04.l02'],
    kind: 'multiple-choice',
    prompt: 'O cliente quer trocar todos os dados do pedido 5. Qual rota REST combina?',
    options: ['GET /pedidos/5', 'POST /pedidos', 'PUT /pedidos/5', 'DELETE /pedidos/5'],
    answerIndex: 2,
    explanation: '`PUT` atualiza o recurso apontado pelo caminho, aqui o pedido 5.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q13',
    lessonIds: ['back.m04.l02'],
    kind: 'fill-blank',
    prompt: 'Os ids da lista são números. Complete a conversão do parâmetro da rota.',
    code: `const id = ___(req.params.id);
const pedido = pedidos.find((p) => p.id === id);`,
    acceptedAnswers: ['Number', 'parseInt', 'Number.parseInt'],
    explanation: "Parâmetros chegam como texto. `Number('42')` vira `42` e aí o `===` funciona.",
    difficulty: 1,
  },
  {
    id: 'back.m04.q14',
    lessonIds: ['back.m04.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const pedidos = [
  { id: 1, bairro: 'Centro' },
  { id: 2, bairro: 'Km 18' },
  { id: 3, bairro: 'Centro' },
];
const query = { bairro: 'Centro' };
const achados = pedidos.filter((p) => p.bairro === query.bairro);
console.log(achados.length, achados.map((p) => p.id).join(','));`,
    expectedOutput: '2 1,3',
    explanation: 'O filtro mantém os pedidos 1 e 3, que são do Centro.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f05',
    lessonIds: ['back.m04.l02'],
    exerciseId: 'back.m04.e02',
    kind: 'multiple-choice',
    prompt: "O que a sua `casarRota('/pedidos/:id', '/pedidos/42/itens')` devolve?",
    options: ["{ id: '42' }", "{ id: '42/itens' }", 'null', '{}'],
    answerIndex: 2,
    explanation: 'O caminho tem um pedaço a mais que o padrão. Tamanhos diferentes: não combina.',
    difficulty: 2,
  },
  {
    id: 'back.m04.f06',
    lessonIds: ['back.m04.l02'],
    exerciseId: 'back.m04.e02',
    kind: 'true-false',
    prompt: "Na sua `casarRota('/pedidos/:id', '/pedidos/42')`, o `id` devolvido é o número `42`.",
    answer: false,
    explanation:
      "É o texto `'42'`: a função só recorta pedaços de uma string. Converter é trabalho do handler.",
    difficulty: 1,
  },
  {
    id: 'back.m04.f07',
    lessonIds: ['back.m04.l02'],
    exerciseId: 'back.m04.e03',
    kind: 'multiple-choice',
    prompt: 'Na sua API, o app chama `GET /pedidos/99` e esse pedido não existe. O que ele recebe?',
    options: [
      "{ status: 404, body: { erro: 'Pedido não encontrado' } }",
      '{ status: 200, body: undefined }',
      '{ status: 204, body: null }',
      '{ status: 500, body: null }',
    ],
    answerIndex: 0,
    explanation: 'O `find` devolve `undefined` e o seu handler responde 404 com a mensagem.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f08',
    lessonIds: ['back.m04.l02'],
    exerciseId: 'back.m04.e03',
    kind: 'fill-blank',
    prompt: 'Complete a resposta do seu `POST /pedidos`.',
    code: 'res.status(___).json(novo);',
    acceptedAnswers: ['201'],
    explanation: '201 Created: o pedido foi criado.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f09',
    lessonIds: ['back.m04.l02'],
    exerciseId: 'back.m04.d02',
    kind: 'multiple-choice',
    prompt: 'Por que `p.id === req.params.id` nunca encontrava o pedido?',
    options: [
      'Porque `req.params.id` é texto e `p.id` é número, e o `===` não converte',
      'Porque o `find` só funciona com strings',
      'Porque a rota `/pedidos/:id` nunca é chamada',
      'Porque o id 1 é falsy',
    ],
    answerIndex: 0,
    explanation: "`1 === '1'` é `false`. Converter com `Number` resolve.",
    difficulty: 1,
  },
  {
    id: 'back.m04.f10',
    lessonIds: ['back.m04.l02'],
    exerciseId: 'back.m04.d02',
    kind: 'predict-output',
    prompt: 'Lembrando do bug que você consertou: o que este código imprime?',
    code: `const query = {};
console.log(query.bairro);
console.log('Centro' === query.bairro);`,
    expectedOutput: 'undefined\nfalse',
    explanation:
      'Sem filtro, `query.bairro` é `undefined`, e nenhum bairro é igual a `undefined`. Por isso a lista vinha vazia.',
    difficulty: 1,
  },
];
