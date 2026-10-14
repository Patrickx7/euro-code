import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'fullstack.m02.l01',
  moduleId: 'fullstack.m02',
  order: 1,
  title: 'Modelagem: os tipos do app que te manda pra estrada',
  concepts: [
    'modelar o domínio com tipos',
    'as const e tipo derivado',
    'união discriminada',
    'type guard (valor is Tipo)',
    'checagem exaustiva com never',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Plot twist de carreira: você virou full stack e o projeto final é construir... **o sistema de jobs ' +
        'do próprio jogo**. Sim, o app que te mandou centralizar uma div a 38 km de casa. Este jogo é escrito ' +
        'em TypeScript, e os arquivos `src/shared/jobs.ts` e `src/gameplay/career.ts` existem de verdade. ' +
        'Neste módulo você faz uma versão simplificada deles, passo a passo.\n\n' +
        'Todo sistema começa pela **modelagem**: quais coisas existem e como elas se encaixam. No nosso:\n\n' +
        '- um **Cliente** (nome e bairro);\n' +
        '- uma **Task** (o exercício que o cliente pede);\n' +
        '- um **Job**: cliente, tasks, senioridade mínima, pagamento-base, SLA e **status**.\n\n' +
        'Tipos bem feitos são documentação que o compilador confere. Tipos frouxos (`string` para tudo, ' +
        'campos opcionais sobrando) deixam o bug passar e explodir na mão do usuário.',
    },
    {
      kind: 'text',
      markdown:
        '**Senioridade: uma lista que vira tipo.** Precisamos da lista em tempo de execução (para saber o ' +
        'próximo degrau) e do tipo em tempo de compilação. Em vez de escrever as duas coisas, escreva a ' +
        'lista com `as const` e **derive** o tipo dela:\n\n' +
        '- sem `as const`, o array é `string[]` e o tipo derivado seria só `string`;\n' +
        "- com `as const`, o array vira uma tupla `readonly ['estagiario', 'junior', ...]`;\n" +
        '- `(typeof SENIORIDADES)[number]` pega o tipo de **qualquer posição**: a união dos textos.\n\n' +
        'Acrescentou um degrau na lista? O tipo muda junto. O jogo faz exatamente isso em ' +
        '`src/shared/profile.ts`.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `export const SENIORIDADES = ['estagiario', 'junior', 'pleno', 'senior', 'fullstack'] as const;
export type Senioridade = (typeof SENIORIDADES)[number];
// = 'estagiario' | 'junior' | 'pleno' | 'senior' | 'fullstack'

const minha: Senioridade = 'senior'; // ok
const chefe: Senioridade = 'gerente'; // erro: não está na lista

// Type guard: valida um texto que veio de fora (JSON, formulário...).
function ehSenioridade(valor: string): valor is Senioridade {
  return (SENIORIDADES as readonly string[]).includes(valor);
}`,
      explanation:
        'O `valor is Senioridade` avisa ao TypeScript: se a função devolver `true`, trate `valor` como ' +
        '`Senioridade` dali em diante. O cast para `readonly string[]` é necessário porque o `includes` da ' +
        'tupla só aceita os cinco textos conhecidos, e `valor` pode ser qualquer string.',
    },
    {
      kind: 'text',
      markdown:
        '**Status: união discriminada.** Um job pode estar disponível, aceito, entregue ou cancelado, e cada ' +
        'estado tem dados diferentes: só o entregue tem estrelas, só o cancelado tem motivo. A versão ' +
        'ingênua é um objeto com tudo opcional:\n\n' +
        '```ts\n' +
        'type Status = { tipo: string; aceitoEm?: number; estrelas?: number; motivo?: string };\n' +
        '```\n\n' +
        'Isso aceita absurdos como "entregue sem estrelas" ou "disponível com motivo de cancelamento". A ' +
        'versão boa é uma **união** em que cada membro tem um campo literal em comum, o **discriminante** ' +
        '(`tipo`). Depois de checar `status.tipo`, o TypeScript sabe exatamente quais campos existem.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type StatusJob =
  | { tipo: 'disponivel' }
  | { tipo: 'aceito'; aceitoEm: number }
  | { tipo: 'entregue'; aceitoEm: number; entregueEm: number; estrelas: number }
  | { tipo: 'cancelado'; motivo: string };

function rotulo(status: StatusJob): string {
  switch (status.tipo) {
    case 'disponivel':
      return 'No app';
    case 'aceito':
      return 'Na estrada desde o minuto ' + status.aceitoEm;
    case 'entregue':
      return status.estrelas + ' estrelas';
    case 'cancelado':
      return 'Cancelado: ' + status.motivo;
    default: {
      const nunca: never = status; // erro de compilação se faltar algum case
      return nunca;
    }
  }
}`,
      explanation:
        'Dentro de cada `case`, `status` tem só os campos daquele estado. O `default` com `never` é a ' +
        '**checagem exaustiva**: se alguém acrescentar um status novo na união e esquecer de tratar aqui, o ' +
        'código para de compilar, em vez de cair calado num caso genérico.',
    },
  ],
  checkQuestionIds: ['fullstack.m02.q01'],
  exerciseIds: ['fullstack.m02.e01', 'fullstack.m02.e02'],
  debugExerciseIds: ['fullstack.m02.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'fullstack.m02.e01',
    lessonId: 'fullstack.m02.l01',
    kind: 'implement',
    title: 'A escada da carreira em tipos',
    promptMarkdown:
      'O freela anterior tipou a senioridade como `string`, e já tem job no banco pedindo nível "gerente". ' +
      'Arrume o arquivo:\n\n' +
      '1. `SENIORIDADES` deve ser uma tupla `as const`, e `Senioridade` deve ser **derivado** dela (a ' +
      'união dos cinco textos);\n' +
      '2. `ehSenioridade(valor)` deve ser um **type guard** (`valor is Senioridade`) que devolve `true` só ' +
      'para os cinco textos da lista;\n' +
      '3. `proximaSenioridade(atual)` devolve o próximo degrau, ou `null` para `fullstack` (o topo).',
    language: 'ts',
    moduleSystem: 'esm',
    starterCode: `export const SENIORIDADES = ['estagiario', 'junior', 'pleno', 'senior', 'fullstack'];
export type Senioridade = string;

export function ehSenioridade(valor: string): boolean {
  return SENIORIDADES.includes(valor);
}

export function proximaSenioridade(atual: Senioridade): Senioridade | null {
  // devolva o próximo degrau, ou null se já é o topo
  return null;
}
`,
    solution: `export const SENIORIDADES = ['estagiario', 'junior', 'pleno', 'senior', 'fullstack'] as const;
export type Senioridade = (typeof SENIORIDADES)[number];

export function ehSenioridade(valor: string): valor is Senioridade {
  return (SENIORIDADES as readonly string[]).includes(valor);
}

export function proximaSenioridade(atual: Senioridade): Senioridade | null {
  return SENIORIDADES[SENIORIDADES.indexOf(atual) + 1] ?? null;
}
`,
    tests: [
      {
        description: '"gerente" não é uma Senioridade (erro de tipo)',
        code: `// @ts-expect-error gerente não existe na escada
const s: Senioridade = 'gerente';`,
      },
      {
        description: 'ehSenioridade reconhece só os cinco degraus',
        code: `assert.strictEqual(ehSenioridade('pleno'), true);
assert.strictEqual(ehSenioridade('fullstack'), true);
assert.strictEqual(ehSenioridade('gerente'), false);
assert.strictEqual(ehSenioridade('Senior'), false);`,
      },
      {
        description: 'ehSenioridade é um type guard: filtra uma lista de textos para Senioridade[]',
        code: `const vindosDoJson: string[] = ['pleno', 'gerente', 'senior', 'CEO'];
const validos: Senioridade[] = vindosDoJson.filter(ehSenioridade);
assert.deepStrictEqual(validos, ['pleno', 'senior']);`,
      },
      {
        description: 'proximaSenioridade sobe um degrau',
        code: `assert.strictEqual(proximaSenioridade('estagiario'), 'junior');
assert.strictEqual(proximaSenioridade('pleno'), 'senior');
assert.strictEqual(proximaSenioridade('senior'), 'fullstack');`,
      },
      {
        description: 'fullstack é o topo: proximaSenioridade devolve null',
        code: "assert.strictEqual(proximaSenioridade('fullstack'), null);",
      },
    ],
    hints: [
      'Coloque `as const` depois do array e troque `string` por `(typeof SENIORIDADES)[number]`.',
      'Com a tupla `as const`, `SENIORIDADES.includes(valor)` reclama: use `(SENIORIDADES as readonly string[]).includes(valor)`.',
      'Para o type guard, troque o retorno `boolean` por `valor is Senioridade`.',
      'O próximo degrau é `SENIORIDADES[SENIORIDADES.indexOf(atual) + 1]`; depois do topo vem `undefined`, então use `?? null`.',
    ],
    followUpQuestionIds: ['fullstack.m02.f01', 'fullstack.m02.f02'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.e02',
    lessonId: 'fullstack.m02.l01',
    kind: 'implement',
    title: 'Status sem estado impossível',
    promptMarkdown:
      'O tipo `StatusJob` atual aceita "entregue sem estrelas" e até status `"pausado"`, que o app nem ' +
      'conhece. Reescreva-o como uma **união discriminada** pelo campo `tipo`:\n\n' +
      "- `{ tipo: 'disponivel' }`\n" +
      "- `{ tipo: 'aceito'; aceitoEm: number }`\n" +
      "- `{ tipo: 'entregue'; aceitoEm: number; entregueEm: number; estrelas: number }`\n" +
      "- `{ tipo: 'cancelado'; motivo: string }`\n\n" +
      'Depois implemente `resumoStatus(status)`, que devolve o texto do painel:\n\n' +
      "- disponível → `'Disponível no app'`\n" +
      "- aceito → `'Aceito no minuto 30'` (com o `aceitoEm`)\n" +
      "- entregue → `'Entregue com 4 estrelas'`\n" +
      "- cancelado → `'Cancelado: cliente sumiu'` (com o `motivo`)",
    language: 'ts',
    moduleSystem: 'esm',
    starterCode: `export type StatusJob = {
  tipo: string;
  aceitoEm?: number;
  entregueEm?: number;
  estrelas?: number;
  motivo?: string;
};

export function resumoStatus(status: StatusJob): string {
  // um switch em status.tipo resolve
  return '';
}
`,
    solution: `export type StatusJob =
  | { tipo: 'disponivel' }
  | { tipo: 'aceito'; aceitoEm: number }
  | { tipo: 'entregue'; aceitoEm: number; entregueEm: number; estrelas: number }
  | { tipo: 'cancelado'; motivo: string };

export function resumoStatus(status: StatusJob): string {
  switch (status.tipo) {
    case 'disponivel':
      return 'Disponível no app';
    case 'aceito':
      return \`Aceito no minuto \${status.aceitoEm}\`;
    case 'entregue':
      return \`Entregue com \${status.estrelas} estrelas\`;
    case 'cancelado':
      return \`Cancelado: \${status.motivo}\`;
    default: {
      const nunca: never = status;
      return nunca;
    }
  }
}
`,
    tests: [
      {
        description: 'disponível e aceito',
        code: `assert.strictEqual(resumoStatus({ tipo: 'disponivel' }), 'Disponível no app');
assert.strictEqual(resumoStatus({ tipo: 'aceito', aceitoEm: 30 }), 'Aceito no minuto 30');`,
      },
      {
        description: 'entregue e cancelado',
        code: `assert.strictEqual(
  resumoStatus({ tipo: 'entregue', aceitoEm: 30, entregueEm: 150, estrelas: 4 }),
  'Entregue com 4 estrelas',
);
assert.strictEqual(resumoStatus({ tipo: 'cancelado', motivo: 'cliente sumiu' }), 'Cancelado: cliente sumiu');`,
      },
      {
        description: 'entregue sem estrelas não compila',
        code: `// @ts-expect-error falta estrelas
const s: StatusJob = { tipo: 'entregue', aceitoEm: 1, entregueEm: 2 };`,
      },
      {
        description: 'aceito sem aceitoEm não compila',
        code: `// @ts-expect-error falta aceitoEm
const s: StatusJob = { tipo: 'aceito' };`,
      },
      {
        description: 'status desconhecido ("pausado") não compila',
        code: `// @ts-expect-error pausado não existe
const s: StatusJob = { tipo: 'pausado' };`,
      },
      {
        description: 'depois de checar o tipo, os campos certos ficam disponíveis',
        code: `const status: StatusJob = { tipo: 'cancelado', motivo: 'choveu na Raposo' };
if (status.tipo === 'cancelado') {
  const motivo: string = status.motivo;
  assert.strictEqual(motivo, 'choveu na Raposo');
}`,
      },
    ],
    hints: [
      "Escreva quatro tipos de objeto separados por `|`, cada um com `tipo` fixo (`tipo: 'aceito'`, não `tipo: string`).",
      "No `resumoStatus`, faça `switch (status.tipo)`: dentro de `case 'aceito'` o TypeScript já sabe que existe `status.aceitoEm`.",
      'Use template string: `` `Aceito no minuto ${status.aceitoEm}` ``.',
    ],
    followUpQuestionIds: ['fullstack.m02.f03', 'fullstack.m02.f04'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.d01',
    lessonId: 'fullstack.m02.l01',
    kind: 'debug',
    title: 'O status novo que ninguém tratou',
    promptMarkdown:
      "O app ganhou o status `'pausado'` (o dev parou pra almoçar num posto da Raposo Tavares) e, desde " +
      'então, todo job pausado aparece no painel com **0 minutos** gastos.\n\n' +
      'Conserte `minutosGastos(status, agora)`:\n\n' +
      '- disponível e cancelado → `0`;\n' +
      '- aceito → `agora - aceitoEm`;\n' +
      '- pausado → `pausadoEm - aceitoEm` (o relógio parou na pausa);\n' +
      '- entregue → `entregueEm - aceitoEm`.\n\n' +
      'Bônus de sênior: troque o `default` por uma checagem exaustiva com `never`, para o próximo status ' +
      'novo não sumir calado de novo.',
    language: 'ts',
    moduleSystem: 'esm',
    starterCode: `export type StatusJob =
  | { tipo: 'disponivel' }
  | { tipo: 'aceito'; aceitoEm: number }
  | { tipo: 'pausado'; aceitoEm: number; pausadoEm: number }
  | { tipo: 'entregue'; aceitoEm: number; entregueEm: number; estrelas: number }
  | { tipo: 'cancelado'; motivo: string };

export function minutosGastos(status: StatusJob, agora: number): number {
  switch (status.tipo) {
    case 'aceito':
      return agora - status.aceitoEm;
    case 'entregue':
      return status.entregueEm - status.aceitoEm;
    default:
      return 0;
  }
}
`,
    solution: `export type StatusJob =
  | { tipo: 'disponivel' }
  | { tipo: 'aceito'; aceitoEm: number }
  | { tipo: 'pausado'; aceitoEm: number; pausadoEm: number }
  | { tipo: 'entregue'; aceitoEm: number; entregueEm: number; estrelas: number }
  | { tipo: 'cancelado'; motivo: string };

export function minutosGastos(status: StatusJob, agora: number): number {
  switch (status.tipo) {
    case 'disponivel':
    case 'cancelado':
      return 0;
    case 'aceito':
      return agora - status.aceitoEm;
    case 'pausado':
      return status.pausadoEm - status.aceitoEm;
    case 'entregue':
      return status.entregueEm - status.aceitoEm;
    default: {
      const nunca: never = status;
      return nunca;
    }
  }
}
`,
    tests: [
      {
        description: 'job pausado conta só até a pausa',
        code: "assert.strictEqual(minutosGastos({ tipo: 'pausado', aceitoEm: 10, pausadoEm: 70 }, 200), 60);",
      },
      {
        description: 'job aceito conta até agora',
        code: "assert.strictEqual(minutosGastos({ tipo: 'aceito', aceitoEm: 10 }, 200), 190);",
      },
      {
        description: 'job entregue conta até a entrega',
        code: "assert.strictEqual(minutosGastos({ tipo: 'entregue', aceitoEm: 10, entregueEm: 130, estrelas: 4 }, 999), 120);",
      },
      {
        description: 'disponível e cancelado não gastam tempo',
        code: `assert.strictEqual(minutosGastos({ tipo: 'disponivel' }, 50), 0);
assert.strictEqual(minutosGastos({ tipo: 'cancelado', motivo: 'cliente desistiu' }, 50), 0);`,
      },
    ],
    hints: [
      "Qual `case` trata o `tipo: 'pausado'`? Se nenhum, ele cai no `default`.",
      "Acrescente `case 'pausado': return status.pausadoEm - status.aceitoEm;`.",
      "Para a checagem exaustiva: trate `'disponivel'` e `'cancelado'` com cases próprios e, no `default`, faça `const nunca: never = status; return nunca;`.",
    ],
    followUpQuestionIds: ['fullstack.m02.f05', 'fullstack.m02.f06'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'fullstack.m02.q01',
    lessonIds: ['fullstack.m02.l01'],
    kind: 'multiple-choice',
    prompt:
      "Por que escrever `const SENIORIDADES = ['estagiario', 'junior', ...] as const` antes de derivar o tipo " +
      '`(typeof SENIORIDADES)[number]`?',
    options: [
      'Sem `as const`, o array é `string[]` e o tipo derivado vira só `string`',
      'Porque `as const` congela o array em tempo de execução',
      'Porque arrays sem `as const` não podem ser exportados',
      'Para o array ficar mais rápido no `includes`',
    ],
    answerIndex: 0,
    explanation:
      '`as const` faz o TypeScript guardar os textos exatos (uma tupla readonly de literais). Sem ele, cada ' +
      'item é só `string`, e o tipo derivado perde a lista.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q02',
    lessonIds: ['fullstack.m02.l01'],
    kind: 'true-false',
    prompt:
      "Com `type S = { tipo: 'aceito'; aceitoEm: number } | { tipo: 'cancelado'; motivo: string }`, dentro de " +
      "`if (s.tipo === 'aceito') { ... }` o TypeScript permite ler `s.aceitoEm`.",
    answer: true,
    explanation:
      'Checar o discriminante (`tipo`) estreita a união: dentro do `if`, `s` só pode ser o membro "aceito".',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q03',
    lessonIds: ['fullstack.m02.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para derivar a união dos textos a partir da tupla.',
    code: `export const SENIORIDADES = ['estagiario', 'junior', 'pleno', 'senior', 'fullstack'] as const;
export type Senioridade = (typeof SENIORIDADES)[___];`,
    acceptedAnswers: ['number'],
    explanation:
      'Indexar o tipo da tupla com `number` dá o tipo de qualquer posição: a união dos cinco textos.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q04',
    lessonIds: ['fullstack.m02.l01'],
    kind: 'multiple-choice',
    prompt:
      'Qual a principal vantagem de modelar o status como união discriminada em vez de um objeto com todos os ' +
      'campos opcionais?',
    options: [
      'Estados impossíveis (como "entregue sem estrelas") deixam de compilar',
      'O JSON gerado fica menor',
      'O código roda mais rápido no Node',
      'Não precisa mais de testes',
    ],
    answerIndex: 0,
    explanation:
      'Cada membro da união exige exatamente os campos daquele estado. Combinações sem sentido viram erro de ' +
      'compilação, não bug em produção.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q05',
    lessonIds: ['fullstack.m02.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const SENIORIDADES = ['estagiario', 'junior', 'pleno', 'senior', 'fullstack'];
console.log(SENIORIDADES[SENIORIDADES.indexOf('senior') + 1]);
console.log(SENIORIDADES[SENIORIDADES.indexOf('fullstack') + 1] ?? null);`,
    expectedOutput: 'fullstack\nnull',
    explanation:
      'Depois de `senior` vem `fullstack`. Depois do último item, o índice 5 não existe: dá `undefined`, e o ' +
      '`?? null` troca por `null`.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q06',
    lessonIds: ['fullstack.m02.l01'],
    kind: 'multiple-choice',
    prompt: 'No `default` de um `switch` sobre uma união, para que serve `const nunca: never = status;`?',
    options: [
      'Faz o código parar de compilar se algum membro da união não tiver `case`',
      'Lança um erro em tempo de execução quando o status é inválido',
      'Converte o status para `never` e apaga o valor',
      'Desliga a checagem de tipos dentro do `switch`',
    ],
    answerIndex: 0,
    explanation:
      'Se todos os casos foram tratados, no `default` sobra `never` e a atribuição compila. Se faltou algum, ' +
      'sobra aquele membro, que não cabe em `never`: erro de compilação apontando o esquecimento.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q07',
    lessonIds: ['fullstack.m02.l01'],
    kind: 'true-false',
    prompt: '`as const` congela o array em tempo de execução, como `Object.freeze`.',
    answer: false,
    explanation:
      '`as const` só existe para o compilador: muda o **tipo** (readonly, literais), mas o JavaScript gerado é ' +
      'o mesmo array comum. Para congelar de verdade, use `Object.freeze`.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q08',
    lessonIds: ['fullstack.m02.l01'],
    kind: 'multiple-choice',
    prompt: 'Um texto chegou de um JSON e você quer usá-lo como `Senioridade`. Qual é o jeito seguro?',
    options: [
      'Validar com um type guard (`ehSenioridade(texto)`) e só usar dentro do `if`',
      'Escrever `texto as Senioridade` e seguir em frente',
      'Trocar o tipo do parâmetro para `any`',
      'Usar `texto!` para o TypeScript parar de reclamar',
    ],
    answerIndex: 0,
    explanation:
      'O `as` só convence o compilador, não confere nada: "gerente" passaria. O type guard checa de verdade em ' +
      'tempo de execução e estreita o tipo.',
    difficulty: 2,
  },

  // ---- acompanhamento: e01 ----
  {
    id: 'fullstack.m02.f01',
    lessonIds: ['fullstack.m02.l01'],
    exerciseId: 'fullstack.m02.e01',
    kind: 'multiple-choice',
    prompt:
      'No seu `ehSenioridade`, por que `SENIORIDADES.includes(valor)` deixou de compilar depois do `as const`?',
    options: [
      'O `includes` da tupla só aceita os cinco textos conhecidos, e `valor` é uma `string` qualquer',
      'Tuplas `as const` não têm o método `includes`',
      'Porque `valor` pode ser `undefined`',
      'Porque `includes` não funciona com textos acentuados',
    ],
    answerIndex: 0,
    explanation:
      'O parâmetro do `includes` passa a ser `Senioridade`. Como a ideia é justamente testar uma string ' +
      'qualquer, alarga-se o array: `(SENIORIDADES as readonly string[]).includes(valor)`.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.f02',
    lessonIds: ['fullstack.m02.l01'],
    exerciseId: 'fullstack.m02.e01',
    kind: 'true-false',
    prompt:
      'Graças ao retorno `valor is Senioridade` do seu `ehSenioridade`, `lista.filter(ehSenioridade)` devolve ' +
      '`Senioridade[]` em vez de `string[]`.',
    answer: true,
    explanation:
      'O `filter` entende type guards: os itens que passaram ganham o tipo estreitado. Com retorno `boolean`, ' +
      'o resultado continuaria `string[]`.',
    difficulty: 2,
  },

  // ---- acompanhamento: e02 ----
  {
    id: 'fullstack.m02.f03',
    lessonIds: ['fullstack.m02.l01'],
    exerciseId: 'fullstack.m02.e02',
    kind: 'true-false',
    prompt: "No seu `resumoStatus`, dentro do `case 'cancelado'` dá para ler `status.estrelas`.",
    answer: false,
    explanation:
      'No case "cancelado", `status` só tem `tipo` e `motivo`. Ler `estrelas` ali é erro de compilação.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.f04',
    lessonIds: ['fullstack.m02.l01'],
    exerciseId: 'fullstack.m02.e02',
    kind: 'multiple-choice',
    prompt: 'Qual destes valores o seu `StatusJob` **aceita**?',
    options: [
      "`{ tipo: 'cancelado', motivo: 'cliente sumiu' }`",
      "`{ tipo: 'entregue', aceitoEm: 1, entregueEm: 2 }`",
      "`{ tipo: 'aceito' }`",
      "`{ tipo: 'pausado' }`",
    ],
    answerIndex: 0,
    explanation:
      'Os outros são exatamente os testes com `@ts-expect-error`: falta estrelas, falta aceitoEm e "pausado" ' +
      'não existe na união.',
    difficulty: 1,
  },

  // ---- acompanhamento: d01 ----
  {
    id: 'fullstack.m02.f05',
    lessonIds: ['fullstack.m02.l01'],
    exerciseId: 'fullstack.m02.d01',
    kind: 'multiple-choice',
    prompt: 'Por que o bug do status "pausado" passou pelo compilador sem nenhum aviso?',
    options: [
      'O `default: return 0` aceitava qualquer status não tratado, inclusive o novo',
      'Porque o TypeScript não checa `switch`',
      'Porque `pausadoEm` era opcional',
      'Porque o status vinha como `any`',
    ],
    answerIndex: 0,
    explanation:
      'Um `default` genérico "engole" os casos esquecidos. Com `const nunca: never = status`, faltar um case ' +
      'vira erro de compilação.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.f06',
    lessonIds: ['fullstack.m02.l01'],
    exerciseId: 'fullstack.m02.d01',
    kind: 'fill-blank',
    prompt: 'Complete a checagem exaustiva que você colocou no `default`.',
    code: `default: {
  const nunca: ___ = status;
  return nunca;
}`,
    acceptedAnswers: ['never'],
    explanation:
      '`never` é o tipo sem nenhum valor: só cabe ali se todos os membros da união já foram tratados.',
    difficulty: 1,
  },
];
