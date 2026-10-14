import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m05.l03',
  moduleId: 'core.m05',
  order: 3,
  title: 'Laços: repetir sem copiar e colar',
  concepts: ['for', 'while', 'for...of', 'break', 'continue'],
  sections: [
    {
      kind: 'text',
      markdown:
        'Quando a mesma coisa precisa acontecer várias vezes, use um **laço** (loop) em vez de copiar a linha ' +
        'dez vezes.\n\n' +
        '**`for`** tem três partes separadas por `;`: o começo, a condição para continuar e o passo.\n\n' +
        "```js\nfor (let i = 1; i <= 3; i++) {\n  console.log('Entrega ' + i);\n}\n```\n\n" +
        '`i++` soma 1 em `i`. O laço roda enquanto `i <= 3` for verdadeiro: imprime Entrega 1, 2 e 3.\n\n' +
        '**`while`** repete enquanto a condição for verdadeira. Cuidado: se nada dentro do laço mudar a ' +
        'condição, ele **nunca termina** e trava o programa (o famoso laço infinito).',
    },
    {
      kind: 'example',
      language: 'js',
      code: `let tanque = 4;
let km = 0;
while (tanque > 0) {
  km += 12;
  tanque -= 1;
}
console.log('Rodou ' + km + ' km até a pane seca');`,
      explanation:
        'Cada volta gasta 1 litro e anda 12 km. Quando o tanque chega a 0, a condição fica falsa e o laço para.',
    },
    {
      kind: 'text',
      markdown:
        '**`for...of`** percorre os itens de uma lista um por um, sem você cuidar de índice. Uma lista entre ' +
        "colchetes, como `['Centro', 'Km 18']`, é um **array** (a próxima aula é toda sobre eles). " +
        'Também funciona com textos, letra por letra.\n\n' +
        'Dentro de qualquer laço:\n\n' +
        '- **`break`** sai do laço na hora;\n' +
        '- **`continue`** pula o resto desta volta e vai para a próxima.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const bairros = ['Centro', 'Km 18', 'Granja Viana', 'Carapicuíba'];
for (const bairro of bairros) {
  if (bairro === 'Km 18') continue;
  if (bairro === 'Carapicuíba') break;
  console.log('Entregando em ' + bairro);
}`,
      explanation:
        'O Km 18 é pulado com `continue`; ao chegar em Carapicuíba o `break` encerra o laço antes de imprimir.',
    },
  ],
  checkQuestionIds: ['core.m05.q17'],
  exerciseIds: ['core.m05.e03', 'core.m05.e04'],
  debugExerciseIds: ['core.m05.d03'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m05.e03',
    lessonId: 'core.m05.l03',
    kind: 'implement',
    title: 'Quantos dias até o conserto?',
    promptMarkdown:
      'O mecânico cobrou o conserto do seu carro e você economiza o mesmo valor todo dia. Crie a função ' +
      '`diasParaJuntar(meta, porDia)` que devolve **quantos dias** são precisos para o total guardado ' +
      'chegar (ou passar) na `meta`. Use um laço `while`.\n\n' +
      'Exemplo: meta de R$ 100 guardando R$ 30 por dia → 4 dias (30, 60, 90, 120).',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function diasParaJuntar(meta, porDia) {
  let guardado = 0;
  let dias = 0;
  // seu laço aqui
  return dias;
}
`,
    solution: `function diasParaJuntar(meta, porDia) {
  let guardado = 0;
  let dias = 0;
  while (guardado < meta) {
    guardado += porDia;
    dias++;
  }
  return dias;
}
`,
    tests: [
      {
        description: 'R$ 100 guardando R$ 30 por dia leva 4 dias',
        code: 'assert.strictEqual(diasParaJuntar(100, 30), 4);',
      },
      {
        description: 'R$ 90 guardando R$ 30 por dia leva 3 dias (bate certinho)',
        code: 'assert.strictEqual(diasParaJuntar(90, 30), 3);',
      },
      {
        description: 'meta de R$ 0 leva 0 dias',
        code: 'assert.strictEqual(diasParaJuntar(0, 30), 0);',
      },
    ],
    hints: [
      'A condição do `while` é "ainda não juntei": `guardado < meta`.',
      'Dentro do laço, some `porDia` em `guardado` e 1 em `dias`. Se esquecer de mudar `guardado`, o laço nunca acaba.',
    ],
    followUpQuestionIds: ['core.m05.f09', 'core.m05.f10'],
    difficulty: 2,
  },
  {
    id: 'core.m05.e04',
    lessonId: 'core.m05.l03',
    kind: 'implement',
    title: 'As tasks do dia',
    promptMarkdown:
      'O cliente mandou a lista de tasks do kanban, mas ela vem bagunçada. Crie a função `listarTasks(tasks)` ' +
      'que imprime cada task com `console.log`, no formato `- Nome da task`, usando `for...of`. Regras:\n\n' +
      "- tasks vazias (`''`) são puladas (`continue`);\n" +
      '- ao chegar na task `\'FIM\'`, pare (`break`): o que vem depois é "pra semana que vem".',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function listarTasks(tasks) {
  for (const task of tasks) {
    console.log('- ' + task);
  }
}
`,
    solution: `function listarTasks(tasks) {
  for (const task of tasks) {
    if (task === '') continue;
    if (task === 'FIM') break;
    console.log('- ' + task);
  }
}
`,
    tests: [
      {
        description: 'imprime as tasks no formato "- Nome"',
        code: "listarTasks(['Login', 'Rodapé']);\nassert.deepStrictEqual(__logs, ['- Login', '- Rodapé']);",
      },
      {
        description: 'pula as tasks vazias',
        code: "listarTasks(['Login', '', 'Banner']);\nassert.deepStrictEqual(__logs, ['- Login', '- Banner']);",
      },
      {
        description: "para ao chegar em 'FIM'",
        code: "listarTasks(['Login', '', 'Rodapé', 'FIM', 'Carrossel 3D']);\nassert.deepStrictEqual(__logs, ['- Login', '- Rodapé']);",
      },
    ],
    hints: [
      'Dentro do `for...of`, antes do `console.log`, teste a task com `if`.',
      "`if (task === '') continue;` pula a volta; `if (task === 'FIM') break;` sai do laço.",
    ],
    followUpQuestionIds: ['core.m05.f11', 'core.m05.f12'],
    difficulty: 2,
  },
  {
    id: 'core.m05.d03',
    lessonId: 'core.m05.l03',
    kind: 'debug',
    title: 'O pagamento que cresce (só que não)',
    promptMarkdown:
      'O cliente prometeu pagar R$ 1 no primeiro dia, R$ 2 no segundo, R$ 3 no terceiro... A função ' +
      '`totalEmDias(n)` deveria somar quanto você recebe em `n` dias (para 3 dias: 1 + 2 + 3 = 6), mas o ' +
      'total sempre vem menor. Conserte o laço.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function totalEmDias(n) {
  let total = 0;
  for (let dia = 1; dia < n; dia++) {
    total += dia;
  }
  return total;
}
`,
    solution: `function totalEmDias(n) {
  let total = 0;
  for (let dia = 1; dia <= n; dia++) {
    total += dia;
  }
  return total;
}
`,
    tests: [
      { description: 'em 3 dias recebe R$ 6', code: 'assert.strictEqual(totalEmDias(3), 6);' },
      { description: 'em 10 dias recebe R$ 55', code: 'assert.strictEqual(totalEmDias(10), 55);' },
      { description: 'em 1 dia recebe R$ 1', code: 'assert.strictEqual(totalEmDias(1), 1);' },
    ],
    hints: ['Para `n = 3`, quais valores `dia` assume? O último dia está entrando na conta?'],
    followUpQuestionIds: ['core.m05.f13', 'core.m05.f14'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m05.q17',
    lessonIds: ['core.m05.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `for (let i = 0; i < 3; i++) {
  console.log(i);
}`,
    expectedOutput: '0\n1\n2',
    explanation: 'Começa em 0 e roda enquanto `i < 3`: 0, 1 e 2. Quando `i` vira 3, o laço para.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q18',
    lessonIds: ['core.m05.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `for (let km = 10; km <= 50; km += 10) {
  if (km === 40) break;
  console.log(km);
}`,
    expectedOutput: '10\n20\n30',
    explanation: 'Quando `km` chega a 40, o `break` encerra o laço antes de imprimir.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q19',
    lessonIds: ['core.m05.l03'],
    kind: 'predict-output',
    prompt: 'Você só trabalha nos dias ímpares (o resto é reunião). O que este código imprime?',
    code: `for (let dia = 1; dia <= 5; dia++) {
  if (dia % 2 === 0) continue;
  console.log('Dia ' + dia);
}`,
    expectedOutput: 'Dia 1\nDia 3\nDia 5',
    explanation: 'Nos dias pares o `continue` pula o `console.log` e vai para a próxima volta.',
    difficulty: 2,
  },
  {
    id: 'core.m05.q20',
    lessonIds: ['core.m05.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `let gasolina = 3;
while (gasolina > 0) {
  console.log('Vrum! Restam ' + gasolina);
  gasolina--;
}
console.log('Pane seca.');`,
    expectedOutput: 'Vrum! Restam 3\nVrum! Restam 2\nVrum! Restam 1\nPane seca.',
    explanation: 'O laço roda com 3, 2 e 1. Quando `gasolina` vira 0, a condição fica falsa.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q21',
    lessonIds: ['core.m05.l03'],
    kind: 'multiple-choice',
    prompt: 'O que acontece com este laço?',
    code: `let km = 0;
while (km < 10) {
  console.log('Quase chegando...');
}`,
    options: [
      'Nunca termina: `km` nunca muda, então a condição é sempre verdadeira',
      'Imprime 10 vezes',
      'Não imprime nada',
      'Dá erro de sintaxe',
    ],
    answerIndex: 0,
    explanation: 'Faltou `km++` (ou algo que mude `km`). É o laço infinito, o "quase chegando" eterno.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q22',
    lessonIds: ['core.m05.l03'],
    kind: 'true-false',
    prompt: '`for...of` percorre os valores de uma lista um por vez, sem precisar de um contador de índice.',
    answer: true,
    explanation: 'Em `for (const item of lista)`, `item` recebe cada valor da lista, em ordem.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q23',
    lessonIds: ['core.m05.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para percorrer todas as tasks.',
    code: `for (const task ___ tasks) {
  console.log(task);
}`,
    acceptedAnswers: ['of'],
    explanation: '`for...of` usa a palavra `of` entre a variável e a lista.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q24',
    lessonIds: ['core.m05.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `let buzina = '';
for (const letra of 'bip') {
  buzina += letra.toUpperCase();
}
console.log(buzina);`,
    expectedOutput: 'BIP',
    explanation: '`for...of` num texto passa letra por letra: b, i, p. Cada uma entra em maiúscula.',
    difficulty: 2,
  },
  {
    id: 'core.m05.q25',
    lessonIds: ['core.m05.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual a diferença entre `break` e `continue`?',
    options: [
      '`break` sai do laço; `continue` pula só a volta atual',
      '`break` pula só a volta atual; `continue` sai do laço',
      'Os dois saem do laço',
      '`continue` reinicia o laço do começo',
    ],
    answerIndex: 0,
    explanation: '`break` encerra o laço inteiro. `continue` vai direto para a próxima volta.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'core.m05.f09',
    lessonIds: ['core.m05.l03'],
    exerciseId: 'core.m05.e03',
    kind: 'multiple-choice',
    prompt: 'Com a sua `diasParaJuntar`, quanto devolve `diasParaJuntar(50, 20)`?',
    options: ['3', '2', '2.5', '50'],
    answerIndex: 0,
    explanation: 'Depois de 2 dias você tem R$ 40, ainda menos que 50. No 3º dia chega a R$ 60.',
    difficulty: 2,
  },
  {
    id: 'core.m05.f10',
    lessonIds: ['core.m05.l03'],
    exerciseId: 'core.m05.e03',
    kind: 'true-false',
    prompt: 'Se você esquecesse a linha que soma `porDia` em `guardado`, o seu `while` nunca terminaria.',
    answer: true,
    explanation: 'Sem mudar `guardado`, a condição `guardado < meta` continua verdadeira para sempre.',
    difficulty: 1,
  },
  {
    id: 'core.m05.f11',
    lessonIds: ['core.m05.l03'],
    exerciseId: 'core.m05.e04',
    kind: 'predict-output',
    prompt: 'Usando a sua `listarTasks`, o que este código imprime?',
    code: `function listarTasks(tasks) {
  for (const task of tasks) {
    if (task === '') continue;
    if (task === 'FIM') break;
    console.log('- ' + task);
  }
}
listarTasks(['', 'Menu', 'FIM', 'Rodapé']);`,
    expectedOutput: '- Menu',
    explanation: 'A vazia é pulada, "Menu" é impressa e em "FIM" o laço para: "Rodapé" nunca aparece.',
    difficulty: 2,
  },
  {
    id: 'core.m05.f12',
    lessonIds: ['core.m05.l03'],
    exerciseId: 'core.m05.e04',
    kind: 'multiple-choice',
    prompt: "Na sua `listarTasks`, o que mudaria se você trocasse o `break` do 'FIM' por `continue`?",
    options: [
      "As tasks depois de 'FIM' também seriam impressas (só o 'FIM' seria pulado)",
      'Nada mudaria',
      'O laço nunca terminaria',
      'Nenhuma task seria impressa',
    ],
    answerIndex: 0,
    explanation: '`continue` só pula aquela volta; o laço seguiria até o fim da lista.',
    difficulty: 2,
  },
  {
    id: 'core.m05.f13',
    lessonIds: ['core.m05.l03'],
    exerciseId: 'core.m05.d03',
    kind: 'multiple-choice',
    prompt: 'Antes do conserto, quanto `totalEmDias(3)` devolvia?',
    options: ['3', '6', '0', '2'],
    answerIndex: 0,
    explanation: 'Com `dia < 3`, só os dias 1 e 2 entravam: 1 + 2 = 3. O último dia ficava de fora.',
    difficulty: 1,
  },
  {
    id: 'core.m05.f14',
    lessonIds: ['core.m05.l03'],
    exerciseId: 'core.m05.d03',
    kind: 'fill-blank',
    prompt: 'Complete a condição do seu laço consertado.',
    code: `for (let dia = 1; ___; dia++) {
  total += dia;
}`,
    acceptedAnswers: ['dia <= n', 'dia<=n', 'dia < n + 1', 'n >= dia'],
    explanation: 'Com `<=` o dia `n` também entra na soma.',
    difficulty: 1,
  },
];
