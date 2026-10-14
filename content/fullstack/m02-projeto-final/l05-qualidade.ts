import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { DOMINIO } from './projeto';

const LEGADO = `// Código legado em JavaScript, em produção há dois anos. Ninguém sabe por que funciona, mas funciona.
function valorFinal(job) {
  const extras = job.extras || 0;
  const multa = job.atrasado ? 0.1 : 0;
  return Math.round((job.base + extras) * (1 - multa));
}

module.exports = { valorFinal };
`;

const RESULT_INICIO = `import { SENIORIDADES, type Job, type Senioridade } from './dominio';
`;

export const lesson: Lesson = {
  id: 'fullstack.m02.l05',
  moduleId: 'fullstack.m02',
  order: 5,
  title: 'Qualidade: Result, testes e refatoração sem susto',
  concepts: [
    'erros esperados como valor (Result)',
    'testes com assert',
    'testes de caracterização',
    'refatorar JS para TS sem mudar comportamento',
    'operador ! (non-null) e ??',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Reta final do projeto. Funcionar na sua máquina não basta: precisa continuar funcionando quando outra ' +
        'pessoa mexer (ou você mesmo, daqui a seis meses, sem lembrar de nada).\n\n' +
        '**Erros esperados como valor.** "Job já foi aceito por outro dev" não é uma catástrofe: é um resultado ' +
        'normal que a tela precisa mostrar. Com `throw`, nada na assinatura avisa que a função pode falhar, e ' +
        'quem esquece o `try/catch` derruba o app. Com um tipo **`Result`**, o erro faz parte do retorno:\n\n' +
        '```ts\n' +
        'type Result<T, E = string> = { ok: true; valor: T } | { ok: false; erro: E };\n' +
        '```\n\n' +
        'É uma união discriminada pelo `ok`: só dá para ler `valor` depois de checar `if (r.ok)`. E o `E` pode ' +
        "ser uma união de textos (`'indisponivel' | 'senioridade-insuficiente'`), que a tela trata caso a " +
        'caso. Guarde o `throw` para o que é bug de verdade (como SLA zero).',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type Result<T, E = string> = { ok: true; valor: T } | { ok: false; erro: E };
type ErroPix = 'saldo-insuficiente' | 'chave-invalida';

function pagarPix(saldo: number, valor: number, chave: string): Result<number, ErroPix> {
  if (!chave.includes('@')) return { ok: false, erro: 'chave-invalida' };
  if (valor > saldo) return { ok: false, erro: 'saldo-insuficiente' };
  return { ok: true, valor: saldo - valor };
}

const r = pagarPix(100, 30, 'posto@exemplo.com');
if (r.ok) {
  console.log('Saldo novo:', r.valor);
} else {
  console.log('Não deu:', r.erro); // r.erro é ErroPix
}
r.valor; // erro de compilação: pode ser o caso de erro`,
      explanation:
        "Testar também fica direto: `assert.deepStrictEqual(pagarPix(10, 30, 'a@b'), { ok: false, erro: " +
        "'saldo-insuficiente' })`.",
    },
    {
      kind: 'text',
      markdown:
        '**Refatorar JS legado para TS sem mudar o comportamento.** O roteiro seguro:\n\n' +
        '1. **Antes de mexer**, escreva **testes de caracterização**: rode o código antigo com vários casos ' +
        '(inclusive os estranhos) e registre o que ele faz hoje, certo ou errado;\n' +
        '2. migre para TypeScript em passos pequenos, rodando os testes a cada passo;\n' +
        '3. só **depois** corrija bugs antigos, num commit separado e com teste novo.\n\n' +
        'Cuidado com os "consertos" que só calam o compilador. `valor!` (non-null assertion) e `as Tipo` não ' +
        'convertem nada: só dizem "confia em mim". Se `job.extras` pode faltar, `job.extras!` continua ' +
        '`undefined` em tempo de execução, e `100 + undefined` é `NaN`. O certo é tratar o caso: ' +
        '`job.extras ?? 0`.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const { strictEqual } = require('assert');

// Código antigo (JS)
function taxaLegado(km) {
  return km > 30 ? km * 0.5 : 10;
}
// Versão nova (refatorada)
function taxaNova(km) {
  return Math.max(10, km * 0.5);
}

for (const km of [0, 10, 25, 30, 31, 80]) {
  try {
    strictEqual(taxaNova(km), taxaLegado(km));
  } catch {
    console.log('Mudou o comportamento com km =', km, '→', taxaLegado(km), 'virou', taxaNova(km));
  }
}`,
      explanation:
        'Parecia a mesma regra, mas com 21 a 30 km o legado cobra 10 e a versão nova cobra mais. Os testes de ' +
        'caracterização pegam isso antes do cliente.',
    },
  ],
  checkQuestionIds: ['fullstack.m02.q33'],
  exerciseIds: ['fullstack.m02.e08'],
  debugExerciseIds: ['fullstack.m02.d05'],
};

export const exercises: Exercise[] = [
  {
    id: 'fullstack.m02.e08',
    lessonId: 'fullstack.m02.l05',
    kind: 'implement',
    title: 'Aceitar o job sem explodir',
    promptMarkdown:
      'Hoje `tentarAceitar` **lança exceções** quando não dá para aceitar o job, e o painel esquece o ' +
      '`try/catch`. Troque pelas regras abaixo, devolvendo um `Result`:\n\n' +
      '1. reescreva `Result<T, E>` como **união discriminada** pelo `ok`: `{ ok: true; valor: T }` ou ' +
      '`{ ok: false; erro: E }`;\n' +
      "2. job que não está `'disponivel'` → `{ ok: false, erro: 'indisponivel' }`;\n" +
      "3. dev com senioridade **abaixo** da do job → `{ ok: false, erro: 'senioridade-insuficiente' }` " +
      '(use a posição em `SENIORIDADES`);\n' +
      "4. senão → `{ ok: true, valor: <job novo com status { tipo: 'aceito', aceitoEm: agora }> }`, sem " +
      'alterar o job recebido.',
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: { 'dominio.ts': DOMINIO },
    starterCode: `${RESULT_INICIO}
// Um saco de opcionais: nada impede ler valor sem checar ok.
export type Result<T, E> = { ok: boolean; valor?: T; erro?: E };
export type ErroAceite = 'indisponivel' | 'senioridade-insuficiente';

export function tentarAceitar(job: Job, dev: Senioridade, agora: number): Result<Job, ErroAceite> {
  if (job.status.tipo !== 'disponivel') throw new Error('indisponivel');
  if (SENIORIDADES.indexOf(dev) < SENIORIDADES.indexOf(job.senioridade)) {
    throw new Error('senioridade-insuficiente');
  }
  return { ok: true, valor: { ...job, status: { tipo: 'aceito', aceitoEm: agora } } };
}
`,
    solution: `${RESULT_INICIO}
export type Result<T, E> = { ok: true; valor: T } | { ok: false; erro: E };
export type ErroAceite = 'indisponivel' | 'senioridade-insuficiente';

export function tentarAceitar(job: Job, dev: Senioridade, agora: number): Result<Job, ErroAceite> {
  if (job.status.tipo !== 'disponivel') return { ok: false, erro: 'indisponivel' };
  if (SENIORIDADES.indexOf(dev) < SENIORIDADES.indexOf(job.senioridade)) {
    return { ok: false, erro: 'senioridade-insuficiente' };
  }
  return { ok: true, valor: { ...job, status: { tipo: 'aceito', aceitoEm: agora } } };
}
`,
    tests: [
      {
        description: 'job disponível e dev com nível suficiente: ok com o job aceito',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
const r = tentarAceitar(novoJob('j1', { senioridade: 'pleno' }), 'senior', 42);
assert.strictEqual(r.ok, true);
if (r.ok) assert.deepStrictEqual(r.valor.status, { tipo: 'aceito', aceitoEm: 42 });`,
      },
      {
        description: 'job que não está disponível devolve erro "indisponivel" (sem lançar)',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
const r = tentarAceitar(novoJob('j1', { status: { tipo: 'aceito', aceitoEm: 0 } }), 'senior', 5);
assert.deepStrictEqual(r, { ok: false, erro: 'indisponivel' });
if (!r.ok) {
  const erro: ErroAceite = r.erro;
  assert.strictEqual(erro, 'indisponivel');
}`,
      },
      {
        description: 'dev abaixo do nível do job devolve "senioridade-insuficiente"',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
const r = tentarAceitar(novoJob('j1', { senioridade: 'fullstack' }), 'senior', 5);
assert.deepStrictEqual(r, { ok: false, erro: 'senioridade-insuficiente' });`,
      },
      {
        description: 'mesmo nível do job pode aceitar',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
assert.strictEqual(tentarAceitar(novoJob('j1', { senioridade: 'senior' }), 'senior', 0).ok, true);`,
      },
      {
        description: 'o job recebido não é alterado',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
const job = novoJob('j1');
tentarAceitar(job, 'fullstack', 10);
assert.deepStrictEqual(job.status, { tipo: 'disponivel' });`,
      },
      {
        description: 'ler o valor sem checar ok não compila',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
const r = tentarAceitar(novoJob('j1'), 'senior', 0);
// @ts-expect-error pode ser o caso de erro, que não tem valor
const v = r.valor;`,
      },
    ],
    hints: [
      'O tipo fica `{ ok: true; valor: T } | { ok: false; erro: E }`: `true` e `false` literais, não `boolean`.',
      "Troque cada `throw new Error('...')` por `return { ok: false, erro: '...' }`.",
      'O caminho feliz já devolve um objeto novo com `{ ...job, status }`, sem alterar o original.',
    ],
    followUpQuestionIds: ['fullstack.m02.f23', 'fullstack.m02.f24'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.d05',
    lessonId: 'fullstack.m02.l05',
    kind: 'debug',
    title: 'A migração que zerou o Pix',
    promptMarkdown:
      'Alguém migrou o `valorFinal` do arquivo `legado.js` para TypeScript. O compilador reclamou que ' +
      '`job.extras` podia ser `undefined`, a pessoa "resolveu" e subiu. Desde então, todo job **sem extras** ' +
      'paga `NaN`, e o banco não sabe fazer Pix de `NaN`.\n\n' +
      'Os testes comparam a versão TypeScript com a original (`legado.js`, só para leitura) em vários casos. ' +
      'Conserte `valorFinal` para ter **exatamente o mesmo comportamento** do legado.\n\n' +
      '```js\n' +
      LEGADO +
      '```',
    language: 'ts',
    moduleSystem: 'commonjs',
    extraFiles: { 'legado.js': LEGADO },
    starterCode: `interface JobPago {
  base: number;
  extras?: number;
  atrasado?: boolean;
}

function valorFinal(job: JobPago): number {
  const multa = job.atrasado ? 0.1 : 0;
  return Math.round((job.base + job.extras!) * (1 - multa));
}
`,
    solution: `interface JobPago {
  base: number;
  extras?: number;
  atrasado?: boolean;
}

function valorFinal(job: JobPago): number {
  const extras = job.extras ?? 0;
  const multa = job.atrasado ? 0.1 : 0;
  return Math.round((job.base + extras) * (1 - multa));
}
`,
    tests: [
      {
        description: 'job sem extras paga o valor-base',
        code: 'assert.strictEqual(valorFinal({ base: 100 }), 100);',
      },
      {
        description: 'mesmo resultado do legado em todos os casos',
        code: `const legado = require('./legado.js');
const casos: JobPago[] = [
  { base: 100 },
  { base: 100, extras: 50 },
  { base: 333, extras: 0, atrasado: true },
  { base: 250, atrasado: true },
  { base: 199.5, extras: 0.4 },
  { base: 500, atrasado: false },
];
for (const caso of casos) {
  assert.strictEqual(valorFinal(caso), legado.valorFinal(caso), JSON.stringify(caso));
}`,
      },
      {
        description: 'continua exigindo o base (erro de tipo sem ele)',
        code: `// @ts-expect-error base é obrigatório
valorFinal({ extras: 10 });`,
      },
    ],
    hints: [
      'O `!` em `job.extras!` não converte nada: só manda o compilador ficar quieto. Sem extras, a conta vira `100 + undefined`.',
      'O legado usava `job.extras || 0`. Para número, `job.extras ?? 0` dá o mesmo resultado e deixa a intenção clara.',
    ],
    followUpQuestionIds: ['fullstack.m02.f25', 'fullstack.m02.f26'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'fullstack.m02.q33',
    lessonIds: ['fullstack.m02.l05'],
    kind: 'multiple-choice',
    prompt:
      'Qual a vantagem de devolver `Result<Job, ErroAceite>` em vez de lançar exceção quando o job não pode ser aceito?',
    options: [
      'O tipo de retorno avisa que pode falhar, e o TypeScript obriga a checar `ok` antes de usar o valor',
      'O código fica mais rápido que com `throw`',
      'Não precisa mais testar os casos de erro',
      'O erro some sozinho se ninguém tratar',
    ],
    answerIndex: 0,
    explanation:
      'Com `throw`, nada na assinatura indica a falha. Com `Result`, o caso de erro faz parte do tipo e não dá ' +
      'para esquecê-lo.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q34',
    lessonIds: ['fullstack.m02.l05'],
    kind: 'true-false',
    prompt: 'Se `job.extras` for `undefined`, `job.extras!` vale `0` em tempo de execução.',
    answer: false,
    explanation:
      'O `!` só existe para o compilador: o JavaScript gerado é `job.extras`, que continua `undefined`. Para ' +
      'um valor padrão, use `?? 0`.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q35',
    lessonIds: ['fullstack.m02.l05'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: 'console.log(0 || 5, 0 ?? 5, undefined ?? 5);',
    expectedOutput: '5 0 5',
    explanation:
      '`||` troca qualquer valor falsy (inclusive `0`). `??` só troca `null` e `undefined`, então `0 ?? 5` ' +
      'continua `0`.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q36',
    lessonIds: ['fullstack.m02.l05'],
    kind: 'fill-blank',
    prompt: 'Complete o tipo `Result` como união discriminada.',
    code: 'type Result<T, E> = { ok: true; valor: T } | { ok: ___; erro: E };',
    acceptedAnswers: ['false'],
    explanation:
      'Os literais `true` e `false` no campo `ok` são o discriminante: checar `r.ok` estreita para um dos lados.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q37',
    lessonIds: ['fullstack.m02.l05'],
    kind: 'multiple-choice',
    prompt: 'O que é um **teste de caracterização**?',
    options: [
      'Um teste que registra o que o código legado faz hoje, para a refatoração não mudar o comportamento',
      'Um teste que confere se os nomes das variáveis estão em português',
      'Um teste que só roda em produção',
      'Um teste que confere a performance do código',
    ],
    answerIndex: 0,
    explanation:
      'Ele não julga se o comportamento é certo: só trava o que existe. Depois, com tudo verde, você refatora ' +
      'com segurança.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q38',
    lessonIds: ['fullstack.m02.l05'],
    kind: 'true-false',
    prompt:
      'Ao migrar JS para TS, se o compilador reclama de um possível `undefined`, o caminho mais seguro é ' +
      'acrescentar `as` ou `!` até ele parar de reclamar.',
    answer: false,
    explanation:
      'Isso só esconde o aviso. O compilador achou um caso real: trate-o (valor padrão, `if`, `Result`...).',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q39',
    lessonIds: ['fullstack.m02.l05'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function dividir(a, b) {
  if (b === 0) return { ok: false, erro: 'divisão por zero' };
  return { ok: true, valor: a / b };
}
const r = dividir(10, 0);
console.log(r.ok ? r.valor : 'falhou: ' + r.erro);`,
    expectedOutput: 'falhou: divisão por zero',
    explanation:
      'Como `b` é 0, a função devolve o caso de erro; `r.ok` é `false` e o `console.log` mostra o erro.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q40',
    lessonIds: ['fullstack.m02.l05'],
    kind: 'multiple-choice',
    prompt: 'Na refatoração de um código legado, você achou um bug antigo. O que fazer?',
    options: [
      'Terminar a refatoração sem mudar o comportamento e corrigir o bug depois, em outro commit e com teste novo',
      'Corrigir no meio da refatoração, sem avisar, já que é para melhor',
      'Apagar os testes de caracterização que pegam o bug',
      'Ignorar para sempre: código legado não se corrige',
    ],
    answerIndex: 0,
    explanation:
      'Misturar refatoração e correção esconde mudanças de comportamento. Passos separados ficam fáceis de ' +
      'revisar e de desfazer.',
    difficulty: 2,
  },

  // ---- acompanhamento: e08 ----
  {
    id: 'fullstack.m02.f23',
    lessonIds: ['fullstack.m02.l05'],
    exerciseId: 'fullstack.m02.e08',
    kind: 'multiple-choice',
    prompt:
      "Com o seu `tentarAceitar`, o que devolve um dev `'pleno'` tentando aceitar um job `'senior'` disponível?",
    options: [
      "`{ ok: false, erro: 'senioridade-insuficiente' }`",
      "`{ ok: false, erro: 'indisponivel' }`",
      'Lança uma exceção',
      '`{ ok: true, valor: ... }` com o job aceito',
    ],
    answerIndex: 0,
    explanation:
      'O job está disponível, mas pleno vem antes de sênior em `SENIORIDADES`: erro de senioridade, devolvido ' +
      'como valor.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.f24',
    lessonIds: ['fullstack.m02.l05'],
    exerciseId: 'fullstack.m02.e08',
    kind: 'true-false',
    prompt:
      'Com o seu `Result` como união discriminada, `const v = r.valor;` só compila dentro de um `if (r.ok)`.',
    answer: true,
    explanation:
      'Fora do `if`, `r` ainda pode ser `{ ok: false; erro }`, que não tem `valor`. Por isso o teste com ' +
      '`@ts-expect-error` passou.',
    difficulty: 2,
  },

  // ---- acompanhamento: d05 ----
  {
    id: 'fullstack.m02.f25',
    lessonIds: ['fullstack.m02.l05'],
    exerciseId: 'fullstack.m02.d05',
    kind: 'multiple-choice',
    prompt: 'Antes do conserto, quanto o `valorFinal({ base: 100 })` em TypeScript devolvia?',
    options: ['`NaN`', '`100`', '`0`', 'Um erro de compilação'],
    answerIndex: 0,
    explanation:
      '`job.extras!` é `undefined` em tempo de execução: `100 + undefined` é `NaN`, e `Math.round(NaN)` também.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.f26',
    lessonIds: ['fullstack.m02.l05'],
    exerciseId: 'fullstack.m02.d05',
    kind: 'fill-blank',
    prompt: 'Complete a linha do seu conserto que dá o valor padrão para os extras.',
    code: 'const extras = job.extras ___ 0;',
    acceptedAnswers: ['??', '||'],
    explanation:
      'Para um número opcional, `??` e `||` dão o mesmo resultado aqui (`0 || 0` e `0 ?? 0` são `0`). O `??` ' +
      'deixa claro que só `undefined` é trocado.',
    difficulty: 1,
  },
];
