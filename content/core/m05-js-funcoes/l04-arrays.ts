import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m05.l04',
  moduleId: 'core.m05',
  order: 4,
  title: 'Arrays: a lista de jobs',
  concepts: ['array', 'índice', 'length', 'push e pop', 'includes', 'indexOf'],
  sections: [
    {
      kind: 'text',
      markdown:
        'Um **array** é uma lista de valores, entre colchetes e separados por vírgula:\n\n' +
        "```js\nconst jobs = ['Site da padaria', 'Cardápio do bar', 'Logo da oficina'];\n```\n\n" +
        '- Cada item tem uma posição, o **índice**, que **começa em 0**: `jobs[0]` é o primeiro.\n' +
        '- `jobs.length` diz quantos itens existem (aqui, 3).\n' +
        '- O último item fica em `jobs[jobs.length - 1]`. Pedir uma posição que não existe dá `undefined`, ' +
        'não erro.\n' +
        "- Dá para trocar um item: `jobs[1] = 'Cardápio novo'`.",
    },
    {
      kind: 'example',
      language: 'js',
      code: `const jobs = ['Site da padaria', 'Cardápio do bar', 'Logo da oficina'];
console.log(jobs[0]);
console.log(jobs.length);
console.log(jobs[jobs.length - 1]);
console.log(jobs[3]);`,
      explanation: 'Três itens, índices 0, 1 e 2. O índice 3 não existe, então vem `undefined`.',
    },
    {
      kind: 'text',
      markdown:
        'Métodos que você vai usar o tempo todo:\n\n' +
        '- `push(item)` coloca no **final** (e devolve o novo tamanho);\n' +
        '- `pop()` tira o **último** e devolve o item removido;\n' +
        '- `includes(item)` responde `true` ou `false`: o item está na lista?\n' +
        '- `indexOf(item)` devolve a posição do item, ou **`-1`** se ele não estiver lá.\n\n' +
        'Repare: um array em `const` ainda pode ganhar e perder itens. O `const` só impede trocar a lista ' +
        'inteira por outra com `=`.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const kanban = ['Login', 'Rodapé'];
kanban.push('Carrossel');
console.log(kanban);
const feita = kanban.pop();
console.log(feita);
console.log(kanban.includes('Login'));
console.log(kanban.indexOf('Rodapé'));
console.log(kanban.indexOf('Banner'));`,
      explanation:
        '`pop` devolve "Carrossel", que saiu da lista. "Banner" não existe, então `indexOf` dá -1.',
    },
  ],
  checkQuestionIds: ['core.m05.q26'],
  exerciseIds: ['core.m05.e05'],
  debugExerciseIds: ['core.m05.d04'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m05.e05',
    lessonId: 'core.m05.l04',
    kind: 'implement',
    title: 'Task repetida não entra',
    promptMarkdown:
      'O cliente manda a mesma task três vezes no WhatsApp, só para garantir. Crie a função ' +
      '`adicionarTask(kanban, task)` que coloca a `task` no **final** do array `kanban`, mas **só se ela ' +
      'ainda não estiver lá**. Em qualquer caso, devolva o tamanho do kanban.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function adicionarTask(kanban, task) {
  // seu código aqui
}
`,
    solution: `function adicionarTask(kanban, task) {
  if (!kanban.includes(task)) {
    kanban.push(task);
  }
  return kanban.length;
}
`,
    tests: [
      {
        description: 'uma task nova vai para o final',
        code: "const k = ['Login'];\nassert.strictEqual(adicionarTask(k, 'Rodapé'), 2);\nassert.deepStrictEqual(k, ['Login', 'Rodapé']);",
      },
      {
        description: 'uma task repetida não entra de novo',
        code: "const k = ['Login', 'Rodapé'];\nassert.strictEqual(adicionarTask(k, 'Login'), 2);\nassert.deepStrictEqual(k, ['Login', 'Rodapé']);",
      },
      {
        description: 'funciona com o kanban vazio',
        code: "const k = [];\nassert.strictEqual(adicionarTask(k, 'Banner'), 1);\nassert.deepStrictEqual(k, ['Banner']);",
      },
    ],
    hints: [
      'Use `kanban.includes(task)` para saber se ela já está lá. O `!` inverte a resposta.',
      'Depois do `if`, devolva `kanban.length`.',
    ],
    followUpQuestionIds: ['core.m05.f15', 'core.m05.f16'],
    difficulty: 1,
  },
  {
    id: 'core.m05.d04',
    lessonId: 'core.m05.l04',
    kind: 'debug',
    title: 'Quem mandou mensagem por último?',
    promptMarkdown:
      'A fila de clientes está em ordem de chegada das mensagens. A função `ultimoCliente(fila)` deveria ' +
      'devolver o **último** da fila (o mais impaciente), mas devolve `undefined`. Conserte.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function ultimoCliente(fila) {
  return fila[fila.length];
}
`,
    solution: `function ultimoCliente(fila) {
  return fila[fila.length - 1];
}
`,
    tests: [
      {
        description: 'com dois clientes, devolve o segundo',
        code: "assert.strictEqual(ultimoCliente(['Padaria Pão de Ontem', 'Bar do Tonhão']), 'Bar do Tonhão');",
      },
      {
        description: 'com um cliente só, devolve ele',
        code: "assert.strictEqual(ultimoCliente(['Auto Peças Parafuso Solto']), 'Auto Peças Parafuso Solto');",
      },
      {
        description: 'não tira ninguém da fila',
        code: "const fila = ['Padaria Pão de Ontem', 'Bar do Tonhão'];\nultimoCliente(fila);\nassert.strictEqual(fila.length, 2);",
      },
    ],
    hints: ['Os índices começam em 0. Num array de 2 itens, qual é o índice do último?'],
    followUpQuestionIds: ['core.m05.f17', 'core.m05.f18'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m05.q26',
    lessonIds: ['core.m05.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const bairros = ['Centro', 'Bela Vista', 'Km 18'];
console.log(bairros[1]);
console.log(bairros.length);`,
    expectedOutput: 'Bela Vista\n3',
    explanation: 'O índice começa em 0, então `bairros[1]` é o segundo item. São 3 itens no total.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q27',
    lessonIds: ['core.m05.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const tasks = ['Login'];
tasks.push('Rodapé');
tasks.push('Banner');
tasks.pop();
console.log(tasks);`,
    expectedOutput: "[ 'Login', 'Rodapé' ]",
    explanation: 'Dois `push` colocam "Rodapé" e "Banner" no final; o `pop` tira o último, "Banner".',
    difficulty: 1,
  },
  {
    id: 'core.m05.q28',
    lessonIds: ['core.m05.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const clientes = ['Padaria Pão de Ontem', 'Auto Peças Parafuso Solto'];
console.log(clientes.indexOf('Auto Peças Parafuso Solto'));
console.log(clientes.indexOf('Bar do Tonhão'));
console.log(clientes.includes('Bar do Tonhão'));`,
    expectedOutput: '1\n-1\nfalse',
    explanation: '`indexOf` devolve a posição (1) ou -1 se não achar; `includes` só responde `true`/`false`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q29',
    lessonIds: ['core.m05.l04'],
    kind: 'multiple-choice',
    prompt: 'Com `const estrelas = [5, 4, 3];`, quanto vale `estrelas[3]`?',
    options: ['undefined', '3', 'Dá erro', 'null'],
    answerIndex: 0,
    explanation: 'Os índices vão de 0 a 2. Uma posição que não existe devolve `undefined`, sem erro.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q30',
    lessonIds: ['core.m05.l04'],
    kind: 'true-false',
    prompt: 'Um array declarado com `const` não pode receber itens com `push`.',
    answer: false,
    explanation: '`const` só impede trocar a lista inteira com `=`. Mexer nos itens (push, pop) é permitido.',
    difficulty: 2,
  },
  {
    id: 'core.m05.q31',
    lessonIds: ['core.m05.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para pegar o último job de qualquer array.',
    code: 'const ultimo = jobs[jobs.___ - 1];',
    acceptedAnswers: ['length'],
    explanation: 'O último índice é sempre o tamanho menos 1.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q32',
    lessonIds: ['core.m05.l04'],
    kind: 'multiple-choice',
    prompt: 'O que `kanban.pop()` devolve?',
    options: [
      'O item que foi removido do final',
      'O novo tamanho do array',
      'O primeiro item, sem remover',
      'Sempre `true`',
    ],
    answerIndex: 0,
    explanation: '`pop` tira o último item e o entrega. Quem devolve o novo tamanho é o `push`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.q33',
    lessonIds: ['core.m05.l04'],
    kind: 'predict-output',
    prompt: 'O dia sem nenhum job. O que este código imprime?',
    code: `const jobsDoDia = [];
console.log(jobsDoDia.length);
console.log(jobsDoDia.pop());`,
    expectedOutput: '0\nundefined',
    explanation: 'Um array vazio tem tamanho 0, e `pop` num array vazio devolve `undefined`.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'core.m05.f15',
    lessonIds: ['core.m05.l04'],
    exerciseId: 'core.m05.e05',
    kind: 'predict-output',
    prompt: 'Usando a sua `adicionarTask`, o que este código imprime?',
    code: `function adicionarTask(kanban, task) {
  if (!kanban.includes(task)) {
    kanban.push(task);
  }
  return kanban.length;
}
const k = ['Login'];
adicionarTask(k, 'Banner');
adicionarTask(k, 'Banner');
console.log(adicionarTask(k, 'Login'));`,
    expectedOutput: '2',
    explanation: '"Banner" entra uma vez só e "Login" já existia: o kanban fica com 2 tasks.',
    difficulty: 2,
  },
  {
    id: 'core.m05.f16',
    lessonIds: ['core.m05.l04'],
    exerciseId: 'core.m05.e05',
    kind: 'multiple-choice',
    prompt:
      'Na sua `adicionarTask`, qual teste poderia substituir `!kanban.includes(task)` sem mudar o resultado?',
    options: [
      'kanban.indexOf(task) === -1',
      'kanban.indexOf(task) === 0',
      'kanban.length === 0',
      'kanban.pop() !== task',
    ],
    answerIndex: 0,
    explanation: '`indexOf` devolve -1 quando o item não está no array, a mesma coisa que `!includes`.',
    difficulty: 2,
  },
  {
    id: 'core.m05.f17',
    lessonIds: ['core.m05.l04'],
    exerciseId: 'core.m05.d04',
    kind: 'multiple-choice',
    prompt: 'Num array de 2 clientes, por que `fila[fila.length]` dava `undefined`?',
    options: [
      'Porque `fila.length` é 2 e os índices só vão de 0 a 1',
      'Porque `length` só funciona em textos',
      'Porque o último cliente tinha sido removido',
      'Porque precisa de `fila.length()` com parênteses',
    ],
    answerIndex: 0,
    explanation: 'O índice 2 não existe num array de 2 itens. O último é `length - 1`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.f18',
    lessonIds: ['core.m05.l04'],
    exerciseId: 'core.m05.d04',
    kind: 'true-false',
    prompt: 'Trocar o conserto por `return fila.pop();` também passaria em todos os testes do exercício.',
    answer: false,
    explanation:
      '`pop` devolve o último, mas também o **remove** da fila. O teste "não tira ninguém da fila" falharia.',
    difficulty: 2,
  },
];
