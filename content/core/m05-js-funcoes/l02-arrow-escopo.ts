import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m05.l02',
  moduleId: 'core.m05',
  order: 2,
  title: 'Arrow functions, valores padrão e escopo',
  concepts: ['arrow function', 'retorno implícito', 'parâmetro padrão', 'escopo de bloco', 'let e const'],
  sections: [
    {
      kind: 'text',
      markdown:
        'Existe um jeito mais curto de escrever funções: a **arrow function** (função flecha). Ela costuma ' +
        'ser guardada numa `const`:\n\n' +
        '```js\nconst precoKm = (km) => km * 4.5;\n```\n\n' +
        '- Os parâmetros vêm entre parênteses, depois a flecha `=>`.\n' +
        '- Se o corpo é **uma expressão só**, sem chaves, o resultado é devolvido sozinho (**retorno ' +
        'implícito**).\n' +
        '- Se você abrir chaves `{ }`, volta a ser um bloco normal e precisa de `return`:\n\n' +
        '```js\nconst precoKm = (km) => {\n  return km * 4.5;\n};\n```',
    },
    {
      kind: 'text',
      markdown:
        '**Parâmetro padrão**: se o argumento não vier (ou vier `undefined`), o parâmetro usa o valor ' +
        'depois do `=`.\n\n' +
        '```js\nfunction cobrar(horas, valorHora = 30) {\n  return horas * valorHora;\n}\n' +
        'cobrar(2);     // 60, usou o padrão\ncobrar(2, 50); // 100\n```\n\n' +
        '**Escopo**: `let` e `const` só existem dentro do bloco `{ }` onde foram criadas (um `if`, um laço, ' +
        'uma função). Fora dele, o nome não existe e usar dá `ReferenceError`. Uma variável de dentro pode ' +
        'até ter o mesmo nome de uma de fora: a de dentro "esconde" a de fora só ali dentro.\n\n' +
        'Lembrete: `const` não pode receber outro valor com `=`; use `let` para o que muda.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const precoKm = (km) => km * 4.5;
const comTaxa = (valor, taxa = 0.1) => valor + valor * taxa;

console.log(precoKm(10));
console.log(comTaxa(100));
console.log(comTaxa(100, 0.5));`,
      explanation: 'Sem o segundo argumento, `comTaxa` usa a taxa padrão de 10%.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const cliente = 'Padaria Pão de Ontem';
if (cliente.length > 10) {
  const aviso = 'Nome comprido, não cabe no banner!';
  console.log(aviso);
}
console.log(typeof aviso);`,
      explanation:
        '`aviso` só existe dentro das chaves do `if`. Fora dele o nome não está definido (`typeof` devolve "undefined").',
    },
  ],
  checkQuestionIds: ['core.m05.q09'],
  exerciseIds: ['core.m05.e02'],
  debugExerciseIds: ['core.m05.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m05.e02',
    lessonId: 'core.m05.l02',
    kind: 'implement',
    title: 'Orçamento de estagiário',
    promptMarkdown:
      'Complete a arrow function `orcamento(horas, valorHora)`, que devolve `horas * valorHora`. Se o ' +
      'cliente não disser o valor da hora, use o padrão de **R$ 30** (o preço de estagiário, com dor no ' +
      'coração).\n\nExemplos: `orcamento(2)` → 60; `orcamento(2, 50)` → 100.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const orcamento = (horas, valorHora) => {
  // seu código aqui
};
`,
    solution: `const orcamento = (horas, valorHora = 30) => horas * valorHora;
`,
    tests: [
      {
        description: 'sem valor da hora, 2 horas custam R$ 60',
        code: 'assert.strictEqual(orcamento(2), 60);',
      },
      {
        description: '2 horas a R$ 50 custam R$ 100',
        code: 'assert.strictEqual(orcamento(2, 50), 100);',
      },
      {
        description: 'orcamento continua sendo uma arrow function',
        code: "assert.strictEqual(typeof orcamento, 'function');\nassert.ok(!('prototype' in orcamento), 'Use uma arrow function (=>).');",
      },
    ],
    hints: [
      'O valor padrão vai na lista de parâmetros: `(horas, valorHora = 30)`.',
      'Com chaves, não esqueça o `return`. Ou tire as chaves e use o retorno implícito.',
    ],
    followUpQuestionIds: ['core.m05.f05', 'core.m05.f06'],
    difficulty: 1,
  },
  {
    id: 'core.m05.d02',
    lessonId: 'core.m05.l02',
    kind: 'debug',
    title: 'O frete que não volta',
    promptMarkdown:
      'A arrow function `freteComPedagio(km, pedagio)` deveria devolver `km * 4.5 + pedagio` (o pedágio é ' +
      '0 se não for informado). Mas ela sempre devolve `undefined`. Encontre o defeito.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const freteComPedagio = (km, pedagio = 0) => {
  km * 4.5 + pedagio;
};
`,
    solution: `const freteComPedagio = (km, pedagio = 0) => {
  return km * 4.5 + pedagio;
};
`,
    tests: [
      {
        description: '10 km sem pedágio dão R$ 45',
        code: 'assert.strictEqual(freteComPedagio(10), 45);',
      },
      {
        description: '10 km com R$ 12 de pedágio dão R$ 57',
        code: 'assert.strictEqual(freteComPedagio(10, 12), 57);',
      },
    ],
    hints: ['Com chaves `{ }`, a arrow function não devolve nada sozinha.'],
    followUpQuestionIds: ['core.m05.f07', 'core.m05.f08'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m05.q09',
    lessonIds: ['core.m05.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const dobro = (n) => n * 2;
console.log(dobro(21));`,
    expectedOutput: '42',
    explanation: 'Sem chaves, a arrow function devolve a expressão `n * 2` automaticamente.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q10',
    lessonIds: ['core.m05.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function cobrar(valor, desconto = 0) {
  return valor - desconto;
}
console.log(cobrar(100));
console.log(cobrar(100, 20));`,
    expectedOutput: '100\n80',
    explanation: 'Na primeira chamada `desconto` usa o padrão 0; na segunda recebe 20.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q11',
    lessonIds: ['core.m05.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `let status = 'livre';
if (status === 'livre') {
  let status = 'ocupado';
  console.log(status);
}
console.log(status);`,
    expectedOutput: 'ocupado\nlivre',
    explanation:
      'O `let status` de dentro do `if` é outra variável, que só existe naquele bloco. A de fora continua "livre".',
    difficulty: 2,
  },
  {
    id: 'core.m05.q12',
    lessonIds: ['core.m05.l02'],
    kind: 'true-false',
    prompt: 'A função `const soma = (a, b) => { a + b; };` devolve a soma de `a` e `b`.',
    answer: false,
    explanation: 'Com chaves, o retorno implícito acaba: falta `return a + b;`. Ela devolve `undefined`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q13',
    lessonIds: ['core.m05.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual destas é uma arrow function válida que devolve o triplo de um número?',
    options: [
      'const triplo = (n) => n * 3;',
      'const triplo = n -> n * 3;',
      'const triplo => (n) n * 3;',
      'function triplo => n * 3;',
    ],
    answerIndex: 0,
    explanation: 'Parâmetros entre parênteses, flecha `=>` (igual e maior) e a expressão.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q14',
    lessonIds: ['core.m05.l02'],
    kind: 'multiple-choice',
    prompt: 'O que acontece quando este código roda?',
    code: `function calcular() {
  const taxa = 0.1;
  return taxa;
}
calcular();
console.log(taxa);`,
    options: [
      'Dá erro: `taxa` não está definida fora da função',
      'Imprime 0.1',
      'Imprime undefined',
      'Imprime null',
    ],
    answerIndex: 0,
    explanation:
      '`taxa` só existe dentro da função. Fora dela o nome não existe e o Node lança `ReferenceError`.',
    difficulty: 2,
  },
  {
    id: 'core.m05.q15',
    lessonIds: ['core.m05.l02'],
    kind: 'true-false',
    prompt:
      'Uma variável declarada com `const` pode receber outro valor com `=` depois, se for no mesmo bloco.',
    answer: false,
    explanation:
      '`const` nunca pode ser reatribuída. Para valores que mudam (contadores, totais), use `let`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q16',
    lessonIds: ['core.m05.l02'],
    kind: 'fill-blank',
    prompt: 'Complete para que `saudar()` sem argumento imprima "Olá, cliente".',
    code: `const saudar = (nome = ___) => 'Olá, ' + nome;
console.log(saudar());`,
    acceptedAnswers: ["'cliente'", '"cliente"', '`cliente`'],
    explanation: 'O valor padrão vem depois do `=` no parâmetro e precisa ser um texto entre aspas.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'core.m05.f05',
    lessonIds: ['core.m05.l02'],
    exerciseId: 'core.m05.e02',
    kind: 'multiple-choice',
    prompt: 'Com a sua `orcamento`, quanto devolve `orcamento(3)`?',
    options: ['90', 'NaN', '3', 'undefined'],
    answerIndex: 0,
    explanation: 'Sem o segundo argumento, `valorHora` vale 30: 3 × 30 = 90.',
    difficulty: 1,
  },
  {
    id: 'core.m05.f06',
    lessonIds: ['core.m05.l02'],
    exerciseId: 'core.m05.e02',
    kind: 'true-false',
    prompt: 'Na sua `orcamento`, chamar `orcamento(2, undefined)` também usa o valor padrão de R$ 30.',
    answer: true,
    explanation:
      'O valor padrão entra quando o argumento falta **ou** chega como `undefined`. Resultado: 60.',
    difficulty: 2,
  },
  {
    id: 'core.m05.f07',
    lessonIds: ['core.m05.l02'],
    exerciseId: 'core.m05.d02',
    kind: 'multiple-choice',
    prompt: 'Por que a versão com defeito de `freteComPedagio` devolvia `undefined`?',
    options: [
      'Com chaves `{ }`, a arrow function precisa de `return` explícito',
      'Porque `pedagio = 0` apaga o valor de `km`',
      'Porque arrow functions não podem ter dois parâmetros',
      'Porque 4.5 não é um número inteiro',
    ],
    answerIndex: 0,
    explanation: 'A conta era feita e jogada fora. Com `return` (ou sem as chaves) o valor volta.',
    difficulty: 1,
  },
  {
    id: 'core.m05.f08',
    lessonIds: ['core.m05.l02'],
    exerciseId: 'core.m05.d02',
    kind: 'fill-blank',
    prompt: 'Outro conserto possível: tirar as chaves. Complete com a expressão devolvida.',
    code: 'const freteComPedagio = (km, pedagio = 0) => ___;',
    acceptedAnswers: [
      'km * 4.5 + pedagio',
      'km*4.5+pedagio',
      '4.5 * km + pedagio',
      'pedagio + km * 4.5',
      '(km * 4.5) + pedagio',
    ],
    explanation: 'Sem chaves, a expressão depois da flecha é devolvida automaticamente.',
    difficulty: 2,
  },
];
