import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'back.m01.l04',
  moduleId: 'back.m01',
  order: 4,
  title: 'Linha de comando: process.argv e process.env',
  concepts: [
    'process.argv',
    'argumentos são texto',
    'validar argumentos',
    'process.env',
    'valor padrão com ??',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Cliente adora perguntar "quanto fica?" pelo WhatsApp enquanto você dirige. Que tal um script que ' +
        'responde na hora:\n\n```\n$ node orcamento.js 3 horas\nOrçamento: R$ 240\n```\n\n' +
        'O que vem depois do nome do script são os **argumentos**, e eles chegam em **`process.argv`**, um ' +
        'array de textos:\n\n' +
        '```js\n// node orcamento.js 3 horas\nprocess.argv;\n' +
        "// [ '/usr/local/bin/node', '/app/orcamento.js', '3', 'horas' ]\n```\n\n" +
        '- posição `0`: o caminho do programa `node`;\n' +
        '- posição `1`: o caminho do script;\n' +
        '- da posição `2` em diante: os argumentos que você digitou.\n\n' +
        'Por isso o jeito mais comum de começar é `const args = process.argv.slice(2);`, que pula as duas ' +
        'primeiras posições.',
    },
    {
      kind: 'text',
      markdown:
        "**Argumento é sempre texto.** Mesmo que você digite `3`, chega `'3'` (string). Somar sem " +
        "converter dá a famosa conta de freela: `'3' + '2'` é `'32'`. Converta com `Number(...)` e " +
        'confira: se o texto não for número, `Number` devolve `NaN`, e `Number.isNaN(valor)` diz se deu ' +
        'isso.\n\n' +
        '**Valide antes de usar.** Um bom script de terminal, quando recebe algo errado, explica como se ' +
        'usa no **stderr** e sai com código diferente de 0:\n\n' +
        '```js\nif (args.length < 2 || Number.isNaN(Number(args[0]))) {\n' +
        "  console.error('Uso: node orcamento.js <quantidade> <horas|dias>');\n" +
        '  process.exit(1);\n}\n```',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const args = ['node', 'horas.js', '3', '2'].slice(2);

console.log(args);
console.log(args[0] + args[1]);
console.log(Number(args[0]) + Number(args[1]));
console.log(Number('três'));`,
      explanation:
        'Aqui o array foi escrito na mão para você ver o resultado, mas é exatamente o que chegaria em ' +
        "`process.argv`. Somar os textos junta `'3'` com `'2'`; convertendo antes, dá 5. E texto que " +
        'não é número vira `NaN`.',
    },
    {
      kind: 'text',
      markdown:
        '**Configuração em variáveis de ambiente.** Coisas que mudam de um computador para outro (o valor ' +
        'da sua hora, a porta do servidor, a senha do banco) não ficam escritas no código: ficam em ' +
        '**variáveis de ambiente**, lidas em `process.env`:\n\n' +
        '```\n$ VALOR_HORA=100 node orcamento.js 3 horas\nOrçamento: R$ 300\n```\n\n' +
        '```js\nconst valorHora = Number(process.env.VALOR_HORA ?? 80);\n```\n\n' +
        'Duas coisas para lembrar:\n\n' +
        '- se a variável não foi definida, `process.env.VALOR_HORA` é `undefined`. O operador **`??`** ' +
        '(coalescência nula) usa o valor da direita só quando o da esquerda é `undefined` ou `null`;\n' +
        '- assim como os argumentos, valores do `process.env` são **texto**. Converta com `Number`.\n\n' +
        'Por que `??` e não `||`? O `||` troca **qualquer** valor "falso" (`0`, `\'\'`, `false`) pelo ' +
        'padrão. Com `||`, um desconto de `0` virava o desconto padrão sem você perceber.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const porta = process.env.PORTA ?? '3000';
console.log('Servidor na porta ' + porta);

const desconto = 0;
console.log(desconto || 10);
console.log(desconto ?? 10);`,
      explanation:
        "Como `PORTA` não foi definida, vale o padrão `'3000'`. No desconto, `||` troca o 0 por 10, " +
        'mas `??` mantém o 0, porque 0 não é `undefined` nem `null`.',
    },
  ],
  checkQuestionIds: ['back.m01.q26', 'back.m01.q27'],
  exerciseIds: ['back.m01.e04'],
  debugExerciseIds: ['back.m01.d04'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m01.e04',
    lessonId: 'back.m01.l04',
    kind: 'implement',
    title: 'CLI de orçamento',
    promptMarkdown:
      'Crie o seu `orcamento.js`, que vai ser rodado como `node orcamento.js 3 horas`.\n\n' +
      'Escreva a função `orcamento(args)`, que recebe os argumentos **já sem as duas primeiras posições** ' +
      "(algo como `['3', 'horas']`), e no fim do arquivo chame `orcamento(process.argv.slice(2));`.\n\n" +
      '- O valor da hora vem de `process.env.VALOR_HORA`; se não estiver definido, use `80`.\n' +
      '- A unidade pode ser `horas` ou `dias` (um dia de trabalho tem 8 horas).\n' +
      '- Com argumentos válidos, imprima no stdout `Orçamento: R$ <total>`.\n' +
      '- Se faltar argumento, se a quantidade não for número ou se a unidade for outra coisa, escreva no ' +
      'stderr `Uso: node orcamento.js <quantidade> <horas|dias>` e marque `process.exitCode = 1` ' +
      '(sem imprimir orçamento).',
    language: 'js',
    moduleSystem: 'commonjs',
    argv: ['3', 'horas'],
    starterCode: `function orcamento(args) {
  // seu código aqui
}

orcamento(process.argv.slice(2));
`,
    solution: `function orcamento(args) {
  const quantidade = Number(args[0]);
  const unidade = args[1];
  const valorHora = Number(process.env.VALOR_HORA ?? 80);

  if (Number.isNaN(quantidade) || (unidade !== 'horas' && unidade !== 'dias')) {
    console.error('Uso: node orcamento.js <quantidade> <horas|dias>');
    process.exitCode = 1;
    return;
  }

  const horas = unidade === 'dias' ? quantidade * 8 : quantidade;
  console.log('Orçamento: R$ ' + horas * valorHora);
}

orcamento(process.argv.slice(2));
`,
    tests: [
      {
        description: '`node orcamento.js 3 horas` imprime R$ 240',
        code: "assert.deepStrictEqual(__logs, ['Orçamento: R$ 240']);",
      },
      {
        description: '2 dias são 16 horas',
        code: `__logs.length = 0;
orcamento(['2', 'dias']);
assert.deepStrictEqual(__logs, ['Orçamento: R$ 1280']);`,
      },
      {
        description: 'usa o VALOR_HORA do ambiente quando existe',
        code: `process.env.VALOR_HORA = '100';
__logs.length = 0;
orcamento(['3', 'horas']);
assert.deepStrictEqual(__logs, ['Orçamento: R$ 300']);`,
      },
      {
        description: 'quantidade que não é número mostra o uso e sai com código 1',
        code: `__logs.length = 0;
orcamento(['três', 'horas']);
assert.deepStrictEqual(__errors, ['Uso: node orcamento.js <quantidade> <horas|dias>']);
assert.deepStrictEqual(__logs, []);
assert.strictEqual(process.exitCode, 1);`,
      },
      {
        description: 'unidade faltando ou desconhecida também mostra o uso',
        code: `__logs.length = 0;
orcamento(['3']);
orcamento(['3', 'semanas']);
assert.strictEqual(__errors.length, 2);
assert.deepStrictEqual(__logs, []);
assert.strictEqual(process.exitCode, 1);`,
      },
    ],
    hints: [
      'Comece com `const quantidade = Number(args[0]);` e `const unidade = args[1];`. O valor da hora é `Number(process.env.VALOR_HORA ?? 80)`.',
      'Valide primeiro: se `Number.isNaN(quantidade)` ou a unidade não for `horas` nem `dias`, use `console.error`, `process.exitCode = 1` e `return`.',
      'Se a unidade for `dias`, multiplique a quantidade por 8 antes de multiplicar pelo valor da hora.',
    ],
    followUpQuestionIds: ['back.m01.f13', 'back.m01.f14'],
    difficulty: 2,
  },
  {
    id: 'back.m01.d04',
    lessonId: 'back.m01.l04',
    kind: 'debug',
    title: 'A soma de horas que dá 32',
    promptMarkdown:
      'O script `horas.js` soma as horas da manhã e da tarde: `node horas.js 3 2` deveria imprimir ' +
      '`Total: 5 horas`. O sobrinho do cliente jura que testou, mas hoje ele imprimiu outra coisa ' +
      'completamente diferente. Conserte a função `somarHoras(argv)`, que recebe o `process.argv` inteiro ' +
      'e devolve o total como **número**.',
    language: 'js',
    moduleSystem: 'commonjs',
    argv: ['3', '2'],
    starterCode: `function somarHoras(argv) {
  const manha = argv[1];
  const tarde = argv[2];
  return manha + tarde;
}

console.log('Total: ' + somarHoras(process.argv) + ' horas');
`,
    solution: `function somarHoras(argv) {
  const manha = Number(argv[2]);
  const tarde = Number(argv[3]);
  return manha + tarde;
}

console.log('Total: ' + somarHoras(process.argv) + ' horas');
`,
    tests: [
      {
        description: '`node horas.js 3 2` imprime "Total: 5 horas"',
        code: "assert.deepStrictEqual(__logs, ['Total: 5 horas']);",
      },
      {
        description: 'devolve um número',
        code: "assert.strictEqual(somarHoras(['node', 'horas.js', '4', '4']), 8);",
      },
    ],
    hints: [
      'Lembre o que tem nas posições 0 e 1 do `process.argv`. Os argumentos começam na posição 2.',
      "Mesmo depois de acertar as posições, `'3' + '2'` é `'32'`. Converta com `Number`.",
    ],
    followUpQuestionIds: ['back.m01.f15', 'back.m01.f16'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m01.q26',
    lessonIds: ['back.m01.l04'],
    kind: 'multiple-choice',
    prompt: 'Você rodou `node orcamento.js 5 dias`. O que tem em `process.argv[2]`?',
    options: ["'5' (texto)", '5 (número)', "'orcamento.js'", "'dias'"],
    answerIndex: 0,
    explanation:
      'As posições 0 e 1 são o `node` e o script. A 2 é o primeiro argumento, e argumento sempre chega como texto.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q27',
    lessonIds: ['back.m01.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const argv = ['node', 'horas.js', '4', '6'];
const args = argv.slice(2);
console.log(args[0] + args[1]);
console.log(Number(args[0]) + Number(args[1]));`,
    expectedOutput: '46\n10',
    explanation:
      'Argumentos são textos: somar textos junta os dois. Convertendo com `Number`, a soma é de verdade.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q28',
    lessonIds: ['back.m01.l04'],
    kind: 'predict-output',
    prompt: 'Ninguém definiu a variável de ambiente `PORTA`. O que este código imprime?',
    code: `const porta = process.env.PORTA ?? 3000;
console.log(porta);`,
    expectedOutput: '3000',
    explanation: 'Variável de ambiente não definida é `undefined`, então o `??` usa o valor padrão.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q29',
    lessonIds: ['back.m01.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const desconto = 0;
console.log(desconto || 15);
console.log(desconto ?? 15);`,
    expectedOutput: '15\n0',
    explanation:
      '`||` troca qualquer valor falso (inclusive 0) pelo padrão. `??` só troca `undefined` e `null`, então mantém o 0.',
    difficulty: 2,
  },
  {
    id: 'back.m01.q30',
    lessonIds: ['back.m01.l04'],
    kind: 'predict-output',
    prompt: 'O cliente digitou o número por extenso. O que este código imprime?',
    code: `const quantidade = Number('três');
console.log(quantidade);
console.log(Number.isNaN(quantidade));`,
    expectedOutput: 'NaN\ntrue',
    explanation:
      'Texto que não representa um número vira `NaN`, e `Number.isNaN` é o jeito certo de detectar isso.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q31',
    lessonIds: ['back.m01.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para pegar só os argumentos digitados, sem o caminho do `node` e do script.',
    code: `const args = process.argv.slice(___);`,
    acceptedAnswers: ['2'],
    explanation: '`slice(2)` pula as posições 0 (node) e 1 (script) e devolve o resto.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q32',
    lessonIds: ['back.m01.l04'],
    kind: 'multiple-choice',
    prompt: 'O usuário rodou o seu CLI sem argumentos. Qual é o comportamento mais adequado?',
    options: [
      'Explicar o uso no stderr e sair com código diferente de 0',
      'Imprimir "Orçamento: R$ NaN" e sair com código 0',
      'Explicar o uso no stdout e sair com código 0',
      'Ficar em silêncio para não assustar o cliente',
    ],
    answerIndex: 0,
    explanation:
      'Erro vai para o stderr e o código de saída diferente de 0 avisa quem chamou (um script, um deploy) que algo deu errado.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q33',
    lessonIds: ['back.m01.l04'],
    kind: 'true-false',
    prompt: 'Rodando `VALOR_HORA=90 node orcamento.js`, `process.env.VALOR_HORA` vale o número `90`.',
    answer: false,
    explanation:
      "Variáveis de ambiente chegam sempre como texto: vale `'90'`. Converta com `Number` antes de fazer contas.",
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'back.m01.f13',
    lessonIds: ['back.m01.l04'],
    exerciseId: 'back.m01.e04',
    kind: 'multiple-choice',
    prompt: 'Com o seu `orcamento.js`, o que imprime `VALOR_HORA=50 node orcamento.js 1 dias`?',
    options: ['Orçamento: R$ 400', 'Orçamento: R$ 50', 'Orçamento: R$ 640', 'Orçamento: R$ 80'],
    answerIndex: 0,
    explanation: '1 dia são 8 horas; com a hora a 50 (do ambiente), dá 8 × 50 = 400.',
    difficulty: 2,
  },
  {
    id: 'back.m01.f14',
    lessonIds: ['back.m01.l04'],
    exerciseId: 'back.m01.e04',
    kind: 'multiple-choice',
    prompt:
      'No seu `orcamento.js`, por que usar `process.exitCode = 1` (ou `process.exit(1)`) quando os argumentos estão errados?',
    options: [
      'Para quem rodou o script (outro script, um deploy) saber que deu errado',
      'Para o Node mostrar a mensagem de uso',
      'Para apagar o que foi impresso no stdout',
      'Porque sem isso o `console.error` não aparece',
    ],
    answerIndex: 0,
    explanation:
      'O código de saída é como o programa avisa a quem o chamou que falhou. A mensagem em si vem do `console.error`.',
    difficulty: 1,
  },
  {
    id: 'back.m01.f15',
    lessonIds: ['back.m01.l04'],
    exerciseId: 'back.m01.d04',
    kind: 'multiple-choice',
    prompt:
      'Antes do conserto, `somarHoras` usava `argv[1]` e `argv[2]`. Com `node horas.js 3 2`, o que era `argv[1]`?',
    options: ['O caminho do script horas.js', "'3'", "'2'", 'O caminho do programa node'],
    answerIndex: 0,
    explanation: 'A posição 0 é o `node`, a 1 é o script. Os argumentos só começam na posição 2.',
    difficulty: 1,
  },
  {
    id: 'back.m01.f16',
    lessonIds: ['back.m01.l04'],
    exerciseId: 'back.m01.d04',
    kind: 'predict-output',
    prompt:
      'Se você só tivesse acertado as posições, mas esquecido o `Number`, o que este código imprimiria?',
    code: `function somarHoras(argv) {
  const manha = argv[2];
  const tarde = argv[3];
  return manha + tarde;
}
console.log('Total: ' + somarHoras(['node', 'horas.js', '3', '2']) + ' horas');`,
    expectedOutput: 'Total: 32 horas',
    explanation:
      "Sem converter, `'3' + '2'` junta os textos e vira `'32'`. Daí as 32 horas de trabalho que o cliente não vai pagar.",
    difficulty: 1,
  },
];
