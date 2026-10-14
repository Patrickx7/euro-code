import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'back.m02.l03',
  moduleId: 'back.m02',
  order: 3,
  title: 'JSON: o "banco de dados" do cliente',
  concepts: [
    'formato JSON',
    'JSON.parse',
    'JSON.stringify com indentação',
    'ler, alterar e gravar',
    'SyntaxError',
    'validar dados',
    'valores padrão com spread',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        '**JSON** é texto que imita objetos e arrays do JavaScript. É como quase todo sistema troca dados, e ' +
        'como muito cliente guarda o cardápio, o estoque e a configuração ("é só abrir no bloco de notas e ' +
        'mudar o preço").\n\n' +
        '```json\n{\n  "loja": "Marmitaria da Tia Nena",\n  "taxaEntrega": 6.5,\n  "aberto": true,\n' +
        '  "bairros": ["Vila Yara", "Centro"]\n}\n```\n\n' +
        'As regras são mais rígidas que as do JS: chaves e textos **sempre com aspas duplas**, nada de ' +
        'vírgula sobrando no último item, nada de comentários, nada de `undefined` nem funções.\n\n' +
        '- `JSON.parse(texto)` transforma o texto em valor JavaScript (objeto, array, número...).\n' +
        '- `JSON.stringify(valor)` faz o caminho de volta, tudo numa linha.\n' +
        '- `JSON.stringify(valor, null, 2)` gera o texto **indentado com 2 espaços**, legível para humanos ' +
        '(e para o cliente que vai editar na mão).',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const fs = require('fs');

const estoque = [
  { item: 'Marmita P', qtd: 12 },
  { item: 'Suco de laranja', qtd: 5 },
];
fs.writeFileSync('estoque.json', JSON.stringify(estoque, null, 2), 'utf8');

const lido = JSON.parse(fs.readFileSync('estoque.json', 'utf8'));
lido[0].qtd -= 1;
fs.writeFileSync('estoque.json', JSON.stringify(lido, null, 2), 'utf8');

console.log(fs.readFileSync('estoque.json', 'utf8'));`,
      explanation:
        'O ciclo de sempre: **ler** o texto, **parse**, **alterar** o objeto em memória, **stringify** e ' +
        '**gravar** de volta. Mudar `lido` não muda o arquivo até você gravar.',
    },
    {
      kind: 'text',
      markdown:
        '**Nunca confie no que veio.** Se alguém deixou uma vírgula sobrando, o `JSON.parse` lança um ' +
        '**`SyntaxError`**, e sem `try/catch` o "sistema" inteiro cai. E mesmo um JSON válido pode vir sem o ' +
        'campo que você precisa, ou com o preço como texto (`"12.50"`). Valide antes de usar: o campo existe? ' +
        'é do tipo certo? (`typeof`, `Array.isArray`).\n\n' +
        'Um truque útil para configurações é ter um objeto de **valores padrão** e juntar com o que veio do ' +
        'arquivo usando o **spread** (`...`): `{ ...PADRAO, ...config }` copia os campos do padrão e depois ' +
        'os do arquivo, e quem vem depois ganha.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const PADRAO = { taxaEntrega: 5, aberto: true };

function lerConfig(texto) {
  try {
    const config = JSON.parse(texto);
    return { ...PADRAO, ...config };
  } catch (err) {
    console.log('Config quebrada (' + err.name + '), usando o padrão.');
    return { ...PADRAO };
  }
}

console.log(lerConfig('{ "taxaEntrega": 8 }'));
console.log(lerConfig('{ "taxaEntrega": 8, }'));`,
      explanation:
        'O primeiro texto é JSON válido e a taxa 8 ganha do padrão. O segundo tem uma vírgula sobrando: o ' +
        '`JSON.parse` lança `SyntaxError` e a função cai no padrão em vez de derrubar tudo.',
    },
  ],
  checkQuestionIds: ['back.m02.q19'],
  exerciseIds: ['back.m02.e03', 'back.m02.e04'],
  debugExerciseIds: ['back.m02.d03'],
};

const cardapioInicial = `[
  {
    "nome": "Feijoada",
    "preco": 28
  },
  {
    "nome": "Virado à paulista",
    "preco": 25
  }
]`;

export const exercises: Exercise[] = [
  {
    id: 'back.m02.e03',
    lessonId: 'back.m02.l03',
    kind: 'implement',
    title: 'Prato novo no cardápio',
    promptMarkdown:
      'O "sistema" da Marmitaria da Tia Nena é o arquivo `cardapio.json`: um array de pratos `{ nome, preco }`. ' +
      'Crie `adicionarPrato(prato)`, que:\n\n' +
      '1. lê `cardapio.json` e transforma em array;\n' +
      '2. coloca o `prato` no fim da lista;\n' +
      '3. grava a lista de volta **indentada com 2 espaços** (`JSON.stringify(lista, null, 2)`), porque a Tia ' +
      'Nena edita o arquivo na mão;\n' +
      '4. devolve quantos pratos o cardápio tem agora.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const fs = require('fs');

function adicionarPrato(prato) {
  // 1. leia cardapio.json e use JSON.parse
  // 2. coloque o prato no fim
  // 3. grave com JSON.stringify(lista, null, 2)
  // 4. devolva o tamanho da lista
}
`,
    solution: `const fs = require('fs');

function adicionarPrato(prato) {
  const lista = JSON.parse(fs.readFileSync('cardapio.json', 'utf8'));
  lista.push(prato);
  fs.writeFileSync('cardapio.json', JSON.stringify(lista, null, 2), 'utf8');
  return lista.length;
}
`,
    fsSeed: { 'cardapio.json': cardapioInicial },
    tests: [
      {
        description: 'devolve quantos pratos o cardápio tem agora',
        code: `assert.strictEqual(adicionarPrato({ nome: 'Parmegiana', preco: 32 }), 3);`,
      },
      {
        description: 'o prato novo é gravado no fim do arquivo, sem perder os antigos',
        code: `adicionarPrato({ nome: 'Parmegiana', preco: 32 });
assert.deepStrictEqual(JSON.parse(require('fs').readFileSync('cardapio.json', 'utf8')), [
  { nome: 'Feijoada', preco: 28 },
  { nome: 'Virado à paulista', preco: 25 },
  { nome: 'Parmegiana', preco: 32 },
]);`,
      },
      {
        description: 'dois pratos seguidos: o segundo enxerga o primeiro',
        code: `adicionarPrato({ nome: 'Parmegiana', preco: 32 });
assert.strictEqual(adicionarPrato({ nome: 'Strogonoff', preco: 27 }), 4);`,
      },
      {
        description: 'o arquivo fica indentado com 2 espaços',
        code: `adicionarPrato({ nome: 'Parmegiana', preco: 32 });
const lista = JSON.parse(require('fs').readFileSync('cardapio.json', 'utf8'));
assert.strictEqual(require('fs').readFileSync('cardapio.json', 'utf8'), JSON.stringify(lista, null, 2));`,
      },
    ],
    hints: [
      "`JSON.parse(fs.readFileSync('cardapio.json', 'utf8'))` devolve o array; depois é um `push`.",
      'Mudar o array não muda o arquivo. Grave com `fs.writeFileSync` e `JSON.stringify(lista, null, 2)`.',
    ],
    followUpQuestionIds: ['back.m02.f09', 'back.m02.f10'],
    difficulty: 2,
  },
  {
    id: 'back.m02.e04',
    lessonId: 'back.m02.l03',
    kind: 'implement',
    title: 'Pedido que chega torto',
    promptMarkdown:
      'Os pedidos da marmitaria chegam como texto JSON, vindos do "aplicativo" que o sobrinho da Tia Nena ' +
      'fez num fim de semana. Crie `validarPedido(texto)` que devolve:\n\n' +
      "- `{ ok: false, erro: 'JSON inválido' }` se o texto não for JSON válido;\n" +
      "- `{ ok: false, erro: 'falta o cliente' }` se `cliente` não for um texto não vazio;\n" +
      "- `{ ok: false, erro: 'pedido sem itens' }` se `itens` não for um array com pelo menos 1 item;\n" +
      '- `{ ok: true, pedido }` (o objeto lido) se estiver tudo certo.\n\n' +
      'Confira nessa ordem. E nada de deixar o script cair!',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function validarPedido(texto) {
  const pedido = JSON.parse(texto);
  return { ok: true, pedido };
}
`,
    solution: `function validarPedido(texto) {
  let pedido;
  try {
    pedido = JSON.parse(texto);
  } catch (err) {
    return { ok: false, erro: 'JSON inválido' };
  }
  if (typeof pedido.cliente !== 'string' || pedido.cliente.trim() === '') {
    return { ok: false, erro: 'falta o cliente' };
  }
  if (!Array.isArray(pedido.itens) || pedido.itens.length === 0) {
    return { ok: false, erro: 'pedido sem itens' };
  }
  return { ok: true, pedido };
}
`,
    tests: [
      {
        description: 'um pedido certinho volta com ok: true e o objeto lido',
        code: `assert.deepStrictEqual(validarPedido('{"cliente": "Seu Zé", "itens": ["Marmita G"]}'), {
  ok: true,
  pedido: { cliente: 'Seu Zé', itens: ['Marmita G'] },
});`,
      },
      {
        description: 'texto que não é JSON devolve "JSON inválido" (sem derrubar o script)',
        code: `assert.deepStrictEqual(validarPedido('{"cliente": "Seu Zé",}'), { ok: false, erro: 'JSON inválido' });`,
      },
      {
        description: 'sem cliente devolve "falta o cliente"',
        code: `assert.deepStrictEqual(validarPedido('{"itens": ["Suco"]}'), { ok: false, erro: 'falta o cliente' });
assert.deepStrictEqual(validarPedido('{"cliente": "", "itens": ["Suco"]}'), { ok: false, erro: 'falta o cliente' });
assert.deepStrictEqual(validarPedido('{"cliente": 42, "itens": ["Suco"]}'), { ok: false, erro: 'falta o cliente' });`,
      },
      {
        description: 'sem itens (ou itens vazios) devolve "pedido sem itens"',
        code: `assert.deepStrictEqual(validarPedido('{"cliente": "Dona Cida"}'), { ok: false, erro: 'pedido sem itens' });
assert.deepStrictEqual(validarPedido('{"cliente": "Dona Cida", "itens": []}'), { ok: false, erro: 'pedido sem itens' });
assert.deepStrictEqual(validarPedido('{"cliente": "Dona Cida", "itens": "marmita"}'), {
  ok: false,
  erro: 'pedido sem itens',
});`,
      },
    ],
    hints: [
      'Coloque o `JSON.parse` dentro de um `try` e devolva o erro no `catch`. Declare `let pedido;` antes do ' +
        '`try` para usar fora dele.',
      "Para o cliente: `typeof pedido.cliente !== 'string'` ou texto vazio. Para os itens: " +
        '`!Array.isArray(pedido.itens) || pedido.itens.length === 0`.',
    ],
    followUpQuestionIds: ['back.m02.f11', 'back.m02.f12'],
    difficulty: 2,
  },
  {
    id: 'back.m02.d03',
    lessonId: 'back.m02.l03',
    kind: 'debug',
    title: 'A config que nunca era lida',
    promptMarkdown:
      'O freela anterior colocou um `try/catch` para a marmitaria não cair quando a Tia Nena deixa uma vírgula ' +
      'sobrando no `config.json`. Agora o JSON quebrado funciona (usa o padrão), mas o **JSON certinho** ' +
      'derruba o script com `ReferenceError`. Conserte `lerConfig(caminho)`: com arquivo válido, ela devolve ' +
      'o padrão com os campos do arquivo por cima; com arquivo quebrado ou inexistente, devolve o padrão.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const fs = require('fs');

const PADRAO = { taxaEntrega: 5, pedidoMinimo: 20 };

function lerConfig(caminho) {
  try {
    const config = JSON.parse(fs.readFileSync(caminho, 'utf8'));
  } catch (err) {
    console.error('Config com problema, usando o padrão.');
    return { ...PADRAO };
  }
  return { ...PADRAO, ...config };
}
`,
    solution: `const fs = require('fs');

const PADRAO = { taxaEntrega: 5, pedidoMinimo: 20 };

function lerConfig(caminho) {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(caminho, 'utf8'));
  } catch (err) {
    console.error('Config com problema, usando o padrão.');
    return { ...PADRAO };
  }
  return { ...PADRAO, ...config };
}
`,
    fsSeed: {
      'config.json': '{\n  "taxaEntrega": 8\n}\n',
      'config-da-tia.json': '{\n  "taxaEntrega": 8,\n}\n',
    },
    tests: [
      {
        description: 'com o config.json válido, a taxa do arquivo ganha do padrão',
        code: `assert.deepStrictEqual(lerConfig('config.json'), { taxaEntrega: 8, pedidoMinimo: 20 });`,
      },
      {
        description: 'com o JSON quebrado, usa o padrão e avisa no stderr',
        code: `assert.deepStrictEqual(lerConfig('config-da-tia.json'), { taxaEntrega: 5, pedidoMinimo: 20 });
assert.ok(__errors.length > 0, 'esperava um aviso com console.error');`,
      },
      {
        description: 'sem arquivo, usa o padrão',
        code: `assert.deepStrictEqual(lerConfig('nao-existe.json'), { taxaEntrega: 5, pedidoMinimo: 20 });`,
      },
    ],
    hints: [
      '`const` (e `let`) declarados dentro do `{ }` do `try` só existem dentro dele. Lá embaixo, `config` não ' +
        'existe mais.',
      'Declare `let config;` antes do `try` e, dentro dele, só atribua: `config = JSON.parse(...)`.',
    ],
    followUpQuestionIds: ['back.m02.f13', 'back.m02.f14'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m02.q19',
    lessonIds: ['back.m02.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const pedido = { cliente: 'Tia Nena', itens: ['marmita', 'suco'] };
console.log(JSON.stringify(pedido, null, 2));`,
    expectedOutput: '{\n  "cliente": "Tia Nena",\n  "itens": [\n    "marmita",\n    "suco"\n  ]\n}',
    explanation:
      'Com o terceiro argumento `2`, cada nível ganha 2 espaços de recuo e cada item vai para uma linha. ' +
      'As chaves e textos saem com aspas duplas, como manda o JSON.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q20',
    lessonIds: ['back.m02.l03'],
    kind: 'predict-output',
    prompt: 'O preço veio como texto no JSON. O que este código imprime?',
    code: `const item = JSON.parse('{"preco": "12.50", "qtd": 2}');
console.log(item.preco * item.qtd);
console.log(item.preco + item.qtd);`,
    expectedOutput: '25\n12.502',
    explanation:
      'O `JSON.parse` respeita o tipo que está no texto: `"12.50"` é string. A multiplicação converte para ' +
      'número, mas o `+` com texto **cola**. Por isso se valida (ou converte com `Number`) o que veio.',
    difficulty: 2,
  },
  {
    id: 'back.m02.q21',
    lessonIds: ['back.m02.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual destes textos é JSON válido?',
    options: [
      '`{"nome": "Seu Zé", "ativo": true}`',
      '`{nome: "Seu Zé", ativo: true}`',
      "`{'nome': 'Seu Zé', 'ativo': true}`",
      '`{"nome": "Seu Zé", "ativo": true,}`',
    ],
    answerIndex: 0,
    explanation:
      'No JSON, chaves e textos usam **aspas duplas** e não pode sobrar vírgula no fim. As outras opções ' +
      'são JavaScript válido, mas JSON inválido.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q22',
    lessonIds: ['back.m02.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const cliente = { nome: 'Seu Zé', apelido: undefined, ativo: true };
console.log(JSON.stringify(cliente));`,
    expectedOutput: '{"nome":"Seu Zé","ativo":true}',
    explanation:
      'JSON não tem `undefined`, então o `JSON.stringify` simplesmente pula esse campo. Sem o terceiro ' +
      'argumento, tudo sai numa linha só, sem espaços.',
    difficulty: 2,
  },
  {
    id: 'back.m02.q23',
    lessonIds: ['back.m02.l03'],
    kind: 'predict-output',
    prompt: 'A Tia Nena editou a config na mão. O que este código imprime?',
    code: `try {
  JSON.parse('{ "taxaEntrega": 5, }');
  console.log('config ok');
} catch (err) {
  console.log(err.name);
}
console.log('segue o baile');`,
    expectedOutput: 'SyntaxError\nsegue o baile',
    explanation:
      'A vírgula sobrando torna o JSON inválido e o `JSON.parse` lança um `SyntaxError`. Como ele foi pego ' +
      'no `catch`, o script continua.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q24',
    lessonIds: ['back.m02.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `console.log(typeof JSON.parse('42'));
console.log(Array.isArray(JSON.parse('[1, 2]')));
console.log(JSON.parse('"oi"').length);`,
    expectedOutput: 'number\ntrue\n2',
    explanation:
      'JSON não é só objeto: `42`, `[1, 2]` e `"oi"` também são JSON válido. O `JSON.parse` devolve um ' +
      'número, um array e uma string.',
    difficulty: 2,
  },
  {
    id: 'back.m02.q25',
    lessonIds: ['back.m02.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para gravar o estoque indentado com 2 espaços.',
    code: `fs.writeFileSync('estoque.json', JSON.stringify(estoque, null, ___), 'utf8');`,
    acceptedAnswers: ['2'],
    explanation: 'O terceiro argumento do `JSON.stringify` é o recuo. Com `2`, o arquivo fica legível.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q26',
    lessonIds: ['back.m02.l03'],
    kind: 'multiple-choice',
    prompt:
      'Você leu `clientes.json` com `JSON.parse` e fez `lista.push(novo)`. O que acontece com o arquivo?',
    options: [
      'Nada: o arquivo só muda quando você gravar com `writeFileSync(JSON.stringify(...))`',
      'O arquivo é atualizado na hora, porque a lista veio dele',
      'O arquivo é apagado',
      'O Node grava sozinho quando o script termina',
    ],
    answerIndex: 0,
    explanation:
      'Depois do `parse`, a lista é um objeto comum na memória, sem ligação com o arquivo. Ler, alterar e ' +
      '**gravar**.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q27',
    lessonIds: ['back.m02.l03'],
    kind: 'true-false',
    prompt: 'Dá para deixar um comentário `// não mexer` dentro de um arquivo `.json` comum.',
    answer: false,
    explanation:
      'JSON não aceita comentários: o `JSON.parse` lança `SyntaxError`. Se precisar de uma observação, crie ' +
      'um campo, tipo `"obs": "não mexer"`.',
    difficulty: 1,
  },
  {
    id: 'back.m02.q28',
    lessonIds: ['back.m02.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const PADRAO = { taxaEntrega: 5, aberto: true };
const doArquivo = { taxaEntrega: 8 };
const config = { ...PADRAO, ...doArquivo };
console.log(config.taxaEntrega, config.aberto);`,
    expectedOutput: '8 true',
    explanation:
      'O spread copia os campos do `PADRAO` e depois os do arquivo. A `taxaEntrega` do arquivo vem depois e ' +
      'ganha; o `aberto` continua do padrão.',
    difficulty: 1,
  },

  // ---- acompanhamento: e03 ----
  {
    id: 'back.m02.f09',
    lessonIds: ['back.m02.l03'],
    exerciseId: 'back.m02.e03',
    kind: 'multiple-choice',
    prompt:
      'Se a sua `adicionarPrato` gravasse com `JSON.stringify(lista)` (sem o `null, 2`), o que mudaria?',
    options: [
      'O conteúdo seria o mesmo, mas tudo numa linha só, difícil de a Tia Nena editar',
      'O arquivo deixaria de ser JSON válido',
      'Só o último prato seria gravado',
      'Os preços virariam texto',
    ],
    answerIndex: 0,
    explanation:
      'A indentação é só para humanos. O `JSON.parse` lê os dois jeitos, mas o cliente que edita na mão ' +
      'agradece o recuo.',
    difficulty: 1,
  },
  {
    id: 'back.m02.f10',
    lessonIds: ['back.m02.l03'],
    exerciseId: 'back.m02.e03',
    kind: 'true-false',
    prompt:
      'Na sua `adicionarPrato`, o `lista.push(prato)` sozinho já salva o prato no `cardapio.json`; o ' +
      '`writeFileSync` é só por garantia.',
    answer: false,
    explanation:
      'O `push` muda só o array na memória. Sem o `writeFileSync`, o prato some quando o script termina.',
    difficulty: 1,
  },

  // ---- acompanhamento: e04 ----
  {
    id: 'back.m02.f11',
    lessonIds: ['back.m02.l03'],
    exerciseId: 'back.m02.e04',
    kind: 'multiple-choice',
    prompt:
      'Na sua `validarPedido`, por que conferir `Array.isArray(pedido.itens)` e não só `pedido.itens.length > 0`?',
    options: [
      'Porque um texto como `"marmita"` também tem `length`, e passaria como se fosse uma lista',
      'Porque `length` não funciona em objetos vindos do JSON',
      'Porque `Array.isArray` também confere se os itens têm preço',
      'Não tem diferença, é só estilo',
    ],
    answerIndex: 0,
    explanation:
      'Strings têm `length`. O `Array.isArray` garante que é mesmo uma lista antes de olhar o tamanho.',
    difficulty: 2,
  },
  {
    id: 'back.m02.f12',
    lessonIds: ['back.m02.l03'],
    exerciseId: 'back.m02.e04',
    kind: 'multiple-choice',
    prompt: 'O que a sua `validarPedido(\'{"cliente": "Seu Zé", "itens": [],}\')` devolve?',
    options: [
      "`{ ok: false, erro: 'JSON inválido' }`",
      "`{ ok: false, erro: 'pedido sem itens' }`",
      "`{ ok: false, erro: 'falta o cliente' }`",
      'O script cai com `SyntaxError`',
    ],
    answerIndex: 0,
    explanation:
      'A vírgula antes do `}` deixa o texto inválido. O `JSON.parse` falha primeiro, e o `catch` devolve ' +
      '"JSON inválido" antes de olhar os itens.',
    difficulty: 2,
  },

  // ---- acompanhamento: d03 ----
  {
    id: 'back.m02.f13',
    lessonIds: ['back.m02.l03'],
    exerciseId: 'back.m02.d03',
    kind: 'multiple-choice',
    prompt: 'Por que a versão com defeito dava `ReferenceError` justamente com o JSON **válido**?',
    options: [
      'O `const config` só existia dentro do `try`; o `return` lá embaixo não enxergava a variável',
      'O `JSON.parse` lança `ReferenceError` quando o JSON está certo',
      'O spread `...config` não funciona com objetos lidos de arquivo',
      'O `catch` apagava a variável `config`',
    ],
    answerIndex: 0,
    explanation:
      'Com JSON quebrado, o `catch` devolvia antes de chegar no `return` de baixo, e o bug ficava escondido. ' +
      'Com JSON válido, o código chegava lá e a variável não existia.',
    difficulty: 2,
  },
  {
    id: 'back.m02.f14',
    lessonIds: ['back.m02.l03'],
    exerciseId: 'back.m02.d03',
    kind: 'predict-output',
    prompt: 'Com o padrão da sua `lerConfig`, o que este trecho imprime?',
    code: `const PADRAO = { taxaEntrega: 5, pedidoMinimo: 20 };
const config = { pedidoMinimo: 30 };
const final = { ...PADRAO, ...config };
console.log(final.taxaEntrega, final.pedidoMinimo);`,
    expectedOutput: '5 30',
    explanation:
      'O arquivo só tinha `pedidoMinimo`, que ganha do padrão. A `taxaEntrega` que faltava vem do `PADRAO`.',
    difficulty: 1,
  },
];
