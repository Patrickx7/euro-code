import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'back.m02.l04',
  moduleId: 'back.m02',
  order: 4,
  title: 'fs/promises e async/await: o relatório de vendas',
  concepts: [
    'fs/promises',
    'Promise',
    'async e await',
    'Promise.all',
    'try/catch com await',
    'CSV com split',
    'gerar relatório',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'O `readFileSync` **trava** o programa enquanto lê. Num script de linha de comando, tudo bem. Num ' +
        'servidor atendendo 50 pedidos, travar é pedir para o cliente ligar reclamando. Por isso o Node tem ' +
        'a versão **assíncrona**, em `fs/promises`:\n\n' +
        "```js\nconst { readFile, writeFile } = require('fs/promises');\n```\n\n" +
        "`readFile('vendas.csv', 'utf8')` não devolve o texto: devolve uma **Promise**, uma \"promessa\" de que " +
        'o texto vai chegar. Para esperar o valor, use **`await`**, que só pode ser usado dentro de uma ' +
        'função marcada com **`async`**:\n\n' +
        "```js\nasync function contarLinhas(caminho) {\n  const texto = await readFile(caminho, 'utf8');\n" +
        "  return texto.split('\\n').length;\n}\n```\n\n" +
        'Uma função `async` **sempre devolve uma Promise**. Quem chama também precisa de `await` (ou `.then`) ' +
        'para pegar o resultado. E erros (como `ENOENT`) viram Promise rejeitada: o `await` lança o erro, e o ' +
        '`try/catch` funciona do mesmo jeito de antes.\n\n' +
        '(No próximo módulo você vê o que acontece por baixo dos panos: event loop, callbacks e eventos.)',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const { readFile, writeFile } = require('fs/promises');

async function main() {
  await writeFile('recado.txt', 'Passo aí às 15h', 'utf8');
  const texto = await readFile('recado.txt', 'utf8');
  console.log('Li: ' + texto);

  try {
    await readFile('nao-existe.txt', 'utf8');
  } catch (err) {
    console.log('Deu ' + err.code);
  }
}

main();`,
      explanation:
        'Dentro da função `async`, cada `await` espera a operação terminar antes de seguir. O erro de arquivo ' +
        'inexistente é pego pelo `try/catch`, igual na versão síncrona.',
    },
    {
      kind: 'text',
      markdown:
        '**Vários arquivos de uma vez.** Com `await` em sequência, você lê um, espera, lê o outro... Para ' +
        'pedir todos **ao mesmo tempo**, use **`Promise.all`**: ele recebe um array de Promises e devolve uma ' +
        'Promise com o array dos resultados, **na mesma ordem** da lista.\n\n' +
        "```js\nconst textos = await Promise.all(arquivos.map((a) => readFile(a, 'utf8')));\n```\n\n" +
        '**CSV**, o formato preferido de quem "exporta da planilha": uma linha por registro, colunas separadas ' +
        'por vírgula, e a primeira linha é o cabeçalho.\n\n' +
        "- `texto.split('\\n')` separa as linhas; `linha.split(',')` separa as colunas;\n" +
        '- planilha do Windows termina as linhas com `\\r\\n`: um `.trim()` em cada linha resolve;\n' +
        '- sempre sobra linha vazia no fim: filtre;\n' +
        '- tudo que vem do CSV é **texto**: converta com `Number(...)` antes de fazer conta.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const { readFile, writeFile } = require('fs/promises');

async function main() {
  await writeFile('vendas.csv', 'produto,quantidade,preco\\r\\nAçaí 500ml,3,18.5\\r\\nSuco,2,7\\r\\n', 'utf8');

  const texto = await readFile('vendas.csv', 'utf8');
  const linhas = texto
    .split('\\n')
    .map((linha) => linha.trim())
    .filter((linha) => linha !== '');

  let total = 0;
  for (const linha of linhas.slice(1)) {
    const colunas = linha.split(',');
    total += Number(colunas[1]) * Number(colunas[2]);
  }
  console.log('Total: R$ ' + total.toFixed(2));
}

main();`,
      explanation:
        'O `slice(1)` pula o cabeçalho. O `trim()` tira o `\\r` que a planilha deixou e o `filter` some com ' +
        'a linha vazia do fim.',
    },
  ],
  checkQuestionIds: ['back.m02.q29'],
  exerciseIds: ['back.m02.e05', 'back.m02.e06'],
  debugExerciseIds: ['back.m02.d04'],
};

const vendasGranja = 'produto,quantidade,preco\r\nAçaí 500ml,3,18.5\r\nCupuaçu 300ml,2,12\r\n\r\n';
const vendasCentro = 'produto,quantidade,preco\nAçaí 700ml,1,24\nCreme de cupuaçu,2,9.9\n';
const vendasCaucaia = 'produto,quantidade,preco\n';

const lerVendasPronta = `const { readFile, writeFile } = require('fs/promises');

async function lerVendas(caminho) {
  const texto = await readFile(caminho, 'utf8');
  const linhas = texto
    .split('\\n')
    .map((linha) => linha.trim())
    .filter((linha) => linha !== '');
  return linhas.slice(1).map((linha) => {
    const colunas = linha.split(',');
    return { produto: colunas[0], quantidade: Number(colunas[1]), preco: Number(colunas[2]) };
  });
}
`;

export const exercises: Exercise[] = [
  {
    id: 'back.m02.e05',
    lessonId: 'back.m02.l04',
    kind: 'implement',
    title: 'Lendo o CSV das vendas',
    promptMarkdown:
      'A Açaiteria Roxo de Fome exporta as vendas de cada loja da planilha num CSV assim:\n\n' +
      '```\nproduto,quantidade,preco\nAçaí 500ml,3,18.5\nCupuaçu 300ml,2,12\n```\n\n' +
      'Crie a função **async** `lerVendas(caminho)` que lê o arquivo com `fs/promises` e devolve um array de ' +
      'objetos `{ produto, quantidade, preco }`, com `quantidade` e `preco` como **números**.\n\n' +
      'Pule o cabeçalho e as linhas vazias. E atenção: a planilha da loja da Granja Viana termina as linhas ' +
      'com `\\r\\n`.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const { readFile } = require('fs/promises');

async function lerVendas(caminho) {
  // leia o arquivo com await
  // separe as linhas, tire espaços e \\r, descarte as vazias e o cabeçalho
  // devolva [{ produto, quantidade, preco }] com números de verdade
}
`,
    solution: `const { readFile } = require('fs/promises');

async function lerVendas(caminho) {
  const texto = await readFile(caminho, 'utf8');
  const linhas = texto
    .split('\\n')
    .map((linha) => linha.trim())
    .filter((linha) => linha !== '');
  return linhas.slice(1).map((linha) => {
    const colunas = linha.split(',');
    return { produto: colunas[0], quantidade: Number(colunas[1]), preco: Number(colunas[2]) };
  });
}
`,
    fsSeed: { 'vendas-granja.csv': vendasGranja, 'vendas-centro.csv': vendasCentro },
    tests: [
      {
        description: 'lerVendas é async (devolve uma Promise)',
        code: `const resultado = lerVendas('vendas-centro.csv');
assert.ok(resultado instanceof Promise, 'lerVendas deveria ser uma função async');
await resultado;`,
      },
      {
        description: 'devolve uma venda por linha, sem cabeçalho nem linha vazia',
        code: `const vendas = await lerVendas('vendas-granja.csv');
assert.strictEqual(vendas.length, 2);`,
      },
      {
        description: 'cada venda vira { produto, quantidade, preco } com números (e sem o \\r)',
        code: `const vendas = await lerVendas('vendas-granja.csv');
assert.deepStrictEqual(vendas, [
  { produto: 'Açaí 500ml', quantidade: 3, preco: 18.5 },
  { produto: 'Cupuaçu 300ml', quantidade: 2, preco: 12 },
]);`,
      },
      {
        description: 'funciona com o CSV da loja do Centro',
        code: `const vendas = await lerVendas('vendas-centro.csv');
assert.deepStrictEqual(vendas, [
  { produto: 'Açaí 700ml', quantidade: 1, preco: 24 },
  { produto: 'Creme de cupuaçu', quantidade: 2, preco: 9.9 },
]);`,
      },
    ],
    hints: [
      "Comece com `const texto = await readFile(caminho, 'utf8');` e depois `texto.split('\\n')`.",
      "Use `.map((linha) => linha.trim())` e `.filter((linha) => linha !== '')`, pule o cabeçalho com " +
        "`slice(1)` e, em cada linha, `linha.split(',')` e `Number(...)` nas colunas de número.",
    ],
    followUpQuestionIds: ['back.m02.f15', 'back.m02.f16'],
    difficulty: 2,
  },
  {
    id: 'back.m02.e06',
    lessonId: 'back.m02.l04',
    kind: 'implement',
    title: 'O relatório das três lojas',
    promptMarkdown:
      'Agora o dono da Açaiteria Roxo de Fome quer um relatório com o faturamento de cada loja. A ' +
      '`lerVendas` já está pronta no código. Crie a função **async** `gerarRelatorio(arquivos)` que:\n\n' +
      '1. lê todos os CSVs **ao mesmo tempo** com `Promise.all` e `lerVendas`;\n' +
      '2. calcula o total de cada loja (soma de `quantidade * preco`);\n' +
      '3. grava `relatorio.txt` com uma linha por arquivo e o total geral no fim, com `toFixed(2)`, assim:\n\n' +
      '```\nvendas-granja.csv: R$ 79.50\nvendas-centro.csv: R$ 43.80\nvendas-caucaia.csv: R$ 0.00\n' +
      'TOTAL: R$ 123.30\n```\n\n' +
      '   (linhas separadas por `\\n`, com um `\\n` também no fim);\n' +
      '4. devolve o total geral (número).',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `${lerVendasPronta}
async function gerarRelatorio(arquivos) {
  // 1. leia todos os arquivos ao mesmo tempo (Promise.all + lerVendas)
  // 2. some quantidade * preco de cada loja
  // 3. grave relatorio.txt (veja o formato no enunciado)
  // 4. devolva o total geral
}
`,
    solution: `${lerVendasPronta}
async function gerarRelatorio(arquivos) {
  const lojas = await Promise.all(arquivos.map((arquivo) => lerVendas(arquivo)));
  const linhas = [];
  let geral = 0;
  lojas.forEach((vendas, i) => {
    const total = vendas.reduce((soma, venda) => soma + venda.quantidade * venda.preco, 0);
    geral += total;
    linhas.push(arquivos[i] + ': R$ ' + total.toFixed(2));
  });
  linhas.push('TOTAL: R$ ' + geral.toFixed(2));
  await writeFile('relatorio.txt', linhas.join('\\n') + '\\n', 'utf8');
  return geral;
}
`,
    fsSeed: {
      'vendas-granja.csv': vendasGranja,
      'vendas-centro.csv': vendasCentro,
      'vendas-caucaia.csv': vendasCaucaia,
    },
    tests: [
      {
        description: 'devolve o total geral das três lojas (R$ 123,30)',
        code: `const total = await gerarRelatorio(['vendas-granja.csv', 'vendas-centro.csv', 'vendas-caucaia.csv']);
assert.ok(typeof total === 'number' && Math.abs(total - 123.3) < 0.001, 'esperava 123.3, veio ' + total);`,
      },
      {
        description: 'grava relatorio.txt no formato pedido',
        code: `await gerarRelatorio(['vendas-granja.csv', 'vendas-centro.csv', 'vendas-caucaia.csv']);
assert.strictEqual(
  require('fs').readFileSync('relatorio.txt', 'utf8'),
  'vendas-granja.csv: R$ 79.50\\nvendas-centro.csv: R$ 43.80\\nvendas-caucaia.csv: R$ 0.00\\nTOTAL: R$ 123.30\\n',
);`,
      },
      {
        description: 'as lojas aparecem na mesma ordem da lista recebida',
        code: `await gerarRelatorio(['vendas-centro.csv', 'vendas-granja.csv']);
assert.strictEqual(
  require('fs').readFileSync('relatorio.txt', 'utf8'),
  'vendas-centro.csv: R$ 43.80\\nvendas-granja.csv: R$ 79.50\\nTOTAL: R$ 123.30\\n',
);`,
      },
    ],
    hints: [
      '`await Promise.all(arquivos.map((arquivo) => lerVendas(arquivo)))` devolve um array com as vendas de ' +
        'cada loja, na mesma ordem de `arquivos`.',
      'Para cada loja, um `reduce` soma `venda.quantidade * venda.preco`. Monte as linhas num array e grave ' +
        "com `await writeFile('relatorio.txt', linhas.join('\\n') + '\\n', 'utf8')`.",
    ],
    followUpQuestionIds: ['back.m02.f17', 'back.m02.f18'],
    difficulty: 3,
  },
  {
    id: 'back.m02.d04',
    lessonId: 'back.m02.l04',
    kind: 'debug',
    title: 'texto.split is not a function',
    promptMarkdown:
      'A função `contarPedidos(caminho)` deveria devolver quantos pedidos tem no CSV (as linhas não vazias, ' +
      'tirando o cabeçalho). Mas ela estoura com `TypeError: texto.split is not a function`. O arquivo ' +
      'existe, o caminho está certo, e o freela anterior jura que "funcionava na máquina dele". Conserte.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const fs = require('fs/promises');

async function contarPedidos(caminho) {
  const texto = fs.readFile(caminho, 'utf8');
  const linhas = texto.split('\\n').filter((linha) => linha.trim() !== '');
  return linhas.length - 1; // tira o cabeçalho
}
`,
    solution: `const fs = require('fs/promises');

async function contarPedidos(caminho) {
  const texto = await fs.readFile(caminho, 'utf8');
  const linhas = texto.split('\\n').filter((linha) => linha.trim() !== '');
  return linhas.length - 1; // tira o cabeçalho
}
`,
    fsSeed: {
      'pedidos.csv': 'cliente,item\nSeu Zé,Açaí 500ml\nDona Cida,Cupuaçu\nSeu Valdir,Açaí 700ml\n',
      'pedidos-domingo.csv': 'cliente,item\r\nGérson,Açaí 300ml\r\n\r\n',
    },
    tests: [
      {
        description: 'pedidos.csv tem 3 pedidos',
        code: `assert.strictEqual(await contarPedidos('pedidos.csv'), 3);`,
      },
      {
        description: 'pedidos-domingo.csv tem 1 pedido',
        code: `assert.strictEqual(await contarPedidos('pedidos-domingo.csv'), 1);`,
      },
    ],
    hints: [
      '`fs.readFile` de `fs/promises` não devolve o texto, devolve uma Promise. Promise não tem `split`.',
      "Falta esperar a Promise: `const texto = await fs.readFile(caminho, 'utf8');`.",
    ],
    followUpQuestionIds: ['back.m02.f19', 'back.m02.f20'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m02.q29',
    lessonIds: ['back.m02.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `async function buscarPix() {
  return 90;
}

console.log('antes');
buscarPix().then((valor) => console.log('caiu ' + valor));
console.log('depois');`,
    expectedOutput: 'antes\ndepois\ncaiu 90',
    explanation:
      'Uma função `async` devolve uma Promise, e o `.then` só roda depois que o código síncrono atual ' +
      'termina. Por isso "depois" sai antes do "caiu 90".',
    difficulty: 2,
  },
  {
    id: 'back.m02.q30',
    lessonIds: ['back.m02.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const csv = 'produto,qtd\\nAçaí,3\\nCupuaçu,2';
const linhas = csv.split('\\n');
console.log(linhas.length);
console.log(linhas[1].split(',')[0]);
console.log(linhas.slice(1).length);`,
    expectedOutput: '3\nAçaí\n2',
    explanation:
      "São 3 linhas contando o cabeçalho. `linhas[1]` é `'Açaí,3'`, e a coluna 0 é o produto. Sem o " +
      'cabeçalho, sobram 2 vendas.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q31',
    lessonIds: ['back.m02.l04'],
    kind: 'predict-output',
    prompt: 'Números vindos da planilha. O que este código imprime?',
    code: `console.log(Number('18.5\\r'));
console.log(Number(' 3 '));
console.log(Number('18,5'));`,
    expectedOutput: '18.5\n3\nNaN',
    explanation:
      'O `Number` ignora espaços e `\\r` nas pontas, mas não entende a vírgula brasileira: `"18,5"` vira ' +
      '`NaN`. Planilha em português? Troque a vírgula por ponto antes (e cuidado: aí o CSV costuma usar `;`).',
    difficulty: 2,
  },
  {
    id: 'back.m02.q32',
    lessonIds: ['back.m02.l04'],
    kind: 'multiple-choice',
    prompt: "O que o `await` faz em `const texto = await readFile('vendas.csv', 'utf8');`?",
    options: [
      'Espera a Promise do `readFile` terminar e entrega o texto lido',
      'Lê o arquivo de forma síncrona, travando o Node inteiro',
      'Transforma o texto em JSON',
      'Cria o arquivo se ele não existir',
    ],
    answerIndex: 0,
    explanation:
      'O `await` pausa só a função `async` atual até a Promise resolver, e devolve o valor dela. O resto do ' +
      'Node continua livre.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q33',
    lessonIds: ['back.m02.l04'],
    kind: 'multiple-choice',
    prompt: "O que `await Promise.all([readFile('a.csv', 'utf8'), readFile('b.csv', 'utf8')])` devolve?",
    options: [
      'Um array com os dois textos, na ordem `[a, b]`, depois que os dois terminarem',
      'Só o texto do arquivo que terminar de ler primeiro',
      'Os dois textos já juntos numa string só',
      'Um array na ordem em que as leituras terminaram',
    ],
    answerIndex: 0,
    explanation:
      'O `Promise.all` espera todas as Promises e devolve os resultados na **mesma ordem** da lista, não ' +
      'importa qual terminou primeiro.',
    difficulty: 2,
  },
  {
    id: 'back.m02.q34',
    lessonIds: ['back.m02.l04'],
    kind: 'true-false',
    prompt: 'Dá para usar `await` dentro de uma função comum, sem `async`, num arquivo CommonJS.',
    answer: false,
    explanation:
      'O `await` só vale dentro de função `async` (ou no topo de um módulo ESM). Numa função comum, é erro de ' +
      'sintaxe.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q35',
    lessonIds: ['back.m02.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para esperar a leitura terminar.',
    code: `async function lerVendas() {
  const texto = ___ readFile('vendas.csv', 'utf8');
  return texto.split('\\n');
}`,
    acceptedAnswers: ['await'],
    explanation: 'Sem `await`, `texto` seria uma Promise, e Promise não tem `split`.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q36',
    lessonIds: ['back.m02.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `async function total() {
  return 10;
}
const resultado = total();
console.log(typeof resultado, resultado instanceof Promise);`,
    expectedOutput: 'object true',
    explanation:
      'Mesmo devolvendo um número, uma função `async` sempre entrega uma Promise para quem chamou.',
    difficulty: 2,
  },
  {
    id: 'back.m02.q37',
    lessonIds: ['back.m02.l04'],
    kind: 'predict-output',
    prompt: 'O fechamento do dia. O que este código imprime?',
    code: `const csv = 'produto,quantidade,preco\\nAçaí 500ml,2,18.5\\nSuco,1,7';
const total = csv
  .split('\\n')
  .slice(1)
  .map((linha) => linha.split(','))
  .reduce((soma, colunas) => soma + Number(colunas[1]) * Number(colunas[2]), 0);
console.log('R$ ' + total.toFixed(2));`,
    expectedOutput: 'R$ 44.00',
    explanation: '2 × 18,5 = 37, mais 1 × 7 = 44. O `toFixed(2)` deixa com duas casas.',
    difficulty: 2,
  },

  // ---- acompanhamento: e05 ----
  {
    id: 'back.m02.f15',
    lessonIds: ['back.m02.l04'],
    exerciseId: 'back.m02.e05',
    kind: 'multiple-choice',
    prompt: 'Na sua `lerVendas`, o que aconteceria sem o `.trim()` nas linhas do CSV da Granja Viana?',
    options: [
      'A linha "vazia" do fim seria `\\r` e passaria no filtro, e o `\\r` iria grudado na última coluna',
      'O `split` daria erro por causa do `\\r`',
      'Os acentos de "Açaí" se perderiam',
      'Nada mudaria',
    ],
    answerIndex: 0,
    explanation:
      'O CSV do Windows termina as linhas com `\\r\\n`. Separando por `\\n`, sobra o `\\r` no fim de cada ' +
      'linha. O `Number` até ignora, mas a linha só com `\\r` viraria uma venda fantasma.',
    difficulty: 2,
  },
  {
    id: 'back.m02.f16',
    lessonIds: ['back.m02.l04'],
    exerciseId: 'back.m02.e05',
    kind: 'multiple-choice',
    prompt: 'Como quem chama a sua `lerVendas` pega o array de vendas?',
    options: [
      "Com `await lerVendas('vendas.csv')` dentro de outra função `async` (ou com `.then`)",
      "Com `lerVendas('vendas.csv')` direto, como qualquer função",
      "Com `JSON.parse(lerVendas('vendas.csv'))`",
      "Com `lerVendas('vendas.csv').length`",
    ],
    answerIndex: 0,
    explanation:
      'Como ela é `async`, devolve uma Promise. Para ter o array, é preciso esperar com `await` ou `.then`.',
    difficulty: 1,
  },

  // ---- acompanhamento: e06 ----
  {
    id: 'back.m02.f17',
    lessonIds: ['back.m02.l04'],
    exerciseId: 'back.m02.e06',
    kind: 'multiple-choice',
    prompt:
      'Na sua `gerarRelatorio`, qual a vantagem do `Promise.all` sobre um `await` por arquivo num laço?',
    options: [
      'As leituras são pedidas todas juntas, em vez de uma esperar a outra terminar',
      'O `Promise.all` soma os totais sozinho',
      'Com `Promise.all` não precisa de `await`',
      'O `Promise.all` grava o relatório no fim',
    ],
    answerIndex: 0,
    explanation:
      'Com o laço, cada leitura só começa quando a anterior termina. Com o `Promise.all`, todas começam de ' +
      'uma vez, e você espera o conjunto.',
    difficulty: 2,
  },
  {
    id: 'back.m02.f18',
    lessonIds: ['back.m02.l04'],
    exerciseId: 'back.m02.e06',
    kind: 'true-false',
    prompt:
      'Na sua `gerarRelatorio`, o array devolvido pelo `Promise.all` pode vir fora da ordem de `arquivos` se ' +
      'um CSV for maior que o outro.',
    answer: false,
    explanation:
      'O `Promise.all` sempre devolve os resultados na ordem da lista que recebeu. Por isso dá para usar o ' +
      '`arquivos[i]` para pôr o nome certo em cada linha.',
    difficulty: 2,
  },

  // ---- acompanhamento: d04 ----
  {
    id: 'back.m02.f19',
    lessonIds: ['back.m02.l04'],
    exerciseId: 'back.m02.d04',
    kind: 'multiple-choice',
    prompt: 'Na versão com defeito, o que era `texto` na linha do `split`?',
    options: [
      'Uma Promise, porque faltou o `await` no `readFile`',
      'O texto do arquivo, mas com `\\r` no fim',
      '`undefined`, porque o arquivo não existia',
      'Um Buffer, porque faltou o `utf8`',
    ],
    answerIndex: 0,
    explanation:
      'O `readFile` de `fs/promises` devolve uma Promise na hora. Sem `await`, o código seguiu com a promessa ' +
      'em vez do texto.',
    difficulty: 1,
  },
  {
    id: 'back.m02.f20',
    lessonIds: ['back.m02.l04'],
    exerciseId: 'back.m02.d04',
    kind: 'true-false',
    prompt:
      'Com o conserto, quem chama `contarPedidos` também precisa usar `await` (ou `.then`) para receber o número.',
    answer: true,
    explanation:
      'Ela é `async`, então devolve uma Promise. Por isso os testes fazem `await contarPedidos(...)`.',
    difficulty: 1,
  },
];
