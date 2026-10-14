import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m02.l02',
  moduleId: 'typescript.m02',
  order: 2,
  title: 'Uniões e narrowing: o status que não aceita "quase pronto"',
  concepts: [
    'tipos literais',
    'união de literais',
    'união de tipos',
    'narrowing',
    'typeof',
    'Array.isArray',
    'in',
    'instanceof',
    'armadilha da truthiness',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        "Um **tipo literal** é um valor exato virando tipo: `'entregue'` é um tipo que só aceita a string " +
        "`'entregue'`. Junte vários com `|` (**união**) e você tem uma lista fechada de opções:\n\n" +
        "```ts\ntype StatusJob = 'aberto' | 'em andamento' | 'entregue';\n\nlet status: StatusJob = 'aberto';\n" +
        "status = 'quase pronto'; // erro: não está na lista\n```\n\n" +
        "Bem melhor que `string`: o editor autocompleta, e o erro de digitação (`'entrege'`) aparece na " +
        'hora, não na reunião com o cliente.\n\n' +
        'A união também mistura tipos diferentes: `number | string` é "um número **ou** uma string". O porém: ' +
        'com uma união, o TypeScript só deixa usar o que vale para **todos** os membros. Com ' +
        '`valor: number | string`, `valor.toFixed(2)` não compila. E se for string?',
    },
    {
      kind: 'text',
      markdown:
        '**Narrowing** (estreitamento) é o TypeScript acompanhando os seus `if`s. Depois de uma checagem, ' +
        'dentro do bloco, ele sabe qual membro da união sobrou:\n\n' +
        '| Checagem | Serve para |\n' +
        '| --- | --- |\n' +
        "| `typeof x === 'string'` | primitivos: `'string'`, `'number'`, `'boolean'`, `'undefined'`... |\n" +
        "| `Array.isArray(x)` | separar arrays (`typeof []` é `'object'`!) |\n" +
        "| `'campo' in x` | objetos que se diferenciam por ter um campo |\n" +
        '| `x instanceof Classe` | instâncias de classes (`Date`, `Error`, as suas) |\n' +
        "| `x === null`, `x === 'aberto'` | comparação com um valor exato |\n\n" +
        'E depois de um `return` dentro do `if`, o resto da função já trabalha só com o que sobrou.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `function paraCentavos(valor: number | string): number {
  if (typeof valor === 'number') {
    return Math.round(valor * 100); // aqui valor é number
  }
  // aqui só pode ser string
  return Math.round(Number(valor.replace(',', '.')) * 100);
}

function tags(entrada: string | string[]): string[] {
  return Array.isArray(entrada) ? entrada : [entrada];
}`,
      explanation: 'Passe o mouse sobre `valor` em cada linha, no editor: o tipo muda conforme os `if`s.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type Pix = { chave: string };
type Cartao = { numero: string; parcelas: number };

function resumo(p: Pix | Cartao): string {
  if ('chave' in p) return \`Pix para \${p.chave}\`;
  return \`Cartão em \${p.parcelas}x\`; // aqui p é Cartao
}

function quando(prazo: Date | string): string {
  if (prazo instanceof Date) return prazo.toISOString().slice(0, 10);
  return prazo; // 'sexta-feira', 'ontem' (cliente sendo cliente)...
}`,
      explanation:
        '`in` separa objetos pelo campo que só um deles tem; `instanceof` separa instâncias de classes.',
    },
    {
      kind: 'text',
      markdown:
        '**Armadilha:** `if (x)` também faz narrowing (tira `null` e `undefined`), mas joga fora junto o ' +
        '`0`, a string vazia `\'\'` e o `false`. Para "não tem valor", compare explicitamente: ' +
        '`x === null`, `x === undefined`, ou `x == null` (que pega os dois).',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const descontos = [0, 10, null];
for (const d of descontos) {
  console.log(d ? 'com ' + d + '%' : 'sem desconto', '|', d !== null ? 'com ' + d + '%' : 'sem desconto');
}`,
      explanation: 'O desconto de 0% some com `d ? ...`, mas aparece certo com `d !== null`.',
    },
  ],
  checkQuestionIds: ['typescript.m02.q08'],
  exerciseIds: ['typescript.m02.e03', 'typescript.m02.e04'],
  debugExerciseIds: ['typescript.m02.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m02.e03',
    lessonId: 'typescript.m02.l02',
    kind: 'implement',
    title: 'Status sem "quase pronto"',
    promptMarkdown:
      "O app de jobs aceita qualquer string como status, e já apareceu job com `'quase pronto'`, " +
      "`'entrege'` e `'vou ver'`.\n\n" +
      "1. Troque `type StatusJob = string` por uma união de literais: `'aberto'`, `'em andamento'` e " +
      "`'entregue'`.\n" +
      "2. Implemente `avancar(status)`: `'aberto'` vira `'em andamento'`, `'em andamento'` vira " +
      "`'entregue'`, e `'entregue'` continua `'entregue'`.",
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type StatusJob = string;

function avancar(status: StatusJob): StatusJob {
  // seu código aqui
  return status;
}
`,
    solution: `type StatusJob = 'aberto' | 'em andamento' | 'entregue';

function avancar(status: StatusJob): StatusJob {
  if (status === 'aberto') return 'em andamento';
  if (status === 'em andamento') return 'entregue';
  return 'entregue';
}
`,
    tests: [
      {
        description: 'aberto vira em andamento, que vira entregue',
        code: `assert.strictEqual(avancar('aberto'), 'em andamento');
assert.strictEqual(avancar('em andamento'), 'entregue');`,
      },
      {
        description: 'entregue continua entregue',
        code: "assert.strictEqual(avancar('entregue'), 'entregue');",
      },
      {
        description: 'status fora da lista não compila',
        code: `const ok: StatusJob = 'entregue';
// @ts-expect-error
const invalido: StatusJob = 'quase pronto';
assert.ok(ok && invalido);`,
      },
      {
        description: 'erro de digitação no argumento não compila',
        code: `// @ts-expect-error
const r = avancar('entrege');
assert.ok(r !== null);`,
      },
    ],
    hints: [
      "A união de literais fica assim: `type StatusJob = 'aberto' | 'em andamento' | 'entregue';`.",
      "Compare com `===`: `if (status === 'aberto') return 'em andamento';`.",
    ],
    followUpQuestionIds: ['typescript.m02.f07', 'typescript.m02.f08'],
    difficulty: 1,
  },
  {
    id: 'typescript.m02.e04',
    lessonId: 'typescript.m02.l02',
    kind: 'implement',
    title: 'A API legada que manda de tudo',
    promptMarkdown:
      'A API antiga da Distribuidora Ovo Frito manda o valor às vezes como número (`1200.5`) e às vezes ' +
      "como texto brasileiro (`'1.200,50'`). As tags vêm como uma string só, como array, ou nem vêm.\n\n" +
      'Implemente:\n\n' +
      '- `paraCentavos(valor: number | string): number`: número (em reais) vira centavos ' +
      '(`1200.5` → `120050`); texto perde os pontos de milhar, troca a vírgula por ponto e segue igual ' +
      "(`'1.200,50'` → `120050`). Arredonde com `Math.round`.\n" +
      '- `normalizarTags(tags: string | string[] | undefined): string[]`: array volta como está, string vira ' +
      'um array com um item, `undefined` vira `[]`.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function paraCentavos(valor: number | string): number {
  // seu código aqui
  return 0;
}

function normalizarTags(tags: string | string[] | undefined): string[] {
  // seu código aqui
  return [];
}
`,
    solution: `function paraCentavos(valor: number | string): number {
  if (typeof valor === 'number') return Math.round(valor * 100);
  const numero = Number(valor.replaceAll('.', '').replace(',', '.'));
  return Math.round(numero * 100);
}

function normalizarTags(tags: string | string[] | undefined): string[] {
  if (tags === undefined) return [];
  if (Array.isArray(tags)) return tags;
  return [tags];
}
`,
    tests: [
      {
        description: 'número em reais vira centavos',
        code: `assert.strictEqual(paraCentavos(1200.5), 120050);
assert.strictEqual(paraCentavos(19.9), 1990);`,
      },
      {
        description: 'texto com vírgula e ponto de milhar vira centavos',
        code: `assert.strictEqual(paraCentavos('1.200,50'), 120050);
assert.strictEqual(paraCentavos('35,90'), 3590);`,
      },
      {
        description: 'tags: array, string e undefined',
        code: `assert.deepStrictEqual(normalizarTags(['urgente', 'pix']), ['urgente', 'pix']);
assert.deepStrictEqual(normalizarTags('urgente'), ['urgente']);
assert.deepStrictEqual(normalizarTags(undefined), []);`,
      },
    ],
    hints: [
      "Comece com `if (typeof valor === 'number') return ...`. Depois desse `return`, o TypeScript sabe que `valor` é string.",
      "Para o texto: `valor.replaceAll('.', '').replace(',', '.')` e depois `Number(...)`.",
      '`Array.isArray(tags)` separa o array da string.',
    ],
    followUpQuestionIds: ['typescript.m02.f09', 'typescript.m02.f10'],
    difficulty: 2,
  },
  {
    id: 'typescript.m02.d02',
    lessonId: 'typescript.m02.l02',
    kind: 'debug',
    title: 'O prazo zero que sumiu',
    promptMarkdown:
      'Jobs com prazo `0` ("é pra hoje!") aparecem no painel como "Sem prazo definido", e o cliente achou ' +
      'que dava para entregar semana que vem. Compila, mas o narrowing está errado: só `null` significa ' +
      'sem prazo. Conserte.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function descreverPrazo(prazo: number | string | null): string {
  if (!prazo) return 'Sem prazo definido';
  if (typeof prazo === 'number') {
    return prazo === 0 ? 'É pra hoje!' : \`\${prazo} dias\`;
  }
  return \`Até \${prazo}\`;
}
`,
    solution: `function descreverPrazo(prazo: number | string | null): string {
  if (prazo === null) return 'Sem prazo definido';
  if (typeof prazo === 'number') {
    return prazo === 0 ? 'É pra hoje!' : \`\${prazo} dias\`;
  }
  return \`Até \${prazo}\`;
}
`,
    tests: [
      {
        description: 'prazo 0 é pra hoje',
        code: "assert.strictEqual(descreverPrazo(0), 'É pra hoje!');",
      },
      {
        description: 'null continua sem prazo',
        code: "assert.strictEqual(descreverPrazo(null), 'Sem prazo definido');",
      },
      {
        description: 'números e textos continuam funcionando',
        code: `assert.strictEqual(descreverPrazo(3), '3 dias');
assert.strictEqual(descreverPrazo('sexta'), 'Até sexta');`,
      },
    ],
    hints: [
      'Quanto vale `!0`? O `if (!prazo)` pega mais coisa do que só `null`.',
      'Troque por `if (prazo === null)`.',
    ],
    followUpQuestionIds: ['typescript.m02.f11', 'typescript.m02.f12'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  // ---- gerais ----
  {
    id: 'typescript.m02.q08',
    lessonIds: ['typescript.m02.l02'],
    kind: 'multiple-choice',
    prompt: "Com `type StatusJob = 'aberto' | 'em andamento' | 'entregue'`, qual linha **não** compila?",
    options: [
      "`const s: StatusJob = 'cancelado';`",
      "`const s: StatusJob = 'aberto';`",
      "`const s: StatusJob = 'entregue';`",
      "`let s: StatusJob = 'em andamento';`",
    ],
    answerIndex: 0,
    explanation: "`'cancelado'` não está na lista de literais da união.",
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q09',
    lessonIds: ['typescript.m02.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `console.log(typeof null);
console.log(typeof ['pix', 'cartão']);
console.log(Array.isArray(['pix', 'cartão']));`,
    expectedOutput: 'object\nobject\ntrue',
    explanation:
      "`typeof` diz `'object'` para `null` e para arrays. Por isso existe `Array.isArray`, e por isso todo guard de objeto checa `!== null`.",
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q10',
    lessonIds: ['typescript.m02.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const job = { titulo: 'Site da oficina', desconto: undefined };
console.log('desconto' in job);
console.log('prazo' in job);`,
    expectedOutput: 'true\nfalse',
    explanation: '`in` confere se a chave **existe** no objeto, mesmo que o valor seja `undefined`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q11',
    lessonIds: ['typescript.m02.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual o tipo de `valor` na linha marcada?',
    code: `function tamanho(valor: number | string) {
  if (typeof valor === 'string') {
    return valor.length;
  }
  return valor; // <- aqui
}`,
    options: ['`number`', '`string`', '`number | string`', '`never`'],
    answerIndex: 0,
    explanation: 'A string saiu pelo `return` dentro do `if`. O que sobra da união é `number`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q12',
    lessonIds: ['typescript.m02.l02'],
    kind: 'true-false',
    prompt: 'Este código compila.',
    code: `function formatar(valor: number | string): string {
  return valor.toFixed(2);
}`,
    answer: false,
    explanation: '`toFixed` só existe em `number`. Com a união, falta um `typeof` antes de usar.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q13',
    lessonIds: ['typescript.m02.l02'],
    kind: 'multiple-choice',
    prompt: 'Para saber se `prazo: Date | string` é uma data, qual checagem faz o narrowing?',
    options: [
      '`prazo instanceof Date`',
      "`typeof prazo === 'date'`",
      "`'Date' in prazo`",
      '`Array.isArray(prazo)`',
    ],
    answerIndex: 0,
    explanation: "`Date` é classe: use `instanceof`. `typeof` de uma data é `'object'`, nunca `'date'`.",
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q14',
    lessonIds: ['typescript.m02.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const descontos = [0, 10, null];
for (const d of descontos) {
  console.log(d ? d + '% off' : 'sem desconto');
}`,
    expectedOutput: 'sem desconto\n10% off\nsem desconto',
    explanation:
      '`0` é falsy, então cai no mesmo caso do `null`. Para separar os dois, compare com `d !== null`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q15',
    lessonIds: ['typescript.m02.l02'],
    kind: 'fill-blank',
    prompt: 'Complete para separar o array da string.',
    code: `function tags(entrada: string | string[]): string[] {
  if (Array.___(entrada)) return entrada;
  return [entrada];
}`,
    acceptedAnswers: ['isArray'],
    explanation:
      '`Array.isArray` devolve `true` só para arrays, e o TypeScript estreita o tipo dentro do `if`.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m02.f07',
    lessonIds: ['typescript.m02.l02'],
    exerciseId: 'typescript.m02.e03',
    kind: 'multiple-choice',
    prompt:
      "Na sua `avancar`, qual o tipo de `status` na linha logo depois de `if (status === 'aberto') return 'em andamento';`?",
    options: [
      "`'em andamento' | 'entregue'`",
      "`'aberto' | 'em andamento' | 'entregue'`",
      '`string`',
      '`never`',
    ],
    answerIndex: 0,
    explanation: "Comparar com um literal também estreita: o `'aberto'` já saiu pelo `return`.",
    difficulty: 2,
  },
  {
    id: 'typescript.m02.f08',
    lessonIds: ['typescript.m02.l02'],
    exerciseId: 'typescript.m02.e03',
    kind: 'true-false',
    prompt:
      "Com o código inicial (`type StatusJob = string`), o teste do `'quase pronto'` falhava porque o TypeScript aceitava a string sem reclamar.",
    answer: true,
    explanation:
      'O `@ts-expect-error` exige um erro. Com `string`, qualquer texto é aceito e o erro esperado não aparece.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f09',
    lessonIds: ['typescript.m02.l02'],
    exerciseId: 'typescript.m02.e04',
    kind: 'multiple-choice',
    prompt:
      'Na sua `paraCentavos`, por que `valor.replaceAll(...)` compila na parte do texto, mas não compilaria na primeira linha da função?',
    options: [
      "Porque depois de `if (typeof valor === 'number') return ...`, o TypeScript sabe que só sobrou `string`",
      'Porque `replaceAll` também existe em `number`',
      'Porque o TypeScript não checa métodos de string',
      'Porque `Math.round` converte o valor antes',
    ],
    answerIndex: 0,
    explanation: 'Na primeira linha, `valor` ainda é `number | string`, e `number` não tem `replaceAll`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f10',
    lessonIds: ['typescript.m02.l02'],
    exerciseId: 'typescript.m02.e04',
    kind: 'multiple-choice',
    prompt:
      'Em `normalizarTags`, que checagem separa com segurança o `string[]` dos outros membros da união?',
    options: [
      '`Array.isArray(tags)`',
      "`typeof tags === 'array'`",
      '`tags instanceof String`',
      "`'length' in tags`",
    ],
    answerIndex: 0,
    explanation:
      "`typeof` nunca devolve `'array'`, e `in` não funciona em string primitiva (dá erro de tipo e `TypeError` na execução).",
    difficulty: 2,
  },
  {
    id: 'typescript.m02.f11',
    lessonIds: ['typescript.m02.l02'],
    exerciseId: 'typescript.m02.d02',
    kind: 'multiple-choice',
    prompt: 'Por que `if (!prazo)` engolia o prazo `0`?',
    options: [
      'Porque `0` é falsy: `!0` é `true`',
      "Porque `typeof 0` é `'undefined'`",
      'Porque o TypeScript converte `0` em `null`',
      'Porque `0 === null` é `true`',
    ],
    answerIndex: 0,
    explanation: "`!` testa truthiness, e `0`, `''`, `false`, `null` e `undefined` são todos falsy.",
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f12',
    lessonIds: ['typescript.m02.l02'],
    exerciseId: 'typescript.m02.d02',
    kind: 'true-false',
    prompt:
      'Com a correção `if (prazo === null) return ...`, na linha seguinte o TypeScript trata `prazo` como `number | string`.',
    answer: true,
    explanation: 'O `null` saiu pelo `return`. Sobram `number` e `string`, que o `typeof` separa em seguida.',
    difficulty: 1,
  },
];
