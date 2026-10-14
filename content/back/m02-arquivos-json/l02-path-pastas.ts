import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'back.m02.l02',
  moduleId: 'back.m02',
  order: 2,
  title: 'Caminhos e pastas: path, __dirname e readdirSync',
  concepts: [
    'path.join',
    'path.resolve',
    'path.basename',
    'path.extname',
    'path.dirname',
    '__dirname e process.cwd()',
    'readdirSync',
    'mkdirSync com recursive',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Montar caminho colando texto (`pasta + "/" + nome`) é pedir para dar errado: falta uma barra, sobra ' +
        'outra, e no Windows a barra é `\\`. O módulo **`path`** monta e desmonta caminhos do jeito certo para ' +
        'o sistema onde o código roda:\n\n' +
        "- `path.join('notas', '2026', 'vendas.csv')` → `notas/2026/vendas.csv` (junta e arruma barras e `..`);\n" +
        "- `path.resolve('notas')` → caminho **absoluto**, a partir da pasta atual (ex.: `/app/notas`);\n" +
        "- `path.basename('notas/vendas.csv')` → `vendas.csv` (e `path.basename(c, '.csv')` → `vendas`);\n" +
        "- `path.extname('vendas.csv')` → `.csv` (com o ponto; respeita maiúsculas: `.CSV`);\n" +
        "- `path.dirname('notas/2026/vendas.csv')` → `notas/2026`.\n\n" +
        '**Pasta atual x pasta do script.** Caminho relativo (`"config.json"`) é relativo a `process.cwd()`, a ' +
        'pasta de onde você rodou o `node`. Já **`__dirname`** (no CommonJS) é a pasta onde está o arquivo do ' +
        "script. Para achar um arquivo que mora ao lado do script, use `path.join(__dirname, 'config.json')`: " +
        'funciona não importa de onde rodaram o comando.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const path = require('path');

const arquivo = path.join('clientes', 'padaria', 'cardapio-FINAL-v2.json');
console.log(arquivo);
console.log(path.basename(arquivo));
console.log(path.extname(arquivo));
console.log(path.dirname(arquivo));
console.log(path.join(__dirname, 'config.json'));`,
      explanation:
        'Aqui o script mora em `/app`, então `__dirname` vale `/app`. Num projeto de verdade, seria a pasta do ' +
        'arquivo `.js`.',
    },
    {
      kind: 'text',
      markdown:
        'Para trabalhar com **pastas**:\n\n' +
        '- `fs.readdirSync(pasta)` devolve um array com os **nomes** do que tem dentro (arquivos e subpastas), ' +
        'sem o caminho na frente. Para abrir cada um, junte com `path.join(pasta, nome)`.\n' +
        '- `fs.mkdirSync(pasta)` cria **uma** pasta. Se a pasta de cima não existir, dá `ENOENT`; se a pasta ' +
        'já existir, dá `EEXIST`.\n' +
        '- `fs.mkdirSync(pasta, { recursive: true })` cria todas as pastas que faltam no caminho e **não ' +
        'reclama** se elas já existem. Na prática, é o que você quer quase sempre.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const fs = require('fs');
const path = require('path');

fs.mkdirSync(path.join('backup', '2026', '10'), { recursive: true });
fs.writeFileSync(path.join('backup', '2026', '10', 'vendas.csv'), 'produto,qtd\\n', 'utf8');
fs.writeFileSync(path.join('backup', '2026', '10', 'leia-me.txt'), 'Não apagar!', 'utf8');

const nomes = fs.readdirSync(path.join('backup', '2026', '10'));
console.log(nomes);
console.log(nomes.filter((nome) => path.extname(nome) === '.csv'));`,
      explanation:
        'O `recursive: true` criou `backup`, `backup/2026` e `backup/2026/10` de uma vez. O `readdirSync` ' +
        'devolve só os nomes, e o `extname` ajuda a filtrar por tipo.',
    },
  ],
  checkQuestionIds: ['back.m02.q10'],
  exerciseIds: ['back.m02.e02'],
  debugExerciseIds: ['back.m02.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m02.e02',
    lessonId: 'back.m02.l02',
    kind: 'implement',
    title: 'Só as planilhas, por favor',
    promptMarkdown:
      'A pasta `notas` do Escritório Contábil Balanço Fechado tem de tudo: planilhas, foto do gato, ' +
      'backup de backup. Crie `listarPlanilhas(pasta)`, que devolve um array com os **nomes** dos arquivos ' +
      'da pasta cuja extensão é `.csv`, **em maiúsculas ou minúsculas** (o sistema antigo exporta ' +
      '`FEVEREIRO.CSV`).\n\n' +
      'Cuidado: `marco.csv.bak` **não** é planilha, e subpastas também não entram.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const fs = require('fs');
const path = require('path');

function listarPlanilhas(pasta) {
  // devolva só os nomes com extensão .csv (maiúscula ou minúscula)
}
`,
    solution: `const fs = require('fs');
const path = require('path');

function listarPlanilhas(pasta) {
  return fs.readdirSync(pasta).filter((nome) => path.extname(nome).toLowerCase() === '.csv');
}
`,
    fsSeed: {
      'notas/janeiro.csv': 'produto,valor\n',
      'notas/FEVEREIRO.CSV': 'produto,valor\n',
      'notas/foto-do-gato.jpg': '(o gato)',
      'notas/marco.csv.bak': 'produto,valor\n',
      'notas/leia-me.txt': 'Não mexer na pasta 2025!!!',
      'notas/2025/dezembro.csv': 'produto,valor\n',
    },
    tests: [
      {
        description: 'devolve só as planilhas .csv (maiúsculas ou minúsculas)',
        code: `assert.deepStrictEqual([...listarPlanilhas('notas')].sort(), ['FEVEREIRO.CSV', 'janeiro.csv']);`,
      },
      {
        description: 'devolve os nomes, não o caminho inteiro',
        code: `assert.ok(listarPlanilhas('notas').includes('janeiro.csv'));`,
      },
      {
        description: 'funciona com um caminho montado com path.join',
        code: `assert.deepStrictEqual(listarPlanilhas(require('path').join('notas', '2025')), ['dezembro.csv']);`,
      },
      {
        description: 'uma pasta vazia devolve lista vazia',
        code: `require('fs').mkdirSync('vazia');
assert.deepStrictEqual(listarPlanilhas('vazia'), []);`,
      },
    ],
    hints: [
      '`fs.readdirSync(pasta)` devolve os nomes. Depois é um `filter`.',
      "`path.extname('marco.csv.bak')` é `.bak`, e `path.extname('FEVEREIRO.CSV')` é `.CSV`. Use " +
        '`.toLowerCase()` antes de comparar com `.csv`.',
    ],
    followUpQuestionIds: ['back.m02.f05', 'back.m02.f06'],
    difficulty: 2,
  },
  {
    id: 'back.m02.d02',
    lessonId: 'back.m02.l02',
    kind: 'debug',
    title: 'O backup que nunca saiu do lugar',
    promptMarkdown:
      'A função `salvarBackup(ano, mes, nome, conteudo)` deveria gravar o arquivo em `backup/<ano>/<mes>/<nome>`, ' +
      'criando as pastas que faltarem, e devolver o caminho gravado. Ela foi escrita colando texto e quebra ' +
      'logo na primeira chamada. Conserte usando `path.join` e o `mkdirSync` certo.\n\n' +
      "Exemplo: `salvarBackup('2026', '10', 'vendas.csv', '...')` grava e devolve `backup/2026/10/vendas.csv`. " +
      'Chamar de novo no mesmo mês não pode dar erro.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const fs = require('fs');
const path = require('path');

function salvarBackup(ano, mes, nome, conteudo) {
  const pasta = 'backup/' + ano + mes;
  fs.mkdirSync(pasta);
  const destino = pasta + nome;
  fs.writeFileSync(destino, conteudo, 'utf8');
  return destino;
}
`,
    solution: `const fs = require('fs');
const path = require('path');

function salvarBackup(ano, mes, nome, conteudo) {
  const pasta = path.join('backup', ano, mes);
  fs.mkdirSync(pasta, { recursive: true });
  const destino = path.join(pasta, nome);
  fs.writeFileSync(destino, conteudo, 'utf8');
  return destino;
}
`,
    tests: [
      {
        description: 'devolve o caminho backup/2026/10/vendas.csv',
        code: `assert.strictEqual(salvarBackup('2026', '10', 'vendas.csv', 'produto,qtd\\n'), 'backup/2026/10/vendas.csv');`,
      },
      {
        description: 'o arquivo é gravado na pasta certa',
        code: `salvarBackup('2026', '10', 'vendas.csv', 'produto,qtd\\n');
assert.strictEqual(require('fs').readFileSync('backup/2026/10/vendas.csv', 'utf8'), 'produto,qtd\\n');`,
      },
      {
        description: 'dois backups no mesmo mês não dão erro',
        code: `salvarBackup('2026', '11', 'a.csv', '1');
salvarBackup('2026', '11', 'b.csv', '2');
assert.deepStrictEqual(require('fs').readdirSync('backup/2026/11'), ['a.csv', 'b.csv']);`,
      },
    ],
    hints: [
      "`'backup/' + ano + mes` com `'2026'` e `'10'` dá `backup/202610`. Use `path.join('backup', ano, mes)`.",
      '`mkdirSync` sem opções só cria uma pasta, e reclama se ela já existe. Passe `{ recursive: true }`.',
    ],
    followUpQuestionIds: ['back.m02.f07', 'back.m02.f08'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m02.q10',
    lessonIds: ['back.m02.l02'],
    kind: 'predict-output',
    prompt: 'Rodando no Linux do servidor, o que este código imprime?',
    code: `const path = require('path');
console.log(path.join('notas', '2026/', '/vendas.csv'));`,
    expectedOutput: 'notas/2026/vendas.csv',
    explanation:
      'O `path.join` junta os pedaços e arruma as barras repetidas. Nada de `notas/2026//vendas.csv`.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q11',
    lessonIds: ['back.m02.l02'],
    kind: 'predict-output',
    prompt: 'O cliente mandou o arquivo com um nome "criativo". O que este código imprime?',
    code: `const path = require('path');
const arquivo = 'clientes/padaria/cardapio-FINAL-agora-vai.json';
console.log(path.basename(arquivo));
console.log(path.extname(arquivo));
console.log(path.dirname(arquivo));
console.log(path.basename(arquivo, '.json'));`,
    expectedOutput: 'cardapio-FINAL-agora-vai.json\n.json\nclientes/padaria\ncardapio-FINAL-agora-vai',
    explanation:
      '`basename` é o nome do arquivo, `extname` a extensão com o ponto, `dirname` a pasta. Passando a ' +
      'extensão como segundo argumento, o `basename` tira ela do nome.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q12',
    lessonIds: ['back.m02.l02'],
    kind: 'multiple-choice',
    prompt: "Por que usar `path.join(pasta, nome)` em vez de `pasta + '/' + nome`?",
    options: [
      'O `path.join` usa o separador certo do sistema e arruma barras repetidas e `..`',
      'O `path.join` também cria a pasta se ela não existir',
      'Colar texto com `+` não funciona com variáveis',
      'O `path.join` confere se o arquivo existe',
    ],
    answerIndex: 0,
    explanation:
      'O `path` só mexe com o **texto** do caminho; não cria nem confere nada no disco. Mas mexe do jeito ' +
      'certo para Linux, Mac e Windows.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q13',
    lessonIds: ['back.m02.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const path = require('path');
console.log(path.join('relatorios', '..', 'backup', 'vendas.csv'));`,
    expectedOutput: 'backup/vendas.csv',
    explanation: 'O `..` volta uma pasta: entrou em `relatorios` e saiu. Sobra `backup/vendas.csv`.',
    difficulty: 2,
  },
  {
    id: 'back.m02.q14',
    lessonIds: ['back.m02.l02'],
    kind: 'true-false',
    prompt:
      "`fs.mkdirSync('a/b/c', { recursive: true })` cria as pastas que faltam e não dá erro se elas já existirem.",
    answer: true,
    explanation:
      'Com `recursive: true` o `mkdirSync` cria o caminho inteiro e fica quieto se já existir. Sem ele, ' +
      'dá `ENOENT` (falta a pasta de cima) ou `EEXIST` (já existe).',
    difficulty: 1,
  },
  {
    id: 'back.m02.q15',
    lessonIds: ['back.m02.l02'],
    kind: 'fill-blank',
    prompt:
      'O `clientes.json` mora numa pasta `dados` ao lado do script. Complete para achar o arquivo não importa ' +
      'de onde rodaram o `node` (CommonJS).',
    code: `const caminho = path.join(___, 'dados', 'clientes.json');`,
    acceptedAnswers: ['__dirname'],
    explanation:
      '`__dirname` é a pasta do arquivo do script. Já `process.cwd()` muda conforme a pasta de onde o ' +
      'comando foi rodado.',
    difficulty: 2,
  },
  {
    id: 'back.m02.q16',
    lessonIds: ['back.m02.l02'],
    kind: 'multiple-choice',
    prompt: "O que `fs.readdirSync('notas')` devolve?",
    options: [
      'Um array com os nomes do que tem na pasta (arquivos e subpastas), sem o caminho na frente',
      'Um array com os caminhos completos, como `/app/notas/janeiro.csv`',
      'Só os arquivos, sem as subpastas',
      'O conteúdo de todos os arquivos, juntos num texto',
    ],
    answerIndex: 0,
    explanation: 'São só os nomes, como `janeiro.csv`. Para ler cada um, junte com `path.join(pasta, nome)`.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q17',
    lessonIds: ['back.m02.l02'],
    kind: 'multiple-choice',
    prompt:
      "O script `/home/dev/freela/scripts/backup.js` faz `fs.readFileSync('config.json', 'utf8')`. " +
      'Você está em `/home/dev/freela` e roda `node scripts/backup.js`. Qual arquivo ele tenta ler?',
    options: [
      '`/home/dev/freela/config.json`',
      '`/home/dev/freela/scripts/config.json`',
      '`/config.json`',
      '`/home/dev/config.json`',
    ],
    answerIndex: 0,
    explanation:
      'Caminho relativo parte de `process.cwd()`, a pasta de onde o comando foi rodado. Para ler ao lado do ' +
      "script, seria `path.join(__dirname, 'config.json')`.",
    difficulty: 2,
  },
  {
    id: 'back.m02.q18',
    lessonIds: ['back.m02.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const path = require('path');
console.log(path.extname('foto-da-obra.JPG'));
console.log(path.extname('backup.tar.gz'));
console.log(path.extname('LEIAME') === '');`,
    expectedOutput: '.JPG\n.gz\ntrue',
    explanation:
      'O `extname` pega do último ponto em diante e não muda maiúsculas. Sem ponto, a extensão é texto ' +
      'vazio.',
    difficulty: 2,
  },

  // ---- acompanhamento: e02 ----
  {
    id: 'back.m02.f05',
    lessonIds: ['back.m02.l02'],
    exerciseId: 'back.m02.e02',
    kind: 'multiple-choice',
    prompt: 'Por que a sua `listarPlanilhas` não deixa passar o `marco.csv.bak`?',
    options: [
      'Porque `path.extname` pega só a última extensão, `.bak`',
      'Porque o `readdirSync` esconde arquivos de backup',
      'Porque o nome tem dois pontos e o Node ignora',
      'Porque `.bak` está em minúsculas',
    ],
    answerIndex: 0,
    explanation:
      '`path.extname` olha do último ponto em diante. Já um `nome.includes(".csv")` deixaria o `.bak` passar.',
    difficulty: 1,
  },
  {
    id: 'back.m02.f06',
    lessonIds: ['back.m02.l02'],
    exerciseId: 'back.m02.e02',
    kind: 'true-false',
    prompt:
      "Na sua `listarPlanilhas('notas')`, a subpasta `2025` não aparece no resultado porque `readdirSync` não " +
      'lista subpastas.',
    answer: false,
    explanation:
      'O `readdirSync` lista sim a subpasta `2025`. Ela fica de fora porque `path.extname("2025")` é texto ' +
      'vazio, não `.csv`.',
    difficulty: 2,
  },

  // ---- acompanhamento: d02 ----
  {
    id: 'back.m02.f07',
    lessonIds: ['back.m02.l02'],
    exerciseId: 'back.m02.d02',
    kind: 'multiple-choice',
    prompt:
      "Na versão com defeito, `salvarBackup('2026', '10', ...)` quebrava com `ENOENT` no `mkdirSync`. Por quê?",
    options: [
      'Tentava criar `backup/202610` sem a pasta `backup` existir, e sem `recursive` o mkdir não cria a de cima',
      'Porque a pasta `backup/2026/10` já existia',
      'Porque `writeFileSync` não aceita nomes com números',
      'Porque faltava o encoding `utf8` no `mkdirSync`',
    ],
    answerIndex: 0,
    explanation:
      'Dois defeitos juntos: o caminho colado sem barras e o `mkdirSync` sem `{ recursive: true }`.',
    difficulty: 2,
  },
  {
    id: 'back.m02.f08',
    lessonIds: ['back.m02.l02'],
    exerciseId: 'back.m02.d02',
    kind: 'predict-output',
    prompt: 'Com o seu conserto, o que este trecho imprime?',
    code: `const path = require('path');
const pasta = path.join('backup', '2026', '10');
console.log(path.join(pasta, 'vendas.csv'));
console.log('backup/' + '2026' + '10' + 'vendas.csv');`,
    expectedOutput: 'backup/2026/10/vendas.csv\nbackup/202610vendas.csv',
    explanation:
      'A primeira linha é o caminho que a sua função monta; a segunda, o que o código antigo montava.',
    difficulty: 1,
  },
];
