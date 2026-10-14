import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'back.m03.l04',
  moduleId: 'back.m03',
  order: 4,
  title: 'EventEmitter: a fila de pedidos da padaria',
  concepts: [
    'EventEmitter',
    'on e emit',
    'once',
    'off (removeListener)',
    'classe que estende EventEmitter',
    "evento 'error'",
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Promises servem para **uma** resposta. Mas e quando algo acontece **várias vezes**? Um pedido novo ' +
        'chega na padaria, outro, mais outro... Para isso o Node tem os **eventos**, no módulo `events`.\n\n' +
        'Um `EventEmitter` é um objeto que **emite** eventos com nome, e qualquer um pode **ouvir**:\n\n' +
        '- `emissor.on(nome, funcao)`: registra um _listener_ (ouvinte) que roda **toda vez** que o evento ' +
        'acontecer;\n' +
        '- `emissor.once(nome, funcao)`: igual, mas só na **primeira** vez; depois ele se remove sozinho;\n' +
        '- `emissor.emit(nome, ...dados)`: dispara o evento, passando os dados para cada listener;\n' +
        '- `emissor.off(nome, funcao)`: remove um listener. Precisa ser **a mesma função** que você ' +
        'registrou, então guarde ela numa variável.\n\n' +
        'Detalhe importante: o `emit` é **síncrono**. Ele chama todos os listeners, na ordem em que foram ' +
        'registrados, antes de passar para a próxima linha.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const EventEmitter = require('events');
const balcao = new EventEmitter();

balcao.on('pedido:novo', (item) => console.log('Cozinha: preparando ' + item));
balcao.once('pedido:novo', () => console.log('Caixa: primeiro pedido do dia!'));

console.log('antes do emit');
balcao.emit('pedido:novo', 'pão na chapa');
balcao.emit('pedido:novo', 'café com leite');
console.log('depois do emit');`,
      explanation:
        'O listener do `once` roda só no primeiro pedido. E tudo acontece entre "antes" e "depois", porque o `emit` é síncrono.',
    },
    {
      kind: 'text',
      markdown:
        'O mais comum no Node é criar uma **classe que estende** `EventEmitter`. Ela ganha `on`, `emit` e ' +
        'companhia, e você emite os eventos de dentro dos seus métodos. É assim que funcionam servidores ' +
        'HTTP, streams de arquivo e muito mais.\n\n' +
        "```js\nconst { EventEmitter } = require('events');\n\nclass Forno extends EventEmitter {\n" +
        '  constructor() {\n    super(); // obrigatório antes de usar this\n    this.fornadas = 0;\n  }\n' +
        "  assar() {\n    this.fornadas++;\n    this.emit('fornada:pronta', this.fornadas);\n  }\n}\n```\n\n" +
        "O evento **`'error'`** é especial: se você der `emit('error', erro)` e **ninguém** estiver " +
        "ouvindo `'error'`, o Node **lança** o erro e, se ninguém pegar, o programa cai. Por isso, quem usa " +
        "um emissor que pode falhar sempre registra um `on('error', ...)`.",
    },
    {
      kind: 'example',
      language: 'js',
      code: `const { EventEmitter } = require('events');

class Impressora extends EventEmitter {
  imprimir(texto) {
    if (texto.length > 20) {
      this.emit('error', new Error('Papel curto demais'));
      return;
    }
    this.emit('impresso', texto);
  }
}

const impressora = new Impressora();
impressora.on('impresso', (t) => console.log('Saiu: ' + t));
impressora.on('error', (err) => console.log('Impressora: ' + err.message));

impressora.imprimir('1x coxinha');
impressora.imprimir('1x bolo de cenoura com cobertura dupla');
console.log('ouvintes de impresso:', impressora.listenerCount('impresso'));`,
      explanation:
        "Como existe um listener de `error`, a falha vira só uma mensagem. Tire o `on('error', ...)` e o programa quebra.",
    },
  ],
  checkQuestionIds: ['back.m03.q27'],
  exerciseIds: ['back.m03.e06', 'back.m03.e07'],
  debugExerciseIds: ['back.m03.d04'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m03.e06',
    lessonId: 'back.m03.l04',
    kind: 'implement',
    title: 'A fila de pedidos da padaria',
    promptMarkdown:
      'A Padaria Fermento Lento quer um painel que mostra os pedidos na hora. Complete a classe ' +
      '`FilaDePedidos`, que **estende `EventEmitter`**:\n\n' +
      '- `adicionar(item)`: cria `{ id, item }` (o `id` começa em 1 e aumenta de 1 em 1), guarda na lista ' +
      "de pendentes, emite `'pedido:novo'` com o pedido e devolve o pedido;\n" +
      "- `finalizar(id)`: tira o pedido dos pendentes e emite `'pedido:pronto'` com ele. Se não existir " +
      "pedido com esse id, emite `'error'` com um `Error` de mensagem `Pedido <id> não existe`;\n" +
      '- `pendentes()`: devolve o array dos pedidos pendentes.\n\n' +
      'O módulo usa ESM (`import`/`export`).',
    language: 'js',
    moduleSystem: 'esm',
    starterCode: `import { EventEmitter } from 'node:events';

export class FilaDePedidos {
  constructor() {
    this.lista = [];
    this.proximoId = 1;
  }

  adicionar(item) {
    // seu código aqui
  }

  finalizar(id) {
    // seu código aqui
  }

  pendentes() {
    return this.lista;
  }
}
`,
    solution: `import { EventEmitter } from 'node:events';

export class FilaDePedidos extends EventEmitter {
  constructor() {
    super();
    this.lista = [];
    this.proximoId = 1;
  }

  adicionar(item) {
    const pedido = { id: this.proximoId, item };
    this.proximoId++;
    this.lista.push(pedido);
    this.emit('pedido:novo', pedido);
    return pedido;
  }

  finalizar(id) {
    const pedido = this.lista.find((p) => p.id === id);
    if (!pedido) {
      this.emit('error', new Error('Pedido ' + id + ' não existe'));
      return;
    }
    this.lista = this.lista.filter((p) => p.id !== id);
    this.emit('pedido:pronto', pedido);
  }

  pendentes() {
    return this.lista;
  }
}
`,
    tests: [
      {
        description: 'FilaDePedidos estende EventEmitter',
        code: `const { EventEmitter } = require('events');
assert.ok(new FilaDePedidos() instanceof EventEmitter, 'Use "class FilaDePedidos extends EventEmitter" e chame super().');`,
      },
      {
        description: "adicionar cria ids 1, 2... e emite 'pedido:novo'",
        code: `const fila = new FilaDePedidos();
const novos = [];
fila.on('pedido:novo', (p) => novos.push(p));
const p1 = fila.adicionar('pão francês');
const p2 = fila.adicionar('sonho');
assert.deepStrictEqual(p1, { id: 1, item: 'pão francês' });
assert.deepStrictEqual(novos, [
  { id: 1, item: 'pão francês' },
  { id: 2, item: 'sonho' },
]);
assert.strictEqual(p2.id, 2);
assert.strictEqual(fila.pendentes().length, 2);`,
      },
      {
        description: "finalizar tira dos pendentes e emite 'pedido:pronto'",
        code: `const fila = new FilaDePedidos();
const prontos = [];
fila.on('pedido:pronto', (p) => prontos.push(p.item));
fila.adicionar('pão francês');
fila.adicionar('sonho');
fila.finalizar(1);
assert.deepStrictEqual(prontos, ['pão francês']);
assert.deepStrictEqual(fila.pendentes(), [{ id: 2, item: 'sonho' }]);`,
      },
      {
        description: "finalizar um id que não existe emite 'error'",
        code: `const fila = new FilaDePedidos();
let erro = null;
fila.on('error', (e) => (erro = e));
fila.finalizar(99);
assert.ok(erro instanceof Error, "Esperava um Error no evento 'error'.");
assert.strictEqual(erro.message, 'Pedido 99 não existe');`,
      },
    ],
    hints: [
      'Na declaração: `class FilaDePedidos extends EventEmitter`. No construtor, `super()` vem antes de qualquer `this`.',
      'Em `adicionar`, monte o pedido com `this.proximoId`, aumente o contador, faça `push`, `this.emit(...)` e `return`.',
      'Em `finalizar`, use `find` para achar o pedido e `filter` para tirá-lo da lista.',
    ],
    followUpQuestionIds: ['back.m03.f17', 'back.m03.f18'],
    difficulty: 2,
  },
  {
    id: 'back.m03.e07',
    lessonId: 'back.m03.l04',
    kind: 'implement',
    title: 'Avisar quando o MEU pedido ficar pronto',
    promptMarkdown:
      'O app de delivery da padaria quer uma função que espera um pedido específico. Crie ' +
      '`esperarPronto(fila, id)`, que devolve uma **Promise**:\n\n' +
      "- ela cumpre com o pedido quando `fila` emitir `'pedido:pronto'` com um pedido de **esse** `id` " +
      '(pedidos de outros ids não contam);\n' +
      '- depois de cumprir, o listener que você registrou precisa ser **removido** (`off`), para não ' +
      'deixar ouvinte esquecido na fila.\n\n' +
      '`fila` é um `EventEmitter` qualquer.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function esperarPronto(fila, id) {
  return new Promise((resolve) => {
    fila.on('pedido:pronto', (pedido) => {
      resolve(pedido);
    });
  });
}
`,
    solution: `function esperarPronto(fila, id) {
  return new Promise((resolve) => {
    const aoFicarPronto = (pedido) => {
      if (pedido.id !== id) return;
      fila.off('pedido:pronto', aoFicarPronto);
      resolve(pedido);
    };
    fila.on('pedido:pronto', aoFicarPronto);
  });
}
`,
    tests: [
      {
        description: 'cumpre com o pedido certo, ignorando os outros',
        code: `const EventEmitter = require('events');
const fila = new EventEmitter();
const promessa = esperarPronto(fila, 2);
fila.emit('pedido:pronto', { id: 1, item: 'coxinha' });
fila.emit('pedido:pronto', { id: 2, item: 'pão de queijo' });
assert.deepStrictEqual(await promessa, { id: 2, item: 'pão de queijo' });`,
      },
      {
        description: 'remove o listener depois de cumprir',
        code: `const EventEmitter = require('events');
const fila = new EventEmitter();
const promessa = esperarPronto(fila, 1);
assert.strictEqual(fila.listenerCount('pedido:pronto'), 1, 'Registre um listener de pedido:pronto.');
fila.emit('pedido:pronto', { id: 1, item: 'café' });
await promessa;
assert.strictEqual(fila.listenerCount('pedido:pronto'), 0, 'O listener continua registrado. Use off com a mesma função.');`,
      },
    ],
    hints: [
      'Guarde o listener numa `const` para poder passar **a mesma função** para `fila.off`.',
      'Dentro do listener: se o `id` não bate, `return`; se bate, `fila.off(...)` e `resolve(pedido)`.',
    ],
    followUpQuestionIds: ['back.m03.f19', 'back.m03.f20'],
    difficulty: 3,
  },
  {
    id: 'back.m03.d04',
    lessonId: 'back.m03.l04',
    kind: 'debug',
    title: 'O painel que não desliga',
    promptMarkdown:
      'O painel da padaria mostra um aviso a cada pedido pronto. `desligarPainel()` deveria parar os ' +
      'avisos (a padaria fecha às 20h), mas o painel continua avisando a madrugada inteira. Conserte ' +
      '**sem** usar `removeAllListeners`.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const EventEmitter = require('events');
const balcao = new EventEmitter();
const avisos = [];

function ligarPainel() {
  balcao.on('pedido:pronto', (p) => avisos.push('Pedido ' + p.id + ' pronto!'));
}

function desligarPainel() {
  balcao.off('pedido:pronto', (p) => avisos.push('Pedido ' + p.id + ' pronto!'));
}
`,
    solution: `const EventEmitter = require('events');
const balcao = new EventEmitter();
const avisos = [];

function mostrarAviso(p) {
  avisos.push('Pedido ' + p.id + ' pronto!');
}

function ligarPainel() {
  balcao.on('pedido:pronto', mostrarAviso);
}

function desligarPainel() {
  balcao.off('pedido:pronto', mostrarAviso);
}
`,
    tests: [
      {
        description: 'avisa enquanto o painel está ligado',
        code: `ligarPainel();
balcao.emit('pedido:pronto', { id: 1 });
assert.deepStrictEqual(avisos, ['Pedido 1 pronto!']);`,
      },
      {
        description: 'depois de desligar, não avisa mais',
        code: `ligarPainel();
balcao.emit('pedido:pronto', { id: 1 });
desligarPainel();
balcao.emit('pedido:pronto', { id: 2 });
assert.deepStrictEqual(avisos, ['Pedido 1 pronto!']);
assert.strictEqual(balcao.listenerCount('pedido:pronto'), 0);`,
      },
      {
        description: 'não usa removeAllListeners',
        code: `assert.strictEqual(String(desligarPainel).includes('removeAllListeners'), false, 'Resolva com off e a mesma função.');`,
      },
    ],
    hints: [
      'Duas arrow functions com o mesmo texto são **funções diferentes**. O `off` procura exatamente a função que o `on` registrou.',
      'Crie uma função com nome (`function mostrarAviso(p) { ... }`) e use ela no `on` e no `off`.',
    ],
    followUpQuestionIds: ['back.m03.f21', 'back.m03.f22'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m03.q27',
    lessonIds: ['back.m03.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const EventEmitter = require('events');
const forno = new EventEmitter();
forno.on('pronto', (item) => console.log('saiu: ' + item));
console.log('ligando o forno');
forno.emit('pronto', 'pão de queijo');
console.log('fim');`,
    expectedOutput: 'ligando o forno\nsaiu: pão de queijo\nfim',
    explanation: 'O `emit` chama os listeners na hora, de forma síncrona, antes da linha seguinte.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q28',
    lessonIds: ['back.m03.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const EventEmitter = require('events');
const caixa = new EventEmitter();
caixa.once('pix', (valor) => console.log('pix de ' + valor));
caixa.emit('pix', 10);
caixa.emit('pix', 20);
console.log(caixa.listenerCount('pix'));`,
    expectedOutput: 'pix de 10\n0',
    explanation: 'O `once` roda só no primeiro `emit` e se remove sozinho, por isso sobram 0 listeners.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q29',
    lessonIds: ['back.m03.l04'],
    kind: 'multiple-choice',
    prompt:
      "O que acontece com `emissor.emit('error', new Error('falhou'))` se ninguém registrou `on('error', ...)`?",
    options: [
      'O erro é lançado e, se ninguém pegar, o programa cai',
      'Nada, o evento é ignorado como qualquer outro',
      'O Node imprime um aviso e segue normalmente',
      'O erro fica guardado até alguém ouvir',
    ],
    answerIndex: 0,
    explanation: "`'error'` é o único evento especial: sem listener, o `emit` lança o erro.",
    difficulty: 2,
  },
  {
    id: 'back.m03.q30',
    lessonIds: ['back.m03.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para que `Balcao` ganhe `on`, `emit` e companhia.',
    code: `const { EventEmitter } = require('events');
class Balcao ___ EventEmitter {
  chamar(senha) {
    this.emit('senha', senha);
  }
}`,
    acceptedAnswers: ['extends'],
    explanation: '`extends` faz a classe herdar todos os métodos do `EventEmitter`.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q31',
    lessonIds: ['back.m03.l04'],
    kind: 'true-false',
    prompt:
      'Numa classe que estende `EventEmitter` e tem `constructor`, é preciso chamar `super()` antes de usar `this`.',
    answer: true,
    explanation: 'Sem `super()`, o `EventEmitter` não é inicializado e usar `this` dá `ReferenceError`.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q32',
    lessonIds: ['back.m03.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const EventEmitter = require('events');
const painel = new EventEmitter();
painel.on('senha', (n) => console.log('A: senha ' + n));
painel.on('senha', (n) => console.log('B: senha ' + n));
const teveOuvinte = painel.emit('senha', 42);
console.log(teveOuvinte, painel.emit('outra-coisa'));`,
    expectedOutput: 'A: senha 42\nB: senha 42\ntrue false',
    explanation:
      'Os listeners rodam na ordem em que foram registrados. O `emit` devolve `true` se havia alguém ouvindo e `false` se não.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q33',
    lessonIds: ['back.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'Quando usar eventos (`EventEmitter`) em vez de uma Promise?',
    options: [
      'Quando a mesma coisa pode acontecer várias vezes (pedidos chegando, dados de um stream)',
      'Sempre que o código for assíncrono',
      'Só quando a operação pode falhar',
      'Quando você precisa de um valor só, uma única vez',
    ],
    answerIndex: 0,
    explanation:
      'Uma Promise termina uma vez só. Eventos servem para avisos que se repetem ao longo do tempo.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q34',
    lessonIds: ['back.m03.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const EventEmitter = require('events');
const loja = new EventEmitter();
function avisar(item) {
  console.log('chegou ' + item);
}
loja.on('entrega', avisar);
loja.emit('entrega', 'farinha');
loja.off('entrega', avisar);
loja.emit('entrega', 'fermento');
console.log('ouvintes:', loja.listenerCount('entrega'));`,
    expectedOutput: 'chegou farinha\nouvintes: 0',
    explanation:
      'Como `off` recebeu a mesma função `avisar`, o listener saiu e o segundo `emit` não encontrou ninguém.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'back.m03.f17',
    lessonIds: ['back.m03.l04'],
    exerciseId: 'back.m03.e06',
    kind: 'multiple-choice',
    prompt:
      "Com a sua `FilaDePedidos`, se você chamar `fila.finalizar(99)` sem ter registrado `fila.on('error', ...)`, o que acontece?",
    options: [
      'O `emit` lança o erro "Pedido 99 não existe"',
      'Nada acontece',
      "Dispara 'pedido:pronto' com `undefined`",
      'Remove o último pedido da lista',
    ],
    answerIndex: 0,
    explanation:
      "Sem listener de `'error'`, emitir esse evento lança o erro. Quem usa a fila precisa ouvir `'error'`.",
    difficulty: 2,
  },
  {
    id: 'back.m03.f18',
    lessonIds: ['back.m03.l04'],
    exerciseId: 'back.m03.e06',
    kind: 'true-false',
    prompt:
      "Na sua `adicionar`, os listeners de `'pedido:novo'` já rodaram quando a linha `return pedido` é executada.",
    answer: true,
    explanation: 'O `this.emit(...)` é síncrono: chama todos os listeners antes de seguir para o `return`.',
    difficulty: 2,
  },
  {
    id: 'back.m03.f19',
    lessonIds: ['back.m03.l04'],
    exerciseId: 'back.m03.e07',
    kind: 'multiple-choice',
    prompt: "Na sua `esperarPronto`, por que não dava para usar `fila.once('pedido:pronto', ...)` direto?",
    options: [
      'O `once` se remove no primeiro pedido pronto, mesmo que seja de outro id',
      'Porque `once` não existe em `EventEmitter`',
      'Porque `once` não funciona dentro de uma Promise',
      'Porque `once` chama o listener duas vezes',
    ],
    answerIndex: 0,
    explanation: 'Se o pedido 1 ficasse pronto antes do 2, o `once` sairia e você nunca veria o 2.',
    difficulty: 3,
  },
  {
    id: 'back.m03.f20',
    lessonIds: ['back.m03.l04'],
    exerciseId: 'back.m03.e07',
    kind: 'true-false',
    prompt:
      'Na sua solução, o `fila.off` só funciona porque recebe a mesma função que foi passada para `fila.on`.',
    answer: true,
    explanation:
      'O `off` compara pela referência da função. Por isso o listener ficou guardado numa `const`.',
    difficulty: 1,
  },
  {
    id: 'back.m03.f21',
    lessonIds: ['back.m03.l04'],
    exerciseId: 'back.m03.d04',
    kind: 'multiple-choice',
    prompt: 'Por que o `off` da versão com defeito não removia nada?',
    options: [
      'Ele recebia uma arrow function nova, diferente da que foi registrada no `on`',
      'O nome do evento estava errado',
      'O `off` só funciona com `once`',
      'O `off` precisa ser chamado antes do `on`',
    ],
    answerIndex: 0,
    explanation: 'Mesmo texto não é mesma função. O `off` não achou a função registrada e não fez nada.',
    difficulty: 1,
  },
  {
    id: 'back.m03.f22',
    lessonIds: ['back.m03.l04'],
    exerciseId: 'back.m03.d04',
    kind: 'predict-output',
    prompt: 'Com o painel consertado, o que este código imprime?',
    code: `const EventEmitter = require('events');
const balcao = new EventEmitter();
const avisos = [];
function mostrarAviso(p) {
  avisos.push('Pedido ' + p.id + ' pronto!');
}
balcao.on('pedido:pronto', mostrarAviso);
balcao.on('pedido:pronto', mostrarAviso);
balcao.emit('pedido:pronto', { id: 5 });
balcao.off('pedido:pronto', mostrarAviso);
console.log(avisos.length, balcao.listenerCount('pedido:pronto'));`,
    expectedOutput: '2 1',
    explanation:
      'Ligar o painel duas vezes registra o listener duas vezes (2 avisos). E cada `off` remove só uma cópia, então sobra 1.',
    difficulty: 3,
  },
];
