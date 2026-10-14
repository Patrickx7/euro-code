import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'back.m03.l02',
  moduleId: 'back.m03',
  order: 2,
  title: 'Promises: a promessa de que a API vai responder (um dia)',
  concepts: [
    'Promise',
    'new Promise(resolve, reject)',
    'then, catch e finally',
    'encadeamento de then',
    'promisificar um callback',
    'Promise.all',
    'Promise.allSettled',
    'Promise.race',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Uma **Promise** é um objeto que representa um valor que **ainda vai chegar**. É como a comanda da ' +
        'lanchonete: você ainda não tem o lanche, mas tem um papel que garante que ele vem (ou que alguém vai ' +
        'avisar que acabou o pão).\n\n' +
        'Toda Promise está num de três estados:\n\n' +
        '- **pendente** (_pending_): ainda esperando;\n' +
        '- **cumprida** (_fulfilled_): deu certo e tem um valor;\n' +
        '- **rejeitada** (_rejected_): deu errado e tem um motivo (normalmente um `Error`).\n\n' +
        'Para criar uma, use `new Promise` com uma função que recebe `resolve` e `reject`. Chame `resolve(valor)` ' +
        'no sucesso e `reject(erro)` na falha. Só a **primeira** chamada vale; as outras são ignoradas.\n\n' +
        'Para usar o resultado, encadeie `.then(valor => ...)` para o sucesso, `.catch(erro => ...)` para a ' +
        'falha e `.finally(() => ...)` para o que roda nos dois casos.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `function esperarAprovacao(orcamento) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (orcamento <= 500) resolve('Aprovado: R$ ' + orcamento);
      else reject(new Error('O cliente achou caro'));
    }, 10);
  });
}

esperarAprovacao(300)
  .then((msg) => console.log(msg))
  .catch((err) => console.log('Recusado:', err.message))
  .finally(() => console.log('Fim da negociação'));`,
      explanation: 'Troque 300 por 900 e o `.catch` é que roda. O `.finally` roda sempre.',
    },
    {
      kind: 'text',
      markdown:
        '**Encadear** é o que mata o callback hell: o valor que um `.then` **retorna** vira a entrada do ' +
        'próximo. Se ele retorna outra Promise, o próximo `.then` espera ela terminar. Um único `.catch` no ' +
        'fim pega o erro de qualquer etapa.\n\n' +
        '```js\nbuscarCliente(id)\n  .then((cliente) => buscarPedidos(cliente)) // retorna Promise\n' +
        '  .then((pedidos) => pedidos.length)\n  .then((total) => console.log(total))\n' +
        '  .catch((err) => console.error(err.message));\n```\n\n' +
        'Cuidado: se você abrir chaves no `.then` e esquecer o `return`, o próximo recebe `undefined`.\n\n' +
        '**Promisificar** é embrulhar uma função de callback numa que devolve Promise: dentro do ' +
        '`new Promise`, chame a função antiga e, no callback dela, use `reject(err)` ou `resolve(resultado)`. ' +
        'No Node de verdade existe `util.promisify` que faz isso, mas fazer na mão mostra como funciona.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `function lerNota(numero, callback) {
  setTimeout(() => {
    if (numero < 1) return callback(new Error('Nota inválida'));
    callback(null, 'Nota ' + numero + ': R$ 150');
  }, 10);
}

function lerNotaAsync(numero) {
  return new Promise((resolve, reject) => {
    lerNota(numero, (err, texto) => {
      if (err) reject(err);
      else resolve(texto);
    });
  });
}

lerNotaAsync(42).then((texto) => console.log(texto));
lerNotaAsync(0).catch((err) => console.log('Erro:', err.message));`,
      explanation: 'Mesma função de antes, agora com cara de Promise: dá para usar `.then` e `.catch`.',
    },
    {
      kind: 'text',
      markdown:
        'Para várias Promises ao mesmo tempo, a classe `Promise` tem funções prontas. Todas recebem um ' +
        '**array de Promises**:\n\n' +
        '| Função | Resolve quando... | Rejeita quando... |\n' +
        '| --- | --- | --- |\n' +
        '| `Promise.all` | **todas** cumprem (array com os valores, na mesma ordem) | **qualquer uma** rejeita |\n' +
        '| `Promise.allSettled` | todas terminam, dando certo ou não | nunca |\n' +
        '| `Promise.race` | a **primeira** que terminar cumprir | a primeira que terminar rejeitar |\n\n' +
        "`Promise.allSettled` devolve objetos `{ status: 'fulfilled', value }` ou " +
        "`{ status: 'rejected', reason }`. E `Promise.race` é o truque clássico do **timeout**: apostar uma " +
        'corrida entre a API lenta do cliente e um timer que rejeita.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const atraso = (ms, valor) => new Promise((resolve) => setTimeout(() => resolve(valor), ms));
const falha = (ms, msg) => new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms));

Promise.all([atraso(20, 'Osasco'), atraso(10, 'Cotia')]).then((v) => console.log('all:', v));

Promise.allSettled([atraso(10, 35), falha(5, 'fora do ar')]).then((r) =>
  console.log('allSettled:', r.map((x) => x.status)),
);

Promise.race([atraso(50, 'API do cliente'), falha(15, 'Tempo esgotado')])
  .then((v) => console.log('race:', v))
  .catch((err) => console.log('race:', err.message));`,
      explanation:
        '`all` mantém a ordem do array (não a de chegada). `allSettled` não rejeita. No `race`, o timer de 15 ms ganha da API de 50 ms.',
    },
  ],
  checkQuestionIds: ['back.m03.q10'],
  exerciseIds: ['back.m03.e02', 'back.m03.e03'],
  debugExerciseIds: ['back.m03.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m03.e02',
    lessonId: 'back.m03.l02',
    kind: 'implement',
    title: 'Promisificar a consulta de estoque',
    promptMarkdown:
      'O depósito gostou, mas o dev novo do cliente "só sabe Promise". A função `consultarEstoque(produto, ' +
      'callback)` já existe (estilo Node, erro primeiro). Crie `consultarEstoqueAsync(produto)`, que ' +
      '**devolve uma Promise**:\n\n' +
      '- cumprida com a quantidade, se o produto existe;\n' +
      '- rejeitada com o mesmo `Error` que o callback recebeu, se não existe.\n\n' +
      'Não mexa em `consultarEstoque`: só embrulhe ela.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const estoque = { cimento: 40, areia: 12, tijolo: 3000 };

function consultarEstoque(produto, callback) {
  setTimeout(() => {
    if (!(produto in estoque)) return callback(new Error('Produto não encontrado: ' + produto));
    callback(null, estoque[produto]);
  }, 20);
}

function consultarEstoqueAsync(produto) {
  // devolva uma Promise que usa consultarEstoque
}
`,
    solution: `const estoque = { cimento: 40, areia: 12, tijolo: 3000 };

function consultarEstoque(produto, callback) {
  setTimeout(() => {
    if (!(produto in estoque)) return callback(new Error('Produto não encontrado: ' + produto));
    callback(null, estoque[produto]);
  }, 20);
}

function consultarEstoqueAsync(produto) {
  return new Promise((resolve, reject) => {
    consultarEstoque(produto, (err, quantidade) => {
      if (err) reject(err);
      else resolve(quantidade);
    });
  });
}
`,
    tests: [
      {
        description: 'devolve uma Promise',
        code: `const p = consultarEstoqueAsync('cimento');
assert.ok(p instanceof Promise, 'consultarEstoqueAsync deve devolver uma Promise.');
await p;`,
      },
      {
        description: 'cimento: a Promise cumpre com 40',
        code: "assert.strictEqual(await consultarEstoqueAsync('cimento'), 40);",
      },
      {
        description: 'produto que não existe: a Promise rejeita com a mensagem do erro',
        code: "await assert.rejects(consultarEstoqueAsync('telha'), { message: 'Produto não encontrado: telha' });",
      },
    ],
    hints: [
      'Comece com `return new Promise((resolve, reject) => { ... })`.',
      'Dentro dela, chame `consultarEstoque(produto, (err, qtd) => ...)` e decida entre `reject(err)` e `resolve(qtd)`.',
    ],
    followUpQuestionIds: ['back.m03.f05', 'back.m03.f06'],
    difficulty: 2,
  },
  {
    id: 'back.m03.e03',
    lessonId: 'back.m03.l02',
    kind: 'implement',
    title: 'Timeout para a API que nunca responde',
    promptMarkdown:
      'A API de CEP que o cliente contratou às vezes simplesmente não responde. Crie `comTimeout(promise, ms)`, ' +
      'que devolve uma **nova Promise**:\n\n' +
      '- se `promise` terminar antes de `ms` milissegundos, o resultado é o dela (valor ou erro);\n' +
      '- se demorar mais, rejeita com um `Error` de mensagem `Tempo esgotado`.\n\n' +
      'Use `Promise.race` com uma Promise que rejeita depois de `ms`.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function comTimeout(promise, ms) {
  // seu código aqui
  return promise;
}
`,
    solution: `function comTimeout(promise, ms) {
  const timer = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Tempo esgotado')), ms);
  });
  return Promise.race([promise, timer]);
}
`,
    tests: [
      {
        description: 'API rápida: devolve o valor dela',
        code: `const api = new Promise((r) => setTimeout(() => r('06700-000'), 10));
assert.strictEqual(await comTimeout(api, 80), '06700-000');`,
      },
      {
        description: 'API lenta: rejeita com "Tempo esgotado"',
        code: `const api = new Promise((r) => setTimeout(() => r('06700-000'), 120));
await assert.rejects(comTimeout(api, 20), { message: 'Tempo esgotado' });`,
      },
      {
        description: 'API que falha rápido: o erro dela passa adiante',
        code: `const api = new Promise((_, reject) => setTimeout(() => reject(new Error('CEP inválido')), 10));
await assert.rejects(comTimeout(api, 80), { message: 'CEP inválido' });`,
      },
    ],
    hints: [
      'Crie `const timer = new Promise((_, reject) => setTimeout(() => reject(new Error(...)), ms));`.',
      '`return Promise.race([promise, timer]);` fica com quem terminar primeiro.',
    ],
    followUpQuestionIds: ['back.m03.f07', 'back.m03.f08'],
    difficulty: 2,
  },
  {
    id: 'back.m03.d02',
    lessonId: 'back.m03.l02',
    kind: 'debug',
    title: 'O total do pedido que virou undefined',
    promptMarkdown:
      '`totalDoPedido(id)` deveria buscar o pedido, depois os preços dos itens, e devolver (numa Promise) a ' +
      'soma. Mas ela quebra com `TypeError: Cannot read properties of undefined`. Encontre o elo quebrado ' +
      'da corrente de `.then`.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const tabela = { coxinha: 7, 'caldo de cana': 9, pastel: 12 };

function buscarPedido(id) {
  return new Promise((resolve) => setTimeout(() => resolve({ id, itens: ['pastel', 'caldo de cana'] }), 10));
}

function buscarPrecos(itens) {
  return new Promise((resolve) => setTimeout(() => resolve(itens.map((i) => tabela[i])), 10));
}

function totalDoPedido(id) {
  return buscarPedido(id)
    .then((pedido) => {
      buscarPrecos(pedido.itens);
    })
    .then((precos) => precos.reduce((soma, p) => soma + p, 0));
}
`,
    solution: `const tabela = { coxinha: 7, 'caldo de cana': 9, pastel: 12 };

function buscarPedido(id) {
  return new Promise((resolve) => setTimeout(() => resolve({ id, itens: ['pastel', 'caldo de cana'] }), 10));
}

function buscarPrecos(itens) {
  return new Promise((resolve) => setTimeout(() => resolve(itens.map((i) => tabela[i])), 10));
}

function totalDoPedido(id) {
  return buscarPedido(id)
    .then((pedido) => {
      return buscarPrecos(pedido.itens);
    })
    .then((precos) => precos.reduce((soma, p) => soma + p, 0));
}
`,
    tests: [
      {
        description: 'o total do pedido é 21',
        code: 'assert.strictEqual(await totalDoPedido(1), 21);',
      },
    ],
    hints: [
      'O segundo `.then` recebe o que o primeiro **retorna**. O que o primeiro retorna hoje?',
      'Com chaves no `.then`, é preciso `return buscarPrecos(...)`.',
    ],
    followUpQuestionIds: ['back.m03.f09', 'back.m03.f10'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m03.q10',
    lessonIds: ['back.m03.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const p = new Promise((resolve) => resolve('pago'));
p.then((v) => console.log(v));
console.log('aguardando pix');`,
    expectedOutput: 'aguardando pix\npago',
    explanation:
      'Mesmo com a Promise já cumprida, o callback do `.then` nunca roda na hora: ele espera o código síncrono terminar.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q11',
    lessonIds: ['back.m03.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `setTimeout(() => console.log('timer'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('síncrono');`,
    expectedOutput: 'síncrono\npromise\ntimer',
    explanation:
      'Primeiro o síncrono. Os callbacks de Promise (microtarefas) rodam assim que o código síncrono acaba, antes dos timers, mesmo os de 0 ms.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q12',
    lessonIds: ['back.m03.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `Promise.resolve(2)
  .then((n) => n * 10)
  .then((n) => {
    n + 1;
  })
  .then((n) => console.log(n));`,
    expectedOutput: 'undefined',
    explanation:
      'O primeiro `.then` devolve 20, mas o segundo tem chaves e nenhum `return`, então o terceiro recebe `undefined`.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q13',
    lessonIds: ['back.m03.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `new Promise((resolve, reject) => {
  resolve('entregue');
  reject(new Error('extraviado'));
})
  .then((v) => console.log('then:', v))
  .catch((e) => console.log('catch:', e.message));`,
    expectedOutput: 'then: entregue',
    explanation: 'Uma Promise só termina uma vez. Depois do `resolve`, o `reject` é ignorado.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q14',
    lessonIds: ['back.m03.l02'],
    kind: 'multiple-choice',
    prompt:
      'Você consulta o frete em 3 transportadoras ao mesmo tempo e quer **todas as respostas**, mesmo que alguma falhe. Qual usar?',
    options: ['`Promise.allSettled`', '`Promise.all`', '`Promise.race`', 'Três `setTimeout`'],
    answerIndex: 0,
    explanation:
      '`Promise.all` rejeita na primeira falha e você perde as outras respostas. `allSettled` espera todas e diz quem deu certo.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q15',
    lessonIds: ['back.m03.l02'],
    kind: 'true-false',
    prompt: '`Promise.all([a, b, c])` rejeita se qualquer uma das três Promises rejeitar.',
    answer: true,
    explanation: 'É tudo ou nada: basta uma rejeitar para o `Promise.all` rejeitar com aquele erro.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q16',
    lessonIds: ['back.m03.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const espera = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
Promise.all([espera(30, 'Cotia'), espera(10, 'Osasco')]).then((v) => console.log(v.join(', ')));`,
    expectedOutput: 'Cotia, Osasco',
    explanation:
      'O resultado do `Promise.all` segue a ordem do array, não a ordem em que cada Promise terminou.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q17',
    lessonIds: ['back.m03.l02'],
    kind: 'fill-blank',
    prompt: 'Complete para tratar a falha da Promise.',
    code: `pagarBoleto(codigo)
  .then((recibo) => console.log('Pago!', recibo))
  .___((err) => console.log('Deu ruim:', err.message));`,
    acceptedAnswers: ['catch'],
    explanation:
      '`.catch` recebe o motivo da rejeição. Um `.catch` no fim pega o erro de qualquer `.then` anterior.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q18',
    lessonIds: ['back.m03.l02'],
    kind: 'multiple-choice',
    prompt: 'Quando o callback de `.finally(() => ...)` roda?',
    options: [
      'Quando a Promise termina, tanto cumprida quanto rejeitada',
      'Só quando a Promise é cumprida',
      'Só quando a Promise é rejeitada',
      'Antes do `.then`, sempre',
    ],
    answerIndex: 0,
    explanation: 'O `.finally` é para a faxina que vale nos dois casos, como esconder o "carregando...".',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'back.m03.f05',
    lessonIds: ['back.m03.l02'],
    exerciseId: 'back.m03.e02',
    kind: 'multiple-choice',
    prompt: "Com a sua `consultarEstoqueAsync`, o que acontece em `consultarEstoqueAsync('telha')`?",
    options: [
      'A Promise rejeita com o erro "Produto não encontrado: telha"',
      'A Promise cumpre com `undefined`',
      'A função lança o erro na hora, sem Promise',
      'A Promise fica pendente para sempre',
    ],
    answerIndex: 0,
    explanation: 'O callback recebe o erro e a sua função repassa com `reject(err)`.',
    difficulty: 1,
  },
  {
    id: 'back.m03.f06',
    lessonIds: ['back.m03.l02'],
    exerciseId: 'back.m03.e02',
    kind: 'true-false',
    prompt:
      'Se você esquecesse o `return` antes do `new Promise` na sua `consultarEstoqueAsync`, ela devolveria `undefined` e não daria para usar `.then`.',
    answer: true,
    explanation: 'A Promise seria criada, mas jogada fora. Quem chama receberia `undefined`.',
    difficulty: 1,
  },
  {
    id: 'back.m03.f07',
    lessonIds: ['back.m03.l02'],
    exerciseId: 'back.m03.e03',
    kind: 'multiple-choice',
    prompt: 'Na sua `comTimeout(api, 100)`, se a `api` rejeitar em 10 ms com "CEP inválido", o que acontece?',
    options: [
      'Rejeita com "CEP inválido"',
      'Rejeita com "Tempo esgotado"',
      'Cumpre com `undefined`',
      'Espera os 100 ms e então rejeita',
    ],
    answerIndex: 0,
    explanation: 'O `Promise.race` fica com a primeira Promise que **terminar**, dando certo ou não.',
    difficulty: 2,
  },
  {
    id: 'back.m03.f08',
    lessonIds: ['back.m03.l02'],
    exerciseId: 'back.m03.e03',
    kind: 'fill-blank',
    prompt: 'Complete a linha da sua solução que aposta a corrida.',
    code: 'return Promise.___([promise, timer]);',
    acceptedAnswers: ['race'],
    explanation: '`Promise.race` termina junto com a primeira Promise do array que terminar.',
    difficulty: 1,
  },
  {
    id: 'back.m03.f09',
    lessonIds: ['back.m03.l02'],
    exerciseId: 'back.m03.d02',
    kind: 'multiple-choice',
    prompt: 'Na versão com defeito, o que o segundo `.then` recebia em `precos`?',
    options: ['`undefined`', 'O array `[12, 9]`', 'A Promise de `buscarPrecos`', 'O objeto do pedido'],
    answerIndex: 0,
    explanation:
      'O primeiro `.then` chamava `buscarPrecos` mas não retornava nada, então passava `undefined` adiante.',
    difficulty: 1,
  },
  {
    id: 'back.m03.f10',
    lessonIds: ['back.m03.l02'],
    exerciseId: 'back.m03.d02',
    kind: 'true-false',
    prompt:
      'Na versão corrigida, como o primeiro `.then` retorna uma Promise, o segundo `.then` espera ela terminar e recebe o array de preços.',
    answer: true,
    explanation:
      'Retornar uma Promise dentro do `.then` faz a corrente esperar por ela. É isso que evita a pirâmide.',
    difficulty: 1,
  },
];
