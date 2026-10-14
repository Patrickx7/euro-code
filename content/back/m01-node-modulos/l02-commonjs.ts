import type { Exercise, Lesson, Question } from '../../../src/shared/content';

const PRECOS_JS = `const VALOR_HORA = 90;

function taxaDeslocamento(km) {
  return km * 1.5;
}

module.exports = { VALOR_HORA, taxaDeslocamento };
`;

const FORMATAR_JS = `function formatarReal(valor) {
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

module.exports = { formatarReal };
`;

export const lesson: Lesson = {
  id: 'back.m01.l02',
  moduleId: 'back.m01',
  order: 2,
  title: 'Módulos CommonJS: require e module.exports',
  concepts: ['módulo', 'require', 'module.exports', 'exports', 'módulos nativos', 'caminho relativo'],
  sections: [
    {
      kind: 'text',
      markdown:
        'O projeto que o sobrinho do cliente deixou tem 3 mil linhas num arquivo só, `tudo.js`. Ninguém ' +
        'acha nada. A saída é dividir o código em **módulos**: cada arquivo cuida de um assunto e ' +
        'escolhe o que mostra para os outros.\n\n' +
        'No Node, o sistema clássico de módulos se chama **CommonJS**:\n\n' +
        '- `module.exports` é o que o arquivo **entrega** para quem o carregar. Tudo que não for ' +
        'exportado fica escondido dentro do arquivo.\n' +
        "- `require('./arquivo')` **carrega** outro arquivo e devolve o `module.exports` dele.\n\n" +
        '```js\n// precos.js\nconst VALOR_HORA = 90;\nfunction taxaDeslocamento(km) {\n  return km * 1.5;\n}\n' +
        'module.exports = { VALOR_HORA, taxaDeslocamento };\n```\n\n' +
        "```js\n// orcamento.js\nconst precos = require('./precos');\n" +
        'console.log(precos.VALOR_HORA * 2 + precos.taxaDeslocamento(10)); // 195\n```\n\n' +
        '`{ VALOR_HORA, taxaDeslocamento }` é um atalho para `{ VALOR_HORA: VALOR_HORA, taxaDeslocamento: ' +
        'taxaDeslocamento }`: um objeto com as coisas que você quer entregar.',
    },
    {
      kind: 'text',
      markdown:
        '**Pegando só o que precisa.** Como o `require` devolve um objeto, dá para tirar as propriedades ' +
        'dele direto em variáveis, com chaves do lado esquerdo (isso se chama **desestruturação**):\n\n' +
        "```js\nconst { VALOR_HORA, taxaDeslocamento } = require('./precos');\n" +
        'console.log(taxaDeslocamento(4)); // 6\n```\n\n' +
        '**O caminho importa.** `\'./precos\'` com `./` quer dizer "o arquivo `precos.js` na mesma pasta" ' +
        '(o `.js` pode ser omitido). Sem o `./`, o Node procura um **módulo nativo** ou um pacote ' +
        "instalado com esse nome, e reclama: `Cannot find module 'precos'`.\n\n" +
        "Os módulos nativos vêm com o Node e são carregados só pelo nome: `require('path')`, " +
        "`require('fs')`, `require('events')`.\n\n" +
        '**Um arquivo roda uma vez só.** Na primeira vez que alguém dá `require`, o Node executa o arquivo ' +
        'e guarda o resultado. Os próximos `require` do mesmo arquivo recebem o mesmo objeto, sem rodar ' +
        'de novo.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const path = require('path');

const pasta = path.join('clientes', 'padaria-pao-de-ontem');
console.log(pasta);
console.log(path.extname('orcamento-final-AGORA-VAI.pdf'));`,
      explanation:
        '`path` é um módulo nativo, então vem sem `./`. Ele monta e desmonta caminhos de arquivo sem você ' +
        'ter que se preocupar com as barras.',
    },
    {
      kind: 'text',
      markdown:
        '**`exports` é um apelido.** Dentro de todo arquivo CommonJS existe também a variável `exports`, ' +
        'que no começo aponta para o mesmo objeto que `module.exports`. Então dá para escrever:\n\n' +
        '```js\nexports.formatarReal = function (valor) { /* ... */ };\n```\n\n' +
        'Mas cuidado: `exports = { ... }` **não exporta nada**. Isso só faz a variável `exports` apontar ' +
        'para outro objeto; o Node continua entregando o `module.exports` original (vazio). Na dúvida, use ' +
        'sempre `module.exports`.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `exports.nome = 'Gráfica Tinta Fresca';
console.log(module.exports);

exports = { telefone: '11 4000-0000' };
console.log(module.exports);`,
      explanation:
        'Acrescentar propriedade em `exports` funciona, porque ele aponta para o `module.exports`. ' +
        'Reatribuir `exports` só troca a variável local: o `module.exports` continua com o `nome` e nada mais.',
    },
  ],
  checkQuestionIds: ['back.m01.q10', 'back.m01.q11'],
  exerciseIds: ['back.m01.e02'],
  debugExerciseIds: ['back.m01.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m01.e02',
    lessonId: 'back.m01.l02',
    kind: 'implement',
    title: 'Orçamento em módulo',
    promptMarkdown:
      'O cliente quer que os preços fiquem num arquivo separado, `precos.js` (já pronto, veja abaixo), ' +
      'para ele "mesmo mudar quando der". Neste arquivo:\n\n' +
      '1. carregue `./precos` com `require`;\n' +
      '2. crie `orcamento(horas, km)`, que devolve `horas × VALOR_HORA + taxaDeslocamento(km)`, usando ' +
      'o que vem de `precos.js` (nada de escrever 90 na mão!);\n' +
      '3. exporte a função: `module.exports = { orcamento };`.\n\n' +
      '```js\n// precos.js\n' +
      PRECOS_JS +
      '```',
    language: 'js',
    moduleSystem: 'commonjs',
    extraFiles: { 'precos.js': PRECOS_JS },
    starterCode: `// carregue ./precos aqui

function orcamento(horas, km) {
  // seu código aqui
}

// exporte a função aqui
`,
    solution: `const { VALOR_HORA, taxaDeslocamento } = require('./precos');

function orcamento(horas, km) {
  return horas * VALOR_HORA + taxaDeslocamento(km);
}

module.exports = { orcamento };
`,
    tests: [
      {
        description: '2 horas e 10 km dão 195',
        code: 'assert.strictEqual(orcamento(2, 10), 195);',
      },
      {
        description: '1 hora sem deslocamento (home office) dá 90',
        code: 'assert.strictEqual(orcamento(1, 0), 90);',
      },
      {
        description: 'a função é exportada com module.exports',
        code: `assert.strictEqual(typeof module.exports.orcamento, 'function', 'Exporte a função: module.exports = { orcamento };');
assert.strictEqual(module.exports.orcamento(3, 4), 276);`,
      },
    ],
    hints: [
      "`const { VALOR_HORA, taxaDeslocamento } = require('./precos');` pega as duas coisas de uma vez.",
      'A conta é `horas * VALOR_HORA + taxaDeslocamento(km)`. No fim do arquivo, `module.exports = { orcamento };`.',
    ],
    followUpQuestionIds: ['back.m01.f05', 'back.m01.f06'],
    difficulty: 1,
  },
  {
    id: 'back.m01.d02',
    lessonId: 'back.m01.l02',
    kind: 'debug',
    title: 'Cannot find module',
    promptMarkdown:
      'O script de recibos do cliente quebra logo na primeira linha:\n\n' +
      "```\nError: Cannot find module 'formatar'\n```\n\n" +
      'O arquivo `formatar.js` está ali, na mesma pasta (veja abaixo). Conserte o carregamento para que ' +
      "`recibo('Dona Cida', 150)` devolva `'Recibo: Dona Cida - R$ 150,00'`.\n\n" +
      '```js\n// formatar.js\n' +
      FORMATAR_JS +
      '```',
    language: 'js',
    moduleSystem: 'commonjs',
    extraFiles: { 'formatar.js': FORMATAR_JS },
    starterCode: `const { formatarReal } = require('formatar');

function recibo(cliente, valor) {
  return 'Recibo: ' + cliente + ' - ' + formatarReal(valor);
}

module.exports = { recibo };
`,
    solution: `const { formatarReal } = require('./formatar');

function recibo(cliente, valor) {
  return 'Recibo: ' + cliente + ' - ' + formatarReal(valor);
}

module.exports = { recibo };
`,
    tests: [
      {
        description: 'monta o recibo da Dona Cida',
        code: "assert.strictEqual(recibo('Dona Cida', 150), 'Recibo: Dona Cida - R$ 150,00');",
      },
      {
        description: 'formata centavos com vírgula',
        code: "assert.strictEqual(recibo('Seu Zé', 72.5), 'Recibo: Seu Zé - R$ 72,50');",
      },
    ],
    hints: [
      'Sem `./` no começo, o Node procura um módulo nativo ou um pacote instalado chamado `formatar`, não o seu arquivo.',
    ],
    followUpQuestionIds: ['back.m01.f07', 'back.m01.f08'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m01.q10',
    lessonIds: ['back.m01.l02'],
    kind: 'multiple-choice',
    prompt: "No CommonJS, o que o `require('./precos')` devolve?",
    options: [
      'O `module.exports` do arquivo `precos.js`',
      'O texto do arquivo `precos.js`',
      'Todas as variáveis declaradas em `precos.js`, exportadas ou não',
      '`true` se o arquivo existir',
    ],
    answerIndex: 0,
    explanation:
      'O `require` executa o arquivo (na primeira vez) e devolve o que ele colocou em `module.exports`. O resto fica escondido.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q11',
    lessonIds: ['back.m01.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `exports.cliente = 'Oficina do Bigode';
exports.horas = 3;
console.log(module.exports);`,
    expectedOutput: "{ cliente: 'Oficina do Bigode', horas: 3 }",
    explanation:
      '`exports` aponta para o mesmo objeto que `module.exports`, então as duas propriedades aparecem nele.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q12',
    lessonIds: ['back.m01.l02'],
    kind: 'predict-output',
    prompt: 'O sobrinho do cliente jurou que exportou. O que este código imprime?',
    code: `exports = { calcular: 'pronto' };
console.log(module.exports);`,
    expectedOutput: '{}',
    explanation:
      'Reatribuir `exports` só troca a variável local. O Node entrega o `module.exports`, que continua vazio.',
    difficulty: 2,
  },
  {
    id: 'back.m01.q13',
    lessonIds: ['back.m01.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `module.exports = { versao: 2 };
exports.extra = true;
console.log(module.exports);`,
    expectedOutput: '{ versao: 2 }',
    explanation:
      'Depois de `module.exports = { ... }`, a variável `exports` ainda aponta para o objeto antigo. O `extra` vai para um objeto que ninguém exporta.',
    difficulty: 3,
  },
  {
    id: 'back.m01.q14',
    lessonIds: ['back.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'O arquivo `clientes.js` está na mesma pasta do seu script. Qual linha o carrega?',
    options: ["require('./clientes')", "require('clientes')", 'require(clientes.js)', "import('clientes')"],
    answerIndex: 0,
    explanation:
      'Arquivos do próprio projeto são carregados por caminho relativo, começando com `./` (ou `../`). Sem ele, o Node procura um módulo nativo ou pacote.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q15',
    lessonIds: ['back.m01.l02'],
    kind: 'true-false',
    prompt:
      "Se três arquivos diferentes derem `require('./config')`, o código de `config.js` é executado três vezes.",
    answer: false,
    explanation:
      'O Node executa o arquivo só no primeiro `require` e guarda o resultado. Os outros recebem o mesmo objeto.',
    difficulty: 2,
  },
  {
    id: 'back.m01.q16',
    lessonIds: ['back.m01.l02'],
    kind: 'fill-blank',
    prompt: 'Complete para que `desconto` possa ser usado por outros arquivos com `require`.',
    code: `function desconto(valor) {
  return valor * 0.9;
}

___ = { desconto };`,
    acceptedAnswers: ['module.exports'],
    explanation: '`module.exports = { desconto };` entrega um objeto com a função para quem fizer `require`.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q17',
    lessonIds: ['back.m01.l02'],
    kind: 'predict-output',
    prompt: 'Desestruturação, aquela que parece mágica. O que este código imprime?',
    code: `const precos = { VALOR_HORA: 90, TAXA: 15 };
const { TAXA, VALOR_HORA } = precos;
console.log(VALOR_HORA - TAXA);`,
    expectedOutput: '75',
    explanation:
      'A desestruturação pega as propriedades pelo **nome**, não pela ordem. `VALOR_HORA` vale 90 e `TAXA` vale 15.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'back.m01.f05',
    lessonIds: ['back.m01.l02'],
    exerciseId: 'back.m01.e02',
    kind: 'multiple-choice',
    prompt:
      'O cliente mudou `VALOR_HORA` para 100 em `precos.js`. Quanto passa a dar `orcamento(2, 10)` no seu código?',
    options: ['215', '195', '200', '120'],
    answerIndex: 0,
    explanation:
      'Como você usou o `VALOR_HORA` do módulo, a mudança vale na hora: 2 × 100 + 10 × 1,5 = 215. Por isso não se escreve o 90 na mão.',
    difficulty: 2,
  },
  {
    id: 'back.m01.f06',
    lessonIds: ['back.m01.l02'],
    exerciseId: 'back.m01.e02',
    kind: 'true-false',
    prompt:
      'Se você apagasse a linha `module.exports = { orcamento };`, outro arquivo ainda conseguiria usar `require(...).orcamento`.',
    answer: false,
    explanation:
      'O que não está em `module.exports` fica escondido no arquivo. O `require` devolveria um objeto vazio e `orcamento` seria `undefined`.',
    difficulty: 1,
  },
  {
    id: 'back.m01.f07',
    lessonIds: ['back.m01.l02'],
    exerciseId: 'back.m01.d02',
    kind: 'multiple-choice',
    prompt: "Por que `require('formatar')` dava `Cannot find module`?",
    options: [
      'Sem `./`, o Node procura um módulo nativo ou pacote instalado com esse nome',
      'Porque faltava a extensão `.js`',
      'Porque `formatar.js` não exportava nada',
      'Porque `require` só funciona com módulos nativos',
    ],
    answerIndex: 0,
    explanation:
      'Com `./formatar` o Node procura o arquivo na mesma pasta. A extensão `.js` pode ser omitida.',
    difficulty: 1,
  },
  {
    id: 'back.m01.f08',
    lessonIds: ['back.m01.l02'],
    exerciseId: 'back.m01.d02',
    kind: 'fill-blank',
    prompt: 'Complete a linha que você consertou.',
    code: `const { formatarReal } = require('___');`,
    acceptedAnswers: ['./formatar', './formatar.js'],
    explanation: 'O `./` diz "arquivo na mesma pasta". O `.js` é opcional no CommonJS.',
    difficulty: 1,
  },
];
