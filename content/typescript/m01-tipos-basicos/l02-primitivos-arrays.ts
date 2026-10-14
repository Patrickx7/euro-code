import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m01.l02',
  moduleId: 'typescript.m01',
  order: 2,
  title: 'Primitivos, arrays e tuplas (e por que fugir do any)',
  concepts: [
    'string, number e boolean',
    'arrays (string[])',
    'tuplas',
    'tipos literais',
    'any',
    'unknown',
    'typeof para checar o tipo',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Os tipos **primitivos** têm o mesmo nome que o `typeof` do JavaScript devolve: `string`, `number` e ' +
        '`boolean` (sempre com letra **minúscula**; `String` com maiúscula é outra coisa e não deve ser usado).\n\n' +
        '**Arrays** se escrevem com `[]` depois do tipo dos itens: `string[]` é uma lista de textos, `number[]` ' +
        'uma lista de números. (`Array<number>` é o mesmo, escrito de outro jeito.) O TS também infere: ' +
        "`['Osasco', 'Cotia']` vira `string[]`.\n\n" +
        'Uma **tupla** é um array de **tamanho e posições fixos**, cada posição com seu tipo. ' +
        "`[string, number]` aceita `['Centro', 35]`, mas não `[35, 'Centro']` nem `['Centro']`. Serve para " +
        'devolver dois valores de uma função sem criar um objeto.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `const bairros: string[] = ['Vila Yara', 'Bela Vista', 'Km 18'];
const corridas = [35, 20, 15]; // inferido: number[]
const emDia: boolean = true;

const corrida: [string, number] = ['Centro', 35];
const [bairro, valor] = corrida; // bairro: string, valor: number

bairros.push(42);
// ❌ Argument of type 'number' is not assignable to parameter of type 'string'.`,
      explanation: 'Na desestruturação da tupla, cada variável ganha o tipo da sua posição.',
    },
    {
      kind: 'text',
      markdown:
        'Um valor exato também pode ser um tipo: são os **tipos literais**. Juntando vários com `|`, você diz ' +
        "exatamente o que é aceito: `let forma: 'pix' | 'dinheiro' | 'cartao'`. Escrever `'boleto'` ou " +
        "`'Pix'` vira erro. (Vamos usar muito essas uniões nos próximos módulos.) Repare: `let x = 'pix'` " +
        "infere `string`, mas `const x = 'pix'` infere o literal `'pix'`, porque uma `const` nunca muda.\n\n" +
        'Agora o vilão: **`any`**. Ele **desliga a checagem** daquele valor. Com `any` você pode chamar ' +
        'qualquer método, passar para qualquer função... e o erro volta a aparecer só em produção. Pior: ele é ' +
        'contagioso, o que sai de um `any` também é `any`. Ele existe para migrar código antigo aos poucos, não ' +
        'para "fazer o erro sumir".\n\n' +
        'Quando você realmente não sabe o tipo (um `JSON.parse`, um valor de planilha), use **`unknown`**: ele ' +
        'aceita qualquer valor, mas **não deixa usar** até você checar o que é, com `typeof`. Dentro do `if`, o ' +
        'TS sabe o tipo.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `let suspeito: any = 42;
suspeito.toUpperCase(); // compila... e quebra ao rodar 💥

let dado: unknown = 42;
dado.toUpperCase();
// ❌ 'dado' is of type 'unknown'.

if (typeof dado === 'string') {
  console.log(dado.toUpperCase()); // aqui dado é string
} else if (typeof dado === 'number') {
  console.log(dado.toFixed(2)); // aqui dado é number
}`,
      explanation: '`any` confia em você cegamente; `unknown` exige provas. Prefira sempre `unknown`.',
    },
  ],
  checkQuestionIds: ['typescript.m01.q09'],
  exerciseIds: ['typescript.m01.e02', 'typescript.m01.e03'],
  debugExerciseIds: ['typescript.m01.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m01.e02',
    lessonId: 'typescript.m01.l02',
    kind: 'implement',
    title: 'Resumo do dia de corridas',
    promptMarkdown:
      'O app de fretes quer um resumo do dia. Crie `resumoDoDia(valores)`, que recebe a lista com o valor ' +
      'de cada corrida e devolve uma **tupla** `[quantidade, total]`.\n\n' +
      '- `valores` é um array de números;\n' +
      '- o retorno é exatamente `[number, number]` (não um `number[]` qualquer);\n' +
      '- lista vazia devolve `[0, 0]`.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function resumoDoDia(valores) {
  // devolva [quantidade de corridas, soma dos valores]
}
`,
    solution: `function resumoDoDia(valores: number[]): [number, number] {
  let total = 0;
  for (const valor of valores) {
    total += valor;
  }
  return [valores.length, total];
}
`,
    tests: [
      {
        description: '3 corridas somando R$ 100',
        code: 'assert.deepStrictEqual(resumoDoDia([50, 30, 20]), [3, 100]);',
      },
      {
        description: 'dia sem corridas',
        code: 'assert.deepStrictEqual(resumoDoDia([]), [0, 0]);',
      },
      {
        description: 'não aceita valores em texto',
        code: `const usoErrado = () => {
  // @ts-expect-error
  resumoDoDia(['50', 30]);
};`,
      },
      {
        description: 'o retorno é uma tupla de 2 posições',
        code: `const [quantidade, total] = resumoDoDia([10]);
const soma: number = quantidade + total;
assert.strictEqual(soma, 11);
const terceiraPosicao = () => {
  // @ts-expect-error
  return resumoDoDia([10])[2];
};`,
      },
    ],
    hints: [
      'Parâmetro: `valores: number[]`. Retorno: `: [number, number]`, depois dos parênteses.',
      'Some com um `for...of` e devolva `[valores.length, total]`.',
    ],
    followUpQuestionIds: ['typescript.m01.f05', 'typescript.m01.f06'],
    difficulty: 1,
  },
  {
    id: 'typescript.m01.e03',
    lessonId: 'typescript.m01.l02',
    kind: 'implement',
    title: 'O valor que vem da planilha',
    promptMarkdown:
      'A planilha do cliente mistura tudo: tem célula com número, célula com texto tipo `"7,50"` e célula ' +
      'vazia. A função `paraNumero(valor: unknown): number` já está declarada; complete o corpo:\n\n' +
      '- se `valor` for `number`, devolva ele mesmo;\n' +
      "- se for `string`, troque a vírgula por ponto e converta: `Number(valor.replace(',', '.'))`;\n" +
      '- qualquer outra coisa (`null`, `true`, objeto...) vira `0`.\n\n' +
      'Não troque `unknown` por `any`: use `typeof` para o TS deixar você usar o valor.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function paraNumero(valor: unknown): number {
  // seu código aqui
  return 0;
}
`,
    solution: `function paraNumero(valor: unknown): number {
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'string') return Number(valor.replace(',', '.'));
  return 0;
}
`,
    tests: [
      { description: 'número continua número', code: 'assert.strictEqual(paraNumero(12), 12);' },
      { description: "'7,50' vira 7.5", code: "assert.strictEqual(paraNumero('7,50'), 7.5);" },
      { description: "'30' vira 30", code: "assert.strictEqual(paraNumero('30'), 30);" },
      {
        description: 'null, true e objetos viram 0',
        code: `assert.strictEqual(paraNumero(null), 0);
assert.strictEqual(paraNumero(true), 0);
assert.strictEqual(paraNumero({ valor: 5 }), 0);`,
      },
      {
        description: 'o retorno é number',
        code: `const usoErrado = () => {
  // @ts-expect-error
  const texto: string = paraNumero('1');
};`,
      },
    ],
    hints: [
      "Comece com `if (typeof valor === 'number') return valor;`.",
      "Dentro de `if (typeof valor === 'string')` o TS deixa usar `valor.replace(...)`.",
    ],
    followUpQuestionIds: ['typescript.m01.f07', 'typescript.m01.f08'],
    difficulty: 2,
  },
  {
    id: 'typescript.m01.d02',
    lessonId: 'typescript.m01.l02',
    kind: 'debug',
    title: 'O any do sobrinho',
    promptMarkdown:
      'O sobrinho do cliente tipou o parâmetro como `any` porque "é mais rápido de escrever". Resultado: o ' +
      'total do dia saiu **R$ 0352015**.\n\n' +
      'Troque o `any` por um tipo de verdade (uma lista de números) e conserte o que o TypeScript passar a ' +
      'apontar, para que o total do dia seja **70**.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function somarCorridas(valores: any) {
  let total = 0;
  for (const valor of valores) {
    total += valor;
  }
  return total;
}

const corridas = ['35', 20, 15]; // a corrida da manhã foi digitada como texto
console.log('Total do dia: R$ ' + somarCorridas(corridas));
`,
    solution: `function somarCorridas(valores: number[]) {
  let total = 0;
  for (const valor of valores) {
    total += valor;
  }
  return total;
}

const corridas = [35, 20, 15];
console.log('Total do dia: R$ ' + somarCorridas(corridas));
`,
    tests: [
      {
        description: 'o total do dia é 70',
        code: 'assert.strictEqual(somarCorridas(corridas), 70);',
      },
      {
        description: 'imprime "Total do dia: R$ 70"',
        code: "assert.deepStrictEqual(__logs, ['Total do dia: R$ 70']);",
      },
      {
        description: 'somarCorridas recusa valores em texto',
        code: `const usoErrado = () => {
  // @ts-expect-error
  somarCorridas(['35', 20]);
};`,
      },
    ],
    hints: [
      'Troque `valores: any` por `valores: number[]`.',
      'Agora o TS reclama da chamada: a lista `corridas` tem um texto. Corrija o dado.',
    ],
    followUpQuestionIds: ['typescript.m01.f09', 'typescript.m01.f10'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'typescript.m01.q09',
    lessonIds: ['typescript.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual o tipo inferido de `bairros`?',
    code: "const bairros = ['Vila Yara', 'Jardim Bonfim'];",
    options: ['string[]', 'string', '[string, string]', 'any[]'],
    answerIndex: 0,
    explanation: 'Um array de textos é inferido como `string[]`. Tupla só se você anotar.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q10',
    lessonIds: ['typescript.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual destes valores pode ser guardado em `corrida`?',
    code: 'let corrida: [string, number];',
    options: ["['Vila Yara', 40]", "[40, 'Vila Yara']", "['Vila Yara']", "['Vila Yara', '40']"],
    answerIndex: 0,
    explanation: 'Na tupla, a ordem e o tamanho importam: primeiro um `string`, depois um `number`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q11',
    lessonIds: ['typescript.m01.l02'],
    kind: 'true-false',
    prompt: 'Com `let dado: any`, a linha `dado.qualquerCoisa()` compila, mesmo que quebre ao rodar.',
    answer: true,
    explanation: '`any` desliga a checagem: o TS aceita tudo e o erro fica para a produção.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q12',
    lessonIds: ['typescript.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'O que você precisa fazer antes de chamar `dado.toUpperCase()`?',
    code: 'const dado: unknown = JSON.parse(textoDaApi);',
    options: [
      "Checar o tipo, por exemplo com `if (typeof dado === 'string')`",
      'Nada, `unknown` funciona igual a `any`',
      'Trocar `const` por `let`',
      'Não tem como: `unknown` nunca pode ser usado',
    ],
    answerIndex: 0,
    explanation: 'Depois do `typeof`, o TS estreita o tipo para `string` e libera os métodos de texto.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.q13',
    lessonIds: ['typescript.m01.l02'],
    kind: 'fill-blank',
    prompt: 'Complete com o único outro valor que `forma` aceita.',
    code: `let forma: 'pix' | 'dinheiro' = 'pix';
forma = ___;`,
    acceptedAnswers: ["'dinheiro'", '"dinheiro"', 'dinheiro'],
    explanation: "O tipo é a união de dois literais: só `'pix'` ou `'dinheiro'` são aceitos.",
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q14',
    lessonIds: ['typescript.m01.l02'],
    kind: 'predict-output',
    prompt: 'Os primitivos do TS têm o nome do `typeof` do JavaScript. O que este código imprime?',
    code: `console.log(typeof 42);
console.log(typeof 'Cotia');
console.log(typeof false);
console.log(typeof [35, 20]);`,
    expectedOutput: 'number\nstring\nboolean\nobject',
    explanation:
      'Arrays são objetos para o `typeof`. Por isso, no TS, o tipo de uma lista é escrito `number[]`, não com `typeof`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q15',
    lessonIds: ['typescript.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'Quais os tipos inferidos de `a` e `b`?',
    code: `let a = 'pix';
const b = 'pix';`,
    options: [
      "`a` é `string` e `b` é o literal `'pix'`",
      'Os dois são `string`',
      "Os dois são o literal `'pix'`",
      "`a` é `'pix'` e `b` é `string`",
    ],
    answerIndex: 0,
    explanation:
      'Uma `let` pode mudar, então vira `string`. Uma `const` nunca muda, então o tipo é o valor exato.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.q16',
    lessonIds: ['typescript.m01.l02'],
    kind: 'true-false',
    prompt: 'Para um parâmetro de texto, o certo em TypeScript é `nome: string`, com letra minúscula.',
    answer: true,
    explanation:
      '`string`, `number` e `boolean` são os primitivos. `String` maiúsculo é o tipo do objeto embrulhador.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m01.f05',
    lessonIds: ['typescript.m01.l02'],
    exerciseId: 'typescript.m01.e02',
    kind: 'multiple-choice',
    prompt: 'Com a sua `resumoDoDia`, o que devolve `resumoDoDia([40, 25])`?',
    options: ['[2, 65]', '[65, 2]', '65', '[40, 25]'],
    answerIndex: 0,
    explanation: 'Primeiro a quantidade (2), depois o total (40 + 25 = 65), como diz a tupla.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f06',
    lessonIds: ['typescript.m01.l02'],
    exerciseId: 'typescript.m01.e02',
    kind: 'true-false',
    prompt:
      'Se o retorno da sua função fosse `number[]` em vez de `[number, number]`, `resumoDoDia([10])[2]` compilaria.',
    answer: true,
    explanation:
      'Um `number[]` pode ter qualquer tamanho, então o TS aceita o índice 2. Com a tupla, ele sabe que só existem as posições 0 e 1.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.f07',
    lessonIds: ['typescript.m01.l02'],
    exerciseId: 'typescript.m01.e03',
    kind: 'multiple-choice',
    prompt: "Por que `valor.replace(...)` só compila dentro do `if (typeof valor === 'string')`?",
    options: [
      '`unknown` exige que você prove o tipo antes de usar o valor',
      'Porque `replace` não existe em JavaScript',
      'Porque `if` deixa o código mais rápido',
      'Não precisa do `if`, compilaria de qualquer jeito',
    ],
    answerIndex: 0,
    explanation:
      'O `typeof` estreita o `unknown` para `string` dentro do bloco, e aí os métodos de texto ficam liberados.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f08',
    lessonIds: ['typescript.m01.l02'],
    exerciseId: 'typescript.m01.e03',
    kind: 'multiple-choice',
    prompt: "O que a sua `paraNumero` devolve para `paraNumero('12,90')`?",
    options: ['12.9', '0', 'NaN', "'12.90'"],
    answerIndex: 0,
    explanation: "A vírgula vira ponto (`'12.90'`) e `Number` converte para `12.9`.",
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f09',
    lessonIds: ['typescript.m01.l02'],
    exerciseId: 'typescript.m01.d02',
    kind: 'multiple-choice',
    prompt: "Por que o TypeScript não reclamou do `'35'` no código original?",
    options: [
      'Porque `valores: any` desliga a checagem daquele parâmetro',
      'Porque o TS converte texto em número sozinho',
      "Porque `'35'` é um número válido",
      'Porque o erro só aparece em modo não estrito',
    ],
    answerIndex: 0,
    explanation: 'Com `any`, qualquer coisa passa. Com `number[]`, o texto na lista vira erro na hora.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f10',
    lessonIds: ['typescript.m01.l02'],
    exerciseId: 'typescript.m01.d02',
    kind: 'multiple-choice',
    prompt: "Depois do seu conserto, o que acontece com `somarCorridas(['35', 20])`?",
    options: [
      'Não compila: `string` não é atribuível a `number`',
      "Devolve `'3520'`",
      'Devolve 55',
      'Compila e dá erro ao rodar',
    ],
    answerIndex: 0,
    explanation: 'Agora o tipo do parâmetro é `number[]`, e um texto na lista é barrado antes de rodar.',
    difficulty: 1,
  },
];
