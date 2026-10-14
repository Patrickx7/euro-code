import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m02.l03',
  moduleId: 'typescript.m02',
  order: 3,
  title: 'Uniões discriminadas: pix, cartão ou dinheiro (fiado não)',
  concepts: [
    'união discriminada',
    'campo discriminante',
    'switch com narrowing',
    'exaustividade',
    'never',
    'assertNever',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Quando os membros de uma união são objetos, dá para colocar em cada um um campo com um **literal ' +
        'diferente**: o **discriminante**. Ele costuma se chamar `tipo`, `kind` ou `type`.\n\n' +
        "```ts\ntype Pagamento =\n  | { tipo: 'pix'; chave: string }\n  | { tipo: 'cartao'; parcelas: number }\n" +
        "  | { tipo: 'dinheiro'; recebido: number };\n```\n\n" +
        "Checando o discriminante (`if (p.tipo === 'cartao')` ou `switch (p.tipo)`), o TypeScript estreita o " +
        "objeto **inteiro**: dentro do `case 'cartao'`, `p.parcelas` existe; no `case 'pix'`, não. Nada de " +
        'campos opcionais soltos (`chave?`, `parcelas?`) nem de `!` para calar o compilador.\n\n' +
        'O próprio jogo usa isso: em `src/shared/content.ts`, `Question` é uma união discriminada por `kind` ' +
        "(`'multiple-choice'`, `'true-false'`...), e cada tipo de pergunta tem os seus campos.",
    },
    {
      kind: 'example',
      language: 'ts',
      code: `function descrever(p: Pagamento): string {
  switch (p.tipo) {
    case 'pix':
      return \`Pix para \${p.chave}\`;
    case 'cartao':
      return \`Cartão em \${p.parcelas}x\`;
    case 'dinheiro':
      return \`Dinheiro: R$ \${p.recebido}\`;
  }
}`,
      explanation:
        'Sem `default` e sem `return` no fim, e mesmo assim compila: o TypeScript sabe que os três `case` ' +
        'cobrem todas as possibilidades.',
    },
    {
      kind: 'text',
      markdown:
        "E quando o cliente inventar o **boleto**? Você acrescenta `{ tipo: 'boleto'; ... }` na união e... " +
        'quem vai lembrar de todos os `switch` espalhados pelo projeto? O compilador, se você deixar.\n\n' +
        'Depois de todos os `case`, o que sobra da união é `never`: o tipo **sem nenhum valor possível**. ' +
        'Uma função que só aceita `never` vira um alarme:\n\n' +
        '```ts\nfunction assertNever(valor: never): never {\n' +
        '  throw new Error(`Caso não tratado: ${JSON.stringify(valor)}`);\n}\n```\n\n' +
        'Chame `assertNever(p)` no `default` do switch:\n\n' +
        '- todos os casos tratados → `p` é `never` e compila;\n' +
        '- alguém acrescentou o boleto e esqueceu o `case` → `p` é o boleto, e o TypeScript acusa erro em ' +
        '**cada** switch incompleto do projeto;\n' +
        '- um dado inválido chegou em tempo de execução (de uma API, por exemplo) → o `throw` avisa, em vez ' +
        'de seguir em silêncio.\n\n' +
        'Cuidado com `default: return 0`: ele engole qualquer caso novo calado, e o boleto sai de graça.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type EventoApp =
  | { tipo: 'job-aceito'; jobId: string }
  | { tipo: 'pix-recebido'; valor: number };

function assertNever(valor: never): never {
  throw new Error(\`Caso não tratado: \${JSON.stringify(valor)}\`);
}

function icone(e: EventoApp): string {
  switch (e.tipo) {
    case 'job-aceito':
      return '[job]';
    case 'pix-recebido':
      return '[R$]';
    default:
      return assertNever(e); // aqui e é never
  }
}`,
      explanation:
        "Acrescente `| { tipo: 'job-cancelado' }` em `EventoApp` e veja o erro aparecer no `assertNever(e)`.",
    },
  ],
  checkQuestionIds: ['typescript.m02.q16'],
  exerciseIds: ['typescript.m02.e05', 'typescript.m02.e06'],
  debugExerciseIds: ['typescript.m02.d03'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m02.e05',
    lessonId: 'typescript.m02.l03',
    kind: 'implement',
    title: 'Pagamento sem campo solto',
    promptMarkdown:
      'O estagiário tipou o pagamento com um monte de campos opcionais, e agora tem pix parcelado e cartão ' +
      'sem parcela nenhuma. Reescreva `Pagamento` como **união discriminada** por `tipo`:\n\n' +
      "- `{ tipo: 'pix'; chave: string }`\n" +
      "- `{ tipo: 'cartao'; parcelas: number }`\n" +
      "- `{ tipo: 'dinheiro'; recebido: number }`\n\n" +
      'E implemente `taxa(p, valor)`: pix e dinheiro não têm taxa; cartão cobra **3%** do valor à vista ' +
      '(1 parcela) e **5%** parcelado.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Pagamento = {
  tipo: string;
  chave?: string;
  parcelas?: number;
  recebido?: number;
};

function taxa(p: Pagamento, valor: number): number {
  if (p.tipo === 'cartao') return valor * 0.03;
  return 0;
}
`,
    solution: `type Pagamento =
  | { tipo: 'pix'; chave: string }
  | { tipo: 'cartao'; parcelas: number }
  | { tipo: 'dinheiro'; recebido: number };

function taxa(p: Pagamento, valor: number): number {
  switch (p.tipo) {
    case 'pix':
      return 0;
    case 'cartao':
      return p.parcelas > 1 ? valor * 0.05 : valor * 0.03;
    case 'dinheiro':
      return 0;
  }
}
`,
    tests: [
      {
        description: 'pix e dinheiro não têm taxa',
        code: `assert.strictEqual(taxa({ tipo: 'pix', chave: 'oficina@exemplo.com' }, 200), 0);
assert.strictEqual(taxa({ tipo: 'dinheiro', recebido: 200 }, 200), 0);`,
      },
      {
        description: 'cartão cobra 3% à vista e 5% parcelado',
        code: `assert.strictEqual(taxa({ tipo: 'cartao', parcelas: 1 }, 200), 6);
assert.strictEqual(taxa({ tipo: 'cartao', parcelas: 3 }, 200), 10);`,
      },
      {
        description: 'pix com parcelas (e sem chave) não compila',
        code: `// @ts-expect-error
const errado: Pagamento = { tipo: 'pix', parcelas: 3 };
assert.ok(errado);`,
      },
      {
        description: 'cartão sem parcelas não compila',
        code: `// @ts-expect-error
const semParcelas: Pagamento = { tipo: 'cartao' };
assert.ok(semParcelas);`,
      },
      {
        description: 'tipo fora da lista não compila',
        code: `// @ts-expect-error
const fiado: Pagamento = { tipo: 'fiado', recebido: 0 };
assert.ok(fiado);`,
      },
    ],
    hints: [
      'Cada membro da união é um objeto com `tipo` literal e só os campos dele, separados por `|`.',
      "Use `switch (p.tipo)`: dentro do `case 'cartao'`, `p.parcelas` já é `number`.",
    ],
    followUpQuestionIds: ['typescript.m02.f13', 'typescript.m02.f14'],
    difficulty: 2,
  },
  {
    id: 'typescript.m02.e06',
    lessonId: 'typescript.m02.l03',
    kind: 'implement',
    title: 'Notificações do app de jobs',
    promptMarkdown:
      'O app de freelas dispara eventos e você precisa transformar cada um numa notificação:\n\n' +
      "- `job-aceito` (`jobId`, `cliente`) → `'Job J42 aceito: Oficina do Tonho'`\n" +
      "- `job-entregue` (`jobId`, `nota`) → `'Job J42 entregue. Nota: 5'`\n" +
      "- `pix-recebido` (`valor`) → `'Pix de R$ 350.00'` (use `toFixed(2)`)\n\n" +
      '1. Crie `assertNever(valor: never): never`, que lança um `Error`.\n' +
      '2. Reescreva `mensagem` com um `switch` em `e.tipo` que trata os três casos e chama ' +
      '`assertNever(e)` no `default`.\n\n' +
      'O teste vai inventar um evento novo e conferir se o seu `assertNever` reclama.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type EventoApp =
  | { tipo: 'job-aceito'; jobId: string; cliente: string }
  | { tipo: 'job-entregue'; jobId: string; nota: number }
  | { tipo: 'pix-recebido'; valor: number };

// crie aqui a função assertNever

function mensagem(e: EventoApp): string {
  if (e.tipo === 'job-aceito') return \`Job \${e.jobId} aceito: \${e.cliente}\`;
  return 'Evento desconhecido';
}
`,
    solution: `type EventoApp =
  | { tipo: 'job-aceito'; jobId: string; cliente: string }
  | { tipo: 'job-entregue'; jobId: string; nota: number }
  | { tipo: 'pix-recebido'; valor: number };

function assertNever(valor: never): never {
  throw new Error(\`Evento não tratado: \${JSON.stringify(valor)}\`);
}

function mensagem(e: EventoApp): string {
  switch (e.tipo) {
    case 'job-aceito':
      return \`Job \${e.jobId} aceito: \${e.cliente}\`;
    case 'job-entregue':
      return \`Job \${e.jobId} entregue. Nota: \${e.nota}\`;
    case 'pix-recebido':
      return \`Pix de R$ \${e.valor.toFixed(2)}\`;
    default:
      return assertNever(e);
  }
}
`,
    tests: [
      {
        description: 'mensagens dos três eventos',
        code: `assert.strictEqual(
  mensagem({ tipo: 'job-aceito', jobId: 'J42', cliente: 'Oficina do Tonho' }),
  'Job J42 aceito: Oficina do Tonho',
);
assert.strictEqual(mensagem({ tipo: 'job-entregue', jobId: 'J42', nota: 5 }), 'Job J42 entregue. Nota: 5');
assert.strictEqual(mensagem({ tipo: 'pix-recebido', valor: 350 }), 'Pix de R$ 350.00');`,
      },
      {
        description: 'evento inválido vindo de fora lança erro',
        code: `const estranho = { tipo: 'job-cancelado', jobId: 'J7' } as unknown as EventoApp;
assert.throws(() => mensagem(estranho));`,
      },
      {
        description: 'assertNever lança erro e só aceita never',
        code: `assert.throws(() => assertNever('boleto' as never));
assert.throws(() => {
  // @ts-expect-error
  assertNever('boleto');
});`,
      },
      {
        description: 'um evento novo sem case vira erro de compilação',
        code: `type EventoNovo = EventoApp | { tipo: 'job-cancelado'; jobId: string };
function rotulo(e: EventoNovo): string {
  switch (e.tipo) {
    case 'job-aceito':
    case 'job-entregue':
    case 'pix-recebido':
      return e.tipo;
    default:
      // @ts-expect-error
      return assertNever(e);
  }
}
assert.strictEqual(rotulo({ tipo: 'pix-recebido', valor: 1 }), 'pix-recebido');`,
      },
    ],
    hints: [
      'A assinatura é `function assertNever(valor: never): never` e o corpo só tem um `throw new Error(...)`.',
      'No `switch (e.tipo)`, cada `case` já enxerga os campos daquele evento.',
      'No `default`, escreva `return assertNever(e);`.',
    ],
    followUpQuestionIds: ['typescript.m02.f15', 'typescript.m02.f16'],
    difficulty: 2,
  },
  {
    id: 'typescript.m02.d03',
    lessonId: 'typescript.m02.l03',
    kind: 'debug',
    title: 'O boleto que saiu de graça',
    promptMarkdown:
      "O cliente pediu boleto, alguém acrescentou `{ tipo: 'boleto'; vencimento: string }` em `Pagamento`... " +
      'e esqueceu de `taxaPercentual`. Como tem um `default: return 0`, compilou, e o boleto está saindo ' +
      'sem taxa. A taxa do boleto é **2%**.\n\n' +
      'Trate o boleto e troque o `default` por `assertNever`, para o próximo esquecimento virar erro de ' +
      'compilação (e um dado inválido lançar erro em vez de cobrar 0).',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Pagamento =
  | { tipo: 'pix'; chave: string }
  | { tipo: 'cartao'; parcelas: number }
  | { tipo: 'dinheiro'; recebido: number }
  | { tipo: 'boleto'; vencimento: string };

function assertNever(valor: never): never {
  throw new Error(\`Pagamento não tratado: \${JSON.stringify(valor)}\`);
}

function taxaPercentual(p: Pagamento): number {
  switch (p.tipo) {
    case 'pix':
      return 0;
    case 'cartao':
      return p.parcelas > 1 ? 5 : 3;
    case 'dinheiro':
      return 0;
    default:
      return 0;
  }
}
`,
    solution: `type Pagamento =
  | { tipo: 'pix'; chave: string }
  | { tipo: 'cartao'; parcelas: number }
  | { tipo: 'dinheiro'; recebido: number }
  | { tipo: 'boleto'; vencimento: string };

function assertNever(valor: never): never {
  throw new Error(\`Pagamento não tratado: \${JSON.stringify(valor)}\`);
}

function taxaPercentual(p: Pagamento): number {
  switch (p.tipo) {
    case 'pix':
      return 0;
    case 'cartao':
      return p.parcelas > 1 ? 5 : 3;
    case 'dinheiro':
      return 0;
    case 'boleto':
      return 2;
    default:
      return assertNever(p);
  }
}
`,
    tests: [
      {
        description: 'boleto cobra 2%',
        code: "assert.strictEqual(taxaPercentual({ tipo: 'boleto', vencimento: '2026-11-10' }), 2);",
      },
      {
        description: 'os outros pagamentos continuam iguais',
        code: `assert.strictEqual(taxaPercentual({ tipo: 'pix', chave: 'a@b.com' }), 0);
assert.strictEqual(taxaPercentual({ tipo: 'cartao', parcelas: 1 }), 3);
assert.strictEqual(taxaPercentual({ tipo: 'cartao', parcelas: 4 }), 5);
assert.strictEqual(taxaPercentual({ tipo: 'dinheiro', recebido: 50 }), 0);`,
      },
      {
        description: 'tipo desconhecido lança erro em vez de cobrar 0',
        code: `const cheque = { tipo: 'cheque' } as unknown as Pagamento;
assert.throws(() => taxaPercentual(cheque));`,
      },
    ],
    hints: [
      "Falta um `case 'boleto'`.",
      'Troque `default: return 0;` por `default: return assertNever(p);`. Se faltar algum `case`, ele nem compila.',
    ],
    followUpQuestionIds: ['typescript.m02.f17', 'typescript.m02.f18'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- gerais ----
  {
    id: 'typescript.m02.q16',
    lessonIds: ['typescript.m02.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual é o campo discriminante desta união?',
    code: `type Pagamento =
  | { tipo: 'pix'; chave: string }
  | { tipo: 'cartao'; parcelas: number };`,
    options: ['`tipo`', '`chave`', '`parcelas`', 'Nenhum: o discriminante precisa se chamar `kind`'],
    answerIndex: 0,
    explanation:
      '`tipo` existe em todos os membros, cada um com um literal diferente. O nome do campo é livre.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q17',
    lessonIds: ['typescript.m02.l03'],
    kind: 'multiple-choice',
    prompt: 'O que acontece com este código?',
    code: `type Pagamento =
  | { tipo: 'pix'; chave: string }
  | { tipo: 'cartao'; parcelas: number };

function mostrar(p: Pagamento) {
  if (p.tipo === 'cartao') {
    console.log(p.chave);
  }
}`,
    options: [
      'Não compila: dentro do `if`, `p` é o cartão, que não tem `chave`',
      'Compila e imprime `undefined`',
      'Compila, porque `chave` existe em algum membro da união',
      'Compila só se `chave` for opcional no cartão',
    ],
    answerIndex: 0,
    explanation:
      "O `if` estreitou `p` para `{ tipo: 'cartao'; parcelas: number }`, e nesse membro não existe `chave`.",
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q18',
    lessonIds: ['typescript.m02.l03'],
    kind: 'true-false',
    prompt:
      'O tipo `never` não tem nenhum valor possível: sem usar `as`, nenhum valor pode ser atribuído a uma variável `never`.',
    answer: true,
    explanation:
      'É justamente por isso que `assertNever(valor: never)` só compila quando todos os casos foram tratados.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q19',
    lessonIds: ['typescript.m02.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function taxa(p) {
  switch (p.tipo) {
    case 'pix':
      return 0;
    case 'cartao':
      return 3;
    default:
      return 0;
  }
}
console.log(taxa({ tipo: 'boleto' }));
console.log(taxa({ tipo: 'Cartao' }));`,
    expectedOutput: '0\n0',
    explanation:
      "O `default: return 0` engole tudo: o boleto e até o `'Cartao'` com maiúscula saem sem taxa e ninguém fica sabendo.",
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q20',
    lessonIds: ['typescript.m02.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual a assinatura de `assertNever` que faz o switch exaustivo funcionar?',
    options: [
      '`function assertNever(valor: never): never`',
      '`function assertNever(valor: unknown): void`',
      '`function assertNever(valor: string): never`',
      '`function assertNever(): never`',
    ],
    answerIndex: 0,
    explanation:
      'O parâmetro precisa ser `never`: assim, passar qualquer caso não tratado vira erro. Com `unknown`, tudo seria aceito.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q21',
    lessonIds: ['typescript.m02.l03'],
    kind: 'true-false',
    prompt: 'Este código compila no modo `strict`, mesmo sem `default` e sem `return` depois do `switch`.',
    code: `type Forma = { tipo: 'pix' } | { tipo: 'dinheiro' };

function nome(f: Forma): string {
  switch (f.tipo) {
    case 'pix':
      return 'Pix';
    case 'dinheiro':
      return 'Dinheiro';
  }
}`,
    answer: true,
    explanation:
      'Os dois `case` cobrem a união inteira, então o TypeScript sabe que a função sempre retorna.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q22',
    lessonIds: ['typescript.m02.l03'],
    kind: 'fill-blank',
    prompt: 'Complete o switch exaustivo.',
    code: `switch (evento.tipo) {
  case 'job-aceito':
    return 'aceito';
  case 'pix-recebido':
    return 'pix';
  ___:
    return assertNever(evento);
}`,
    acceptedAnswers: ['default'],
    explanation: 'O `default` recebe o que sobrou da união, que deve ser `never` quando tudo foi tratado.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q23',
    lessonIds: ['typescript.m02.l03'],
    kind: 'multiple-choice',
    prompt:
      'Por que preferir uma união discriminada a um tipo único com vários campos opcionais (`chave?`, `parcelas?`, `recebido?`)?',
    options: [
      'Ela impede combinações sem sentido, como pix parcelado, e cada `case` libera só os campos certos',
      'Ela deixa o JavaScript gerado mais rápido',
      'Campos opcionais não são permitidos no modo `strict`',
      'Ela dispensa testes',
    ],
    answerIndex: 0,
    explanation:
      'Com campos opcionais, tudo é `number | undefined` e qualquer mistura compila. Com a união, não.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m02.f13',
    lessonIds: ['typescript.m02.l03'],
    exerciseId: 'typescript.m02.e05',
    kind: 'multiple-choice',
    prompt:
      "Dentro do `case 'cartao'` da sua `taxa`, por que `p.parcelas` é `number` e não `number | undefined`?",
    options: [
      "Porque o `case` estreitou `p` para o membro `{ tipo: 'cartao'; parcelas: number }`",
      'Porque o TypeScript ignora `undefined` dentro de `switch`',
      'Porque `parcelas` tem valor padrão 1',
      'Porque o `switch` converte os campos para `number`',
    ],
    answerIndex: 0,
    explanation: 'No membro do cartão, `parcelas` é obrigatório. O discriminante levou até ele.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f14',
    lessonIds: ['typescript.m02.l03'],
    exerciseId: 'typescript.m02.e05',
    kind: 'true-false',
    prompt:
      "Com a sua união, `const p: Pagamento = { tipo: 'fiado', recebido: 0 }` compila, porque o membro do dinheiro também tem `recebido`.",
    answer: false,
    explanation: "`'fiado'` não é nenhum dos literais do discriminante, então não combina com membro nenhum.",
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f15',
    lessonIds: ['typescript.m02.l03'],
    exerciseId: 'typescript.m02.e06',
    kind: 'multiple-choice',
    prompt: 'No `default` do seu `switch` em `mensagem`, qual é o tipo de `e`?',
    options: [
      '`never`',
      '`EventoApp`',
      '`unknown`',
      "`{ tipo: 'job-aceito'; jobId: string; cliente: string }`",
    ],
    answerIndex: 0,
    explanation: 'Os três `case` consumiram todos os membros de `EventoApp`. Não sobra nada: `never`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f16',
    lessonIds: ['typescript.m02.l03'],
    exerciseId: 'typescript.m02.e06',
    kind: 'multiple-choice',
    prompt:
      "Se alguém acrescentar `{ tipo: 'job-cancelado'; jobId: string }` em `EventoApp` e não mexer na sua `mensagem`, o que acontece?",
    options: [
      'O TypeScript acusa erro em `assertNever(e)`, porque `e` deixou de ser `never`',
      'Nada: o `default` devolve uma mensagem vazia',
      "O evento novo cai no `case 'job-aceito'`",
      'O JavaScript gerado perde o `switch`',
    ],
    answerIndex: 0,
    explanation:
      'No `default`, `e` passa a ser o evento de cancelamento, que não pode ser passado para um parâmetro `never`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.f17',
    lessonIds: ['typescript.m02.l03'],
    exerciseId: 'typescript.m02.d03',
    kind: 'true-false',
    prompt:
      "Com `default: return assertNever(p)` no lugar de `default: return 0`, esquecer o `case 'boleto'` vira erro de compilação.",
    answer: true,
    explanation: 'Sem o `case`, o boleto chega no `default`, e ele não é `never`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f18',
    lessonIds: ['typescript.m02.l03'],
    exerciseId: 'typescript.m02.d03',
    kind: 'multiple-choice',
    prompt: 'Por que o código com defeito compilava mesmo sem tratar o boleto?',
    options: [
      'Porque o `default: return 0` aceita qualquer caso que sobrar, inclusive o boleto',
      'Porque o TypeScript não checa `switch`',
      "Porque `'boleto'` é uma string e qualquer string é aceita",
      'Porque `assertNever` estava declarada no arquivo',
    ],
    answerIndex: 0,
    explanation:
      'Um `default` que devolve um valor qualquer é uma "rede" silenciosa: o compilador não tem do que reclamar.',
    difficulty: 1,
  },
];
