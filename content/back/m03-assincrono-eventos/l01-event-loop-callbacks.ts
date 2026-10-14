import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'back.m03.l01',
  moduleId: 'back.m03',
  order: 1,
  title: 'Event loop e callbacks: o Node não fica esperando',
  concepts: [
    'código síncrono e assíncrono',
    'setTimeout',
    'event loop',
    'callback',
    'callback com erro primeiro (err, resultado)',
    'callback hell',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Você pede um orçamento para a API do cliente e ela demora 3 segundos para responder. Se o Node ' +
        'ficasse parado olhando para a tela esperando, o servidor inteiro travaria junto. Por isso o Node é ' +
        '**assíncrono**: ele dispara a tarefa demorada, segue rodando o resto do código e, quando a resposta ' +
        'chega, chama uma função sua para cuidar dela.\n\n' +
        'Quem organiza isso é o **event loop** (laço de eventos). O seu JavaScript roda numa linha só (uma ' +
        '_thread_), na ordem em que está escrito. Tudo que é "para depois" (um timer, a leitura de um ' +
        'arquivo, a resposta de uma API) vai para uma fila. Só quando o código síncrono atual **termina** é ' +
        'que o event loop pega o próximo item da fila e roda.\n\n' +
        'O jeito mais simples de agendar algo para depois é o `setTimeout(funcao, ms)`: ele roda `funcao` ' +
        'depois de **pelo menos** `ms` milissegundos. Mesmo `setTimeout(fn, 0)` espera o código síncrono ' +
        'acabar.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `console.log('1. Liguei o notebook');
setTimeout(() => console.log('3. A API do cliente respondeu'), 30);
setTimeout(() => console.log('2. O café ficou pronto'), 0);
console.log('1. Abri o editor');`,
      explanation:
        'As duas linhas síncronas saem primeiro. Depois o event loop roda os timers: o de 0 ms antes do de 30 ms.',
    },
    {
      kind: 'text',
      markdown:
        'A função que você passa para ser chamada depois se chama **callback** ("me liga de volta"). No ' +
        'Node, as funções assíncronas antigas seguem uma convenção chamada **erro primeiro** ' +
        '(_error-first_):\n\n' +
        '- o **primeiro** parâmetro do callback é o erro (`null` se deu tudo certo);\n' +
        '- o **segundo** é o resultado.\n\n' +
        "```js\nfs.readFile('pedido.txt', 'utf8', (err, texto) => {\n" +
        "  if (err) {\n    console.error('Não deu para ler:', err.message);\n    return; // para aqui!\n  }\n" +
        '  console.log(texto);\n});\n```\n\n' +
        'Repare no `return` dentro do `if (err)`: sem ele, a função continua e tenta usar um resultado que ' +
        'não existe.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const fretes = { 'Granja Viana': 35, Carapicuíba: 20 };

function calcularFrete(bairro, callback) {
  setTimeout(() => {
    if (!(bairro in fretes)) {
      callback(new Error('Não entregamos em ' + bairro));
      return;
    }
    callback(null, fretes[bairro]);
  }, 10);
}

calcularFrete('Carapicuíba', (err, valor) => {
  if (err) return console.log('Erro:', err.message);
  console.log('Frete: R$', valor);
});
calcularFrete('Marte', (err, valor) => {
  if (err) return console.log('Erro:', err.message);
  console.log('Frete: R$', valor);
});`,
      explanation:
        'Quem chama sempre checa o `err` antes de usar o resultado. `return callback(...)` é um jeito curto de chamar e parar.',
    },
    {
      kind: 'text',
      markdown:
        'O problema aparece quando uma tarefa depende da outra: buscar o cliente, depois os pedidos dele, ' +
        'depois o frete de cada pedido... Cada passo fica **dentro** do callback do anterior, e o código vai ' +
        'escorregando para a direita:\n\n' +
        '```js\nbuscarCliente(id, (err, cliente) => {\n  if (err) return fim(err);\n' +
        '  buscarPedidos(cliente, (err, pedidos) => {\n    if (err) return fim(err);\n' +
        '    calcularFrete(pedidos[0], (err, frete) => {\n      if (err) return fim(err);\n' +
        '      // ... e lá vamos nós\n    });\n  });\n});\n```\n\n' +
        'Isso tem nome: **callback hell** (o inferno dos callbacks), ou "pirâmide da desgraça". Difícil de ' +
        'ler, fácil de esquecer um `if (err)`. Na próxima lição você vê as **Promises**, que resolvem isso.',
    },
  ],
  checkQuestionIds: ['back.m03.q01'],
  exerciseIds: ['back.m03.e01'],
  debugExerciseIds: ['back.m03.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m03.e01',
    lessonId: 'back.m03.l01',
    kind: 'implement',
    title: 'Estoque do depósito no estilo Node',
    promptMarkdown:
      'O Depósito Tijolo Torto quer consultar o estoque "como uma API de verdade, que demora". Complete ' +
      '`consultarEstoque(produto, callback)`:\n\n' +
      '- espere **20 ms** com `setTimeout` (a API do depósito é lenta, claro);\n' +
      '- se o produto existe em `estoque`, chame `callback(null, quantidade)`;\n' +
      '- se não existe, chame `callback(erro)` com um `Error` de mensagem `Produto não encontrado: <produto>`.\n\n' +
      "Exemplo: `consultarEstoque('cimento', (err, qtd) => ...)` recebe `err = null` e `qtd = 40`.",
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const estoque = { cimento: 40, areia: 12, tijolo: 3000 };

function consultarEstoque(produto, callback) {
  // seu código aqui
}
`,
    solution: `const estoque = { cimento: 40, areia: 12, tijolo: 3000 };

function consultarEstoque(produto, callback) {
  setTimeout(() => {
    if (!(produto in estoque)) {
      callback(new Error('Produto não encontrado: ' + produto));
      return;
    }
    callback(null, estoque[produto]);
  }, 20);
}
`,
    tests: [
      {
        description: 'cimento: erro null e 40 unidades',
        code: `const r = await new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error('O callback nunca foi chamado.')), 150);
  consultarEstoque('cimento', (err, qtd) => resolve({ err, qtd }));
});
assert.strictEqual(r.err, null);
assert.strictEqual(r.qtd, 40);`,
      },
      {
        description: 'produto que não existe: callback recebe um Error com a mensagem certa',
        code: `const r = await new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error('O callback nunca foi chamado.')), 150);
  consultarEstoque('telha', (err, qtd) => resolve({ err, qtd }));
});
assert.ok(r.err instanceof Error, 'O primeiro argumento deve ser um Error.');
assert.strictEqual(r.err.message, 'Produto não encontrado: telha');
assert.strictEqual(r.qtd, undefined);`,
      },
      {
        description: 'o callback não é chamado na hora: espera o setTimeout',
        code: `let chamou = false;
consultarEstoque('areia', () => {
  chamou = true;
});
assert.strictEqual(chamou, false, 'O callback foi chamado na hora. Use setTimeout.');
await new Promise((r) => setTimeout(r, 60));
assert.strictEqual(chamou, true, 'O callback não foi chamado depois de 60 ms.');`,
      },
    ],
    hints: [
      'Coloque todo o corpo dentro de `setTimeout(() => { ... }, 20)`.',
      'Para saber se a chave existe, use `produto in estoque`. No caso de erro, chame `callback(new Error(...))` e dê `return`.',
    ],
    followUpQuestionIds: ['back.m03.f01', 'back.m03.f02'],
    difficulty: 1,
  },
  {
    id: 'back.m03.d01',
    lessonId: 'back.m03.l01',
    kind: 'debug',
    title: 'A comanda que imprime duas vezes',
    promptMarkdown:
      '`imprimirPedido(id, callback)` busca o pedido e monta o texto da comanda. Com um id válido funciona, ' +
      'mas com um id inválido o programa **quebra** com `TypeError` em vez de devolver o erro para quem ' +
      'chamou. Conserte para que, no erro, o callback receba o erro **uma vez só** e a função pare ali.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function lerPedido(id, callback) {
  setTimeout(() => {
    if (id <= 0) callback(new Error('Id inválido'));
    else callback(null, { id, item: 'pão na chapa' });
  }, 10);
}

function imprimirPedido(id, callback) {
  lerPedido(id, (err, pedido) => {
    if (err) {
      callback(err);
    }
    callback(null, 'Pedido ' + pedido.id + ': ' + pedido.item);
  });
}
`,
    solution: `function lerPedido(id, callback) {
  setTimeout(() => {
    if (id <= 0) callback(new Error('Id inválido'));
    else callback(null, { id, item: 'pão na chapa' });
  }, 10);
}

function imprimirPedido(id, callback) {
  lerPedido(id, (err, pedido) => {
    if (err) {
      return callback(err);
    }
    callback(null, 'Pedido ' + pedido.id + ': ' + pedido.item);
  });
}
`,
    tests: [
      {
        description: 'id válido devolve o texto da comanda',
        code: `const texto = await new Promise((resolve, reject) => {
  imprimirPedido(7, (err, t) => (err ? reject(err) : resolve(t)));
});
assert.strictEqual(texto, 'Pedido 7: pão na chapa');`,
      },
      {
        description: 'id inválido: o callback recebe o erro uma vez só',
        code: `const chamadas = [];
imprimirPedido(-1, (err, texto) => chamadas.push({ err, texto }));
await new Promise((r) => setTimeout(r, 50));
assert.strictEqual(chamadas.length, 1, 'O callback deveria ser chamado exatamente 1 vez.');
assert.strictEqual(chamadas[0].err.message, 'Id inválido');`,
      },
    ],
    hints: [
      'Depois de chamar `callback(err)`, a função continua rodando e tenta ler `pedido.id`, mas `pedido` é `undefined`.',
      'Use `return callback(err);` para chamar o callback e sair da função.',
    ],
    followUpQuestionIds: ['back.m03.f03', 'back.m03.f04'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m03.q01',
    lessonIds: ['back.m03.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
console.log('C');`,
    expectedOutput: 'A\nC\nB',
    explanation:
      'Mesmo com 0 ms, o callback do `setTimeout` só roda depois que todo o código síncrono termina.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q02',
    lessonIds: ['back.m03.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `setTimeout(() => console.log('entrega em Barueri'), 40);
setTimeout(() => console.log('entrega em Osasco'), 10);
console.log('saindo do depósito');`,
    expectedOutput: 'saindo do depósito\nentrega em Osasco\nentrega em Barueri',
    explanation:
      'Primeiro o código síncrono. Depois os timers, na ordem em que vencem: 10 ms antes de 40 ms, não importa a ordem em que foram criados.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q03',
    lessonIds: ['back.m03.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log('entrega ' + i), i * 10);
}
console.log('saí do laço');`,
    expectedOutput: 'saí do laço\nentrega 1\nentrega 2\nentrega 3',
    explanation:
      'O laço só agenda os três timers e termina na hora. Com `let`, cada volta tem o seu próprio `i`, então cada timer lembra o seu número.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q04',
    lessonIds: ['back.m03.l01'],
    kind: 'true-false',
    prompt: '`setTimeout(fn, 0)` roda `fn` imediatamente, antes da próxima linha do código.',
    answer: false,
    explanation:
      'O `fn` vai para a fila. Ele só roda quando o código síncrono atual acaba e o event loop pega o próximo item.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q05',
    lessonIds: ['back.m03.l01'],
    kind: 'multiple-choice',
    prompt:
      'Num callback no estilo Node, `(err, resultado) => { ... }`, o que vem em `err` quando deu tudo certo?',
    options: ['`null`', 'O resultado', 'A string "ok"', 'Um `Error` vazio'],
    answerIndex: 0,
    explanation:
      'Na convenção erro primeiro, `err` é `null` (ou `undefined`) no sucesso, e o resultado vem no segundo parâmetro.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q06',
    lessonIds: ['back.m03.l01'],
    kind: 'multiple-choice',
    prompt: 'O que é o "callback hell"?',
    options: [
      'Callbacks aninhados um dentro do outro, formando uma pirâmide difícil de ler',
      'Um erro que o Node lança quando há callbacks demais',
      'Um callback que nunca é chamado',
      'O nome do event loop quando ele está ocupado',
    ],
    answerIndex: 0,
    explanation:
      'Quando cada passo depende do anterior, cada callback fica dentro do outro. O código escorrega para a direita e os `if (err)` se multiplicam.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q07',
    lessonIds: ['back.m03.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para que, no erro, o callback seja chamado e a função pare ali.',
    code: `lerArquivo('nota.txt', (err, texto) => {
  if (err) ___ callback(err);
  callback(null, texto.toUpperCase());
});`,
    acceptedAnswers: ['return'],
    explanation: '`return callback(err)` chama o callback e sai da função, sem chegar na linha de baixo.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q08',
    lessonIds: ['back.m03.l01'],
    kind: 'true-false',
    prompt:
      'Enquanto um timer de 2 segundos está esperando, o Node pode continuar rodando outras partes do seu código.',
    answer: true,
    explanation:
      'O timer não bloqueia nada: o Node segue o código e o event loop chama o callback quando o tempo vencer.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q09',
    lessonIds: ['back.m03.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function buscarPreco(callback) {
  setTimeout(() => callback(null, 25), 10);
}
let preco = 0;
buscarPreco((err, valor) => {
  preco = valor;
});
console.log(preco);`,
    expectedOutput: '0',
    explanation:
      'O `console.log` roda antes do callback: quando a linha é executada, o timer ainda não venceu e `preco` continua 0. Use o valor **dentro** do callback.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'back.m03.f01',
    lessonIds: ['back.m03.l01'],
    exerciseId: 'back.m03.e01',
    kind: 'multiple-choice',
    prompt: "Na sua `consultarEstoque('tijolo', cb)`, com que argumentos o `cb` é chamado?",
    options: ['`(null, 3000)`', '`(3000)`', '`(3000, null)`', '`(undefined)`'],
    answerIndex: 0,
    explanation: 'Erro primeiro: `null` porque deu certo, e a quantidade no segundo argumento.',
    difficulty: 1,
  },
  {
    id: 'back.m03.f02',
    lessonIds: ['back.m03.l01'],
    exerciseId: 'back.m03.e01',
    kind: 'predict-output',
    prompt: 'Usando a sua função, o que este código imprime?',
    code: `const estoque = { cimento: 40, areia: 12, tijolo: 3000 };
function consultarEstoque(produto, callback) {
  setTimeout(() => {
    if (!(produto in estoque)) {
      callback(new Error('Produto não encontrado: ' + produto));
      return;
    }
    callback(null, estoque[produto]);
  }, 20);
}
consultarEstoque('areia', (err, qtd) => console.log('areia:', qtd));
console.log('consultando...');`,
    expectedOutput: 'consultando...\nareia: 12',
    explanation: 'A consulta espera 20 ms, então a linha síncrona "consultando..." sai antes.',
    difficulty: 1,
  },
  {
    id: 'back.m03.f03',
    lessonIds: ['back.m03.l01'],
    exerciseId: 'back.m03.d01',
    kind: 'multiple-choice',
    prompt: 'Por que a versão com defeito de `imprimirPedido` quebrava com `TypeError` no id inválido?',
    options: [
      'Depois do `callback(err)` a função seguia e lia `pedido.id`, com `pedido` valendo `undefined`',
      'Porque `lerPedido` lançava o erro com `throw`',
      'Porque `setTimeout` não aceita funções com dois parâmetros',
      'Porque o id -1 não é um número',
    ],
    answerIndex: 0,
    explanation:
      'Sem `return`, o código continua para a linha do sucesso, que acessa uma propriedade de `undefined`.',
    difficulty: 1,
  },
  {
    id: 'back.m03.f04',
    lessonIds: ['back.m03.l01'],
    exerciseId: 'back.m03.d01',
    kind: 'true-false',
    prompt:
      'Na versão corrigida, com um id válido, o callback de `imprimirPedido` é chamado uma vez só, com `err` igual a `null`.',
    answer: true,
    explanation: 'O `if (err)` não entra, e a única chamada é `callback(null, texto)`.',
    difficulty: 1,
  },
];
