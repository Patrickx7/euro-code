import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m03.l03',
  moduleId: 'typescript.m03',
  order: 3,
  title: 'keyof, T[K], typeof e as const: tipos tirados de outros tipos',
  concepts: [
    'keyof',
    'acesso indexado T[K]',
    'K extends keyof T',
    'typeof em posição de tipo',
    'as const',
    'união a partir de array: (typeof X)[number]',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Até aqui você escreveu os tipos na mão. Agora vamos **derivar** tipos de outros, para que eles ' +
        'mudem juntos quando o código mudar.\n\n' +
        '**`keyof`** dá a união dos nomes das propriedades de um tipo:\n\n' +
        "```ts\ntype Job = { cliente: string; valor: number; urgente: boolean };\ntype CampoDoJob = keyof Job; // 'cliente' | 'valor' | 'urgente'\n```\n\n" +
        '**Acesso indexado** (`T[K]`) dá o tipo de uma propriedade, com a mesma sintaxe de colchetes do ' +
        "JavaScript, só que em tipos: `Job['valor']` é `number`, e `Job['cliente' | 'urgente']` é `string | boolean`.",
    },
    {
      kind: 'text',
      markdown:
        'Juntando os dois com genéricos, sai uma das assinaturas mais úteis do TypeScript:\n\n' +
        '```ts\nfunction pegar<T, K extends keyof T>(obj: T, chave: K): T[K] {\n  return obj[chave];\n}\n```\n\n' +
        '- `K extends keyof T`: a chave precisa ser **uma das chaves de verdade** do objeto;\n' +
        '- `T[K]`: o retorno é o tipo **daquela** propriedade.\n\n' +
        "Então `pegar(job, 'valor')` é `number`, `pegar(job, 'cliente')` é `string` e `pegar(job, 'naoExiste')` " +
        'nem compila. Erro de digitação no nome do campo vira erro de compilação, não `undefined` em produção.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type Job = { cliente: string; valor: number; urgente: boolean };

function pegar<T, K extends keyof T>(obj: T, chave: K): T[K] {
  return obj[chave];
}

const job: Job = { cliente: 'Pastelaria do Tio', valor: 180, urgente: true };

const valor = pegar(job, 'valor'); // number
const cliente = pegar(job, 'cliente'); // string
// pegar(job, 'valr'); // erro: 'valr' não é uma chave de Job`,
      explanation:
        "O K é inferido como o literal `'valor'`, e `Job['valor']` é `number`. Por isso cada chamada tem um tipo de retorno diferente.",
    },
    {
      kind: 'text',
      markdown:
        '**`typeof` em tipos.** No JavaScript, `typeof x` devolve uma string em tempo de execução. Numa ' +
        '**posição de tipo**, o `typeof` do TypeScript pega o tipo de uma variável:\n\n' +
        "```ts\nconst config = { porta: 3000, host: 'localhost' };\ntype Config = typeof config; // { porta: number; host: string }\n" +
        "type ChaveConfig = keyof typeof config; // 'porta' | 'host'\n```\n\n" +
        "**`as const`.** Por padrão, o TypeScript \"alarga\" literais: `['aberto', 'pago']` vira `string[]`. " +
        'Com `as const`, o valor vira **somente leitura** e os literais são mantidos:\n\n' +
        "```ts\nconst STATUS = ['aberto', 'pago', 'cancelado'] as const;\n// readonly ['aberto', 'pago', 'cancelado']\n" +
        "type Status = (typeof STATUS)[number]; // 'aberto' | 'pago' | 'cancelado'\n```\n\n" +
        'O `[number]` é um acesso indexado: "o tipo de qualquer item do array". Assim a lista de status ' +
        'existe uma vez só, no código, e o tipo é derivado dela. Acrescentou um status no array? O tipo ' +
        'acompanha sozinho.\n\n' +
        'Lembrete: `as const` é só para o compilador. Em tempo de execução, o array continua um array comum ' +
        '(para congelar de verdade existe `Object.freeze`).',
    },
  ],
  checkQuestionIds: ['typescript.m03.q17'],
  exerciseIds: ['typescript.m03.e05', 'typescript.m03.e06'],
  debugExerciseIds: ['typescript.m03.d03'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m03.e05',
    lessonId: 'typescript.m03.l03',
    kind: 'implement',
    title: 'pegar e coluna sem erro de digitação',
    promptMarkdown:
      'O relatório da Distribuidora Parafuso Solto quebrou porque alguém escreveu `pegar(job, "valr")` e o ' +
      '`any` deixou passar. Reescreva as duas funções da biblioteca interna com genéricos e `keyof`:\n\n' +
      '- `pegar(obj, chave)`: devolve `obj[chave]`. A chave precisa existir no objeto e o retorno tem o ' +
      'tipo daquela propriedade;\n' +
      '- `coluna(lista, chave)`: devolve um array com o valor daquela propriedade em cada item ' +
      "(ex.: `coluna(jobs, 'valor')` dá `[180, 90]`, do tipo `number[]`).",
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function pegar(obj: any, chave: string): any {
  return obj[chave];
}

function coluna(lista: any[], chave: string): any[] {
  return lista.map((item) => item[chave]);
}
`,
    solution: `function pegar<T, K extends keyof T>(obj: T, chave: K): T[K] {
  return obj[chave];
}

function coluna<T, K extends keyof T>(lista: T[], chave: K): T[K][] {
  return lista.map((item) => item[chave]);
}
`,
    tests: [
      {
        description: 'pegar devolve o valor da propriedade',
        code: `const job = { cliente: 'Pastelaria do Tio', valor: 180, urgente: true };
assert.strictEqual(pegar(job, 'cliente'), 'Pastelaria do Tio');
assert.strictEqual(pegar(job, 'valor'), 180);`,
      },
      {
        description: 'coluna devolve os valores de uma propriedade',
        code: `const jobs = [
  { cliente: 'Pastelaria do Tio', valor: 180 },
  { cliente: 'Oficina Graxa Fina', valor: 90 },
];
assert.deepStrictEqual(coluna(jobs, 'valor'), [180, 90]);
assert.deepStrictEqual(coluna(jobs, 'cliente'), ['Pastelaria do Tio', 'Oficina Graxa Fina']);`,
      },
      {
        description: 'o retorno tem o tipo da propriedade',
        code: `const job = { cliente: 'Pastelaria do Tio', valor: 180 };
const valor: number = pegar(job, 'valor');
const valores: number[] = coluna([job], 'valor');
// @ts-expect-error valor é number, não string
const errado: string = pegar(job, 'valor');
// @ts-expect-error a coluna cliente é string[]
const errado2: number[] = coluna([job], 'cliente');
assert.strictEqual(valor + valores[0], 360);`,
      },
      {
        description: 'chave que não existe não compila',
        code: `const job = { cliente: 'Pastelaria do Tio', valor: 180 };
const usarErrado = () => {
  // @ts-expect-error erro de digitação no nome do campo
  pegar(job, 'valr');
  // @ts-expect-error o campo não existe
  coluna([job], 'naoExiste');
};
assert.strictEqual(typeof usarErrado, 'function');`,
      },
    ],
    hints: [
      'Dois parâmetros de tipo: o objeto e a chave. `function pegar<T, K extends keyof T>(obj: T, chave: K)`.',
      'O retorno de `pegar` é `T[K]`. O de `coluna` é uma lista disso: `T[K][]`.',
    ],
    followUpQuestionIds: ['typescript.m03.f13', 'typescript.m03.f14'],
    difficulty: 2,
  },
  {
    id: 'typescript.m03.e06',
    lessonId: 'typescript.m03.l03',
    kind: 'implement',
    title: 'Atualizar um campo sem estragar o original',
    promptMarkdown:
      'Crie a função genérica `comCampo(obj, chave, valor)` que devolve uma **cópia** do objeto com aquela ' +
      'propriedade trocada, sem alterar o original.\n\n' +
      '- a chave precisa existir no objeto;\n' +
      "- o valor precisa ter o **tipo da propriedade**: `comCampo(produto, 'preco', 'caro')` não pode compilar;\n" +
      '- o retorno tem o mesmo tipo do objeto.\n\n' +
      'O código inicial (adivinha quem escreveu) muda o objeto original e aceita qualquer coisa.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function comCampo(obj: any, chave: string, valor: unknown): any {
  obj[chave] = valor;
  return obj;
}
`,
    solution: `function comCampo<T, K extends keyof T>(obj: T, chave: K, valor: T[K]): T {
  return { ...obj, [chave]: valor };
}
`,
    tests: [
      {
        description: 'devolve uma cópia com o campo trocado',
        code: `const produto = { nome: 'Furadeira', preco: 289, estoque: 4 };
const novo = comCampo(produto, 'preco', 249);
assert.deepStrictEqual(novo, { nome: 'Furadeira', preco: 249, estoque: 4 });`,
      },
      {
        description: 'não altera o objeto original',
        code: `const produto = { nome: 'Furadeira', preco: 289, estoque: 4 };
comCampo(produto, 'estoque', 0);
assert.strictEqual(produto.estoque, 4, 'O objeto original foi alterado.');`,
      },
      {
        description: 'o valor precisa ter o tipo da propriedade',
        code: `const produto = { nome: 'Furadeira', preco: 289 };
const novo = comCampo(produto, 'nome', 'Furadeira de impacto');
const nome: string = novo.nome;
assert.strictEqual(nome, 'Furadeira de impacto');
const usarErrado = () => {
  // @ts-expect-error preco é number
  comCampo(produto, 'preco', 'caro');
  // @ts-expect-error o campo não existe
  comCampo(produto, 'voltagem', 220);
};
assert.strictEqual(typeof usarErrado, 'function');`,
      },
    ],
    hints: [
      'A assinatura usa os três juntos: `<T, K extends keyof T>(obj: T, chave: K, valor: T[K]): T`.',
      'Para copiar trocando um campo: `return { ...obj, [chave]: valor };` (o `[chave]` é uma propriedade com nome calculado).',
    ],
    followUpQuestionIds: ['typescript.m03.f15', 'typescript.m03.f16'],
    difficulty: 3,
  },
  {
    id: 'typescript.m03.d03',
    lessonId: 'typescript.m03.l03',
    kind: 'debug',
    title: 'O status que aceitava qualquer coisa',
    promptMarkdown:
      'O sistema de jobs tem uma lista de status e o tipo `Status` deveria ser a união dos três valores. ' +
      "Mas alguém chamou `proximoStatus('cancelad')` e o TypeScript nem piscou: o tipo virou `string`. " +
      "Conserte para que `Status` seja `'aberto' | 'em-andamento' | 'entregue'`, sem repetir os " +
      'valores à mão.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `const STATUS = ['aberto', 'em-andamento', 'entregue'];
type Status = (typeof STATUS)[number];

function proximoStatus(atual: Status): Status {
  const i = STATUS.indexOf(atual);
  return STATUS[Math.min(i + 1, STATUS.length - 1)];
}
`,
    solution: `const STATUS = ['aberto', 'em-andamento', 'entregue'] as const;
type Status = (typeof STATUS)[number];

function proximoStatus(atual: Status): Status {
  const i = STATUS.indexOf(atual);
  return STATUS[Math.min(i + 1, STATUS.length - 1)];
}
`,
    tests: [
      {
        description: 'avança o status e para no último',
        code: `assert.strictEqual(proximoStatus('aberto'), 'em-andamento');
assert.strictEqual(proximoStatus('em-andamento'), 'entregue');
assert.strictEqual(proximoStatus('entregue'), 'entregue');`,
      },
      {
        description: 'o retorno é a união dos status, não string',
        code: `const s: 'aberto' | 'em-andamento' | 'entregue' = proximoStatus('aberto');
assert.strictEqual(s, 'em-andamento');`,
      },
      {
        description: 'status inexistente não compila',
        code: `const usarErrado = () => {
  // @ts-expect-error esse status não existe
  proximoStatus('cancelad');
};
assert.strictEqual(typeof usarErrado, 'function');`,
      },
    ],
    hints: [
      'Sem nada, o TypeScript alarga o array para `string[]`, e `(typeof STATUS)[number]` vira `string`.',
      'Coloque `as const` no fim do array para manter os literais.',
    ],
    followUpQuestionIds: ['typescript.m03.f17', 'typescript.m03.f18'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'typescript.m03.q17',
    lessonIds: ['typescript.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual é o tipo `C`?',
    code: `type Cliente = { nome: string; bairro: string; ativo: boolean };
type C = keyof Cliente;`,
    options: ["'nome' | 'bairro' | 'ativo'", 'string | boolean', 'string', "['nome', 'bairro', 'ativo']"],
    answerIndex: 0,
    explanation:
      '`keyof` dá a união dos **nomes** das propriedades. Os tipos dos valores seriam `Cliente[keyof Cliente]`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q18',
    lessonIds: ['typescript.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual é o tipo `V`?',
    code: `type Cliente = { nome: string; bairro: string; ativo: boolean };
type V = Cliente['ativo'];`,
    options: ['boolean', "'ativo'", 'string | boolean', 'Cliente'],
    answerIndex: 0,
    explanation: 'O acesso indexado `T[K]` dá o tipo da propriedade `K` de `T`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q19',
    lessonIds: ['typescript.m03.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para que a chave seja obrigatoriamente uma das chaves de `T`.',
    code: 'function pegar<T, K extends ___ T>(obj: T, chave: K): T[K] {',
    acceptedAnswers: ['keyof'],
    explanation: '`K extends keyof T`: K só pode ser um dos nomes de propriedade de T.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q20',
    lessonIds: ['typescript.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual o tipo de `TAXAS`?',
    code: "const TAXAS = ['centro', 'granja-viana'] as const;",
    options: [
      "readonly ['centro', 'granja-viana']",
      'string[]',
      "('centro' | 'granja-viana')[]",
      'readonly string[]',
    ],
    answerIndex: 0,
    explanation: '`as const` transforma o array numa tupla somente leitura, guardando cada literal.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q21',
    lessonIds: ['typescript.m03.l03'],
    kind: 'predict-output',
    prompt: 'O `as const` some na compilação. Este é o JavaScript que sobra. O que ele imprime?',
    code: `const BAIRROS = ['Centro', 'Km 18'];
BAIRROS.push('Vila Yara');
console.log(BAIRROS.length);`,
    expectedOutput: '3',
    explanation:
      'Em TypeScript, `BAIRROS.push` nem compilaria com `as const` (é `readonly`). Mas isso é só checagem: em tempo de execução o array é comum e aceita o `push`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q22',
    lessonIds: ['typescript.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual o tipo `Chave`?',
    code: `const precos = { marmita: 22, suco: 8, sobremesa: 6 };
type Chave = keyof typeof precos;`,
    options: ["'marmita' | 'suco' | 'sobremesa'", 'number', 'string', 'typeof precos'],
    answerIndex: 0,
    explanation:
      '`typeof precos` dá o tipo do objeto e `keyof` pega os nomes das propriedades. `keyof precos` sozinho não compila: `precos` é um valor, não um tipo.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q23',
    lessonIds: ['typescript.m03.l03'],
    kind: 'true-false',
    prompt:
      "Com `pegar<T, K extends keyof T>(obj: T, chave: K): T[K]`, a chamada `pegar({ km: 18 }, 'km')` tem tipo `number`.",
    answer: true,
    explanation: "K é inferido como o literal `'km'`, e `{ km: number }['km']` é `number`.",
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q24',
    lessonIds: ['typescript.m03.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para que `Status` seja a união dos itens do array.',
    code: "const STATUS = ['aberto', 'pago'] as const;\ntype Status = (typeof STATUS)[___];",
    acceptedAnswers: ['number'],
    explanation: "`(typeof STATUS)[number]` é \"o tipo de qualquer item do array\": `'aberto' | 'pago'`.",
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m03.f13',
    lessonIds: ['typescript.m03.l03'],
    exerciseId: 'typescript.m03.e05',
    kind: 'multiple-choice',
    prompt: "Com a sua `coluna`, qual o tipo de `coluna(jobs, 'cliente')`, se `cliente` é `string`?",
    options: ['string[]', "'cliente'[]", 'unknown[]', 'string'],
    answerIndex: 0,
    explanation: "O retorno é `T[K][]`; com `K = 'cliente'`, vira `string[]`.",
    difficulty: 2,
  },
  {
    id: 'typescript.m03.f14',
    lessonIds: ['typescript.m03.l03'],
    exerciseId: 'typescript.m03.e05',
    kind: 'true-false',
    prompt:
      "Com a sua versão, `pegar(job, 'valr')` (erro de digitação) é barrado na compilação, antes de rodar.",
    answer: true,
    explanation: "`'valr'` não está em `keyof` do tipo do job, então não satisfaz `K extends keyof T`.",
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f15',
    lessonIds: ['typescript.m03.l03'],
    exerciseId: 'typescript.m03.e06',
    kind: 'multiple-choice',
    prompt: 'Na sua `comCampo`, o que faz o tipo `T[K]` no parâmetro `valor`?',
    options: [
      'Obriga o valor a ter o tipo da propriedade escolhida',
      'Obriga o valor a ser uma das chaves do objeto',
      'Deixa o valor ser de qualquer tipo',
      'Faz o retorno ser só aquela propriedade',
    ],
    answerIndex: 0,
    explanation: "Com `K = 'preco'`, `T[K]` é `number`: passar `'caro'` não compila.",
    difficulty: 2,
  },
  {
    id: 'typescript.m03.f16',
    lessonIds: ['typescript.m03.l03'],
    exerciseId: 'typescript.m03.e06',
    kind: 'true-false',
    prompt:
      'O código inicial de `comCampo` alterava o objeto original, porque `obj[chave] = valor` muda o próprio objeto recebido.',
    answer: true,
    explanation:
      'Objetos são passados por referência. O spread `{ ...obj, [chave]: valor }` cria uma cópia nova.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f17',
    lessonIds: ['typescript.m03.l03'],
    exerciseId: 'typescript.m03.d03',
    kind: 'multiple-choice',
    prompt: 'Sem o `as const`, qual era o tipo `Status`?',
    options: ['string', "'aberto' | 'em-andamento' | 'entregue'", 'string[]', 'never'],
    answerIndex: 0,
    explanation: 'O array era `string[]`, e o tipo de um item de `string[]` é `string`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f18',
    lessonIds: ['typescript.m03.l03'],
    exerciseId: 'typescript.m03.d03',
    kind: 'true-false',
    prompt:
      "Depois do conserto, para criar o status 'cancelado' basta acrescentá-lo no array `STATUS`: o tipo `Status` acompanha sozinho.",
    answer: true,
    explanation: 'O tipo é derivado do array, então existe uma fonte só de verdade.',
    difficulty: 1,
  },
];
