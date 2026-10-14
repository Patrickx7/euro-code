import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'back.m02.l01',
  moduleId: 'back.m02',
  order: 1,
  title: 'Ler e escrever arquivos com fs',
  concepts: [
    "require('fs')",
    "readFileSync com 'utf8'",
    'writeFileSync',
    'appendFileSync',
    'existsSync',
    'erro ENOENT',
    'try/catch',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Metade dos "sistemas" dos seus clientes é um arquivo de texto que alguém edita na mão. Para mexer ' +
        'neles com Node, use o módulo **`fs`** (file system), que já vem com o Node:\n\n' +
        "```js\nconst fs = require('fs');\n```\n\n" +
        "- `fs.readFileSync(caminho, 'utf8')` **lê** o arquivo inteiro e devolve o texto. Sem o `'utf8'`, o " +
        'Node devolve um `Buffer` (os bytes crus), e aí o "ç" do cliente vira sopa de letrinhas.\n' +
        "- `fs.writeFileSync(caminho, texto, 'utf8')` **grava** o texto. Se o arquivo existe, ele é " +
        '**substituído inteiro**; se não existe, é criado.\n' +
        "- `fs.appendFileSync(caminho, texto, 'utf8')` **acrescenta** no fim, sem apagar o que já tinha. " +
        'Também cria o arquivo se ele não existir. Ótimo para logs.\n' +
        '- `fs.existsSync(caminho)` devolve `true` ou `false`.\n\n' +
        'O `Sync` no nome quer dizer **síncrono**: o script espera a leitura terminar antes de seguir para a ' +
        'próxima linha. Para scripts pequenos, é o jeito mais simples.\n\n' +
        'Caminhos como `"pedidos.txt"` são **relativos à pasta onde você rodou o `node`**.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const fs = require('fs');

fs.writeFileSync('pedidos.txt', 'Marmita de frango\\n', 'utf8');
fs.appendFileSync('pedidos.txt', 'Marmita de feijoada\\n', 'utf8');

const texto = fs.readFileSync('pedidos.txt', 'utf8');
console.log(texto);
console.log(fs.existsSync('pedidos.txt'));`,
      explanation:
        'O `writeFileSync` cria o arquivo com a primeira linha; o `appendFileSync` coloca a segunda no fim. ' +
        'Repare no `\\n` no fim de cada linha: o Node não pula linha sozinho.',
    },
    {
      kind: 'text',
      markdown:
        'E quando o arquivo **não existe**? O `readFileSync` lança um erro com `code` igual a **`ENOENT`** ' +
        '("Error NO ENTry": não tem nada nesse caminho). Erro não tratado derruba o script na hora.\n\n' +
        'Para tratar, use **`try/catch`**: o código arriscado vai no `try`; se ele lançar um erro, o JavaScript ' +
        'pula direto para o `catch`, que recebe o erro.\n\n' +
        "```js\ntry {\n  const texto = fs.readFileSync('estoque.txt', 'utf8');\n} catch (err) {\n" +
        "  if (err.code === 'ENOENT') console.log('Ainda não tem estoque.');\n  else throw err;\n}\n```\n\n" +
        'Olhar o `err.code` é importante: "arquivo não existe" é normal na primeira vez, mas outros erros ' +
        '(como tentar ler uma pasta) você quer ver estourar, com `throw err`.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const fs = require('fs');

function lerAvisos() {
  try {
    return fs.readFileSync('avisos.txt', 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return 'Sem avisos hoje.';
    throw err;
  }
}

console.log(lerAvisos());
fs.writeFileSync('avisos.txt', 'O Pix caiu!', 'utf8');
console.log(lerAvisos());`,
      explanation:
        'Na primeira chamada o arquivo não existe e o `catch` devolve um texto padrão. Depois que ele é ' +
        'criado, a função lê normalmente.',
    },
  ],
  checkQuestionIds: ['back.m02.q01'],
  exerciseIds: ['back.m02.e01'],
  debugExerciseIds: ['back.m02.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m02.e01',
    lessonId: 'back.m02.l01',
    kind: 'implement',
    title: 'O caderninho de fiado digital',
    promptMarkdown:
      'O Seu Bené anota o fiado da mercearia num caderninho que já viu três enchentes. Ele quer um arquivo ' +
      '`fiado.txt`, com uma linha por compra no formato `nome;valor`.\n\n' +
      '- `anotarFiado(nome, valor)`: **acrescenta** a linha `nome;valor` (com `\\n` no fim) em `fiado.txt`, ' +
      'sem apagar as anteriores. Se o arquivo não existir, ele deve ser criado.\n' +
      "- `lerFiado()`: devolve o texto de `fiado.txt`, ou `''` (texto vazio) se o arquivo ainda não existir.\n\n" +
      "Exemplo: com o arquivo `Seu Zé;12.5\\n`, depois de `anotarFiado('Dona Cida', 30)` ele fica " +
      '`Seu Zé;12.5\\nDona Cida;30\\n`.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const fs = require('fs');

function anotarFiado(nome, valor) {
  // acrescente a linha "nome;valor" no fim de fiado.txt
}

function lerFiado() {
  // devolva o conteúdo de fiado.txt, ou '' se ele não existir
}
`,
    solution: `const fs = require('fs');

function anotarFiado(nome, valor) {
  fs.appendFileSync('fiado.txt', nome + ';' + valor + '\\n', 'utf8');
}

function lerFiado() {
  try {
    return fs.readFileSync('fiado.txt', 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return '';
    throw err;
  }
}
`,
    fsSeed: { 'fiado.txt': 'Seu Zé;12.5\n' },
    tests: [
      {
        description: 'anotarFiado acrescenta a linha no fim, sem apagar as anteriores',
        code: `anotarFiado('Dona Cida', 30);
assert.strictEqual(require('fs').readFileSync('fiado.txt', 'utf8'), 'Seu Zé;12.5\\nDona Cida;30\\n');`,
      },
      {
        description: 'duas anotações seguidas viram duas linhas novas',
        code: `anotarFiado('Seu Valdir', 7.9);
anotarFiado('Seu Valdir', 3);
assert.strictEqual(
  require('fs').readFileSync('fiado.txt', 'utf8'),
  'Seu Zé;12.5\\nSeu Valdir;7.9\\nSeu Valdir;3\\n',
);`,
      },
      {
        description: 'lerFiado devolve o texto do arquivo',
        code: `assert.strictEqual(lerFiado(), 'Seu Zé;12.5\\n');`,
      },
      {
        description: 'sem o arquivo, lerFiado devolve texto vazio (sem derrubar o script)',
        code: `require('fs').unlinkSync('fiado.txt');
assert.strictEqual(lerFiado(), '');`,
      },
      {
        description: 'sem o arquivo, anotarFiado cria um novo',
        code: `require('fs').unlinkSync('fiado.txt');
anotarFiado('Dona Cida', 30);
assert.strictEqual(lerFiado(), 'Dona Cida;30\\n');`,
      },
    ],
    hints: [
      'Para escrever no fim sem apagar o resto, use `fs.appendFileSync`. Não esqueça o `\\n`.',
      "Em `lerFiado`, coloque o `readFileSync(..., 'utf8')` dentro de um `try` e, no `catch`, devolva `''` " +
        "quando `err.code === 'ENOENT'`. Também vale checar antes com `fs.existsSync`.",
    ],
    followUpQuestionIds: ['back.m02.f01', 'back.m02.f02'],
    difficulty: 1,
  },
  {
    id: 'back.m02.d01',
    lessonId: 'back.m02.l01',
    kind: 'debug',
    title: 'A tabela de preços que só tinha a última linha',
    promptMarkdown:
      'O Lava-Rápido Espuma Brava imprime a tabela de serviços a partir de `servicos.txt`. A função ' +
      '`salvarServicos(servicos)` deveria gravar **todos** os serviços da lista, um por linha, substituindo a ' +
      'tabela antiga. Mas o arquivo sempre fica só com o último serviço, e o Seu Ditão já está cobrando ' +
      '"Higienização" de quem pediu lavagem simples. Conserte.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const fs = require('fs');

function salvarServicos(servicos) {
  servicos.forEach((servico) => {
    fs.writeFileSync('servicos.txt', servico + '\\n', 'utf8');
  });
}
`,
    solution: `const fs = require('fs');

function salvarServicos(servicos) {
  const texto = servicos.map((servico) => servico + '\\n').join('');
  fs.writeFileSync('servicos.txt', texto, 'utf8');
}
`,
    fsSeed: { 'servicos.txt': 'Polimento (promoção de 2019)\n' },
    tests: [
      {
        description: 'grava todos os serviços, um por linha',
        code: `salvarServicos(['Lavagem simples', 'Cera', 'Higienização']);
assert.strictEqual(
  require('fs').readFileSync('servicos.txt', 'utf8'),
  'Lavagem simples\\nCera\\nHigienização\\n',
);`,
      },
      {
        description: 'a lista nova substitui a tabela antiga',
        code: `salvarServicos(['Cera', 'Pretinho no pneu']);
assert.strictEqual(require('fs').readFileSync('servicos.txt', 'utf8'), 'Cera\\nPretinho no pneu\\n');`,
      },
    ],
    hints: [
      '`writeFileSync` substitui o arquivo inteiro a cada chamada. Chamado dentro do laço, quem sobra?',
      'Monte o texto completo primeiro (por exemplo com `map` e `join`) e grave uma vez só. Trocar por ' +
        '`appendFileSync` sozinho não basta: a promoção de 2019 continuaria lá.',
    ],
    followUpQuestionIds: ['back.m02.f03', 'back.m02.f04'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m02.q01',
    lessonIds: ['back.m02.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const fs = require('fs');
fs.writeFileSync('log.txt', 'a\\n', 'utf8');
fs.writeFileSync('log.txt', 'b\\n', 'utf8');
fs.appendFileSync('log.txt', 'c\\n', 'utf8');
console.log(fs.readFileSync('log.txt', 'utf8').trim());`,
    expectedOutput: 'b\nc',
    explanation:
      'O segundo `writeFileSync` substitui o arquivo inteiro (o "a" some). O `appendFileSync` acrescenta o ' +
      '"c" no fim. O `trim()` tira a quebra de linha final.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q02',
    lessonIds: ['back.m02.l01'],
    kind: 'predict-output',
    prompt: 'O arquivo não existe. O que este código imprime?',
    code: `const fs = require('fs');
try {
  fs.readFileSync('planilha-do-mes.txt', 'utf8');
  console.log('li tudo');
} catch (err) {
  console.log(err.code);
}
console.log('fim');`,
    expectedOutput: 'ENOENT\nfim',
    explanation:
      'O `readFileSync` lança o erro, então o `console.log("li tudo")` nunca roda. O `catch` imprime o código ' +
      'do erro e, como o erro foi tratado, o script segue até o "fim".',
    difficulty: 1,
  },
  {
    id: 'back.m02.q03',
    lessonIds: ['back.m02.l01'],
    kind: 'multiple-choice',
    prompt: "Para que serve o `'utf8'` em `fs.readFileSync('clientes.txt', 'utf8')`?",
    options: [
      'Faz o Node devolver o conteúdo como texto; sem ele, o Node real devolve um Buffer com os bytes',
      'Cria o arquivo se ele não existir',
      'Deixa a leitura mais rápida',
      'Converte o arquivo para JSON',
    ],
    answerIndex: 0,
    explanation:
      'O encoding diz como transformar os bytes em texto. Sem ele, você recebe um `Buffer` e precisa ' +
      'converter na mão.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q04',
    lessonIds: ['back.m02.l01'],
    kind: 'true-false',
    prompt: '`fs.writeFileSync` acrescenta o texto no fim do arquivo, mantendo o que já estava lá.',
    answer: false,
    explanation: '`writeFileSync` substitui o conteúdo inteiro. Quem acrescenta no fim é o `appendFileSync`.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q05',
    lessonIds: ['back.m02.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para ler o arquivo como texto.',
    code: `const fs = require('fs');
const texto = fs.readFileSync('pedidos.txt', ___);`,
    acceptedAnswers: ["'utf8'", '"utf8"', "'utf-8'", '"utf-8"', '`utf8`'],
    explanation: "Passe o encoding `'utf8'` para receber uma string em vez de um Buffer.",
    difficulty: 1,
  },
  {
    id: 'back.m02.q06',
    lessonIds: ['back.m02.l01'],
    kind: 'multiple-choice',
    prompt: 'O script estourou com `ENOENT`. O que isso quer dizer?',
    options: [
      'Não existe arquivo (ou pasta) no caminho informado',
      'O arquivo existe, mas está vazio',
      'O arquivo tem acentos que o Node não entende',
      'Falta memória no computador',
    ],
    answerIndex: 0,
    explanation:
      '`ENOENT` ("Error NO ENTry") é o erro de caminho inexistente. Confira o nome, a pasta e de onde você ' +
      'rodou o `node`.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q07',
    lessonIds: ['back.m02.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime? (o `recibo.txt` ainda não existe)',
    code: `const fs = require('fs');
console.log(fs.existsSync('recibo.txt'));
fs.writeFileSync('recibo.txt', 'Recebi R$ 90,00 do Seu Zé', 'utf8');
console.log(fs.existsSync('recibo.txt'));`,
    expectedOutput: 'false\ntrue',
    explanation: '`existsSync` só responde se o caminho existe. O `writeFileSync` cria o arquivo no meio.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q08',
    lessonIds: ['back.m02.l01'],
    kind: 'true-false',
    prompt:
      'Se um `readFileSync` lançar um erro fora de qualquer `try/catch`, o script para ali e as linhas de ' +
      'baixo não rodam.',
    answer: true,
    explanation:
      'Erro não tratado derruba o processo. Por isso a leitura de arquivos que podem não existir vai dentro ' +
      'de um `try`.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q09',
    lessonIds: ['back.m02.l01'],
    kind: 'predict-output',
    prompt: 'A fila de espera do barbeiro. O que este código imprime?',
    code: `const fs = require('fs');
fs.writeFileSync('fila.txt', 'Seu Zé\\nDona Cida\\n', 'utf8');
fs.appendFileSync('fila.txt', 'Seu Valdir\\n', 'utf8');
const nomes = fs.readFileSync('fila.txt', 'utf8').trim().split('\\n');
console.log(nomes.length, nomes[2]);`,
    expectedOutput: '3 Seu Valdir',
    explanation:
      'O arquivo termina com 3 linhas. O `trim()` tira o `\\n` final (senão sobraria uma linha vazia) e o ' +
      "`split('\\n')` separa os nomes.",
    difficulty: 2,
  },

  // ---- acompanhamento: e01 ----
  {
    id: 'back.m02.f01',
    lessonIds: ['back.m02.l01'],
    exerciseId: 'back.m02.e01',
    kind: 'multiple-choice',
    prompt: 'Na sua `anotarFiado`, o que aconteceria se você trocasse `appendFileSync` por `writeFileSync`?',
    options: [
      'Cada anotação apagaria o fiado anterior: o arquivo ficaria só com a última compra',
      'Nada, os dois fazem a mesma coisa',
      'O script daria erro ENOENT na primeira anotação',
      'As linhas ficariam em ordem alfabética',
    ],
    answerIndex: 0,
    explanation:
      '`writeFileSync` substitui o arquivo. O Seu Bené ia adorar (e os clientes também): todo o fiado ' +
      'antigo sumiria.',
    difficulty: 1,
  },
  {
    id: 'back.m02.f02',
    lessonIds: ['back.m02.l01'],
    exerciseId: 'back.m02.e01',
    kind: 'multiple-choice',
    prompt: 'Na sua `lerFiado`, por que tratar o erro `ENOENT` em vez de deixar o script cair?',
    options: [
      'Porque não ter fiado anotado ainda é uma situação normal, não um defeito',
      'Porque o `readFileSync` sempre lança ENOENT na primeira leitura',
      'Porque sem o `catch` o arquivo seria apagado',
      'Porque o `try/catch` deixa a leitura mais rápida',
    ],
    answerIndex: 0,
    explanation:
      'Na primeira vez o `fiado.txt` não existe, e isso é esperado: a função responde "nada anotado" com ' +
      "`''`. Erros inesperados continuam estourando.",
    difficulty: 1,
  },

  // ---- acompanhamento: d01 ----
  {
    id: 'back.m02.f03',
    lessonIds: ['back.m02.l01'],
    exerciseId: 'back.m02.d01',
    kind: 'multiple-choice',
    prompt:
      "Na versão com defeito, `salvarServicos(['Lavagem simples', 'Cera'])` deixava o arquivo com o quê?",
    options: ['`Cera\\n`', '`Lavagem simples\\n`', '`Lavagem simples\\nCera\\n`', 'O arquivo ficava vazio'],
    answerIndex: 0,
    explanation:
      'Cada volta do `forEach` chamava `writeFileSync`, que substitui o arquivo. Só a última gravação ' +
      'sobrevivia.',
    difficulty: 1,
  },
  {
    id: 'back.m02.f04',
    lessonIds: ['back.m02.l01'],
    exerciseId: 'back.m02.d01',
    kind: 'true-false',
    prompt:
      'Trocar só o `writeFileSync` por `appendFileSync` dentro do laço consertaria a tabela de serviços.',
    answer: false,
    explanation:
      'Com `appendFileSync`, os serviços novos iriam para o fim da tabela antiga, e a promoção de 2019 ' +
      'continuaria lá. O certo é montar o texto todo e gravar uma vez.',
    difficulty: 2,
  },
];
