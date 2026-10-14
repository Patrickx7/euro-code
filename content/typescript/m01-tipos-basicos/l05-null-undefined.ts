import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m01.l05',
  moduleId: 'typescript.m01',
  order: 5,
  title: 'null e undefined: o bug que só acontece em produção',
  concepts: [
    'strictNullChecks',
    'string | null',
    'narrowing com if',
    'optional chaining (?.)',
    'nullish coalescing (??)',
    'find devolve T | undefined',
    'operador ! (e por que evitar)',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        '`Cannot read properties of undefined` é o erro mais famoso do JavaScript, e quase sempre aparece em ' +
        'produção, com o cliente que não tem telefone cadastrado. No modo strict, o TS trata `null` e ' +
        '`undefined` como **tipos separados**: uma `string` nunca é `null`. Se um valor pode faltar, isso ' +
        'aparece no tipo:\n\n' +
        '- `let cupom: string | null = null;`\n' +
        '- uma propriedade opcional `telefone?: string` é `string | undefined`;\n' +
        '- `lista.find(...)` devolve `Cliente | undefined`, porque pode não achar ninguém.\n\n' +
        "Usar um valor desses direto é erro: `'cliente' is possibly 'undefined'`. Para liberar, faça " +
        '**narrowing** (estreitamento): um `if` que descarta o caso vazio. Dentro do `if`, o TS sabe que o valor ' +
        'existe.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type Cliente = { nome: string; telefone?: string };
const clientes: Cliente[] = [{ nome: 'Dona Cida', telefone: '11 98888-0000' }, { nome: 'Seu Jorge' }];

const achado = clientes.find((c) => c.nome === 'Bia'); // Cliente | undefined
console.log(achado.nome);
// ❌ 'achado' is possibly 'undefined'.

if (achado !== undefined) {
  console.log(achado.nome); // ok: aqui achado é Cliente
}

function avisar(cupom: string | null): string {
  if (cupom === null) return 'Sem cupom';
  return 'Cupom: ' + cupom.toUpperCase(); // aqui cupom é string
}`,
      explanation: 'Depois de um `return` no caso vazio, o resto da função já sabe que o valor existe.',
    },
    {
      kind: 'text',
      markdown:
        'Dois operadores do JavaScript moderno resolvem a maioria dos casos em uma linha, e o TS entende os ' +
        'dois:\n\n' +
        '- **`?.` (optional chaining)**: `cliente?.telefone` devolve `undefined` se `cliente` for `null` ou ' +
        '`undefined`, em vez de quebrar.\n' +
        "- **`??` (nullish coalescing)**: `valor ?? 'padrão'` usa o padrão **só** se `valor` for `null` ou " +
        '`undefined`.\n\n' +
        "Cuidado com `||`: ele troca **qualquer valor falso**, incluindo `0` e `''`. Uma taxa de entrega " +
        '`0` (frete grátis!) viraria a taxa padrão com `||`, mas continua `0` com `??`. O mesmo vale para ' +
        '`if (taxa)`: com `0`, cai no caso "vazio".\n\n' +
        'Por último, o **`!`** (`cliente!.nome`) manda o TS "confiar em você" e não checa nada ao rodar. É o ' +
        '`any` dos nulos: se você errou, o bug volta para a produção.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const pedido = { cliente: { nome: 'Seu Jorge' }, taxa: 0 };

console.log(pedido.cliente?.nome);
console.log(pedido.entrega?.bairro);
console.log(pedido.entrega?.bairro ?? 'retirada no balcão');
console.log(pedido.taxa || 15);
console.log(pedido.taxa ?? 15);`,
      explanation:
        'Sem o `?.`, `pedido.entrega.bairro` quebraria. Repare que `||` troca o `0` por 15, e `??` não.',
    },
  ],
  checkQuestionIds: ['typescript.m01.q33'],
  exerciseIds: ['typescript.m01.e08'],
  debugExerciseIds: ['typescript.m01.d05'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m01.e08',
    lessonId: 'typescript.m01.l05',
    kind: 'implement',
    title: 'Taxa de entrega da marmitaria',
    promptMarkdown:
      'Implemente `taxaDeEntrega(pedido)` com as regras da marmitaria:\n\n' +
      '- pedido **sem** `endereco`: é retirada no balcão, taxa **0**;\n' +
      '- endereço **sem** `bairro`, ou com um bairro que não está em `taxas`: taxa padrão **15**;\n' +
      '- senão, a taxa do bairro em `taxas`. Atenção: o Jardim Bonfim tem taxa **0** (é vizinho!).\n\n' +
      'Sem `any` e sem `!`: use `if`, `?.` e `??`.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Endereco = { rua: string; bairro?: string };
type Pedido = { id: number; endereco?: Endereco };

const taxas: Record<string, number> = { Centro: 5, 'Vila Yara': 8, 'Granja Viana': 12, 'Jardim Bonfim': 0 };

function taxaDeEntrega(pedido: Pedido): number {
  // seu código aqui
}
`,
    solution: `type Endereco = { rua: string; bairro?: string };
type Pedido = { id: number; endereco?: Endereco };

const taxas: Record<string, number> = { Centro: 5, 'Vila Yara': 8, 'Granja Viana': 12, 'Jardim Bonfim': 0 };

function taxaDeEntrega(pedido: Pedido): number {
  if (pedido.endereco === undefined) return 0;
  const bairro = pedido.endereco.bairro;
  if (bairro === undefined) return 15;
  return taxas[bairro] ?? 15;
}
`,
    tests: [
      {
        description: 'retirada no balcão: 0',
        code: 'assert.strictEqual(taxaDeEntrega({ id: 1 }), 0);',
      },
      {
        description: 'bairro com taxa: Vila Yara custa 8',
        code: "assert.strictEqual(taxaDeEntrega({ id: 2, endereco: { rua: 'Rua das Flores', bairro: 'Vila Yara' } }), 8);",
      },
      {
        description: 'Jardim Bonfim tem taxa 0',
        code: "assert.strictEqual(taxaDeEntrega({ id: 3, endereco: { rua: 'Rua A', bairro: 'Jardim Bonfim' } }), 0);",
      },
      {
        description: 'bairro desconhecido: 15',
        code: "assert.strictEqual(taxaDeEntrega({ id: 4, endereco: { rua: 'Estrada do Embu', bairro: 'Caucaia do Alto' } }), 15);",
      },
      {
        description: 'endereço sem bairro: 15',
        code: "assert.strictEqual(taxaDeEntrega({ id: 5, endereco: { rua: 'Rua sem nome' } }), 15);",
      },
    ],
    hints: [
      'Comece tratando o pedido sem endereço: `if (pedido.endereco === undefined) return 0;`.',
      'Um `bairro` que pode ser `undefined` não serve de chave: confira antes de usar `taxas[bairro]`.',
      'Para o padrão, use `??` (e não `||`), senão o Jardim Bonfim paga 15.',
    ],
    followUpQuestionIds: ['typescript.m01.f23', 'typescript.m01.f24'],
    difficulty: 2,
  },
  {
    id: 'typescript.m01.d05',
    lessonId: 'typescript.m01.l05',
    kind: 'debug',
    title: 'Funciona na minha máquina',
    promptMarkdown:
      'Na máquina do dev anterior, a saudação do app sempre funcionou: ele só testava com a Dona Cida. Em ' +
      'produção, o Seu Jorge (sem apelido) e quem não é cliente derrubam tudo. O TypeScript já mostra dois ' +
      "erros `possibly 'undefined'`.\n\n" +
      'Regras:\n\n' +
      '- cliente com apelido: `Olá, CIDINHA!` (apelido em maiúsculas);\n' +
      '- cliente sem apelido: use o nome, `Olá, SEU JORGE!`;\n' +
      '- não achou o cliente: `Olá, visitante!`.\n\n' +
      'Sem `!`: o `!` só cala o compilador, o bug continua.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Cliente = { nome: string; apelido?: string };

const clientes: Cliente[] = [{ nome: 'Dona Cida', apelido: 'Cidinha' }, { nome: 'Seu Jorge' }];

function saudacao(nome: string): string {
  const cliente = clientes.find((c) => c.nome === nome);
  return 'Olá, ' + cliente.apelido.toUpperCase() + '!';
}
`,
    solution: `type Cliente = { nome: string; apelido?: string };

const clientes: Cliente[] = [{ nome: 'Dona Cida', apelido: 'Cidinha' }, { nome: 'Seu Jorge' }];

function saudacao(nome: string): string {
  const cliente = clientes.find((c) => c.nome === nome);
  if (cliente === undefined) return 'Olá, visitante!';
  return 'Olá, ' + (cliente.apelido ?? cliente.nome).toUpperCase() + '!';
}
`,
    tests: [
      {
        description: 'Dona Cida: Olá, CIDINHA!',
        code: "assert.strictEqual(saudacao('Dona Cida'), 'Olá, CIDINHA!');",
      },
      {
        description: 'Seu Jorge, sem apelido: Olá, SEU JORGE!',
        code: "assert.strictEqual(saudacao('Seu Jorge'), 'Olá, SEU JORGE!');",
      },
      {
        description: 'quem não é cliente: Olá, visitante!',
        code: "assert.strictEqual(saudacao('Fulano'), 'Olá, visitante!');",
      },
    ],
    hints: [
      '`find` devolve `Cliente | undefined`. Trate o `undefined` primeiro, com um `if` e um `return`.',
      'Para cair no nome quando não há apelido: `cliente.apelido ?? cliente.nome`.',
    ],
    followUpQuestionIds: ['typescript.m01.f25', 'typescript.m01.f26'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'typescript.m01.q33',
    lessonIds: ['typescript.m01.l05'],
    kind: 'multiple-choice',
    prompt: 'No modo strict, este código compila?',
    code: `let cupom: string | null = buscarCupom();
console.log(cupom.toUpperCase());`,
    options: [
      "Não: `'cupom' is possibly 'null'`",
      'Sim: `null` é um `string` vazio',
      'Sim, mas imprime `NULL`',
      'Não: `toUpperCase` não existe em `string`',
    ],
    answerIndex: 0,
    explanation: 'Antes de usar, descarte o `null`: `if (cupom !== null) { ... }` ou `cupom?.toUpperCase()`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q34',
    lessonIds: ['typescript.m01.l05'],
    kind: 'predict-output',
    prompt: 'O frete é grátis (taxa 0). O que este código imprime?',
    code: `const taxa = 0;
console.log(taxa || 15);
console.log(taxa ?? 15);`,
    expectedOutput: '15\n0',
    explanation: '`||` troca qualquer valor falso, inclusive `0`. `??` só troca `null` e `undefined`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.q35',
    lessonIds: ['typescript.m01.l05'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const pedido = { cliente: { nome: 'Seu Jorge' } };
console.log(pedido.cliente?.nome);
console.log(pedido.entrega?.bairro);
console.log(pedido.entrega?.bairro ?? 'balcão');`,
    expectedOutput: 'Seu Jorge\nundefined\nbalcão',
    explanation:
      'Com `?.`, acessar algo dentro de `undefined` devolve `undefined` em vez de quebrar. O `??` dá o padrão.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q36',
    lessonIds: ['typescript.m01.l05'],
    kind: 'multiple-choice',
    prompt: 'Qual o tipo de `achado`?',
    code: `const clientes: Cliente[] = carregarClientes();
const achado = clientes.find((c) => c.nome === 'Bia');`,
    options: ['Cliente | undefined', 'Cliente', 'Cliente[]', 'Cliente | null'],
    answerIndex: 0,
    explanation: '`find` pode não achar ninguém, e aí devolve `undefined`. O tipo avisa isso.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q37',
    lessonIds: ['typescript.m01.l05'],
    kind: 'true-false',
    prompt: 'O operador `!` em `cliente!.nome` confere, ao rodar, se `cliente` existe.',
    answer: false,
    explanation:
      'O `!` só cala o compilador e some no JavaScript. Se `cliente` for `undefined`, quebra igual em produção.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.q38',
    lessonIds: ['typescript.m01.l05'],
    kind: 'fill-blank',
    prompt: 'Complete para que a linha não quebre quando o pedido não tem `endereco`.',
    code: 'const bairro = pedido.endereco___.bairro;',
    acceptedAnswers: ['?'],
    explanation: 'Com `?.`, se `endereco` for `undefined`, `bairro` vira `undefined` em vez de dar erro.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q39',
    lessonIds: ['typescript.m01.l05'],
    kind: 'multiple-choice',
    prompt: 'Dentro do `if`, qual o tipo de `cupom`?',
    code: `function aplicar(cupom: string | null) {
  if (cupom !== null) {
    // aqui
  }
}`,
    options: ['string', 'string | null', 'null', 'unknown'],
    answerIndex: 0,
    explanation: 'O `if` descartou o `null`, então o TS estreita o tipo para `string` dentro do bloco.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q40',
    lessonIds: ['typescript.m01.l05'],
    kind: 'multiple-choice',
    prompt: 'Com `desconto: number | undefined`, por que `if (desconto) { ... }` pode ser uma armadilha?',
    options: [
      'Porque um desconto `0` também é falso e cai fora do `if`',
      'Porque `if` não funciona com números',
      'Porque o TS não faz narrowing com `if`',
      'Não é armadilha, é sempre igual a `desconto !== undefined`',
    ],
    answerIndex: 0,
    explanation:
      'Se `0` é um valor válido, compare com `undefined` (ou use `??`) em vez de testar se é verdadeiro.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m01.f23',
    lessonIds: ['typescript.m01.l05'],
    exerciseId: 'typescript.m01.e08',
    kind: 'multiple-choice',
    prompt:
      'Se você tivesse usado `taxas[bairro] || 15` na sua `taxaDeEntrega`, quanto pagaria o Jardim Bonfim?',
    options: ['15', '0', 'undefined', 'Não compilaria'],
    answerIndex: 0,
    explanation: 'A taxa do Bonfim é `0`, que é falso, e o `||` troca por 15. Com `??`, o `0` é mantido.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.f24',
    lessonIds: ['typescript.m01.l05'],
    exerciseId: 'typescript.m01.e08',
    kind: 'multiple-choice',
    prompt: 'Por que `return taxas[pedido.endereco.bairro];`, direto, não compila?',
    options: [
      '`endereco` e `bairro` são opcionais e podem ser `undefined`',
      'Porque `Record` não aceita colchetes',
      'Porque `taxas` é `readonly`',
      'Compila sim, só não passa nos testes',
    ],
    answerIndex: 0,
    explanation: 'O TS exige descartar os dois `undefined` antes: com `if`, `?.` ou um valor padrão.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.f25',
    lessonIds: ['typescript.m01.l05'],
    exerciseId: 'typescript.m01.d05',
    kind: 'multiple-choice',
    prompt: "Rodando o código original como JavaScript, o que acontecia com `saudacao('Seu Jorge')`?",
    options: [
      'Quebrava: `Cannot read properties of undefined` (ele não tem apelido)',
      "Devolvia 'Olá, SEU JORGE!'",
      "Devolvia 'Olá, undefined!'",
      "Devolvia 'Olá, visitante!'",
    ],
    answerIndex: 0,
    explanation: '`cliente.apelido` é `undefined`, e chamar `.toUpperCase()` em `undefined` derruba o app.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f26',
    lessonIds: ['typescript.m01.l05'],
    exerciseId: 'typescript.m01.d05',
    kind: 'true-false',
    prompt: 'Trocar a linha por `cliente!.apelido!.toUpperCase()` faria os testes passarem.',
    answer: false,
    explanation:
      'Compilaria, mas o `!` não muda nada ao rodar: o Seu Jorge e o visitante continuariam quebrando o app.',
    difficulty: 1,
  },
];
