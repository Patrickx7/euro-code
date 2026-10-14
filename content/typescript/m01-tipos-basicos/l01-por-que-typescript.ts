import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m01.l01',
  moduleId: 'typescript.m01',
  order: 1,
  title: 'Por que TypeScript: o erro aparece antes do cliente ver',
  concepts: [
    'tipagem estática',
    'erro em tempo de compilação',
    'anotação de tipo',
    'inferência de tipo',
    'tipos somem ao rodar',
    'modo strict',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Parabéns pela promoção a **Pleno**! Agora os clientes maiores mandam o código em **TypeScript**, e ' +
        'você vai entender o porquê na primeira sexta-feira à noite.\n\n' +
        "Em JavaScript, os erros de tipo só aparecem **quando o código roda**: `'100' + 15` vira `'10015'` " +
        'sem nenhum aviso, e o cliente descobre na nota fiscal. O TypeScript é **JavaScript com tipos**: você ' +
        'diz o que cada valor é, e o compilador (`tsc`) confere o programa inteiro **antes de rodar**.\n\n' +
        'Três coisas que você ganha:\n\n' +
        '- **erros antes de rodar**: passar texto onde se espera número nem compila;\n' +
        '- **autocompletar** de verdade: o editor sabe quais propriedades e métodos um valor tem;\n' +
        '- **documentação que não mente**: a assinatura da função diz o que ela recebe e devolve.\n\n' +
        'Importante: os tipos **somem** quando o código vira JavaScript. O Node nunca vê o `: number`; a ' +
        'checagem acontece só na compilação.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `let preco: number = 150;
preco = 180; // ok
preco = 'cento e oitenta';
// ❌ Type 'string' is not assignable to type 'number'.`,
      explanation:
        'A anotação `: number` vem depois do nome. Atribuir texto vira erro no editor, antes de rodar.',
    },
    {
      kind: 'text',
      markdown:
        '**Anotações** em parâmetros e no retorno de funções ficam depois de cada nome:\n\n' +
        '```ts\nfunction orcamento(horas: number, valorHora: number): number {\n  return horas * valorHora;\n}\n```\n\n' +
        'Mas você não precisa anotar tudo. Com **inferência**, o TypeScript descobre o tipo pelo valor:\n\n' +
        "- `let cidade = 'Osasco'` → `cidade` é `string`;\n" +
        '- `let km = 18` → `km` é `number`;\n' +
        '- o retorno de `orcamento` seria inferido como `number` mesmo sem o `: number`.\n\n' +
        'A regra prática: **anote os parâmetros** (o TS não tem como adivinhar o que vão passar) e deixe a ' +
        'inferência cuidar das variáveis com valor inicial. No **modo strict**, que é o que os projetos ' +
        "sérios usam, parâmetro sem tipo é erro: `Parameter 'horas' implicitly has an 'any' type`.",
    },
    {
      kind: 'example',
      language: 'ts',
      code: `function totalComFrete(produto: number, frete: number) {
  return produto + frete; // retorno inferido: number
}

const total = totalComFrete(120, 15); // total: number
totalComFrete('120', 15);
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
totalComFrete(120);
// ❌ Expected 2 arguments, but got 1.`,
      explanation:
        'Passe o mouse sobre `total` no editor e ele mostra `number`, sem você ter escrito nada. A chamada com texto e a com argumento faltando nem chegam a rodar.',
    },
  ],
  checkQuestionIds: ['typescript.m01.q01'],
  exerciseIds: ['typescript.m01.e01'],
  debugExerciseIds: ['typescript.m01.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m01.e01',
    lessonId: 'typescript.m01.l01',
    kind: 'implement',
    title: 'Migrar a calculadora de orçamento',
    promptMarkdown:
      'A calculadora de orçamento do cliente funciona em JavaScript, mas o sobrinho dele já chamou ' +
      "`calcularOrcamento('3', 80)` e o sistema cobrou um valor que ninguém entendeu.\n\n" +
      'Migre a função para TypeScript: **anote** os parâmetros `horas` e `valorHora` como números e o ' +
      'retorno como número. A conta continua a mesma: horas × valor da hora + **R$ 30** de deslocamento.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function calcularOrcamento(horas, valorHora) {
  return horas * valorHora + 30;
}
`,
    solution: `function calcularOrcamento(horas: number, valorHora: number): number {
  return horas * valorHora + 30;
}
`,
    tests: [
      {
        description: '3 horas a R$ 80 dão R$ 270',
        code: 'assert.strictEqual(calcularOrcamento(3, 80), 270);',
      },
      {
        description: '0 horas: só o deslocamento',
        code: 'assert.strictEqual(calcularOrcamento(0, 120), 30);',
      },
      {
        description: "calcularOrcamento('3', 80) não compila",
        code: `const chamadaDoSobrinho = () => {
  // @ts-expect-error
  calcularOrcamento('3', 80);
};`,
      },
      {
        description: 'o resultado é um number',
        code: `const usoErrado = () => {
  // @ts-expect-error
  const texto: string = calcularOrcamento(1, 50);
};`,
      },
    ],
    hints: [
      'Anotação vem depois do nome, com dois-pontos: `horas: number`.',
      'O tipo do retorno fica depois dos parênteses: `function f(a: number): number { ... }`.',
    ],
    followUpQuestionIds: ['typescript.m01.f01', 'typescript.m01.f02'],
    difficulty: 1,
  },
  {
    id: 'typescript.m01.d01',
    lessonId: 'typescript.m01.l01',
    kind: 'debug',
    title: 'O frete de R$ 12.015',
    promptMarkdown:
      'A loja do cliente cobrou **R$ 12015** de um produto de R$ 120 com R$ 15 de frete. Em JavaScript ' +
      'ninguém viu nada; no TypeScript o editor já está sublinhando a linha culpada.\n\n' +
      'O preço chega como **texto** do campo do formulário. Conserte a **chamada** para que `total` seja ' +
      '`135`. Não afrouxe o tipo de `totalComFrete`: ela tem que continuar recusando texto.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function totalComFrete(produto: number, frete: number): number {
  return produto + frete;
}

// o preço chega como texto do campo do formulário
const precoDigitado = '120';

const total = totalComFrete(precoDigitado, 15);
console.log('Total: R$ ' + total);
`,
    solution: `function totalComFrete(produto: number, frete: number): number {
  return produto + frete;
}

// o preço chega como texto do campo do formulário
const precoDigitado = '120';

const total = totalComFrete(Number(precoDigitado), 15);
console.log('Total: R$ ' + total);
`,
    tests: [
      {
        description: 'o total é 135',
        code: 'assert.strictEqual(total, 135);',
      },
      {
        description: 'imprime "Total: R$ 135"',
        code: "assert.deepStrictEqual(__logs, ['Total: R$ 135']);",
      },
      {
        description: 'totalComFrete continua recusando texto',
        code: `const usoErrado = () => {
  // @ts-expect-error
  totalComFrete('120', 15);
};`,
      },
    ],
    hints: [
      'Leia a mensagem de erro: o TS diz que `string` não serve onde se espera `number`.',
      'Converta o texto antes de passar: `Number(precoDigitado)`.',
    ],
    followUpQuestionIds: ['typescript.m01.f03', 'typescript.m01.f04'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'typescript.m01.q01',
    lessonIds: ['typescript.m01.l01'],
    kind: 'multiple-choice',
    prompt:
      'Com `function calcularOrcamento(horas: number, valorHora: number)`, o que acontece com a chamada abaixo?',
    code: "calcularOrcamento('3', 80);",
    options: [
      'O TypeScript acusa erro antes de rodar: `string` não é `number`',
      "O TypeScript converte `'3'` para `3` sozinho",
      'Compila e roda, devolvendo um texto estranho',
      'Só dá erro quando o cliente reclamar',
    ],
    answerIndex: 0,
    explanation: 'Esse é o ponto do TS: o erro aparece no editor e na compilação, não em produção.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q02',
    lessonIds: ['typescript.m01.l01'],
    kind: 'true-false',
    prompt: 'Quando o código roda, o Node confere o `: number` de cada parâmetro e lança erro se vier texto.',
    answer: false,
    explanation:
      'Os tipos somem na compilação; o JavaScript que roda não tem nenhum `: number`. A checagem é só antes de rodar.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q03',
    lessonIds: ['typescript.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Qual o tipo inferido de `bairro`?',
    code: "let bairro = 'Km 18';",
    options: ['string', 'any', 'unknown', 'Nenhum: sem anotação não tem tipo'],
    answerIndex: 0,
    explanation: 'O TS infere o tipo pelo valor inicial. Um texto numa variável `let` vira `string`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q04',
    lessonIds: ['typescript.m01.l01'],
    kind: 'true-false',
    prompt:
      "No modo strict, `function frete(km) { ... }` dá erro: `Parameter 'km' implicitly has an 'any' type`.",
    answer: true,
    explanation:
      'O TS não tem como adivinhar o que vão passar para um parâmetro, então o strict exige a anotação.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q05',
    lessonIds: ['typescript.m01.l01'],
    kind: 'fill-blank',
    prompt: 'Complete com o tipo do parâmetro `km`.',
    code: `function frete(km: ___): number {
  return km * 4.5;
}`,
    acceptedAnswers: ['number'],
    explanation: 'Quilômetros são um número, e `km * 4.5` só faz sentido com `number`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q06',
    lessonIds: ['typescript.m01.l01'],
    kind: 'predict-output',
    prompt:
      'Em JavaScript puro, sem tipos, o que este código imprime? (É desse tipo de surpresa que o TS te salva.)',
    code: `function somarFrete(preco, frete) {
  return preco + frete;
}
console.log(somarFrete(100, 15));
console.log(somarFrete('100', 15));`,
    expectedOutput: '115\n10015',
    explanation:
      "Com texto, o `+` concatena: `'100' + 15` vira `'10015'`. No TS, a segunda chamada nem compilaria.",
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q07',
    lessonIds: ['typescript.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Onde vale mais a pena escrever anotação de tipo?',
    options: [
      'Nos parâmetros das funções; nas variáveis com valor inicial, a inferência resolve',
      'Em toda variável, sempre, mesmo `let x: number = 1`',
      'Em lugar nenhum: o TypeScript adivinha tudo sozinho',
      'Só nos `console.log`',
    ],
    answerIndex: 0,
    explanation:
      'O TS infere variáveis pelo valor inicial, mas não sabe o que vão passar para um parâmetro. Anotar o retorno é opcional, mas ajuda a documentar.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q08',
    lessonIds: ['typescript.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Este código compila?',
    code: `let total = 0;
total = 'zero';`,
    options: [
      'Não: `total` foi inferido como `number`',
      'Sim: sem anotação, a variável aceita qualquer coisa',
      'Sim, mas só em modo não estrito',
      'Não: falta `const`',
    ],
    answerIndex: 0,
    explanation: 'A inferência fixa o tipo no valor inicial. Depois disso, `total` só aceita números.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m01.f01',
    lessonIds: ['typescript.m01.l01'],
    exerciseId: 'typescript.m01.e01',
    kind: 'multiple-choice',
    prompt: "Com os tipos que você escreveu, o que acontece com `calcularOrcamento('3', 80)`?",
    options: [
      'Não compila: `string` não é atribuível a `number`',
      'Devolve 270',
      "Devolve `'38030'`",
      'Compila, mas lança erro ao rodar',
    ],
    answerIndex: 0,
    explanation:
      'Com `horas: number`, passar texto é erro de compilação. O sobrinho vai ter que digitar número.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f02',
    lessonIds: ['typescript.m01.l01'],
    exerciseId: 'typescript.m01.e01',
    kind: 'multiple-choice',
    prompt: 'Na sua `calcularOrcamento`, quanto devolve `calcularOrcamento(2, 100)`?',
    options: ['230', '200', '2130', '30'],
    answerIndex: 0,
    explanation: '2 × 100 = 200, mais R$ 30 de deslocamento: 230. Os tipos não mudaram a conta.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f03',
    lessonIds: ['typescript.m01.l01'],
    exerciseId: 'typescript.m01.d01',
    kind: 'multiple-choice',
    prompt: 'Rodando o código original como JavaScript, qual era o valor de `total`?',
    options: ["'12015'", '135', 'NaN', 'Dava erro e parava'],
    answerIndex: 0,
    explanation: "`'120' + 15` concatena os dois: `'12015'`. Por isso a loja cobrou doze mil reais.",
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f04',
    lessonIds: ['typescript.m01.l01'],
    exerciseId: 'typescript.m01.d01',
    kind: 'true-false',
    prompt: 'Trocar o parâmetro para `produto: any` também resolveria o bug do frete.',
    answer: false,
    explanation:
      "Com `any` o código compila, mas continua somando texto com número: o total seria `'12015'` de novo. O conserto é converter o valor.",
    difficulty: 1,
  },
];
