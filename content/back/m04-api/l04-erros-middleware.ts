import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { MINI_API } from './mini-api';

const RELATORIO = `async function gerarRelatorio() {
  await new Promise((resolve) => setTimeout(resolve, 5));
  throw new Error('Falha ao conectar em db://admin:senha123@10.0.0.5/pastelaria');
}

module.exports = { gerarRelatorio };
`;

export const lesson: Lesson = {
  id: 'back.m04.l04',
  moduleId: 'back.m04',
  order: 4,
  title: 'Erros, 404/500 e middleware',
  concepts: [
    'try/catch em handlers',
    '500 sem vazar detalhes',
    'middleware',
    'next()',
    'autenticação por token',
    '401',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Em produção, coisa dá errado: o arquivo sumiu, o banco caiu, alguém (você) deixou um bug. Se o erro ' +
        'escapa do handler, o servidor pode cair ou devolver a **pilha de chamadas** inteira para o cliente, com ' +
        'caminhos de pastas, versões e às vezes até senha de banco.\n\n' +
        'O jeito profissional:\n\n' +
        '1. envolva o trabalho do handler em `try/catch`;\n' +
        '2. no `catch`, **registre o detalhe no servidor** (`console.error`), que é onde você vai investigar;\n' +
        '3. responda **500** com uma mensagem **genérica**, sem `err.message` nem `err.stack`.\n\n' +
        'Com código assíncrono, o erro só cai no `catch` se você usar **`await`** dentro do `try`. Um ' +
        '`return promessa` sem `await` sai do `try` antes de a Promise falhar.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `function comTratamento(handler) {
  return function (req) {
    try {
      return handler(req);
    } catch (err) {
      console.log('[log interno]', err.message);
      return { status: 500, body: { erro: 'Erro interno' } };
    }
  };
}

const rotaQuebrada = comTratamento(() => {
  throw new Error('senha do banco: pastel123');
});
const res = rotaQuebrada({ method: 'GET', path: '/relatorio' });
console.log(res.status, res.body.erro);`,
      explanation:
        'O detalhe (com a senha!) fica só no log do servidor. O cliente recebe 500 e uma mensagem genérica. ' +
        '`comTratamento` recebe uma função e devolve outra: dá para "embrulhar" qualquer handler.',
    },
    {
      kind: 'text',
      markdown:
        'Um **middleware** é uma função `(req, res, next)` que roda **antes** das rotas. Ela pode:\n\n' +
        '- fazer algo e chamar `next()` para o pedido seguir (ex.: registrar um log);\n' +
        '- **responder e não chamar `next()`**, cortando o caminho (ex.: barrar quem não tem permissão).\n\n' +
        'Se um middleware não responde **nem** chama `next()`, o pedido fica pendurado até o app desistir. ' +
        'No `mini-api`, isso vira **504** (o famoso "timeout").\n\n' +
        'Middlewares são registrados com `app.use(fn)` e rodam **na ordem** em que foram registrados, então ' +
        'registre-os antes das rotas. E se nada combinar com o caminho, o roteador responde **404**.',
    },
    {
      kind: 'text',
      markdown:
        'Autenticação simples: o app manda um **token** no cabeçalho `authorization`, no formato ' +
        '`Bearer <token>`. Um middleware confere:\n\n' +
        '- sem token ou token errado → **401 Unauthorized** ("quem é você?");\n' +
        '- token certo, mas sem permissão para aquela ação → **403 Forbidden** ("sei quem você é, mas não pode");\n' +
        '- tudo certo → `next()`.\n\n' +
        'Nos exercícios, os cabeçalhos ficam em `req.headers`, com nomes em minúsculas.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const camadas = [
  (req, next) => {
    console.log('LOG', req.method, req.path);
    next();
  },
  (req, next) => {
    if (req.headers.authorization !== 'Bearer segredo') {
      console.log('401 barrado no porteiro');
      return;
    }
    next();
  },
  (req) => console.log('200 rota executada'),
];

function atender(req) {
  let i = 0;
  function next() {
    const camada = camadas[i++];
    if (camada) camada(req, next);
  }
  next();
}

atender({ method: 'GET', path: '/pedidos', headers: { authorization: 'Bearer segredo' } });
atender({ method: 'GET', path: '/pedidos', headers: {} });`,
      explanation:
        'Cada camada decide se chama a próxima. O porteiro barra o segundo pedido e a rota nunca roda para ele.',
    },
  ],
  checkQuestionIds: ['back.m04.q22'],
  exerciseIds: ['back.m04.e06', 'back.m04.e07'],
  debugExerciseIds: ['back.m04.d04'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m04.e06',
    lessonId: 'back.m04.l04',
    kind: 'implement',
    title: 'O airbag dos handlers',
    promptMarkdown:
      'Crie `comTratamento(handler)`, que recebe um handler (pode ser `async`) e devolve **outro** handler ' +
      '`async (req) => ...` que:\n\n' +
      '- chama `handler(req)` e devolve o resultado normalmente se der certo;\n' +
      "- se der erro (inclusive Promise rejeitada), registra no servidor com `console.error('Erro em ' + req.method + ' ' + req.path + ': ' + err.message)`;\n" +
      "- e responde `{ status: 500, body: { erro: 'Erro interno. Tente de novo mais tarde.' } }`, sem nenhum detalhe do erro.",
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function comTratamento(handler) {
  return async function (req) {
    return handler(req);
  };
}
`,
    solution: `function comTratamento(handler) {
  return async function (req) {
    try {
      return await handler(req);
    } catch (err) {
      console.error('Erro em ' + req.method + ' ' + req.path + ': ' + err.message);
      return { status: 500, body: { erro: 'Erro interno. Tente de novo mais tarde.' } };
    }
  };
}
`,
    tests: [
      {
        description: 'handler que funciona devolve a resposta dele',
        code: `const rota = comTratamento(async () => ({ status: 200, body: { ok: true } }));
assert.deepStrictEqual(await rota({ method: 'GET', path: '/saude' }), { status: 200, body: { ok: true } });`,
      },
      {
        description: 'erro comum (throw) vira 500 genérico',
        code: `const rota = comTratamento(() => {
  throw new Error('pedidos.json não encontrado');
});
const res = await rota({ method: 'GET', path: '/pedidos' });
assert.deepStrictEqual(res, { status: 500, body: { erro: 'Erro interno. Tente de novo mais tarde.' } });`,
      },
      {
        description: 'Promise rejeitada também vira 500',
        code: `const rota = comTratamento(async () => {
  await new Promise((r) => setTimeout(r, 5));
  throw new Error('banco fora do ar');
});
const res = await rota({ method: 'POST', path: '/pedidos' });
assert.strictEqual(res.status, 500);`,
      },
      {
        description: 'o detalhe vai para o log do servidor, não para o cliente',
        code: `const rota = comTratamento(async () => {
  throw new Error('senha do banco: pastel123');
});
const res = await rota({ method: 'GET', path: '/relatorio' });
assert.ok(!JSON.stringify(res.body).includes('pastel123'), 'a senha vazou na resposta!');
assert.ok(__errors.some((linha) => linha.includes('GET /relatorio') && linha.includes('senha do banco: pastel123')), 'o erro não foi registrado com console.error');`,
      },
    ],
    hints: [
      'Coloque a chamada ao handler dentro de um `try { ... } catch (err) { ... }`.',
      'Use `return await handler(req)`: sem o `await`, a Promise rejeitada escapa do `try`.',
      'No `catch`, primeiro `console.error(...)`, depois `return { status: 500, body: { erro: ... } }`.',
    ],
    followUpQuestionIds: ['back.m04.f17', 'back.m04.f18'],
    difficulty: 2,
  },
  {
    id: 'back.m04.e07',
    lessonId: 'back.m04.l04',
    kind: 'implement',
    title: 'O porteiro da API',
    promptMarkdown:
      'O painel de pedidos da pastelaria está aberto para qualquer um. Escreva o middleware ' +
      '`exigirToken(req, res, next)`:\n\n' +
      "- sem cabeçalho `authorization`: **401** com `{ erro: 'Token ausente' }`;\n" +
      "- com cabeçalho, mas diferente de `'Bearer ' + TOKEN`: **401** com `{ erro: 'Token inválido' }`;\n" +
      '- com o token certo: chama `next()` para o pedido seguir até a rota.\n\n' +
      'O `app.use(exigirToken)` já está registrado antes das rotas.',
    language: 'js',
    moduleSystem: 'commonjs',
    extraFiles: { 'mini-api.js': MINI_API },
    starterCode: `const { criarApp } = require('./mini-api');

const app = criarApp();
const TOKEN = 'pastel-de-vento-2026';

function exigirToken(req, res, next) {
  // seu código aqui
  next();
}

app.use(exigirToken);

app.get('/pedidos', (req, res) => {
  res.json([{ id: 1, sabor: 'carne' }]);
});
`,
    solution: `const { criarApp } = require('./mini-api');

const app = criarApp();
const TOKEN = 'pastel-de-vento-2026';

function exigirToken(req, res, next) {
  const autorizacao = req.headers.authorization;
  if (!autorizacao) {
    return res.status(401).json({ erro: 'Token ausente' });
  }
  if (autorizacao !== 'Bearer ' + TOKEN) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
  next();
}

app.use(exigirToken);

app.get('/pedidos', (req, res) => {
  res.json([{ id: 1, sabor: 'carne' }]);
});
`,
    tests: [
      {
        description: 'sem token responde 401 "Token ausente"',
        code: `const res = await app.handle({ method: 'GET', path: '/pedidos' });
assert.deepStrictEqual(res, { status: 401, body: { erro: 'Token ausente' } });`,
      },
      {
        description: 'token errado responde 401 "Token inválido"',
        code: `const res = await app.handle({ method: 'GET', path: '/pedidos', headers: { authorization: 'Bearer 123456' } });
assert.deepStrictEqual(res, { status: 401, body: { erro: 'Token inválido' } });`,
      },
      {
        description: 'token sem o "Bearer " também é inválido',
        code: `const res = await app.handle({ method: 'GET', path: '/pedidos', headers: { authorization: 'pastel-de-vento-2026' } });
assert.strictEqual(res.status, 401);`,
      },
      {
        description: 'token certo chega na rota',
        code: `const res = await app.handle({
  method: 'GET',
  path: '/pedidos',
  headers: { authorization: 'Bearer pastel-de-vento-2026' },
});
assert.deepStrictEqual(res, { status: 200, body: [{ id: 1, sabor: 'carne' }] });`,
      },
      {
        description: 'com token certo, rota inexistente continua dando 404',
        code: `const res = await app.handle({
  method: 'GET',
  path: '/segredos',
  headers: { authorization: 'Bearer pastel-de-vento-2026' },
});
assert.strictEqual(res.status, 404);`,
      },
    ],
    hints: [
      'Leia o cabeçalho com `req.headers.authorization`. Se não veio, ele é `undefined`.',
      "Compare com o texto completo: `'Bearer ' + TOKEN`.",
      'Quando barrar, use `return res.status(401).json(...)` para não chegar no `next()`.',
    ],
    followUpQuestionIds: ['back.m04.f19', 'back.m04.f20'],
    difficulty: 2,
  },
  {
    id: 'back.m04.d04',
    lessonId: 'back.m04.l04',
    kind: 'debug',
    title: 'O log que trava e o erro que fofoca',
    promptMarkdown:
      'Duas reclamações da pastelaria depois do último deploy:\n\n' +
      '1. **Nenhuma** rota responde: o app espera, espera e mostra 504. O middleware de log imprime a linha, ' +
      'mas parece que o pedido para nele.\n' +
      '2. Quando o relatório falha, o celular do cliente mostra o endereço e a **senha do banco**.\n\n' +
      'Conserte: o log continua imprimindo `MÉTODO /caminho`, as rotas voltam a responder, e o erro do ' +
      'relatório vira **500** com uma mensagem genérica (registre o detalhe com `console.error`).',
    language: 'js',
    moduleSystem: 'commonjs',
    extraFiles: { 'mini-api.js': MINI_API, 'relatorio.js': RELATORIO },
    starterCode: `const { criarApp } = require('./mini-api');
const { gerarRelatorio } = require('./relatorio');

const app = criarApp();

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.path);
});

app.get('/cardapio', (req, res) => {
  res.json(['carne', 'queijo', 'palmito']);
});

app.get('/relatorio', async (req, res) => {
  try {
    const dados = await gerarRelatorio();
    res.json(dados);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});
`,
    solution: `const { criarApp } = require('./mini-api');
const { gerarRelatorio } = require('./relatorio');

const app = criarApp();

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.path);
  next();
});

app.get('/cardapio', (req, res) => {
  res.json(['carne', 'queijo', 'palmito']);
});

app.get('/relatorio', async (req, res) => {
  try {
    const dados = await gerarRelatorio();
    res.json(dados);
  } catch (err) {
    console.error('Erro no relatório: ' + err.message);
    res.status(500).json({ erro: 'Erro interno. Tente de novo mais tarde.' });
  }
});
`,
    tests: [
      {
        description: 'GET /cardapio responde 200 e o log é impresso',
        code: `const res = await app.handle({ method: 'GET', path: '/cardapio' });
assert.deepStrictEqual(res, { status: 200, body: ['carne', 'queijo', 'palmito'] });
assert.ok(__logs.includes('GET /cardapio'), 'o log "GET /cardapio" sumiu');`,
      },
      {
        description: 'rota que não existe responde 404 (não 504)',
        code: `const res = await app.handle({ method: 'GET', path: '/pastel-de-vento' });
assert.strictEqual(res.status, 404);`,
      },
      {
        description: 'falha no relatório vira 500 sem vazar a senha',
        code: `const res = await app.handle({ method: 'GET', path: '/relatorio' });
assert.strictEqual(res.status, 500);
const corpo = JSON.stringify(res.body);
assert.ok(!corpo.includes('senha123') && !corpo.includes('db://'), 'a resposta ainda mostra detalhes do banco: ' + corpo);`,
      },
    ],
    hints: [
      'Um middleware que não responde precisa passar a vez. Qual função ele recebe para isso?',
      'No `catch` do relatório, troque `err.message` por uma mensagem genérica e mande o detalhe para `console.error`.',
    ],
    followUpQuestionIds: ['back.m04.f21', 'back.m04.f22'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m04.q22',
    lessonIds: ['back.m04.l04'],
    kind: 'multiple-choice',
    prompt: 'O que um middleware precisa fazer para o pedido seguir até a rota?',
    options: ['Chamar `next()`', 'Dar `return true`', 'Chamar `res.json()`', 'Nada, a rota roda sozinha'],
    answerIndex: 0,
    explanation:
      '`next()` passa a vez para a próxima camada. Chamar `res.json()` responde e encerra o caminho.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q23',
    lessonIds: ['back.m04.l04'],
    kind: 'multiple-choice',
    prompt: 'O app chamou o painel de pedidos sem mandar token nenhum. Qual status combina?',
    options: ['401', '404', '500', '201'],
    answerIndex: 0,
    explanation:
      '401 Unauthorized: a API não sabe quem está pedindo. 403 seria para quem se identificou mas não pode.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q24',
    lessonIds: ['back.m04.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function handler() {
  throw new Error('arquivo pedidos.json sumiu');
}
function seguro(req) {
  try {
    return handler(req);
  } catch (err) {
    return { status: 500, body: { erro: 'Erro interno' } };
  }
}
const res = seguro({});
console.log(res.status, res.body.erro);`,
    expectedOutput: '500 Erro interno',
    explanation: 'O `throw` cai no `catch`, que devolve a resposta genérica. O nome do arquivo não aparece.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q25',
    lessonIds: ['back.m04.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const ordem = [];
const camadas = [
  (next) => {
    ordem.push('log');
    next();
  },
  (next) => {
    ordem.push('token');
    next();
  },
  () => {
    ordem.push('rota');
  },
];
let i = 0;
function next() {
  const camada = camadas[i++];
  if (camada) camada(next);
}
next();
console.log(ordem.join(' > '));`,
    expectedOutput: 'log > token > rota',
    explanation: 'Cada camada chama `next()`, que roda a seguinte, na ordem em que foram registradas.',
    difficulty: 2,
  },
  {
    id: 'back.m04.q26',
    lessonIds: ['back.m04.l04'],
    kind: 'true-false',
    prompt:
      'Dentro de uma função `async`, um `try { return buscarNoBanco(); } catch { ... }` (sem `await`) pega o erro ' +
      'quando a Promise de `buscarNoBanco` rejeita.',
    answer: false,
    explanation:
      'Sem `await`, a Promise é devolvida e o `try` já terminou quando ela falha. Use `return await buscarNoBanco()`.',
    difficulty: 3,
  },
  {
    id: 'back.m04.q27',
    lessonIds: ['back.m04.l04'],
    kind: 'multiple-choice',
    prompt: 'Por que não mandar `err.stack` (ou `err.message`) para o cliente num erro 500?',
    options: [
      'Porque deixa a resposta lenta',
      'Porque pode revelar caminhos, versões e senhas, e o cliente não tem o que fazer com isso',
      'Porque o JSON não aceita textos longos',
      'Porque o status 500 não pode ter corpo',
    ],
    answerIndex: 1,
    explanation: 'O detalhe ajuda quem quer atacar e não ajuda o usuário. Ele vai para o log do servidor.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q28',
    lessonIds: ['back.m04.l04'],
    kind: 'fill-blank',
    prompt: 'Complete o registro de um middleware que roda antes de todas as rotas.',
    code: 'app.___(registrarLog);',
    acceptedAnswers: ['use'],
    explanation: '`app.use(fn)` registra um middleware, que roda para qualquer método e caminho.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q29',
    lessonIds: ['back.m04.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `async function buscar() {
  throw new Error('timeout no banco');
}
async function rota() {
  try {
    await buscar();
    return 200;
  } catch (err) {
    return 500;
  }
}
rota().then((status) => console.log('status', status));`,
    expectedOutput: 'status 500',
    explanation: 'Com `await`, a rejeição de `buscar()` cai no `catch`, que devolve 500.',
    difficulty: 2,
  },
  {
    id: 'back.m04.f17',
    lessonIds: ['back.m04.l04'],
    exerciseId: 'back.m04.e06',
    kind: 'multiple-choice',
    prompt:
      'Na sua `comTratamento`, por que `return await handler(req)` e não só `return handler(req)` dentro do `try`?',
    options: [
      'Sem `await`, uma Promise rejeitada escapa do `try` e o `catch` não roda',
      'Sem `await`, o handler roda duas vezes',
      'O `await` deixa o código mais rápido',
      'Tanto faz, os dois pegam o erro',
    ],
    answerIndex: 0,
    explanation:
      'O `await` faz a falha da Promise acontecer **dentro** do `try`, onde o `catch` consegue pegá-la.',
    difficulty: 2,
  },
  {
    id: 'back.m04.f18',
    lessonIds: ['back.m04.l04'],
    exerciseId: 'back.m04.e06',
    kind: 'true-false',
    prompt: 'A sua `comTratamento` manda o `err.message` para o cliente, no corpo da resposta 500.',
    answer: false,
    explanation:
      'O `err.message` vai só para o `console.error` (log do servidor). O cliente recebe a mensagem genérica.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f19',
    lessonIds: ['back.m04.l04'],
    exerciseId: 'back.m04.e07',
    kind: 'multiple-choice',
    prompt: 'No seu `exigirToken`, o que acontece com a rota `GET /pedidos` quando o token está errado?',
    options: [
      'Ela nunca roda: o middleware responde 401 e não chama `next()`',
      'Ela roda, mas devolve uma lista vazia',
      'Ela roda e depois o middleware troca o status para 401',
      'O app recebe 504',
    ],
    answerIndex: 0,
    explanation: 'O `return res.status(401).json(...)` responde e sai da função antes do `next()`.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f20',
    lessonIds: ['back.m04.l04'],
    exerciseId: 'back.m04.e07',
    kind: 'fill-blank',
    prompt: 'Complete a resposta do seu porteiro para um token errado.',
    code: "return res.status(___).json({ erro: 'Token inválido' });",
    acceptedAnswers: ['401'],
    explanation: '401 Unauthorized: o token não identifica ninguém.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f21',
    lessonIds: ['back.m04.l04'],
    exerciseId: 'back.m04.d04',
    kind: 'multiple-choice',
    prompt: 'Por que todas as rotas davam 504 antes do seu conserto?',
    options: [
      'O middleware de log não chamava `next()`, então o pedido nunca chegava nas rotas',
      'O `console.log` trava o servidor',
      'As rotas estavam registradas com o método errado',
      'Faltava `await` no `app.use`',
    ],
    answerIndex: 0,
    explanation: 'Middleware que não responde nem chama `next()` deixa o pedido pendurado até o timeout.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f22',
    lessonIds: ['back.m04.l04'],
    exerciseId: 'back.m04.d04',
    kind: 'true-false',
    prompt:
      'Mandar `err.message` para o cliente, como o `/relatorio` fazia, é seguro desde que o status seja 500.',
    answer: false,
    explanation: 'O status não esconde nada: a mensagem tinha usuário, senha e endereço do banco.',
    difficulty: 1,
  },
];
