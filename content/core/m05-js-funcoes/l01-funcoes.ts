import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m05.l01',
  moduleId: 'core.m05',
  order: 1,
  title: 'Funções: a calculadora do orçamento',
  concepts: ['declaração de função', 'chamada de função', 'parâmetros e argumentos', 'return'],
  sections: [
    {
      kind: 'text',
      markdown:
        'Todo cliente pergunta "quanto fica?". Em vez de refazer a conta toda vez, você guarda a conta numa ' +
        '**função**: um bloco de código com nome que só roda quando é **chamado**.\n\n' +
        '```js\nfunction orcamento(horas, valorHora) {\n  return horas * valorHora;\n}\n```\n\n' +
        '- `function` declara a função; `orcamento` é o nome dela.\n' +
        '- `horas` e `valorHora` são **parâmetros**: variáveis que recebem os valores na hora da chamada.\n' +
        '- Na chamada `orcamento(3, 40)`, os valores `3` e `40` são os **argumentos**.\n' +
        '- `return` entrega o resultado para quem chamou e **encerra** a função na hora. ' +
        'O que vem depois do `return` nunca roda.\n\n' +
        'Se a função não tem `return`, ela devolve `undefined`. E se você esquecer um argumento, o parâmetro ' +
        'correspondente também vale `undefined`.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `function orcamento(horas, valorHora) {
  return horas * valorHora;
}

const site = orcamento(3, 40);
console.log(site);
console.log(orcamento(1, 40) + orcamento(2, 25));`,
      explanation:
        'A mesma função serve para vários orçamentos. O resultado do `return` pode ir para uma variável ou ' +
        'direto para uma conta.',
    },
    {
      kind: 'text',
      markdown:
        '**`console.log` não é `return`.** O `console.log` só mostra um texto no terminal; quem chamou a ' +
        'função não recebe nada. Já o `return` devolve o valor para ser usado depois (somar, comparar, ' +
        'guardar). Regra de bolso: função que **calcula** algo deve usar `return`.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `function avisarCliente(nome) {
  console.log('Bom dia, ' + nome + '! Tô chegando.');
}

const resposta = avisarCliente('Seu Zé');
console.log(resposta);`,
      explanation: 'A função imprime o aviso, mas não tem `return`, então `resposta` fica com `undefined`.',
    },
  ],
  checkQuestionIds: ['core.m05.q01'],
  exerciseIds: ['core.m05.e01'],
  debugExerciseIds: ['core.m05.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m05.e01',
    lessonId: 'core.m05.l01',
    kind: 'implement',
    title: 'Quanto custa a gasolina até o cliente?',
    promptMarkdown:
      'Seu carro de estagiário bebe mais que motorista de firma em festa de fim de ano. Crie a função ' +
      '`custoGasolina(km, kmPorLitro, precoLitro)` que **devolve** (com `return`) quanto você gasta de ' +
      'gasolina num trecho.\n\nExemplo: 100 km, fazendo 10 km por litro, com o litro a R$ 6 → R$ 60.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function custoGasolina(km, kmPorLitro, precoLitro) {
  // seu código aqui
}
`,
    solution: `function custoGasolina(km, kmPorLitro, precoLitro) {
  const litros = km / kmPorLitro;
  return litros * precoLitro;
}
`,
    tests: [
      {
        description: '100 km a 10 km/l com o litro a R$ 6 custam R$ 60',
        code: 'assert.strictEqual(custoGasolina(100, 10, 6), 60);',
      },
      {
        description: '27 km a 9 km/l com o litro a R$ 6 custam R$ 18',
        code: 'assert.strictEqual(custoGasolina(27, 9, 6), 18);',
      },
      {
        description: 'ficar parado (0 km) custa R$ 0',
        code: 'assert.strictEqual(custoGasolina(0, 10, 6), 0);',
      },
    ],
    hints: [
      'Primeiro descubra quantos litros o trecho gasta: `km / kmPorLitro`.',
      'Depois multiplique os litros pelo preço do litro e use `return` para devolver o resultado.',
    ],
    followUpQuestionIds: ['core.m05.f01', 'core.m05.f02'],
    difficulty: 1,
  },
  {
    id: 'core.m05.d01',
    lessonId: 'core.m05.l01',
    kind: 'debug',
    title: 'O lucro que sumiu',
    promptMarkdown:
      'A função `lucroDoJob(pagamento, gasolina)` deveria devolver quanto sobra de um job depois de pagar a ' +
      'gasolina. Ela até mostra o lucro na tela, mas quem chama a função recebe `undefined`. Conserte.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function lucroDoJob(pagamento, gasolina) {
  const lucro = pagamento - gasolina;
  console.log('Lucro: R$ ' + lucro);
}
`,
    solution: `function lucroDoJob(pagamento, gasolina) {
  const lucro = pagamento - gasolina;
  console.log('Lucro: R$ ' + lucro);
  return lucro;
}
`,
    tests: [
      {
        description: 'um job de R$ 80 com R$ 30 de gasolina dá R$ 50 de lucro',
        code: 'assert.strictEqual(lucroDoJob(80, 30), 50);',
      },
      {
        description: 'um job de R$ 40 com R$ 45 de gasolina dá prejuízo de R$ 5',
        code: 'assert.strictEqual(lucroDoJob(40, 45), -5);',
      },
    ],
    hints: ['Mostrar na tela não é devolver. O que falta para a função entregar o `lucro` para quem chamou?'],
    followUpQuestionIds: ['core.m05.f03', 'core.m05.f04'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m05.q01',
    lessonIds: ['core.m05.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function taxa(valor) {
  valor * 0.1;
}
console.log(taxa(200));`,
    expectedOutput: 'undefined',
    explanation: 'A conta é feita, mas sem `return` a função não devolve nada: o resultado é `undefined`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q02',
    lessonIds: ['core.m05.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function orcamento(horas, valorHora) {
  return horas * valorHora;
  console.log('Fechado!');
}
console.log(orcamento(2, 50));`,
    expectedOutput: '100',
    explanation: 'O `return` encerra a função na hora, então o `console.log` de dentro nunca roda.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q03',
    lessonIds: ['core.m05.l01'],
    kind: 'multiple-choice',
    prompt:
      'Em `function frete(km) { return km * 4; }` chamada como `frete(12)`, o que é `km` e o que é `12`?',
    options: [
      '`km` é o parâmetro e `12` é o argumento',
      '`km` é o argumento e `12` é o parâmetro',
      'Os dois são parâmetros',
      '`km` é o retorno e `12` é o parâmetro',
    ],
    answerIndex: 0,
    explanation:
      'Parâmetro é o nome declarado na função; argumento é o valor passado na chamada. Na chamada, `km` vale 12.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q04',
    lessonIds: ['core.m05.l01'],
    kind: 'true-false',
    prompt: 'O código de dentro de uma função declarada com `function` só roda quando a função é chamada.',
    answer: true,
    explanation: 'Declarar só ensina a receita. Ela é executada a cada chamada, como `orcamento(3, 40)`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q05',
    lessonIds: ['core.m05.l01'],
    kind: 'predict-output',
    prompt: 'O cliente esqueceu de mandar o bairro. O que este código imprime?',
    code: `function apresentar(nome, bairro) {
  return nome + ' de ' + bairro;
}
console.log(apresentar('Dona Cida'));`,
    expectedOutput: 'Dona Cida de undefined',
    explanation: 'Faltou o segundo argumento, então o parâmetro `bairro` vale `undefined`.',
    difficulty: 2,
  },
  {
    id: 'core.m05.q06',
    lessonIds: ['core.m05.l01'],
    kind: 'fill-blank',
    prompt: 'Complete com a palavra que declara uma função.',
    code: `___ desconto(valor) {
  return valor * 0.9;
}`,
    acceptedAnswers: ['function'],
    explanation:
      'Funções declaradas começam com a palavra-chave `function`, seguida do nome e dos parâmetros.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q07',
    lessonIds: ['core.m05.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function avisar() {
  console.log('Chegando!');
  return 'ok';
}
const resposta = avisar();
console.log(resposta);`,
    expectedOutput: 'Chegando!\nok',
    explanation:
      'A chamada `avisar()` imprime "Chegando!" e devolve "ok", que vai para `resposta` e é impresso em seguida.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q08',
    lessonIds: ['core.m05.l01'],
    kind: 'multiple-choice',
    prompt: 'Qual a diferença entre `console.log(x)` e `return x` dentro de uma função?',
    options: [
      '`console.log` só mostra na tela; `return` entrega o valor para quem chamou a função',
      'Nenhuma, os dois devolvem o valor',
      '`return` mostra na tela e `console.log` guarda numa variável',
      '`console.log` encerra a função e `return` continua',
    ],
    answerIndex: 0,
    explanation: 'Só o `return` faz a chamada da função "valer" alguma coisa. O `console.log` é só para ver.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'core.m05.f01',
    lessonIds: ['core.m05.l01'],
    exerciseId: 'core.m05.e01',
    kind: 'multiple-choice',
    prompt: 'Com a sua `custoGasolina`, quanto devolve `custoGasolina(50, 10, 6)`?',
    options: ['30', '300', '5', 'undefined'],
    answerIndex: 0,
    explanation: '50 km ÷ 10 km/l = 5 litros; 5 × R$ 6 = R$ 30.',
    difficulty: 1,
  },
  {
    id: 'core.m05.f02',
    lessonIds: ['core.m05.l01'],
    exerciseId: 'core.m05.e01',
    kind: 'true-false',
    prompt:
      'Se você trocasse o `return` da sua `custoGasolina` por um `console.log` do resultado, os testes continuariam passando.',
    answer: false,
    explanation:
      'Os testes comparam o valor devolvido. Com `console.log` a função devolveria `undefined` e falharia.',
    difficulty: 1,
  },
  {
    id: 'core.m05.f03',
    lessonIds: ['core.m05.l01'],
    exerciseId: 'core.m05.d01',
    kind: 'multiple-choice',
    prompt: 'Antes do seu conserto, o que `lucroDoJob(80, 30)` devolvia para quem chamou?',
    options: ['undefined', '50', "'Lucro: R$ 50'", 'null'],
    answerIndex: 0,
    explanation: 'Ela imprimia "Lucro: R$ 50", mas sem `return` o valor devolvido era `undefined`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.f04',
    lessonIds: ['core.m05.l01'],
    exerciseId: 'core.m05.d01',
    kind: 'fill-blank',
    prompt: 'Complete a linha que você acrescentou para consertar a função.',
    code: `function lucroDoJob(pagamento, gasolina) {
  const lucro = pagamento - gasolina;
  ___ lucro;
}`,
    acceptedAnswers: ['return'],
    explanation: '`return lucro;` entrega o lucro para quem chamou a função.',
    difficulty: 1,
  },
];
