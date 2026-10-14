import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { DOMINIO } from './projeto';

export const lesson: Lesson = {
  id: 'fullstack.m02.l02',
  moduleId: 'fullstack.m02',
  order: 2,
  title: 'Regras de negócio puras: SLA, estrelas e pagamento',
  concepts: [
    'funções puras',
    'SLA como razão',
    'faixas de avaliação',
    'Record<Chave, Valor>',
    'imutabilidade',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'As **regras de negócio** são o coração do sistema: quanto o job paga, quantas estrelas o cliente dá, ' +
        'quando o dev está atrasado. Elas mudam toda hora ("agora o sênior ganha 5×!"), então precisam ser ' +
        'fáceis de testar. O segredo é escrevê-las como **funções puras**:\n\n' +
        '- o resultado depende **só dos parâmetros** (nada de `Date.now()`, `Math.random()` ou variável global ' +
        'lá dentro);\n' +
        '- **não mudam nada fora delas** (não alteram o objeto recebido, não salvam, não imprimem).\n\n' +
        'Precisa da hora atual? Receba `agora` como parâmetro. Quem chama decide o relógio; o teste passa o ' +
        'número que quiser. No jogo, `src/gameplay/career.ts` segue essa regra: as funções de lá não sabem ' +
        'que existe um mapa, um caminhão ou um `localStorage`.',
    },
    {
      kind: 'text',
      markdown:
        '**SLA como razão.** Em vez de "atrasou 20 minutos", o jogo mede `tempo gasto / prazo`:\n\n' +
        '- `0.5` → entregou na metade do prazo;\n' +
        '- `1` → no limite;\n' +
        '- `1.25` → 25% atrasado.\n\n' +
        'Com a razão, a mesma régua serve para um job de 45 minutos e um de 5 horas. As **estrelas** saem de ' +
        'faixas: até 0,75 → 5 estrelas; até 1 → 4; até 1,25 → 3; até 1,6 → 2; acima disso, 1 estrela. ' +
        'Prazo zero ou negativo não faz sentido: a função **lança** `RangeError` em vez de devolver `Infinity` ' +
        'e estragar a média do jogador sem ninguém perceber.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const FAIXAS = [
  { ate: 0.75, estrelas: 5 },
  { ate: 1, estrelas: 4 },
  { ate: 1.25, estrelas: 3 },
  { ate: 1.6, estrelas: 2 },
];

function estrelasPorSla(razao) {
  const faixa = FAIXAS.find((f) => razao <= f.ate);
  return faixa ? faixa.estrelas : 1;
}

console.log(estrelasPorSla(60 / 120)); // metade do prazo
console.log(estrelasPorSla(150 / 120)); // 25% atrasado
console.log(estrelasPorSla(300 / 120)); // perdeu o almoço do cliente`,
      explanation:
        'O `find` devolve a **primeira** faixa que serve, por isso a ordem importa: da mais rigorosa para a mais ' +
        'tolerante. Nenhuma serviu? Uma estrela.',
    },
    {
      kind: 'text',
      markdown:
        '**Pagamento por senioridade com `Record`.** O pagamento-base do job é multiplicado conforme o seu ' +
        'nível (no jogo: ×1 estagiário, ×1,8 júnior, ×3 pleno, ×5 sênior, ×8 full stack). Tipar a tabela como ' +
        '`Record<Senioridade, number>` obriga a ter **todas** as chaves: se alguém criar um degrau novo e ' +
        'esquecer o multiplicador, o código para de compilar. Tabelas de regra assim ficam todas juntas, como ' +
        'o `src/shared/balance.ts` do jogo, para balancear sem caçar números mágicos pelo código.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `import type { Senioridade } from './dominio';

export const MULTIPLICADOR: Record<Senioridade, number> = {
  estagiario: 1,
  junior: 1.8,
  pleno: 3,
  senior: 5,
  fullstack: 8,
};

export function pagamento(base: number, senioridade: Senioridade): number {
  return Math.round(base * MULTIPLICADOR[senioridade]);
}

pagamento(100, 'senior'); // 500
pagamento(100, 'gerente'); // erro de compilação`,
      explanation:
        'O parâmetro é `Senioridade`, não `string`: um degrau inventado nem compila. O `Math.round` evita ' +
        'centavos quebrados como 59,4.',
    },
  ],
  checkQuestionIds: ['fullstack.m02.q09'],
  exerciseIds: ['fullstack.m02.e03', 'fullstack.m02.e04'],
  debugExerciseIds: ['fullstack.m02.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'fullstack.m02.e03',
    lessonId: 'fullstack.m02.l02',
    kind: 'implement',
    title: 'O SLA e as estrelas',
    promptMarkdown:
      'Implemente as duas regras que decidem a sua avaliação:\n\n' +
      '1. `razaoSla(minutosGastos, slaMinutos)`: devolve `minutosGastos / slaMinutos`. Minutos negativos contam ' +
      "como 0. Se o SLA não for maior que zero, lance `new RangeError('O SLA precisa ser maior que zero.')`.\n" +
      '2. `estrelasPorSla(razao)`: até 0,75 → 5; até 1 → 4; até 1,25 → 3; até 1,6 → 2; acima → 1. Os limites ' +
      'são **inclusivos** (exatamente 1 dá 4 estrelas).\n\n' +
      'As duas devem ser puras: nada de relógio, nada de variável de fora.',
    language: 'ts',
    moduleSystem: 'esm',
    starterCode: `export function razaoSla(minutosGastos: number, slaMinutos: number): number {
  return minutosGastos / slaMinutos;
}

export function estrelasPorSla(razao: number): number {
  // 5, 4, 3, 2 ou 1 estrela
  return 5;
}
`,
    solution: `const FAIXAS = [
  { ate: 0.75, estrelas: 5 },
  { ate: 1, estrelas: 4 },
  { ate: 1.25, estrelas: 3 },
  { ate: 1.6, estrelas: 2 },
] as const;

export function razaoSla(minutosGastos: number, slaMinutos: number): number {
  if (!(slaMinutos > 0)) throw new RangeError('O SLA precisa ser maior que zero.');
  return Math.max(0, minutosGastos) / slaMinutos;
}

export function estrelasPorSla(razao: number): number {
  return FAIXAS.find((faixa) => razao <= faixa.ate)?.estrelas ?? 1;
}
`,
    tests: [
      {
        description: 'a razão é tempo gasto dividido pelo prazo',
        code: `assert.strictEqual(razaoSla(60, 120), 0.5);
assert.strictEqual(razaoSla(150, 120), 1.25);`,
      },
      {
        description: 'minutos negativos contam como zero',
        code: 'assert.strictEqual(razaoSla(-10, 120), 0);',
      },
      {
        description: 'SLA zero ou negativo lança RangeError',
        code: `assert.throws(() => razaoSla(10, 0), RangeError);
assert.throws(() => razaoSla(10, -30), RangeError);`,
      },
      {
        description: 'estrelas nas faixas, com limites inclusivos',
        code: `assert.strictEqual(estrelasPorSla(0.5), 5);
assert.strictEqual(estrelasPorSla(0.75), 5);
assert.strictEqual(estrelasPorSla(0.9), 4);
assert.strictEqual(estrelasPorSla(1), 4);
assert.strictEqual(estrelasPorSla(1.25), 3);
assert.strictEqual(estrelasPorSla(1.5), 2);
assert.strictEqual(estrelasPorSla(1.6), 2);
assert.strictEqual(estrelasPorSla(2), 1);`,
      },
      {
        description: 'as duas juntas: 150 min num SLA de 120 dão 3 estrelas',
        code: 'assert.strictEqual(estrelasPorSla(razaoSla(150, 120)), 3);',
      },
    ],
    hints: [
      'Comece o `razaoSla` com `if (!(slaMinutos > 0)) throw new RangeError(...)`: o `!( > 0)` também pega `NaN`.',
      'Para os negativos: `Math.max(0, minutosGastos)`.',
      'Para as estrelas, uma lista de faixas `{ ate, estrelas }` em ordem crescente e um `find((f) => razao <= f.ate)` resolvem; sem faixa, 1 estrela.',
    ],
    followUpQuestionIds: ['fullstack.m02.f07', 'fullstack.m02.f08'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.e04',
    lessonId: 'fullstack.m02.l02',
    kind: 'implement',
    title: 'Quanto o sênior ganha',
    promptMarkdown:
      'O arquivo `dominio.ts` (já pronto) exporta `SENIORIDADES` e o tipo `Senioridade`. Complete:\n\n' +
      '1. `MULTIPLICADOR`: tipado como `Record<Senioridade, number>`, com **todos** os degraus: estagiário 1, ' +
      'júnior 1,8, pleno 3, sênior 5, full stack 8;\n' +
      '2. `pagamento(base, senioridade)`: `base × multiplicador`, arredondado com `Math.round`. O parâmetro ' +
      '`senioridade` deve ser do tipo `Senioridade` (um degrau inventado não pode compilar).',
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: { 'dominio.ts': DOMINIO },
    starterCode: `import type { Senioridade } from './dominio';

// Faltam degraus aqui... e nada obriga a ter todos.
export const MULTIPLICADOR = { junior: 1.8, pleno: 3, senior: 5 };

export function pagamento(base: number, senioridade: string): number {
  return base;
}
`,
    solution: `import type { Senioridade } from './dominio';

export const MULTIPLICADOR: Record<Senioridade, number> = {
  estagiario: 1,
  junior: 1.8,
  pleno: 3,
  senior: 5,
  fullstack: 8,
};

export function pagamento(base: number, senioridade: Senioridade): number {
  return Math.round(base * MULTIPLICADOR[senioridade]);
}
`,
    tests: [
      {
        description: 'sênior ganha 5× e full stack 8×',
        code: `assert.strictEqual(pagamento(100, 'senior'), 500);
assert.strictEqual(pagamento(250, 'fullstack'), 2000);`,
      },
      {
        description: 'estagiário ganha o valor-base',
        code: "assert.strictEqual(pagamento(35, 'estagiario'), 35);",
      },
      {
        description: 'o pagamento é arredondado (33 × 1,8 = 59,4 → 59)',
        code: `assert.strictEqual(pagamento(33, 'junior'), 59);
assert.strictEqual(pagamento(45, 'junior'), 81);`,
      },
      {
        description: 'o MULTIPLICADOR tem todos os degraus',
        code: `const { SENIORIDADES } = require('./dominio') as typeof import('./dominio');
assert.deepStrictEqual(Object.keys(MULTIPLICADOR).sort(), [...SENIORIDADES].sort());`,
      },
      {
        description: 'um degrau inventado não compila',
        code: `// @ts-expect-error gerente não é senioridade
pagamento(100, 'gerente');`,
      },
    ],
    hints: [
      'Anote o tipo: `export const MULTIPLICADOR: Record<Senioridade, number> = { ... }` e o TypeScript lista as chaves que faltam.',
      'Troque `senioridade: string` por `senioridade: Senioridade` no parâmetro.',
      'O cálculo é `Math.round(base * MULTIPLICADOR[senioridade])`.',
    ],
    followUpQuestionIds: ['fullstack.m02.f09', 'fullstack.m02.f10'],
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.d02',
    lessonId: 'fullstack.m02.l02',
    kind: 'debug',
    title: 'O ranking que bagunça o histórico',
    promptMarkdown:
      'O painel mostra o **histórico** de entregas (em ordem de entrega) e, ao lado, as **melhores do mês**. ' +
      'Desde que o ranking entrou, o histórico aparece embaralhado: `melhoresEntregas` mexe no array que ' +
      'recebe.\n\n' +
      'Conserte a função para ela ser **pura**:\n\n' +
      '- tipe o parâmetro como `readonly Entrega[]` (o painel guarda o histórico assim);\n' +
      '- ordene uma **cópia**, por estrelas (maior primeiro) e, no empate, por valor (maior primeiro);\n' +
      '- devolva só as `quantas` primeiras.',
    language: 'ts',
    moduleSystem: 'esm',
    starterCode: `export interface Entrega {
  jobId: string;
  estrelas: number;
  valor: number;
}

export function melhoresEntregas(entregas: Entrega[], quantas: number): Entrega[] {
  return entregas.sort((a, b) => b.estrelas - a.estrelas || b.valor - a.valor).slice(0, quantas);
}
`,
    solution: `export interface Entrega {
  jobId: string;
  estrelas: number;
  valor: number;
}

export function melhoresEntregas(entregas: readonly Entrega[], quantas: number): Entrega[] {
  return [...entregas].sort((a, b) => b.estrelas - a.estrelas || b.valor - a.valor).slice(0, quantas);
}
`,
    tests: [
      {
        description: 'devolve as melhores, por estrelas e depois por valor',
        code: `const historico: Entrega[] = [
  { jobId: 'padaria', estrelas: 3, valor: 500 },
  { jobId: 'academia', estrelas: 5, valor: 900 },
  { jobId: 'pet-shop', estrelas: 5, valor: 1200 },
  { jobId: 'oficina', estrelas: 4, valor: 700 },
];
assert.deepStrictEqual(
  melhoresEntregas(historico, 2).map((e) => e.jobId),
  ['pet-shop', 'academia'],
);`,
      },
      {
        description: 'o histórico original não muda de ordem',
        code: `const historico: Entrega[] = [
  { jobId: 'padaria', estrelas: 3, valor: 500 },
  { jobId: 'academia', estrelas: 5, valor: 900 },
  { jobId: 'oficina', estrelas: 4, valor: 700 },
];
melhoresEntregas(historico, 1);
assert.deepStrictEqual(historico.map((e) => e.jobId), ['padaria', 'academia', 'oficina']);`,
      },
      {
        description: 'aceita um histórico readonly (erro de tipo se o parâmetro não for readonly)',
        code: `const congelado: readonly Entrega[] = [
  { jobId: 'a', estrelas: 2, valor: 100 },
  { jobId: 'b', estrelas: 4, valor: 100 },
];
assert.strictEqual(melhoresEntregas(congelado, 1)[0]?.jobId, 'b');`,
      },
    ],
    hints: [
      'O `sort` ordena **o próprio array** (e devolve ele mesmo). Quem chamou vê a mudança.',
      'Ordene uma cópia: `[...entregas].sort(...)`.',
      'Troque o tipo do parâmetro para `readonly Entrega[]`: com ele, o TypeScript nem deixa chamar `entregas.sort`.',
    ],
    followUpQuestionIds: ['fullstack.m02.f11', 'fullstack.m02.f12'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'fullstack.m02.q09',
    lessonIds: ['fullstack.m02.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual destas funções é **pura**?',
    options: [
      '`(gastos, sla) => gastos / sla`',
      '`(sla) => (Date.now() - inicio) / sla`',
      '`(job) => { job.pago = true; return job; }`',
      '`(valor) => { console.log(valor); return valor; }`',
    ],
    answerIndex: 0,
    explanation:
      'A primeira só depende dos parâmetros e não mexe em nada. As outras leem o relógio e uma variável de ' +
      'fora, alteram o objeto recebido ou imprimem (efeito colateral).',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q10',
    lessonIds: ['fullstack.m02.l02'],
    kind: 'true-false',
    prompt:
      'Para testar uma regra que depende da hora atual, é melhor receber `agora` como parâmetro do que chamar ' +
      '`Date.now()` dentro da função.',
    answer: true,
    explanation:
      'Com `agora` como parâmetro, o teste escolhe o momento e o resultado é sempre o mesmo. Com `Date.now()` ' +
      'lá dentro, cada execução do teste vê um relógio diferente.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q11',
    lessonIds: ['fullstack.m02.l02'],
    kind: 'predict-output',
    prompt: 'Alguém colocou as faixas na ordem errada. O que este código imprime?',
    code: `const faixas = [
  { ate: 1.6, estrelas: 2 },
  { ate: 1, estrelas: 4 },
];
const estrelas = (r) => faixas.find((f) => r <= f.ate)?.estrelas ?? 1;
console.log(estrelas(0.5), estrelas(1.3), estrelas(2));`,
    expectedOutput: '2 2 1',
    explanation:
      'O `find` para na primeira faixa que serve. Como a de 1,6 vem primeiro, 0,5 e 1,3 caem nela (2 ' +
      'estrelas). 2 não cabe em nenhuma: 1 estrela.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q12',
    lessonIds: ['fullstack.m02.l02'],
    kind: 'multiple-choice',
    prompt:
      'Por que tipar a tabela de multiplicadores como `Record<Senioridade, number>` em vez de deixar o ' +
      'TypeScript inferir o tipo do objeto?',
    options: [
      'Se faltar um degrau (ou sobrar um inventado), o código não compila',
      'Para o objeto ocupar menos memória',
      'Porque objetos sem anotação não podem ser exportados',
      'Para os valores virarem inteiros automaticamente',
    ],
    answerIndex: 0,
    explanation:
      '`Record<Senioridade, number>` exige exatamente uma chave para cada senioridade. Novo degrau na união = ' +
      'erro apontando a tabela incompleta.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q13',
    lessonIds: ['fullstack.m02.l02'],
    kind: 'fill-blank',
    prompt: 'Complete o tipo que exige um número para cada senioridade.',
    code: `export const MULTIPLICADOR: ___<Senioridade, number> = {
  estagiario: 1,
  junior: 1.8,
  pleno: 3,
  senior: 5,
  fullstack: 8,
};`,
    acceptedAnswers: ['Record'],
    explanation:
      '`Record<Chaves, Valor>` cria um objeto com todas as chaves da união, cada uma com o tipo do valor.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q14',
    lessonIds: ['fullstack.m02.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const razao = (gastos, sla) => Math.max(0, gastos) / sla;
console.log(razao(90, 120));
console.log(razao(-30, 120));`,
    expectedOutput: '0.75\n0',
    explanation: '90 / 120 = 0,75. Minutos negativos viram 0 antes da divisão, e 0 / 120 = 0.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q15',
    lessonIds: ['fullstack.m02.l02'],
    kind: 'true-false',
    prompt:
      'As regras puras de SLA e pagamento podem ser testadas sem abrir o jogo: sem mapa, sem caminhão e sem ' +
      '`localStorage`.',
    answer: true,
    explanation:
      'Elas só recebem números e devolvem números. Basta chamar com valores conhecidos e conferir com `assert`.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q16',
    lessonIds: ['fullstack.m02.l02'],
    kind: 'multiple-choice',
    prompt: 'Por que `razaoSla(10, 0)` lança `RangeError` em vez de devolver `10 / 0`?',
    options: [
      '`10 / 0` dá `Infinity`, que entraria calado na média do jogador e estragaria as contas',
      'Porque dividir por zero trava o Node',
      'Porque o TypeScript não deixa dividir por zero',
      'Porque `RangeError` é mais rápido que uma divisão',
    ],
    answerIndex: 0,
    explanation:
      'Em JavaScript, dividir por zero não dá erro: dá `Infinity`. Falhar cedo, com uma mensagem clara, é ' +
      'melhor do que propagar um número sem sentido.',
    difficulty: 2,
  },

  // ---- acompanhamento: e03 ----
  {
    id: 'fullstack.m02.f07',
    lessonIds: ['fullstack.m02.l02'],
    exerciseId: 'fullstack.m02.e03',
    kind: 'multiple-choice',
    prompt: 'Com o seu código, quantas estrelas ganha quem gastou 120 minutos num SLA de 120?',
    options: ['4', '5', '3', '1'],
    answerIndex: 0,
    explanation: 'A razão é exatamente 1. Como os limites são inclusivos (`razao <= 1`), dá 4 estrelas.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.f08',
    lessonIds: ['fullstack.m02.l02'],
    exerciseId: 'fullstack.m02.e03',
    kind: 'true-false',
    prompt: 'No seu `razaoSla`, `if (!(slaMinutos > 0))` também recusa um SLA `NaN`.',
    answer: true,
    explanation:
      'Qualquer comparação com `NaN` dá `false`, então `NaN > 0` é `false` e a negação lança o erro. Um ' +
      '`if (slaMinutos <= 0)` deixaria o `NaN` passar.',
    difficulty: 3,
  },

  // ---- acompanhamento: e04 ----
  {
    id: 'fullstack.m02.f09',
    lessonIds: ['fullstack.m02.l02'],
    exerciseId: 'fullstack.m02.e04',
    kind: 'multiple-choice',
    prompt: 'Com o seu `pagamento`, quanto recebe um júnior num job de base R$ 33?',
    options: ['R$ 59', 'R$ 59,40', 'R$ 60', 'R$ 33'],
    answerIndex: 0,
    explanation: '33 × 1,8 = 59,4, e o `Math.round` arredonda para 59.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.f10',
    lessonIds: ['fullstack.m02.l02'],
    exerciseId: 'fullstack.m02.e04',
    kind: 'true-false',
    prompt:
      "Se alguém acrescentar `'diretor'` em `SENIORIDADES` no `dominio.ts`, o seu `MULTIPLICADOR` passa a dar " +
      'erro de compilação até ganhar a chave nova.',
    answer: true,
    explanation:
      'O tipo `Senioridade` é derivado da lista; o `Record<Senioridade, number>` passa a exigir a chave ' +
      '`diretor` também.',
    difficulty: 2,
  },

  // ---- acompanhamento: d02 ----
  {
    id: 'fullstack.m02.f11',
    lessonIds: ['fullstack.m02.l02'],
    exerciseId: 'fullstack.m02.d02',
    kind: 'multiple-choice',
    prompt: 'Por que o histórico do painel ficava embaralhado?',
    options: [
      'O `sort` ordena o próprio array recebido, e o painel usava esse mesmo array',
      'O `slice` apagava itens do histórico',
      'O `sort` devolve sempre uma cópia nova',
      'O critério de desempate estava invertido',
    ],
    answerIndex: 0,
    explanation:
      '`sort` muda o array original. Ordenando uma cópia (`[...entregas].sort(...)`), o histórico fica intacto.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.f12',
    lessonIds: ['fullstack.m02.l02'],
    exerciseId: 'fullstack.m02.d02',
    kind: 'true-false',
    prompt:
      'Com o parâmetro tipado como `readonly Entrega[]`, o TypeScript recusa chamar `entregas.sort(...)` direto.',
    answer: true,
    explanation:
      '`ReadonlyArray` não tem métodos que alteram o array (`sort`, `push`, `splice`...). O tipo vira uma ' +
      'proteção contra o bug.',
    difficulty: 2,
  },
];
