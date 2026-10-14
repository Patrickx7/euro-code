import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m02.l04',
  moduleId: 'typescript.m02',
  order: 4,
  title: 'Type guards: o JSON da API não é confiável',
  concepts: [
    'dados externos como unknown',
    'type guard próprio',
    'predicado de tipo (x is T)',
    "'campo' in x com typeof x.campo",
    'validar JSON',
    'filter com type guard',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        '`JSON.parse` devolve `any`, e `any` desliga o TypeScript: dá para escrever ' +
        '`dados.cliente.nome.toUpperCase()` e só descobrir que `cliente` não veio quando o app quebra na ' +
        'frente do cliente. ("Funciona na minha máquina", onde a API devolve tudo certinho.)\n\n' +
        'O jeito seguro é tratar todo dado que vem de fora (API, arquivo, `localStorage`, formulário) como ' +
        '`unknown`:\n\n' +
        "```ts\nconst dados: unknown = JSON.parse(texto);\ndados.valor; // erro: 'dados' is of type 'unknown'\n```\n\n" +
        'Com `unknown`, o TypeScript obriga você a **checar antes de usar**. Só que checar um objeto inteiro ' +
        'com `typeof` e `in` toda vez cansa. Aí entra o **type guard**.',
    },
    {
      kind: 'text',
      markdown:
        'Um type guard é uma função que devolve `boolean`, mas com um tipo de retorno especial: ' +
        '`valor is Tipo` (um **predicado de tipo**). Ele diz ao TypeScript: "se eu devolver `true`, pode ' +
        'tratar o valor como `Tipo`".\n\n' +
        'Para um objeto vindo de JSON, a receita é sempre a mesma:\n\n' +
        "1. `typeof x === 'object' && x !== null` (lembre: `typeof null` é `'object'`);\n" +
        "2. `'campo' in x` para cada campo;\n" +
        "3. `typeof x.campo === '...'` para conferir o tipo de cada um.\n\n" +
        "Depois de `'valor' in x`, o TypeScript deixa ler `x.valor` (como `unknown`), e o `typeof` em seguida " +
        'estreita o campo.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `interface Job {
  id: string;
  cliente: string;
  valor: number;
}

function isJob(x: unknown): x is Job {
  return (
    typeof x === 'object' &&
    x !== null &&
    'id' in x &&
    typeof x.id === 'string' &&
    'cliente' in x &&
    typeof x.cliente === 'string' &&
    'valor' in x &&
    typeof x.valor === 'number'
  );
}

const dados: unknown = JSON.parse('{"id":"J1","cliente":"Oficina do Tonho","valor":300}');
if (isJob(dados)) {
  console.log(dados.cliente.toUpperCase()); // aqui dados é Job
}`,
      explanation: 'Fora do `if`, `dados` continua `unknown`. Dentro, é `Job`, com autocomplete e tudo.',
    },
    {
      kind: 'text',
      markdown:
        'O guard também funciona com `filter`: `lista.filter(isJob)` devolve `Job[]`, já filtrado **e** ' +
        'tipado.\n\n' +
        'Mas atenção: o predicado é uma **promessa sua** para o compilador, e ele acredita sem conferir. Se o ' +
        'guard checar pouco e devolver `true` para um objeto incompleto, o erro aparece lá na frente, longe da ' +
        'causa. Guard bom confere **todos** os campos que o resto do código vai usar.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const resposta = JSON.parse('[{"id":"J1","valor":300},null,{"id":"J2","valor":"duzentos"}]');
const validos = resposta.filter(
  (x) => typeof x === 'object' && x !== null && typeof x.id === 'string' && typeof x.valor === 'number',
);
console.log(validos.length, 'de', resposta.length, 'itens aproveitados');`,
      explanation:
        'Em JavaScript puro a checagem é a mesma; o TypeScript só acrescenta o `x is Job` para saber o resultado.',
    },
  ],
  checkQuestionIds: ['typescript.m02.q24'],
  exerciseIds: ['typescript.m02.e07', 'typescript.m02.e08'],
  debugExerciseIds: ['typescript.m02.d04'],
};

const JOB_GUARD = `interface Job {
  id: string;
  cliente: string;
  valor: number;
}

function isJob(x: unknown): x is Job {
  return (
    typeof x === 'object' &&
    x !== null &&
    'id' in x &&
    typeof x.id === 'string' &&
    'cliente' in x &&
    typeof x.cliente === 'string' &&
    'valor' in x &&
    typeof x.valor === 'number'
  );
}
`;

export const exercises: Exercise[] = [
  {
    id: 'typescript.m02.e07',
    lessonId: 'typescript.m02.l04',
    kind: 'implement',
    title: 'O guard do job',
    promptMarkdown:
      'A API do app de freelas devolve jobs em JSON e às vezes vem lixo: `null`, valor como texto, campo ' +
      'faltando. Implemente o type guard `isJob(x: unknown): x is Job`, que só devolve `true` quando `x` é ' +
      'um objeto com:\n\n' +
      '- `id`: string\n' +
      '- `cliente`: string\n' +
      '- `valor`: number\n' +
      "- `status`: `'aberto'`, `'em andamento'` ou `'entregue'`\n\n" +
      'Não esqueça de trocar o tipo de retorno `boolean` pelo predicado.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type StatusJob = 'aberto' | 'em andamento' | 'entregue';

interface Job {
  id: string;
  cliente: string;
  valor: number;
  status: StatusJob;
}

function isJob(x: unknown): boolean {
  // seu código aqui
  return false;
}
`,
    solution: `type StatusJob = 'aberto' | 'em andamento' | 'entregue';

interface Job {
  id: string;
  cliente: string;
  valor: number;
  status: StatusJob;
}

const STATUS: readonly string[] = ['aberto', 'em andamento', 'entregue'];

function isJob(x: unknown): x is Job {
  return (
    typeof x === 'object' &&
    x !== null &&
    'id' in x &&
    typeof x.id === 'string' &&
    'cliente' in x &&
    typeof x.cliente === 'string' &&
    'valor' in x &&
    typeof x.valor === 'number' &&
    'status' in x &&
    typeof x.status === 'string' &&
    STATUS.includes(x.status)
  );
}
`,
    tests: [
      {
        description: 'aceita um job válido',
        code: "assert.strictEqual(isJob({ id: 'J1', cliente: 'Oficina do Tonho', valor: 300, status: 'aberto' }), true);",
      },
      {
        description: 'recusa lixo',
        code: `assert.strictEqual(isJob(null), false);
assert.strictEqual(isJob('J1'), false);
assert.strictEqual(isJob({ id: 'J1', cliente: 'Bar do Zé', valor: '300', status: 'aberto' }), false);
assert.strictEqual(isJob({ id: 'J1', valor: 300, status: 'aberto' }), false);
assert.strictEqual(isJob({ id: 'J1', cliente: 'Bar do Zé', valor: 300, status: 'quase pronto' }), false);`,
      },
      {
        description: 'o guard estreita o tipo (x is Job)',
        code: `const dado: unknown = JSON.parse('{"id":"J2","cliente":"Bar do Zé","valor":120,"status":"entregue"}');
if (isJob(dado)) {
  const valor: number = dado.valor;
  const status: StatusJob = dado.status;
  assert.strictEqual(valor + 0, 120);
  assert.strictEqual(status, 'entregue');
} else {
  assert.fail('deveria ser um Job');
}`,
      },
      {
        description: 'filter com o guard devolve Job[]',
        code: `const lista: unknown[] = [{ id: 'J1', cliente: 'A', valor: 10, status: 'aberto' }, null, { id: 'J3' }];
const jobs: Job[] = lista.filter(isJob);
assert.strictEqual(jobs.length, 1);`,
      },
    ],
    hints: [
      "Comece com `typeof x === 'object' && x !== null` e vá encadeando com `&&`.",
      "Para cada campo: `'id' in x && typeof x.id === 'string'`.",
      "Para o status, dá para ter uma lista `['aberto', 'em andamento', 'entregue']` e usar `includes`.",
      'O tipo de retorno precisa ser `x is Job`, não `boolean`.',
    ],
    followUpQuestionIds: ['typescript.m02.f19', 'typescript.m02.f20'],
    difficulty: 3,
  },
  {
    id: 'typescript.m02.e08',
    lessonId: 'typescript.m02.l04',
    kind: 'implement',
    title: 'Lendo a resposta da API',
    promptMarkdown:
      'Agora use o guard (o `isJob` já está pronto). Implemente `lerJobs(json: string): Job[]`:\n\n' +
      '- faça `JSON.parse` e guarde o resultado como `unknown` (confiar na API é coisa de júnior);\n' +
      "- se não for um array, lance `new Error('Resposta inválida da API')`;\n" +
      '- se for, devolva só os itens que são `Job`, ignorando o lixo.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `${JOB_GUARD}
function lerJobs(json: string): Job[] {
  const dados = JSON.parse(json);
  return dados;
}
`,
    solution: `${JOB_GUARD}
function lerJobs(json: string): Job[] {
  const dados: unknown = JSON.parse(json);
  if (!Array.isArray(dados)) throw new Error('Resposta inválida da API');
  return dados.filter(isJob);
}
`,
    tests: [
      {
        description: 'devolve os jobs válidos',
        code: `assert.deepStrictEqual(lerJobs('[{"id":"J1","cliente":"Oficina do Tonho","valor":300}]'), [
  { id: 'J1', cliente: 'Oficina do Tonho', valor: 300 },
]);`,
      },
      {
        description: 'ignora os itens inválidos',
        code: `const jobs = lerJobs('[{"id":"J1","cliente":"A","valor":10},null,{"id":"J2"},{"id":"J3","cliente":"B","valor":"20"}]');
assert.strictEqual(jobs.length, 1);
assert.strictEqual(jobs[0]?.id, 'J1');`,
      },
      {
        description: 'resposta que não é array lança erro',
        code: `assert.throws(() => lerJobs('{"erro":"tente mais tarde"}'), /Resposta inválida da API/);
assert.throws(() => lerJobs('null'), /Resposta inválida da API/);`,
      },
    ],
    hints: [
      'Anote o tipo: `const dados: unknown = JSON.parse(json);`.',
      "`if (!Array.isArray(dados)) throw new Error('Resposta inválida da API');`",
      'Depois do `if`, `dados.filter(isJob)` já devolve `Job[]`.',
    ],
    followUpQuestionIds: ['typescript.m02.f21', 'typescript.m02.f22'],
    difficulty: 2,
  },
  {
    id: 'typescript.m02.d04',
    lessonId: 'typescript.m02.l04',
    kind: 'debug',
    title: 'O guard mentiroso',
    promptMarkdown:
      "A lista de contatos quebra com `Cannot read properties of undefined (reading 'replace')` quando a " +
      'API manda cliente sem WhatsApp. O type guard `isCliente` só confere o `nome` e jura para o ' +
      'TypeScript que o resto está lá. Conserte o guard para conferir **todos** os campos de `Cliente`.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `interface Cliente {
  nome: string;
  whatsapp: string;
}

function isCliente(x: unknown): x is Cliente {
  return typeof x === 'object' && x !== null && 'nome' in x && typeof x.nome === 'string';
}

function contatos(dados: unknown[]): string[] {
  return dados.filter(isCliente).map((c) => \`\${c.nome}: \${c.whatsapp.replace(/\\D/g, '')}\`);
}
`,
    solution: `interface Cliente {
  nome: string;
  whatsapp: string;
}

function isCliente(x: unknown): x is Cliente {
  return (
    typeof x === 'object' &&
    x !== null &&
    'nome' in x &&
    typeof x.nome === 'string' &&
    'whatsapp' in x &&
    typeof x.whatsapp === 'string'
  );
}

function contatos(dados: unknown[]): string[] {
  return dados.filter(isCliente).map((c) => \`\${c.nome}: \${c.whatsapp.replace(/\\D/g, '')}\`);
}
`,
    tests: [
      {
        description: 'recusa cliente sem WhatsApp ou com WhatsApp numérico',
        code: `assert.strictEqual(isCliente({ nome: 'Seu Zé' }), false);
assert.strictEqual(isCliente({ nome: 'Seu Zé', whatsapp: 11988887777 }), false);`,
      },
      {
        description: 'aceita cliente válido',
        code: "assert.strictEqual(isCliente({ nome: 'Dona Cida', whatsapp: '(11) 98888-7777' }), true);",
      },
      {
        description: 'contatos ignora os registros quebrados',
        code: `const r = contatos([{ nome: 'Dona Cida', whatsapp: '(11) 98888-7777' }, { nome: 'Seu Zé' }, null]);
assert.deepStrictEqual(r, ['Dona Cida: 11988887777']);`,
      },
    ],
    hints: [
      'O guard promete `x is Cliente`, mas só confere `nome`. Qual campo o `contatos` usa além dele?',
      "Acrescente `'whatsapp' in x && typeof x.whatsapp === 'string'`.",
    ],
    followUpQuestionIds: ['typescript.m02.f23', 'typescript.m02.f24'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- gerais ----
  {
    id: 'typescript.m02.q24',
    lessonIds: ['typescript.m02.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual é a assinatura de um type guard que diz se um valor qualquer é um `Job`?',
    options: [
      '`function isJob(x: unknown): x is Job`',
      '`function isJob(x: Job): boolean`',
      '`function isJob(x: unknown): Job`',
      '`function isJob(x: unknown): x as Job`',
    ],
    answerIndex: 0,
    explanation: 'Recebe `unknown` (pode vir qualquer coisa) e devolve o predicado `x is Job`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q25',
    lessonIds: ['typescript.m02.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const a = JSON.parse('{"valor":"300"}');
const b = JSON.parse('[1, 2]');
console.log(typeof a.valor);
console.log(typeof b, Array.isArray(b));
console.log(JSON.parse('null') === null);`,
    expectedOutput: 'string\nobject true\ntrue',
    explanation:
      'O JSON manda o que manda: `"300"` é texto, não número. Arrays são `object` para o `typeof`, e `null` é um JSON válido.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q26',
    lessonIds: ['typescript.m02.l04'],
    kind: 'true-false',
    prompt: 'Este código compila.',
    code: `const dados: unknown = JSON.parse('{"cliente":"Bar do Zé"}');
console.log(dados.cliente);`,
    answer: false,
    explanation: 'Com `unknown`, nada pode ser lido antes de uma checagem que estreite o tipo.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q27',
    lessonIds: ['typescript.m02.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual a diferença prática entre tratar o resultado de `JSON.parse` como `any` ou como `unknown`?',
    options: [
      'Com `unknown` você é obrigado a checar antes de usar; com `any` o TypeScript deixa tudo passar',
      'Nenhuma: os dois aceitam qualquer valor e qualquer uso',
      'Com `unknown`, o `JSON.parse` valida o formato sozinho',
      '`any` é mais seguro, porque é mais genérico',
    ],
    answerIndex: 0,
    explanation: 'Os dois aceitam qualquer valor, mas só o `any` aceita qualquer **uso** sem checar.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q28',
    lessonIds: ['typescript.m02.l04'],
    kind: 'true-false',
    prompt:
      'O TypeScript confere se o corpo de um type guard (`x is Job`) realmente checa todos os campos de `Job`.',
    answer: false,
    explanation:
      'O predicado é uma promessa: o TypeScript acredita. Se o guard checar pouco, o erro aparece só em tempo de execução.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q29',
    lessonIds: ['typescript.m02.l04'],
    kind: 'fill-blank',
    prompt: 'Complete o predicado de tipo.',
    code: `function isPix(p: Pagamento): p ___ Pix {
  return p.tipo === 'pix';
}`,
    acceptedAnswers: ['is'],
    explanation: '`p is Pix` diz ao TypeScript que, quando a função devolve `true`, `p` é um `Pix`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q30',
    lessonIds: ['typescript.m02.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function pareceJob(x) {
  return typeof x === 'object' && 'id' in x;
}
try {
  console.log(pareceJob({ id: 'J1' }));
  console.log(pareceJob(null));
} catch (e) {
  console.log('quebrou:', e.constructor.name);
}`,
    expectedOutput: 'true\nquebrou: TypeError',
    explanation:
      "`typeof null` é `'object'`, então o código chega no `'id' in null`, que lança `TypeError`. Faltou o `x !== null`.",
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q31',
    lessonIds: ['typescript.m02.l04'],
    kind: 'multiple-choice',
    prompt: 'Com `dados: unknown[]` e `isJob(x: unknown): x is Job`, qual o tipo de `jobs`?',
    code: 'const jobs = dados.filter(isJob);',
    options: ['`Job[]`', '`unknown[]`', '`boolean[]`', '`(Job | unknown)[]`'],
    answerIndex: 0,
    explanation: 'O `filter` reconhece o type guard e devolve o array já com o tipo estreitado.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m02.f19',
    lessonIds: ['typescript.m02.l04'],
    exerciseId: 'typescript.m02.e07',
    kind: 'multiple-choice',
    prompt: "Por que o seu `isJob` checa `x !== null` logo depois de `typeof x === 'object'`?",
    options: [
      "Porque `typeof null` também é `'object'`, e `'id' in null` lançaria `TypeError`",
      'Porque JSON não pode ter `null`',
      'Porque `x !== null` transforma `x` em `Job`',
      'Por estilo: não muda nada',
    ],
    answerIndex: 0,
    explanation: 'É o buraco mais clássico de validação: `null` passa no `typeof` e quebra no `in`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f20',
    lessonIds: ['typescript.m02.l04'],
    exerciseId: 'typescript.m02.e07',
    kind: 'true-false',
    prompt:
      'Se o retorno de `isJob` fosse só `boolean` (sem `x is Job`), dentro de `if (isJob(dado))` o TypeScript continuaria tratando `dado` como `unknown`.',
    answer: true,
    explanation:
      'Sem o predicado, o `true` não diz nada ao compilador. Por isso o teste de `dado.valor` falhava.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f21',
    lessonIds: ['typescript.m02.l04'],
    exerciseId: 'typescript.m02.e08',
    kind: 'multiple-choice',
    prompt:
      'Na sua `lerJobs`, depois de `if (!Array.isArray(dados)) throw ...`, o que o TypeScript sabe sobre `dados`?',
    options: [
      'Que é um array: o `throw` eliminou o resto',
      'Nada: continua `unknown`',
      'Que já é `Job[]`',
      'Que é uma string',
    ],
    answerIndex: 0,
    explanation: 'O `throw` funciona como o `return`: o que passa da linha é só o que não entrou no `if`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f22',
    lessonIds: ['typescript.m02.l04'],
    exerciseId: 'typescript.m02.e08',
    kind: 'true-false',
    prompt: 'Na sua solução, `dados.filter(isJob)` devolve `Job[]` porque `isJob` é um type guard.',
    answer: true,
    explanation:
      'Com uma função `(x) => boolean` comum, o `filter` devolveria o mesmo tipo do array original.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f23',
    lessonIds: ['typescript.m02.l04'],
    exerciseId: 'typescript.m02.d04',
    kind: 'multiple-choice',
    prompt: 'Por que o código com defeito compilava, mesmo quebrando em tempo de execução?',
    options: [
      'Porque o TypeScript acredita no predicado `x is Cliente`; ele não confere o que o guard checa',
      'Porque `unknown` desliga a checagem de tipos',
      'Porque `replace` aceita `undefined`',
      'Porque `filter` ignora os tipos',
    ],
    answerIndex: 0,
    explanation:
      'O guard prometeu um `Cliente` completo; o `.map` confiou e leu `c.whatsapp`, que não existia.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.f24',
    lessonIds: ['typescript.m02.l04'],
    exerciseId: 'typescript.m02.d04',
    kind: 'true-false',
    prompt: "Depois da sua correção, `isCliente({ nome: 'Seu Zé', whatsapp: 11988887777 })` devolve `false`.",
    answer: true,
    explanation: "O WhatsApp veio como número, e o guard agora exige `typeof x.whatsapp === 'string'`.",
    difficulty: 1,
  },
];
