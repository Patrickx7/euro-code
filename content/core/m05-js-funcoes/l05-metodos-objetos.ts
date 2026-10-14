import type { Exercise, Lesson, Question } from '../../../src/shared/content';

const JOBS_DO_DIA = `const jobs = [
  { cliente: 'Padaria Pão de Ontem', valor: 80 },
  { cliente: 'Bar do Tonhão', valor: 40 },
  { cliente: 'Auto Peças Parafuso Solto', valor: 120 },
];`;

export const lesson: Lesson = {
  id: 'core.m05.l05',
  moduleId: 'core.m05',
  order: 5,
  title: 'Objetos e map, filter, reduce, find',
  concepts: ['objeto', 'acesso com ponto', 'callback', 'map', 'filter', 'reduce', 'find'],
  sections: [
    {
      kind: 'text',
      markdown:
        'Um job tem cliente, valor, bairro... Para juntar tudo numa coisa só, use um **objeto**: pares ' +
        '`chave: valor` entre chaves.\n\n' +
        "```js\nconst job = { cliente: 'Bar do Tonhão', valor: 40, bairro: 'Km 18' };\n```\n\n" +
        '- Leia um campo com **ponto**: `job.valor` vale 40.\n' +
        '- Mude ou crie um campo do mesmo jeito: `job.valor = 50;`, `job.pago = false;`.\n' +
        '- Um campo que não existe vale `undefined`.\n\n' +
        'E o normal é ter um **array de objetos**: a lista de jobs do dia, cada um com seus campos.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const job = { cliente: 'Bar do Tonhão', valor: 40, bairro: 'Km 18' };
console.log(job.cliente);
job.valor = job.valor + 10;
job.pago = false;
console.log(job);`,
      explanation:
        'O `console.log` do objeto inteiro mostra todos os campos, inclusive o `pago` que acabou de nascer.',
    },
    {
      kind: 'text',
      markdown:
        'Os arrays têm métodos que recebem uma **função como argumento**: o **callback**. O método chama ' +
        'o seu callback uma vez para cada item. Quase sempre o callback é uma arrow function curtinha.\n\n' +
        '- **`map`** transforma cada item e devolve um array **novo**, do mesmo tamanho.\n' +
        '- **`filter`** devolve um array novo só com os itens em que o callback devolveu `true`.\n' +
        '- **`find`** devolve o **primeiro item** que passa no teste (o item, não um array), ou ' +
        '`undefined` se nenhum passar.\n' +
        '- **`reduce`** junta tudo num valor só. O callback recebe o **acumulador** (o total até agora) e ' +
        'o item, e devolve o novo acumulador. O segundo argumento do `reduce` é o valor inicial: use `0` ' +
        'para somas.\n\n' +
        'Nenhum deles muda o array original.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `${JOBS_DO_DIA}

const nomes = jobs.map((job) => job.cliente);
const bons = jobs.filter((job) => job.valor > 50);
const total = jobs.reduce((soma, job) => soma + job.valor, 0);
const baratinho = jobs.find((job) => job.valor < 50);

console.log(nomes.length + ' clientes hoje');
console.log(bons.length + ' jobs acima de R$ 50');
console.log('Total do dia: R$ ' + total);
console.log('O mais barato: ' + baratinho.cliente);`,
      explanation: '`reduce` começa com `soma = 0` e vai somando: 0 + 80, 80 + 40, 120 + 120 = 240.',
    },
  ],
  checkQuestionIds: ['core.m05.q34'],
  exerciseIds: ['core.m05.e06', 'core.m05.e07'],
  debugExerciseIds: ['core.m05.d05'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m05.e06',
    lessonId: 'core.m05.l05',
    kind: 'implement',
    title: 'Fechamento do dia',
    promptMarkdown:
      'Hora de ver se o dia valeu a gasolina. Crie a função `totalDoDia(jobs)` que recebe um array de ' +
      'objetos `{ cliente, valor }` e devolve a **soma dos valores**. Use `reduce`. Dia sem job (array ' +
      'vazio) dá 0.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function totalDoDia(jobs) {
  // seu código aqui
}
`,
    solution: `function totalDoDia(jobs) {
  return jobs.reduce((soma, job) => soma + job.valor, 0);
}
`,
    tests: [
      {
        description: 'soma os três jobs do dia: R$ 240',
        code: `${JOBS_DO_DIA}\nassert.strictEqual(totalDoDia(jobs), 240);`,
      },
      {
        description: 'um job só vale ele mesmo',
        code: "assert.strictEqual(totalDoDia([{ cliente: 'Bar do Tonhão', valor: 40 }]), 40);",
      },
      {
        description: 'dia sem job dá R$ 0',
        code: 'assert.strictEqual(totalDoDia([]), 0);',
      },
    ],
    hints: [
      'O callback do `reduce` recebe `(soma, job)` e devolve `soma + job.valor`.',
      'Não esqueça o valor inicial `0` como segundo argumento do `reduce`, e o `return` da função.',
    ],
    followUpQuestionIds: ['core.m05.f19', 'core.m05.f20'],
    difficulty: 2,
  },
  {
    id: 'core.m05.e07',
    lessonId: 'core.m05.l05',
    kind: 'implement',
    title: 'Só os jobs que pagam a gasolina',
    promptMarkdown:
      'Crie a função `jobsQueValem(jobs, minimo)` que devolve um array com os **nomes dos clientes** ' +
      '(`cliente`) dos jobs que pagam **mais** que `minimo`, na mesma ordem. Combine `filter` e `map`.\n\n' +
      "Exemplo: com mínimo 50, os jobs do dia viram `['Padaria Pão de Ontem', 'Auto Peças Parafuso Solto']`.",
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function jobsQueValem(jobs, minimo) {
  return jobs.map((job) => job.cliente);
}
`,
    solution: `function jobsQueValem(jobs, minimo) {
  return jobs.filter((job) => job.valor > minimo).map((job) => job.cliente);
}
`,
    tests: [
      {
        description: 'com mínimo de R$ 50, sobram a padaria e a auto peças',
        code: `${JOBS_DO_DIA}\nassert.deepStrictEqual(jobsQueValem(jobs, 50), ['Padaria Pão de Ontem', 'Auto Peças Parafuso Solto']);`,
      },
      {
        description: 'um job que paga exatamente o mínimo não entra',
        code: `${JOBS_DO_DIA}\nassert.deepStrictEqual(jobsQueValem(jobs, 80), ['Auto Peças Parafuso Solto']);`,
      },
      {
        description: 'se nenhum job vale a pena, devolve um array vazio',
        code: `${JOBS_DO_DIA}\nassert.deepStrictEqual(jobsQueValem(jobs, 500), []);`,
      },
    ],
    hints: [
      'Primeiro `filter((job) => job.valor > minimo)`, depois `map((job) => job.cliente)`.',
      'Dá para encadear: `jobs.filter(...).map(...)`, porque o `filter` devolve um array.',
    ],
    followUpQuestionIds: ['core.m05.f21', 'core.m05.f22'],
    difficulty: 2,
  },
  {
    id: 'core.m05.d05',
    lessonId: 'core.m05.l05',
    kind: 'debug',
    title: 'Cadê o job do cliente?',
    promptMarkdown:
      'A função `buscarJob(jobs, cliente)` deveria devolver **o objeto** do job daquele cliente (ou ' +
      "`undefined` se ele não existir). Mas quem usa `buscarJob(jobs, 'Bar do Tonhão').valor` recebe " +
      '`undefined` em vez de 40. Conserte.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function buscarJob(jobs, cliente) {
  return jobs.filter((job) => job.cliente === cliente);
}
`,
    solution: `function buscarJob(jobs, cliente) {
  return jobs.find((job) => job.cliente === cliente);
}
`,
    tests: [
      {
        description: 'acha o job do Bar do Tonhão e o valor é 40',
        code: `${JOBS_DO_DIA}\nassert.strictEqual(buscarJob(jobs, 'Bar do Tonhão').valor, 40);`,
      },
      {
        description: 'devolve o próprio objeto da lista',
        code: `${JOBS_DO_DIA}\nassert.strictEqual(buscarJob(jobs, 'Padaria Pão de Ontem'), jobs[0]);`,
      },
      {
        description: 'cliente que não existe dá undefined',
        code: `${JOBS_DO_DIA}\nassert.strictEqual(buscarJob(jobs, 'Pizzaria Massa Crua'), undefined);`,
      },
    ],
    hints: ['`filter` sempre devolve um array, mesmo com um item só. Qual método devolve o item direto?'],
    followUpQuestionIds: ['core.m05.f23', 'core.m05.f24'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m05.q34',
    lessonIds: ['core.m05.l05'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const job = { cliente: 'Bar do Tonhão', valor: 40 };
console.log(job.cliente);
console.log(job.valor * 2);`,
    expectedOutput: 'Bar do Tonhão\n80',
    explanation: 'Com o ponto você lê cada campo do objeto: `job.cliente` e `job.valor`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q35',
    lessonIds: ['core.m05.l05'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const valores = [10, 20, 30];
const dobrados = valores.map((v) => v * 2);
console.log(dobrados);
console.log(valores);`,
    expectedOutput: '[ 20, 40, 60 ]\n[ 10, 20, 30 ]',
    explanation: '`map` cria um array novo; o original continua igual.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q36',
    lessonIds: ['core.m05.l05'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const pagamentos = [30, 80, 45, 120];
console.log(pagamentos.filter((p) => p > 50));`,
    expectedOutput: '[ 80, 120 ]',
    explanation: 'Só ficam os itens em que o callback devolve `true`: 80 e 120.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q37',
    lessonIds: ['core.m05.l05'],
    kind: 'predict-output',
    prompt: 'A média das suas avaliações. O que este código imprime?',
    code: `const estrelas = [5, 3, 4];
const soma = estrelas.reduce((total, e) => total + e, 0);
console.log(soma / estrelas.length);`,
    expectedOutput: '4',
    explanation: 'O `reduce` soma 5 + 3 + 4 = 12; dividido por 3 avaliações dá 4.',
    difficulty: 2,
  },
  {
    id: 'core.m05.q38',
    lessonIds: ['core.m05.l05'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const clientes = [
  { nome: 'Padaria Pão de Ontem', km: 3 },
  { nome: 'Bar do Tonhão', km: 15 },
];
const longe = clientes.find((c) => c.km > 10);
console.log(longe.nome);
console.log(clientes.find((c) => c.km > 100));`,
    expectedOutput: 'Bar do Tonhão\nundefined',
    explanation: '`find` devolve o primeiro item que passa no teste, ou `undefined` se nenhum passar.',
    difficulty: 2,
  },
  {
    id: 'core.m05.q39',
    lessonIds: ['core.m05.l05'],
    kind: 'multiple-choice',
    prompt: 'Você quer uma lista nova só com os jobs que pagam mais de R$ 50. Qual método usa?',
    options: ['filter', 'map', 'find', 'push'],
    answerIndex: 0,
    explanation: '`filter` escolhe quais itens ficam. `map` transforma todos, `find` devolve só um.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q40',
    lessonIds: ['core.m05.l05'],
    kind: 'true-false',
    prompt: '`map` devolve um array novo com o mesmo número de itens do original.',
    answer: true,
    explanation: '`map` transforma cada item, um para um. Para tirar itens, use `filter`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q41',
    lessonIds: ['core.m05.l05'],
    kind: 'fill-blank',
    prompt: 'Complete para criar um array só com os nomes dos clientes.',
    code: 'const nomes = jobs.___((job) => job.cliente);',
    acceptedAnswers: ['map'],
    explanation: '`map` transforma cada objeto de job no seu campo `cliente`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q42',
    lessonIds: ['core.m05.l05'],
    kind: 'multiple-choice',
    prompt: 'Em `jobs.filter((job) => job.valor > 50)`, o que é `(job) => job.valor > 50`?',
    options: [
      'Um callback: uma função passada como argumento, que o `filter` chama para cada item',
      'Um objeto com a chave `job`',
      'Um laço `for` escrito de outro jeito',
      'O valor inicial do `filter`',
    ],
    answerIndex: 0,
    explanation: 'Você não chama o callback: o `filter` chama, uma vez por item, e olha o que ele devolve.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q43',
    lessonIds: ['core.m05.l05'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const carro = { modelo: 'Quadradão', km: 300000 };
carro.km = carro.km + 15;
carro.cor = 'ferrugem';
console.log(carro);`,
    expectedOutput: "{ modelo: 'Quadradão', km: 300015, cor: 'ferrugem' }",
    explanation: 'Atribuir com ponto muda um campo que existe (`km`) ou cria um novo (`cor`).',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'core.m05.f19',
    lessonIds: ['core.m05.l05'],
    exerciseId: 'core.m05.e06',
    kind: 'multiple-choice',
    prompt: 'Na sua `totalDoDia`, para que serve o `0` passado para o `reduce`?',
    options: [
      'É o valor inicial do acumulador: a soma começa em 0 e a lista vazia dá 0',
      'Diz para o `reduce` começar pelo índice 0',
      'Limita o total a no máximo 0',
      'Não serve para nada, é só costume',
    ],
    answerIndex: 0,
    explanation:
      'Sem o valor inicial, `reduce` num array vazio dá erro e a soma começaria pelo objeto do 1º job.',
    difficulty: 2,
  },
  {
    id: 'core.m05.f20',
    lessonIds: ['core.m05.l05'],
    exerciseId: 'core.m05.e06',
    kind: 'predict-output',
    prompt: 'Usando a sua `totalDoDia`, o que este código imprime?',
    code: `function totalDoDia(jobs) {
  return jobs.reduce((soma, job) => soma + job.valor, 0);
}
const semana = [
  { cliente: 'Padaria Pão de Ontem', valor: 35 },
  { cliente: 'Bar do Tonhão', valor: 15 },
];
console.log('Semana: R$ ' + totalDoDia(semana));`,
    expectedOutput: 'Semana: R$ 50',
    explanation: '0 + 35 + 15 = 50. Uma semana de freela, R$ 50. Bem-vindo à vida de estagiário.',
    difficulty: 1,
  },
  {
    id: 'core.m05.f21',
    lessonIds: ['core.m05.l05'],
    exerciseId: 'core.m05.e07',
    kind: 'predict-output',
    prompt: 'Usando a sua `jobsQueValem`, o que este código imprime?',
    code: `function jobsQueValem(jobs, minimo) {
  return jobs.filter((job) => job.valor > minimo).map((job) => job.cliente);
}
const jobs = [
  { cliente: 'Bar do Tonhão', valor: 40 },
  { cliente: 'Pizzaria Massa Crua', valor: 60 },
];
console.log(jobsQueValem(jobs, 30));`,
    expectedOutput: "[ 'Bar do Tonhão', 'Pizzaria Massa Crua' ]",
    explanation: 'Os dois pagam mais de 30, então os dois nomes ficam, na ordem original.',
    difficulty: 2,
  },
  {
    id: 'core.m05.f22',
    lessonIds: ['core.m05.l05'],
    exerciseId: 'core.m05.e07',
    kind: 'multiple-choice',
    prompt:
      'Na sua `jobsQueValem`, o que aconteceria se você fizesse o `map` **antes** do `filter`, com os mesmos callbacks?',
    options: [
      'O `filter` receberia só os nomes (textos); `job.valor` seria `undefined` e nada passaria',
      'Daria o mesmo resultado',
      'Viria um array com os objetos inteiros',
      'Daria erro de sintaxe',
    ],
    answerIndex: 0,
    explanation: 'Depois do `map` só sobram textos, que não têm `valor`. `undefined > 50` é `false`.',
    difficulty: 3,
  },
  {
    id: 'core.m05.f23',
    lessonIds: ['core.m05.l05'],
    exerciseId: 'core.m05.d05',
    kind: 'multiple-choice',
    prompt: "Antes do conserto, o que `buscarJob(jobs, 'Bar do Tonhão')` devolvia?",
    options: [
      'Um array com o objeto do job dentro',
      'O objeto do job',
      'undefined',
      "O texto 'Bar do Tonhão'",
    ],
    answerIndex: 0,
    explanation: '`filter` devolve um array, então `.valor` era lido do array (que não tem esse campo).',
    difficulty: 2,
  },
  {
    id: 'core.m05.f24',
    lessonIds: ['core.m05.l05'],
    exerciseId: 'core.m05.d05',
    kind: 'predict-output',
    prompt: 'Comparando a versão com defeito e a consertada quando o cliente não existe: o que imprime?',
    code: `const jobs = [{ cliente: 'Bar do Tonhão', valor: 40 }];
console.log(jobs.filter((job) => job.cliente === 'Ninguém'));
console.log(jobs.find((job) => job.cliente === 'Ninguém'));`,
    expectedOutput: '[]\nundefined',
    explanation: 'Sem resultado, `filter` devolve um array vazio e `find` devolve `undefined`.',
    difficulty: 2,
  },
];
