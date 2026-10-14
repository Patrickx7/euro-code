import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { MINI_API } from './mini-api';

const VALIDACAO = `function validarPedido(body) {
  const dados = body || {};
  const erros = [];
  if (typeof dados.sabor !== 'string' || dados.sabor.trim() === '') {
    erros.push('sabor é obrigatório');
  }
  if (!Number.isInteger(dados.quantidade) || dados.quantidade < 1 || dados.quantidade > 50) {
    erros.push('quantidade deve ser um inteiro entre 1 e 50');
  }
  if (typeof dados.bairro !== 'string' || dados.bairro.trim() === '') {
    erros.push('bairro é obrigatório');
  }
  return erros;
}

module.exports = { validarPedido };
`;

export const lesson: Lesson = {
  id: 'back.m04.l03',
  moduleId: 'back.m04',
  order: 3,
  title: 'Validação: não confie no cliente',
  concepts: ['validação de entrada', 'campos obrigatórios', 'checagem de tipos', '400 com lista de erros'],
  sections: [
    {
      kind: 'text',
      markdown:
        'O corpo da requisição vem **de fora**: do app, de um formulário, de alguém testando com ferramenta de ' +
        'API ou do sobrinho do cliente que "mexe com computador". Sua API não pode supor que os dados vêm ' +
        'certos. Antes de salvar qualquer coisa, **valide**:\n\n' +
        "- **obrigatórios**: o campo veio? Texto só com espaços não vale (`texto.trim() === ''`);\n" +
        '- **tipos**: `typeof quantidade === \'number\'`? `"3"` (texto) não é `3` (número);\n' +
        '- **faixas e formatos**: `Number.isInteger(q)`, entre 1 e 50, data no formato certo...\n\n' +
        'Se algo estiver errado, responda **400** com uma **lista** de erros: `{ erros: [...] }`. Mandar todos ' +
        'de uma vez poupa o app de ir e voltar cinco vezes para descobrir cinco problemas.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `function validarCliente(body) {
  const erros = [];
  if (typeof body.nome !== 'string' || body.nome.trim() === '') {
    erros.push('nome é obrigatório');
  }
  if (typeof body.telefone !== 'string') {
    erros.push('telefone deve ser texto');
  }
  return erros;
}

console.log(validarCliente({ nome: 'Dona Cida', telefone: '11 99999-0000' }).length);
console.log(validarCliente({ nome: '   ', telefone: 11999990000 }).join(' | '));`,
      explanation:
        'A função junta todos os problemas num array. Array vazio = dados válidos. Nome só com espaços também é ' +
        'reprovado.',
    },
    {
      kind: 'text',
      markdown:
        '**Não confiar no cliente** vai além de checar tipos:\n\n' +
        '- **Preço e total quem calcula é o servidor.** Se a API aceitar `preco` no corpo, alguém manda ' +
        '`preco: 0.01` e leva 50 pastéis por 50 centavos.\n' +
        '- **Escolha os campos que você salva.** Salvar `req.body` inteiro deixa o cliente mandar ' +
        "`status: 'pago'` ou `id: 1` e bagunçar seus dados. Monte o objeto campo a campo.\n" +
        '- **Validar no app não basta.** A validação do front é conforto para o usuário; a do back-end é a ' +
        'que protege. Requisições podem ser feitas sem passar pelo app.\n\n' +
        'E cuidado com checagens "preguiçosas" como `if (!body.desconto)`: o número `0` é falsy, então um ' +
        'desconto zero válido seria tratado como campo ausente.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const precos = { carne: 9, queijo: 8 };
const bodyDoEspertinho = { sabor: 'carne', quantidade: 10, preco: 0.01, status: 'pago' };

const pedido = {
  sabor: bodyDoEspertinho.sabor,
  quantidade: bodyDoEspertinho.quantidade,
  total: precos[bodyDoEspertinho.sabor] * bodyDoEspertinho.quantidade,
  status: 'aberto',
};
console.log(pedido.total, pedido.status);`,
      explanation:
        'O servidor ignora `preco` e `status` que vieram do cliente: o total sai da tabela de preços do servidor e ' +
        'todo pedido nasce "aberto".',
    },
  ],
  checkQuestionIds: ['back.m04.q15'],
  exerciseIds: ['back.m04.e04', 'back.m04.e05'],
  debugExerciseIds: ['back.m04.d03'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m04.e04',
    lessonId: 'back.m04.l03',
    kind: 'implement',
    title: 'O validador de pedidos',
    promptMarkdown:
      'Crie `validarPedido(body)`, que devolve um **array** com todos os erros encontrados, nesta ordem ' +
      '(array vazio se estiver tudo certo):\n\n' +
      "1. `sabor` precisa ser texto não vazio → `'sabor é obrigatório'`\n" +
      "2. `quantidade` precisa ser um **número inteiro** de 1 a 50 → `'quantidade deve ser um inteiro entre 1 e 50'`\n" +
      "3. `bairro` precisa ser texto não vazio → `'bairro é obrigatório'`\n\n" +
      'Se o corpo nem vier (`undefined`), trate como objeto vazio. Texto só com espaços conta como vazio.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function validarPedido(body) {
  const erros = [];
  // seu código aqui
  return erros;
}
`,
    solution: VALIDACAO.replace('\nmodule.exports = { validarPedido };\n', ''),
    tests: [
      {
        description: 'pedido válido não tem erros',
        code: "assert.deepStrictEqual(validarPedido({ sabor: 'carne', quantidade: 2, bairro: 'Centro' }), []);",
      },
      {
        description: 'corpo vazio tem os três erros, na ordem',
        code: `assert.deepStrictEqual(validarPedido({}), [
  'sabor é obrigatório',
  'quantidade deve ser um inteiro entre 1 e 50',
  'bairro é obrigatório',
]);`,
      },
      {
        description: 'corpo undefined não quebra e tem os três erros',
        code: 'assert.strictEqual(validarPedido(undefined).length, 3);',
      },
      {
        description: 'quantidade como texto ("3") é recusada',
        code: `assert.deepStrictEqual(validarPedido({ sabor: 'carne', quantidade: '3', bairro: 'Centro' }), [
  'quantidade deve ser um inteiro entre 1 e 50',
]);`,
      },
      {
        description: 'quantidade 0, 2.5 e 51 são recusadas; 1 e 50 passam',
        code: `for (const q of [0, 2.5, 51]) {
  assert.strictEqual(validarPedido({ sabor: 'carne', quantidade: q, bairro: 'Centro' }).length, 1, 'quantidade ' + q);
}
for (const q of [1, 50]) {
  assert.deepStrictEqual(validarPedido({ sabor: 'carne', quantidade: q, bairro: 'Centro' }), [], 'quantidade ' + q);
}`,
      },
      {
        description: 'sabor e bairro só com espaços são recusados',
        code: `assert.deepStrictEqual(validarPedido({ sabor: '   ', quantidade: 1, bairro: ' ' }), [
  'sabor é obrigatório',
  'bairro é obrigatório',
]);`,
      },
    ],
    hints: [
      'Comece com `const dados = body || {};` e leia os campos de `dados`.',
      "Para texto: `typeof dados.sabor !== 'string' || dados.sabor.trim() === ''`.",
      'Para a quantidade: `Number.isInteger(q)` já recusa texto e números quebrados; depois confira a faixa.',
      'Não use `return` no meio: cada `if` só faz `erros.push(...)`.',
    ],
    followUpQuestionIds: ['back.m04.f11', 'back.m04.f12'],
    difficulty: 2,
  },
  {
    id: 'back.m04.e05',
    lessonId: 'back.m04.l03',
    kind: 'implement',
    title: 'POST com validação e sem espertinho',
    promptMarkdown:
      'O `POST /pedidos` atual salva qualquer coisa que chega. Use o `validarPedido` do arquivo `validacao.js` ' +
      '(já pronto) para consertar:\n\n' +
      '- se houver erros: responda **400** com `{ erros }` (o array devolvido pelo validador) e **não** salve nada;\n' +
      "- se estiver tudo certo: crie `{ id, sabor, quantidade, bairro, status: 'aberto' }`, com `id = proximoId++`, " +
      'salve em `pedidos` e responda **201** com o pedido.\n\n' +
      'Campos extras que o cliente mandar (como `id` ou `status`) devem ser **ignorados**.',
    language: 'js',
    moduleSystem: 'commonjs',
    extraFiles: { 'mini-api.js': MINI_API, 'validacao.js': VALIDACAO },
    starterCode: `const { criarApp } = require('./mini-api');
const { validarPedido } = require('./validacao');

const app = criarApp();
const pedidos = [];
let proximoId = 1;

app.post('/pedidos', (req, res) => {
  pedidos.push(req.body);
  res.status(201).json(req.body);
});
`,
    solution: `const { criarApp } = require('./mini-api');
const { validarPedido } = require('./validacao');

const app = criarApp();
const pedidos = [];
let proximoId = 1;

app.post('/pedidos', (req, res) => {
  const erros = validarPedido(req.body);
  if (erros.length > 0) {
    return res.status(400).json({ erros });
  }
  const { sabor, quantidade, bairro } = req.body;
  const novo = { id: proximoId++, sabor, quantidade, bairro, status: 'aberto' };
  pedidos.push(novo);
  res.status(201).json(novo);
});
`,
    tests: [
      {
        description: 'pedido válido responde 201 com o pedido criado',
        code: `const res = await app.handle({ method: 'POST', path: '/pedidos', body: { sabor: 'queijo', quantidade: 3, bairro: 'Jardim D\\'Abril' } });
assert.deepStrictEqual(res, {
  status: 201,
  body: { id: 1, sabor: 'queijo', quantidade: 3, bairro: "Jardim D'Abril", status: 'aberto' },
});`,
      },
      {
        description: 'pedido inválido responde 400 com a lista de erros',
        code: `const res = await app.handle({ method: 'POST', path: '/pedidos', body: { sabor: 'carne' } });
assert.deepStrictEqual(res, {
  status: 400,
  body: { erros: ['quantidade deve ser um inteiro entre 1 e 50', 'bairro é obrigatório'] },
});`,
      },
      {
        description: 'pedido inválido não é salvo',
        code: `await app.handle({ method: 'POST', path: '/pedidos', body: { quantidade: 999 } });
assert.strictEqual(pedidos.length, 0);`,
      },
      {
        description: 'campos extras do cliente (id, status) são ignorados',
        code: `const res = await app.handle({
  method: 'POST',
  path: '/pedidos',
  body: { sabor: 'carne', quantidade: 1, bairro: 'Centro', id: 999, status: 'entregue', desconto: 100 },
});
assert.deepStrictEqual(res.body, { id: 1, sabor: 'carne', quantidade: 1, bairro: 'Centro', status: 'aberto' });
assert.deepStrictEqual(pedidos, [res.body]);`,
      },
    ],
    hints: [
      'Chame `const erros = validarPedido(req.body)` logo no começo do handler.',
      'Se `erros.length > 0`, faça `return res.status(400).json({ erros })` para o resto não rodar.',
      'Monte o pedido novo pegando só `sabor`, `quantidade` e `bairro` de `req.body`.',
    ],
    followUpQuestionIds: ['back.m04.f13', 'back.m04.f14'],
    difficulty: 2,
  },
  {
    id: 'back.m04.d03',
    lessonId: 'back.m04.l03',
    kind: 'debug',
    title: 'O pastel de um centavo',
    promptMarkdown:
      'A pastelaria descobriu um pedido de 40 pastéis de carne que custou **R$ 0,40**. Alguém percebeu que a ' +
      'API usa o `preco` que vem no corpo da requisição.\n\n' +
      'Conserte o `POST /pedidos`: o `total` deve ser calculado com a tabela `precos` **do servidor** ' +
      '(`preco × quantidade`), ignorando qualquer preço mandado pelo cliente.',
    language: 'js',
    moduleSystem: 'commonjs',
    extraFiles: { 'mini-api.js': MINI_API },
    starterCode: `const { criarApp } = require('./mini-api');

const app = criarApp();
const precos = { carne: 9, queijo: 8, palmito: 11 };

app.post('/pedidos', (req, res) => {
  const { sabor, quantidade, preco } = req.body;
  if (precos[sabor] === undefined) {
    return res.status(400).json({ erros: ['sabor não existe no cardápio'] });
  }
  const total = preco * quantidade;
  res.status(201).json({ sabor, quantidade, total });
});
`,
    solution: `const { criarApp } = require('./mini-api');

const app = criarApp();
const precos = { carne: 9, queijo: 8, palmito: 11 };

app.post('/pedidos', (req, res) => {
  const { sabor, quantidade } = req.body;
  if (precos[sabor] === undefined) {
    return res.status(400).json({ erros: ['sabor não existe no cardápio'] });
  }
  const total = precos[sabor] * quantidade;
  res.status(201).json({ sabor, quantidade, total });
});
`,
    tests: [
      {
        description: 'o preço mandado pelo cliente é ignorado',
        code: `const res = await app.handle({ method: 'POST', path: '/pedidos', body: { sabor: 'carne', quantidade: 40, preco: 0.01 } });
assert.deepStrictEqual(res, { status: 201, body: { sabor: 'carne', quantidade: 40, total: 360 } });`,
      },
      {
        description: 'sem preço no corpo, o total sai da tabela do servidor',
        code: `const res = await app.handle({ method: 'POST', path: '/pedidos', body: { sabor: 'palmito', quantidade: 2 } });
assert.deepStrictEqual(res.body, { sabor: 'palmito', quantidade: 2, total: 22 });`,
      },
      {
        description: 'sabor fora do cardápio continua dando 400',
        code: `const res = await app.handle({ method: 'POST', path: '/pedidos', body: { sabor: 'caviar', quantidade: 1, preco: 1 } });
assert.strictEqual(res.status, 400);`,
      },
    ],
    hints: [
      'De onde vem o `preco` usado no `total`? Quem controla esse valor?',
      'O servidor já tem a tabela `precos`. Use `precos[sabor]`.',
    ],
    followUpQuestionIds: ['back.m04.f15', 'back.m04.f16'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m04.q15',
    lessonIds: ['back.m04.l03'],
    kind: 'multiple-choice',
    prompt:
      'O app mandou um pedido sem o campo `bairro`, que é obrigatório. Qual status a API deve responder?',
    options: ['200', '201', '400', '500'],
    answerIndex: 2,
    explanation: '400 Bad Request: o problema está nos dados que o cliente mandou, não no servidor.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q16',
    lessonIds: ['back.m04.l03'],
    kind: 'predict-output',
    prompt: 'O app mandou este JSON. O que o código imprime?',
    code: `const body = JSON.parse('{"quantidade":"3","pago":"false"}');
console.log(typeof body.quantidade);
console.log(Boolean(body.pago));`,
    expectedOutput: 'string\ntrue',
    explanation:
      'Com aspas, `"3"` é texto, não número. E `"false"` é um texto não vazio, que vira `true`. Por isso se ' +
      'checa o **tipo**, não só a presença.',
    difficulty: 2,
  },
  {
    id: 'back.m04.q17',
    lessonIds: ['back.m04.l03'],
    kind: 'true-false',
    prompt: 'Devolver todos os erros de validação de uma vez é melhor do que parar no primeiro.',
    answer: true,
    explanation: 'Com a lista completa, o app mostra tudo que precisa ser corrigido numa tentativa só.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q18',
    lessonIds: ['back.m04.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function erros(q) {
  const lista = [];
  if (!Number.isInteger(q)) lista.push('não é inteiro');
  if (q < 1) lista.push('menor que 1');
  return lista;
}
console.log(erros(2).length, erros(0).length, erros(-1.5).length);`,
    expectedOutput: '0 1 2',
    explanation: '2 passa em tudo. 0 é inteiro, mas é menor que 1. -1.5 falha nas duas regras.',
    difficulty: 2,
  },
  {
    id: 'back.m04.q19',
    lessonIds: ['back.m04.l03'],
    kind: 'multiple-choice',
    prompt: 'O app da pastelaria já valida o formulário antes de enviar. E a API?',
    options: [
      'Não precisa validar: o app já validou',
      'Precisa validar também: requisições podem chegar sem passar pelo app',
      'Só precisa validar se o status for 500',
      'Só valida os campos numéricos',
    ],
    answerIndex: 1,
    explanation:
      'Qualquer um pode chamar a API direto, sem o app. A validação do front é conforto; a do back é proteção.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q20',
    lessonIds: ['back.m04.l03'],
    kind: 'fill-blank',
    prompt: 'Complete a checagem de que `sabor` é um texto.',
    code: `if (typeof body.sabor !== '___' || body.sabor.trim() === '') {
  erros.push('sabor é obrigatório');
}`,
    acceptedAnswers: ['string'],
    explanation: "`typeof` de um texto devolve `'string'`.",
    difficulty: 1,
  },
  {
    id: 'back.m04.q21',
    lessonIds: ['back.m04.l03'],
    kind: 'multiple-choice',
    prompt: "Por que `if (!body.desconto) erros.push('desconto é obrigatório')` é uma checagem perigosa?",
    options: [
      'Porque um desconto `0`, que é válido, é falsy e seria tratado como ausente',
      'Porque o `!` só funciona com textos',
      'Porque `push` não funciona dentro de `if`',
      'Não é perigosa, é a forma recomendada',
    ],
    answerIndex: 0,
    explanation:
      "`!0` é `true`. Para saber se o campo veio, compare com `undefined` ou cheque o tipo: `typeof d !== 'number'`.",
    difficulty: 2,
  },
  {
    id: 'back.m04.f11',
    lessonIds: ['back.m04.l03'],
    exerciseId: 'back.m04.e04',
    kind: 'multiple-choice',
    prompt: "O que a sua `validarPedido({ sabor: 'carne', quantidade: '2', bairro: 'Centro' })` devolve?",
    options: [
      '[]',
      "['quantidade deve ser um inteiro entre 1 e 50']",
      "['sabor é obrigatório']",
      'undefined',
    ],
    answerIndex: 1,
    explanation: "`'2'` é texto, e `Number.isInteger('2')` é `false`. Só a regra da quantidade falha.",
    difficulty: 1,
  },
  {
    id: 'back.m04.f12',
    lessonIds: ['back.m04.l03'],
    exerciseId: 'back.m04.e04',
    kind: 'true-false',
    prompt: 'A sua `validarPedido` para no primeiro erro que encontra.',
    answer: false,
    explanation: 'Cada regra só faz `push` no array; no fim a função devolve todos os erros juntos.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f13',
    lessonIds: ['back.m04.l03'],
    exerciseId: 'back.m04.e05',
    kind: 'multiple-choice',
    prompt:
      'No seu `POST /pedidos`, por que montar o pedido campo a campo em vez de salvar `req.body` inteiro?',
    options: [
      'Para o código ficar mais curto',
      'Para o cliente não conseguir enfiar campos como `status` ou `id` nos seus dados',
      'Porque `req.body` não pode ser salvo em arrays',
      'Porque o validador apaga os campos de `req.body`',
    ],
    answerIndex: 1,
    explanation: 'Quem decide o `id` e o `status` de um pedido novo é o servidor, não quem fez a requisição.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f14',
    lessonIds: ['back.m04.l03'],
    exerciseId: 'back.m04.e05',
    kind: 'fill-blank',
    prompt: 'Complete a resposta do seu handler quando o validador encontra erros.',
    code: 'return res.status(___).json({ erros });',
    acceptedAnswers: ['400'],
    explanation: '400 Bad Request, com a lista de erros para o app mostrar.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f15',
    lessonIds: ['back.m04.l03'],
    exerciseId: 'back.m04.d03',
    kind: 'multiple-choice',
    prompt: 'Qual era a falha no `POST /pedidos` que você consertou?',
    options: [
      'O total usava o preço mandado pelo cliente',
      'O status 201 estava errado',
      'Faltava o `JSON.parse` do corpo',
      'O sabor não era validado',
    ],
    answerIndex: 0,
    explanation: 'Preço é informação do servidor. O cliente podia mandar `preco: 0.01` e pagar centavos.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f16',
    lessonIds: ['back.m04.l03'],
    exerciseId: 'back.m04.d03',
    kind: 'true-false',
    prompt:
      "Depois do conserto, se o cliente mandar `{ sabor: 'queijo', quantidade: 2, preco: 100 }`, o total " +
      'do pedido é 200.',
    answer: false,
    explanation: 'O `preco` do corpo é ignorado: o total é `precos.queijo * 2`, ou seja, 16.',
    difficulty: 1,
  },
];
