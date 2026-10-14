import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m01.l03',
  moduleId: 'typescript.m01',
  order: 3,
  title: 'Funções tipadas: o contrato do freela',
  concepts: [
    'tipos de parâmetros e de retorno',
    'parâmetros opcionais (?)',
    'valores padrão',
    'void',
    'never',
    'tipos de função ((n: number) => string)',
    'callbacks tipados',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'A assinatura de uma função tipada é um **contrato**: o que ela recebe e o que ela devolve. Quem chama ' +
        'não precisa abrir o código para saber como usar.\n\n' +
        '- **Parâmetro opcional**: um `?` depois do nome (`desconto?: number`). Dentro da função, o tipo dele é ' +
        '`number | undefined`, então o TS obriga você a tratar o caso de não vir nada. Opcionais vêm **depois** ' +
        'dos obrigatórios.\n' +
        '- **Valor padrão**: `parcelas = 1`. O tipo é inferido do valor (`number`) e o parâmetro pode ser ' +
        'omitido na chamada; dentro da função ele nunca é `undefined`.\n' +
        '- **`void`**: a função não devolve nada útil (só faz algo, como imprimir ou salvar).\n' +
        '- **`never`**: a função **nunca termina normalmente**, porque sempre lança um erro (ou fica num laço ' +
        'infinito).',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `function precoComDesconto(valor: number, desconto?: number): number {
  if (desconto === undefined) return valor;
  return valor - desconto;
}

function parcelar(total: number, parcelas = 1): number {
  return total / parcelas;
}

function avisar(mensagem: string): void {
  console.log('[aviso] ' + mensagem);
}

function falhar(motivo: string): never {
  throw new Error(motivo);
}

precoComDesconto(100); // ok, desconto é opcional
parcelar(300, 3); // 100
parcelar(300); // 300`,
      explanation:
        "Tirando o `if` de `precoComDesconto`, o TS reclama: `'desconto' is possibly 'undefined'`.",
    },
    {
      kind: 'text',
      markdown:
        'Em JavaScript, função é um valor: dá para guardar numa variável, passar como argumento (callback) e ' +
        'devolver de outra função. O TypeScript tem um tipo para isso, com cara de arrow function:\n\n' +
        '```ts\n(valor: number) => string\n```\n\n' +
        'Leia como "uma função que recebe um `number` e devolve uma `string`". Com isso, você tipa callbacks e ' +
        'funções que fabricam funções. Bônus: quando o TS já sabe o tipo esperado, ele infere os parâmetros da ' +
        'arrow function sozinho (é a **tipagem pelo contexto**), então `numeros.map((n) => n * 2)` não precisa ' +
        'de `n: number`.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `function aplicarEmTodos(valores: number[], transformar: (n: number) => string): string[] {
  const resultado: string[] = [];
  for (const v of valores) resultado.push(transformar(v));
  return resultado;
}

aplicarEmTodos([10, 25], (n) => 'R$ ' + n); // n é number pelo contexto
aplicarEmTodos([10, 25], (n) => n * 2);
// ❌ Type 'number' is not assignable to type 'string'.

function criarSaudacao(empresa: string): (cliente: string) => string {
  return (cliente) => 'Olá, ' + cliente + '! Aqui é da ' + empresa + '.';
}
const saudar = criarSaudacao('Freela na Estrada');
saudar('Dona Cida');`,
      explanation: 'O tipo depois dos parênteses de `criarSaudacao` diz que ela devolve uma função.',
    },
  ],
  checkQuestionIds: ['typescript.m01.q17'],
  exerciseIds: ['typescript.m01.e04', 'typescript.m01.e05'],
  debugExerciseIds: ['typescript.m01.d03'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m01.e04',
    lessonId: 'typescript.m01.l03',
    kind: 'implement',
    title: 'Preço final na maquininha',
    promptMarkdown:
      'A lanchonete quer o preço final conforme a forma de pagamento. Crie ' +
      '`precoFinal(valor, forma, parcelas)`:\n\n' +
      '- `valor`: `number`;\n' +
      "- `forma`: só aceita `'pix'`, `'dinheiro'` ou `'cartao'` (use um tipo literal);\n" +
      '- `parcelas`: `number` com **padrão 1**;\n' +
      '- retorno `number`.\n\n' +
      'Regras: no **pix**, 5% de desconto; no **dinheiro**, o próprio valor; no **cartão**, 2% de acréscimo ' +
      '**por parcela** (3 parcelas = +6%).',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function precoFinal(valor, forma, parcelas) {
  // seu código aqui
}
`,
    solution: `function precoFinal(valor: number, forma: 'pix' | 'dinheiro' | 'cartao', parcelas = 1): number {
  if (forma === 'pix') return valor - (valor * 5) / 100;
  if (forma === 'cartao') return valor + (valor * 2 * parcelas) / 100;
  return valor;
}
`,
    tests: [
      {
        description: 'pix: R$ 200 viram R$ 190',
        code: `const centavos = (n: number) => Math.round(n * 100);
assert.strictEqual(centavos(precoFinal(200, 'pix')), 19000);`,
      },
      {
        description: 'dinheiro: o próprio valor',
        code: "assert.strictEqual(precoFinal(200, 'dinheiro'), 200);",
      },
      {
        description: 'cartão em 3 vezes: +6%',
        code: `const centavos = (n: number) => Math.round(n * 100);
assert.strictEqual(centavos(precoFinal(200, 'cartao', 3)), 21200);`,
      },
      {
        description: 'cartão sem dizer as parcelas: 1 parcela (+2%)',
        code: `const centavos = (n: number) => Math.round(n * 100);
assert.strictEqual(centavos(precoFinal(50, 'cartao')), 5100);`,
      },
      {
        description: "'boleto' não compila",
        code: `const usoErrado = () => {
  // @ts-expect-error
  precoFinal(200, 'boleto');
};`,
      },
      {
        description: 'valor em texto não compila',
        code: `const usoErrado = () => {
  // @ts-expect-error
  precoFinal('200', 'pix');
};`,
      },
    ],
    hints: [
      "O tipo de `forma` é uma união de literais: `'pix' | 'dinheiro' | 'cartao'`.",
      'Valor padrão em TS é igual ao JS: `parcelas = 1` (o tipo `number` é inferido).',
      'Cartão: `valor + valor * 2 * parcelas / 100`.',
    ],
    followUpQuestionIds: ['typescript.m01.f11', 'typescript.m01.f12'],
    difficulty: 2,
  },
  {
    id: 'typescript.m01.e05',
    lessonId: 'typescript.m01.l03',
    kind: 'implement',
    title: 'Fábrica de formatadores de moeda',
    promptMarkdown:
      'O relatório do cliente mostra preço em real e em dólar, e cada tela formatava de um jeito. Crie ' +
      '`criarFormatador(prefixo: string)`, que **devolve uma função** do tipo `(valor: number) => string`.\n\n' +
      'A função devolvida escreve o prefixo, o valor com **2 casas** e **vírgula** no lugar do ponto: ' +
      "`criarFormatador('R$ ')(150)` → `'R$ 150,00'`.",
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function criarFormatador(prefixo) {
  // devolva uma função que recebe um número e devolve o texto formatado
}
`,
    solution: `function criarFormatador(prefixo: string): (valor: number) => string {
  return (valor) => prefixo + valor.toFixed(2).replace('.', ',');
}
`,
    tests: [
      {
        description: "criarFormatador('R$ ')(150) devolve 'R$ 150,00'",
        code: "assert.strictEqual(criarFormatador('R$ ')(150), 'R$ 150,00');",
      },
      {
        description: 'o mesmo formatador serve para vários valores',
        code: `const dolar = criarFormatador('US$ ');
assert.strictEqual(dolar(3.5), 'US$ 3,50');
assert.strictEqual(dolar(1234.567), 'US$ 1234,57');`,
      },
      {
        description: 'a função devolvida tem o tipo (valor: number) => string',
        code: `const formatar: (valor: number) => string = criarFormatador('R$ ');
assert.strictEqual(formatar(0), 'R$ 0,00');
const usoErrado = () => {
  // @ts-expect-error
  formatar('150');
};`,
      },
      {
        description: 'o prefixo precisa ser texto',
        code: `const usoErrado = () => {
  // @ts-expect-error
  criarFormatador(10);
};`,
      },
    ],
    hints: [
      'O retorno é um tipo de função: `function criarFormatador(prefixo: string): (valor: number) => string`.',
      "Devolva uma arrow function: `return (valor) => prefixo + valor.toFixed(2).replace('.', ',');`.",
    ],
    followUpQuestionIds: ['typescript.m01.f13', 'typescript.m01.f14'],
    difficulty: 2,
  },
  {
    id: 'typescript.m01.d03',
    lessonId: 'typescript.m01.l03',
    kind: 'debug',
    title: 'Hora extra que deu NaN',
    promptMarkdown:
      'O cálculo de hora do motoboy devolve **NaN** quando ninguém informa o valor da hora, e o TypeScript ' +
      "já está avisando: `'valorHora' is possibly 'undefined'`.\n\n" +
      'Regra do cliente: quando o valor da hora não vem, ele é **R$ 80**. Conserte a assinatura (sem `any` e ' +
      'sem `!`) para que `cobrarHoras(2)` dê **160**.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function cobrarHoras(horas: number, valorHora?: number): number {
  return horas * valorHora;
}

console.log(cobrarHoras(2));
`,
    solution: `function cobrarHoras(horas: number, valorHora = 80): number {
  return horas * valorHora;
}

console.log(cobrarHoras(2));
`,
    tests: [
      { description: 'sem valor da hora: R$ 80 por hora', code: 'assert.strictEqual(cobrarHoras(2), 160);' },
      { description: 'com valor da hora', code: 'assert.strictEqual(cobrarHoras(2, 100), 200);' },
      { description: 'imprime 160', code: "assert.deepStrictEqual(__logs, ['160']);" },
      {
        description: 'valor da hora em texto não compila',
        code: `const usoErrado = () => {
  // @ts-expect-error
  cobrarHoras(2, '100');
};`,
      },
    ],
    hints: [
      'Um parâmetro opcional pode ser `undefined`, e `2 * undefined` é `NaN`.',
      'Troque `valorHora?: number` por um valor padrão: `valorHora = 80`.',
    ],
    followUpQuestionIds: ['typescript.m01.f15', 'typescript.m01.f16'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'typescript.m01.q17',
    lessonIds: ['typescript.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Dentro da função, qual o tipo de `taxa`?',
    code: 'function frete(km: number, taxa?: number) { ... }',
    options: ['number | undefined', 'number', 'any', 'unknown'],
    answerIndex: 0,
    explanation: 'Parâmetro opcional pode não vir, então o tipo dele inclui `undefined`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q18',
    lessonIds: ['typescript.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'O que o `void` diz sobre esta função?',
    code: 'function registrarLog(msg: string): void { ... }',
    options: [
      'Que ela não devolve nenhum valor útil',
      'Que ela nunca termina',
      'Que ela devolve qualquer tipo',
      'Que ela não recebe parâmetros',
    ],
    answerIndex: 0,
    explanation: '`void` é para funções que só fazem algo (imprimir, salvar), sem devolver resultado.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q19',
    lessonIds: ['typescript.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual o melhor tipo de retorno para esta função?',
    code: `function recusarJob(motivo: string) {
  throw new Error('Job recusado: ' + motivo);
}`,
    options: ['never', 'void', 'string', 'Error'],
    answerIndex: 0,
    explanation:
      '`never` é o tipo de quem nunca termina normalmente. Ela sempre lança, então nunca chega a devolver nada.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.q20',
    lessonIds: ['typescript.m01.l03'],
    kind: 'fill-blank',
    prompt: 'Complete o tipo de retorno da função guardada em `formatar`.',
    code: "const formatar: (valor: number) => ___ = (v) => 'R$ ' + v.toFixed(2);",
    acceptedAnswers: ['string'],
    explanation: "`'R$ ' + v.toFixed(2)` é um texto, então a função é `(valor: number) => string`.",
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q21',
    lessonIds: ['typescript.m01.l03'],
    kind: 'true-false',
    prompt:
      'Em `function parcelar(total: number, parcelas = 1)`, o tipo de `parcelas` é inferido como `number` e dá para chamar `parcelar(300)`.',
    answer: true,
    explanation:
      'O valor padrão dá o tipo e torna o argumento dispensável. Dentro da função, `parcelas` nunca é `undefined`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q22',
    lessonIds: ['typescript.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Este código compila?',
    code: 'function orcamento(desconto?: number, horas: number) { ... }',
    options: [
      'Não: um parâmetro obrigatório não pode vir depois de um opcional',
      'Sim, a ordem não importa',
      'Sim, mas `horas` vira opcional também',
      'Não: falta o tipo de retorno',
    ],
    answerIndex: 0,
    explanation: 'Os opcionais ficam no fim da lista. Troque a ordem: `(horas: number, desconto?: number)`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.q23',
    lessonIds: ['typescript.m01.l03'],
    kind: 'predict-output',
    prompt: 'Valor padrão funciona igual no JavaScript que roda. O que este código imprime?',
    code: `function cobrar(horas, valorHora = 80) {
  return horas * valorHora;
}
console.log(cobrar(2));
console.log(cobrar(2, undefined));
console.log(cobrar(2, 100));`,
    expectedOutput: '160\n160\n200',
    explanation: 'O padrão é usado quando o argumento falta **ou** vem como `undefined`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.q24',
    lessonIds: ['typescript.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual destas chamadas **não** compila?',
    code: 'function repetir(vezes: number, acao: (i: number) => void): void { ... }',
    options: [
      "repetir('3', (i) => console.log(i))",
      'repetir(3, (i) => console.log(i))',
      "repetir(3, () => console.log('buzina!'))",
      'repetir(0, (i) => console.log(i * 2))',
    ],
    answerIndex: 0,
    explanation:
      "`'3'` não é `number`. Um callback com menos parâmetros (`() => ...`) é aceito: ignorar argumentos é permitido.",
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m01.f11',
    lessonIds: ['typescript.m01.l03'],
    exerciseId: 'typescript.m01.e04',
    kind: 'multiple-choice',
    prompt: "Com a sua `precoFinal`, quanto dá `precoFinal(100, 'pix')`?",
    options: ['95', '100', '105', '5'],
    answerIndex: 0,
    explanation: 'No pix, 5% de desconto: 100 − 5 = 95.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f12',
    lessonIds: ['typescript.m01.l03'],
    exerciseId: 'typescript.m01.e04',
    kind: 'multiple-choice',
    prompt: "O que o TypeScript faz com `precoFinal(100, 'boleto')` no seu código?",
    options: [
      "Erro de compilação: `'boleto'` não está na união de literais",
      'Devolve 100, como no dinheiro',
      'Devolve `undefined`',
      'Lança um erro ao rodar',
    ],
    answerIndex: 0,
    explanation: "O tipo `'pix' | 'dinheiro' | 'cartao'` barra qualquer outro texto antes de rodar.",
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f13',
    lessonIds: ['typescript.m01.l03'],
    exerciseId: 'typescript.m01.e05',
    kind: 'multiple-choice',
    prompt: "Qual o tipo de `criarFormatador('R$ ')`?",
    options: ['(valor: number) => string', 'string', '(prefixo: string) => string', 'void'],
    answerIndex: 0,
    explanation: 'Chamar a fábrica devolve a função formatadora, que recebe um número e devolve texto.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f14',
    lessonIds: ['typescript.m01.l03'],
    exerciseId: 'typescript.m01.e05',
    kind: 'multiple-choice',
    prompt: "O que imprime `console.log(criarFormatador('US$ ')(7))` com a sua função?",
    options: ['US$ 7,00', 'US$ 7.00', 'US$ 7', '7,00'],
    answerIndex: 0,
    explanation: '`toFixed(2)` dá `7.00` e o `replace` troca o ponto pela vírgula.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f15',
    lessonIds: ['typescript.m01.l03'],
    exerciseId: 'typescript.m01.d03',
    kind: 'multiple-choice',
    prompt: 'Por que `horas * valorHora` não compilava no código original?',
    options: [
      'Porque `valorHora?: number` pode ser `undefined`',
      'Porque não dá para multiplicar dois `number`',
      'Porque faltava o tipo de retorno',
      'Porque `horas` era opcional',
    ],
    answerIndex: 0,
    explanation: 'O `?` deixa o tipo `number | undefined`, e o TS não deixa fazer conta com `undefined`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f16',
    lessonIds: ['typescript.m01.l03'],
    exerciseId: 'typescript.m01.d03',
    kind: 'multiple-choice',
    prompt: 'Rodando o código original como JavaScript, o que `cobrarHoras(2)` devolvia?',
    options: ['NaN', '0', '160', 'undefined'],
    answerIndex: 0,
    explanation: '`2 * undefined` é `NaN`. Com o padrão `valorHora = 80`, a conta vira `2 * 80`.',
    difficulty: 1,
  },
];
