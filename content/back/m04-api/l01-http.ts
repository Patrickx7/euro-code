import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'back.m04.l01',
  moduleId: 'back.m04',
  order: 1,
  title: 'HTTP sem mistério: métodos, status e JSON',
  concepts: ['requisição e resposta', 'métodos HTTP', 'status codes', 'JSON no corpo', 'API REST'],
  sections: [
    {
      kind: 'text',
      markdown:
        'A Pastelaria Massa Fina quer um app de delivery. O app no celular do cliente não abre o banco de dados ' +
        'da pastelaria: ele **pede** as coisas para o seu servidor, e o servidor **responde**. Essa conversa ' +
        'segue um protocolo chamado **HTTP**, e o conjunto de pedidos que o seu servidor sabe atender é a **API**.\n\n' +
        'Toda **requisição** (request) tem:\n\n' +
        '- um **método**, que diz a intenção: `GET` (ler), `POST` (criar), `PUT` (atualizar), `DELETE` (apagar);\n' +
        '- um **caminho** (path), que diz o recurso: `/pedidos`, `/pedidos/7`, `/cardapio`;\n' +
        '- às vezes uma **query string** depois do `?`, com filtros: `/pedidos?bairro=Centro`;\n' +
        '- às vezes um **corpo** (body) com dados, quase sempre em **JSON**.\n\n' +
        'Toda **resposta** (response) tem um **status** (um número que resume o que aconteceu) e, em geral, um ' +
        'corpo em JSON.',
    },
    {
      kind: 'text',
      markdown:
        'Os status que você vai usar todo dia:\n\n' +
        '| Status | Nome | Quando |\n' +
        '| --- | --- | --- |\n' +
        '| 200 | OK | deu certo (leitura, atualização) |\n' +
        '| 201 | Created | deu certo e algo **foi criado** (um `POST`) |\n' +
        '| 400 | Bad Request | o cliente mandou dados errados |\n' +
        '| 404 | Not Found | o recurso ou a rota não existe |\n' +
        '| 405 | Method Not Allowed | a rota existe, mas não aceita esse método |\n' +
        '| 500 | Internal Server Error | o erro foi **do servidor** (bug, banco fora do ar) |\n\n' +
        'Regra de bolso: **2xx** = sucesso, **4xx** = culpa de quem pediu, **5xx** = culpa do servidor (sua).\n\n' +
        'Uma API **REST** organiza tudo em **recursos** (substantivos no caminho) e deixa o **método** dizer o ' +
        'verbo: `GET /pedidos` lista, `POST /pedidos` cria, `GET /pedidos/7` mostra um, `PUT /pedidos/7` ' +
        'atualiza, `DELETE /pedidos/7` apaga. Nada de `/criarPedidoNovoAgora`.',
    },
    {
      kind: 'text',
      markdown:
        'No simulador do jogo não existe servidor de verdade, então vamos imitar o HTTP com objetos simples. ' +
        'Uma requisição é um objeto `{ method, path, query, body }` e a resposta é `{ status, body }`. Um ' +
        '**handler** é só uma função que recebe a requisição e devolve a resposta. É exatamente a mesma ideia ' +
        'de um servidor real, sem a parte de cabos e portas.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const cardapio = ['carne', 'queijo', 'palmito'];

function rotaCardapio(req) {
  if (req.method === 'GET') {
    return { status: 200, body: cardapio };
  }
  return { status: 405, body: { erro: 'Método não permitido' } };
}

const ok = rotaCardapio({ method: 'GET', path: '/cardapio' });
console.log(ok.status, ok.body.join(', '));

const proibido = rotaCardapio({ method: 'DELETE', path: '/cardapio' });
console.log(proibido.status, proibido.body.erro);`,
      explanation:
        'O handler olha o método e escolhe a resposta. Apagar o cardápio inteiro não é permitido: 405, com uma ' +
        'mensagem que explica o motivo.',
    },
    {
      kind: 'text',
      markdown:
        'Pela rede só viaja **texto**. Por isso o corpo é convertido para JSON na ida (`JSON.stringify`) e de ' +
        'volta para objeto na chegada (`JSON.parse`). Frameworks como o Express fazem isso por você, mas vale ' +
        'saber o que acontece por baixo.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const pedido = { sabor: 'queijo', quantidade: 3 };
const texto = JSON.stringify(pedido);
console.log(texto);
console.log(typeof texto);

const chegou = JSON.parse(texto);
console.log(chegou.quantidade * 2);`,
      explanation: '`JSON.stringify` vira texto para viajar; `JSON.parse` transforma de volta em objeto.',
    },
  ],
  checkQuestionIds: ['back.m04.q01'],
  exerciseIds: ['back.m04.e01'],
  debugExerciseIds: ['back.m04.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m04.e01',
    lessonId: 'back.m04.l01',
    kind: 'implement',
    title: 'A rota de pedidos da pastelaria',
    promptMarkdown:
      'Complete o handler `rotaPedidos(req)` da Pastelaria Massa Fina. A lista `pedidos` já existe.\n\n' +
      '- `GET`: responde **200** com a lista `pedidos` no corpo.\n' +
      '- `POST`: cria um pedido `{ id, sabor, quantidade }` com o próximo id (`pedidos.length + 1`), ' +
      'usando `sabor` e `quantidade` de `req.body`. Guarda na lista e responde **201** com o pedido criado.\n' +
      "- qualquer outro método: responde **405** com `{ erro: 'Método não permitido' }`.\n\n" +
      'Lembre: o handler **devolve** (`return`) um objeto `{ status, body }`.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const pedidos = [{ id: 1, sabor: 'carne', quantidade: 2 }];

function rotaPedidos(req) {
  // GET: 200 com a lista
  // POST: cria o pedido e responde 201
  // outro método: 405
}
`,
    solution: `const pedidos = [{ id: 1, sabor: 'carne', quantidade: 2 }];

function rotaPedidos(req) {
  if (req.method === 'GET') {
    return { status: 200, body: pedidos };
  }
  if (req.method === 'POST') {
    const novo = { id: pedidos.length + 1, sabor: req.body.sabor, quantidade: req.body.quantidade };
    pedidos.push(novo);
    return { status: 201, body: novo };
  }
  return { status: 405, body: { erro: 'Método não permitido' } };
}
`,
    tests: [
      {
        description: 'GET /pedidos responde 200 com a lista',
        code: `const res = rotaPedidos({ method: 'GET', path: '/pedidos' });
assert.deepStrictEqual(res, { status: 200, body: [{ id: 1, sabor: 'carne', quantidade: 2 }] });`,
      },
      {
        description: 'POST /pedidos cria o pedido 2 e responde 201',
        code: `const res = rotaPedidos({ method: 'POST', path: '/pedidos', body: { sabor: 'queijo', quantidade: 3 } });
assert.deepStrictEqual(res, { status: 201, body: { id: 2, sabor: 'queijo', quantidade: 3 } });`,
      },
      {
        description: 'depois do POST, o GET já mostra o pedido novo',
        code: `rotaPedidos({ method: 'POST', path: '/pedidos', body: { sabor: 'palmito', quantidade: 1 } });
const res = rotaPedidos({ method: 'GET', path: '/pedidos' });
assert.strictEqual(res.body.length, 2);
assert.deepStrictEqual(res.body[1], { id: 2, sabor: 'palmito', quantidade: 1 });`,
      },
      {
        description: 'DELETE /pedidos responde 405',
        code: `const res = rotaPedidos({ method: 'DELETE', path: '/pedidos' });
assert.deepStrictEqual(res, { status: 405, body: { erro: 'Método não permitido' } });`,
      },
    ],
    hints: [
      "Use `if (req.method === 'GET')` e `if (req.method === 'POST')`, cada um com seu `return`.",
      'No POST, monte o objeto novo, faça `pedidos.push(novo)` e devolva `{ status: 201, body: novo }`.',
      'O `return` do 405 fica no final, para tudo que não caiu nos `if` anteriores.',
    ],
    followUpQuestionIds: ['back.m04.f01', 'back.m04.f02'],
    difficulty: 1,
  },
  {
    id: 'back.m04.d01',
    lessonId: 'back.m04.l01',
    kind: 'debug',
    title: 'A API otimista demais',
    promptMarkdown:
      'O app da pastelaria consulta o preço de um sabor com `GET /preco?sabor=...`. Quando o sabor não existe, ' +
      'o app mostra "Sucesso!" e um preço em branco, porque a API responde **200** até para erro.\n\n' +
      'Conserte `rotaPreco(req)`: sabor inexistente deve responder **404** com ' +
      "`{ erro: 'Sabor não encontrado' }`. Sabor que existe continua com 200 e `{ sabor, preco }`.",
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const precos = { carne: 9, queijo: 8, palmito: 11 };

function rotaPreco(req) {
  const sabor = req.query.sabor;
  const preco = precos[sabor];
  if (preco === undefined) {
    return { status: 200, body: { erro: 'Sabor não encontrado' } };
  }
  return { status: 200, body: { sabor, preco } };
}
`,
    solution: `const precos = { carne: 9, queijo: 8, palmito: 11 };

function rotaPreco(req) {
  const sabor = req.query.sabor;
  const preco = precos[sabor];
  if (preco === undefined) {
    return { status: 404, body: { erro: 'Sabor não encontrado' } };
  }
  return { status: 200, body: { sabor, preco } };
}
`,
    tests: [
      {
        description: 'sabor que existe responde 200 com o preço',
        code: `const res = rotaPreco({ method: 'GET', path: '/preco', query: { sabor: 'palmito' } });
assert.deepStrictEqual(res, { status: 200, body: { sabor: 'palmito', preco: 11 } });`,
      },
      {
        description: 'sabor que não existe responde 404',
        code: `const res = rotaPreco({ method: 'GET', path: '/preco', query: { sabor: 'nutella-com-bacon' } });
assert.deepStrictEqual(res, { status: 404, body: { erro: 'Sabor não encontrado' } });`,
      },
    ],
    hints: [
      'O corpo da resposta de erro está certo. O problema é o número que acompanha ele.',
      'Qual status significa "o recurso que você pediu não existe"?',
    ],
    followUpQuestionIds: ['back.m04.f03', 'back.m04.f04'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m04.q01',
    lessonIds: ['back.m04.l01'],
    kind: 'multiple-choice',
    prompt: 'O app da pastelaria quer **criar** um pedido novo. Qual método HTTP combina?',
    options: ['GET', 'POST', 'DELETE', 'PUT'],
    answerIndex: 1,
    explanation: '`POST` cria um recurso novo. `GET` só lê, `PUT` atualiza e `DELETE` apaga.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q02',
    lessonIds: ['back.m04.l01'],
    kind: 'multiple-choice',
    prompt: 'O que o status **201** diz para quem fez a requisição?',
    options: [
      'Deu certo e algo foi criado',
      'O recurso não existe',
      'O servidor quebrou',
      'Os dados enviados estão errados',
    ],
    answerIndex: 0,
    explanation: '201 Created: sucesso com criação, a resposta típica de um `POST` que deu certo.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q03',
    lessonIds: ['back.m04.l01'],
    kind: 'true-false',
    prompt: 'Status **500** significa que o cliente mandou dados errados na requisição.',
    answer: false,
    explanation:
      'Dados errados do cliente são **400** (família 4xx). A família 5xx é erro do servidor: bug, banco fora do ar...',
    difficulty: 1,
  },
  {
    id: 'back.m04.q04',
    lessonIds: ['back.m04.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const texto = JSON.stringify({ sabor: 'queijo', quantidade: 2 });
console.log(typeof texto);
const pedido = JSON.parse(texto);
console.log(pedido.quantidade * 2);`,
    expectedOutput: 'string\n4',
    explanation:
      '`JSON.stringify` transforma o objeto em texto (`string`). `JSON.parse` faz o caminho de volta, e ' +
      '`quantidade` volta a ser o número 2.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q05',
    lessonIds: ['back.m04.l01'],
    kind: 'multiple-choice',
    prompt: 'Numa API REST, qual requisição apaga o pedido 7?',
    options: ['GET /apagarPedido?id=7', 'POST /pedidos/7/apagar', 'DELETE /pedidos/7', 'DELETE /pedidos'],
    answerIndex: 2,
    explanation:
      'Em REST o caminho aponta o recurso (`/pedidos/7`) e o método diz a ação (`DELETE`). `DELETE /pedidos` ' +
      'apagaria a lista inteira, o que o dono da pastelaria não ia gostar.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q06',
    lessonIds: ['back.m04.l01'],
    kind: 'fill-blank',
    prompt: 'Complete o método que **lê** a lista de pedidos, sem alterar nada.',
    code: `if (req.method === '___') {
  return { status: 200, body: pedidos };
}`,
    acceptedAnswers: ['GET'],
    explanation: '`GET` é o método de leitura. Ele não deve criar nem mudar nada no servidor.',
    difficulty: 1,
  },
  {
    id: 'back.m04.q07',
    lessonIds: ['back.m04.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function familia(status) {
  if (status >= 500) return 'servidor';
  if (status >= 400) return 'cliente';
  return 'ok';
}
console.log(familia(404), familia(201), familia(500));`,
    expectedOutput: 'cliente ok servidor',
    explanation: '404 é da família 4xx (cliente), 201 é sucesso e 500 é da família 5xx (servidor).',
    difficulty: 1,
  },
  {
    id: 'back.m04.f01',
    lessonIds: ['back.m04.l01'],
    exerciseId: 'back.m04.e01',
    kind: 'multiple-choice',
    prompt:
      'Na sua `rotaPedidos`, a lista começa com 1 pedido. O app faz dois `POST` seguidos. Qual é o `id` do ' +
      'segundo pedido criado?',
    options: ['1', '2', '3', '4'],
    answerIndex: 2,
    explanation:
      'O id é `pedidos.length + 1`. No primeiro POST a lista tem 1 item (id 2); no segundo tem 2 itens (id 3).',
    difficulty: 1,
  },
  {
    id: 'back.m04.f02',
    lessonIds: ['back.m04.l01'],
    exerciseId: 'back.m04.e01',
    kind: 'true-false',
    prompt: 'Se o app mandar `PUT /pedidos` para a sua `rotaPedidos`, ela responde 405.',
    answer: true,
    explanation: 'Só `GET` e `POST` têm tratamento. Todo o resto cai no `return` final com 405.',
    difficulty: 1,
  },
  {
    id: 'back.m04.f03',
    lessonIds: ['back.m04.l01'],
    exerciseId: 'back.m04.d01',
    kind: 'multiple-choice',
    prompt: 'Por que responder **200** com `{ erro: ... }` no corpo, como a `rotaPreco` fazia, é ruim?',
    options: [
      'Porque o JSON fica maior',
      'Porque quem chama olha o status para saber se deu certo, e 200 diz que deu',
      'Porque o status 200 é proibido em GET',
      'Não é ruim, o importante é a mensagem',
    ],
    answerIndex: 1,
    explanation:
      'Apps, navegadores e bibliotecas decidem pelo status. Com 200, o app achou que deu certo e mostrou "Sucesso!".',
    difficulty: 1,
  },
  {
    id: 'back.m04.f04',
    lessonIds: ['back.m04.l01'],
    exerciseId: 'back.m04.d01',
    kind: 'fill-blank',
    prompt: 'Complete a linha que você consertou na `rotaPreco`.',
    code: "return { status: ___, body: { erro: 'Sabor não encontrado' } };",
    acceptedAnswers: ['404'],
    explanation: '404 Not Found: o sabor pedido não existe no cardápio.',
    difficulty: 1,
  },
];
