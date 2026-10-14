import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'back.m01.l01',
  moduleId: 'back.m01',
  order: 1,
  title: 'Node.js: JavaScript fora do navegador',
  concepts: [
    'runtime Node.js',
    'rodar scripts',
    'console.log e console.error',
    'process.exit e código de saída',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Parabéns pela efetivação! Agora você é **Júnior Back-end** e o seu JavaScript sai do navegador.\n\n' +
        'O **Node.js** é um **runtime**: um programa que roda JavaScript direto no computador (ou no ' +
        'servidor do cliente), sem navegador nenhum. A linguagem é a mesma que você já sabe: variáveis, ' +
        'funções, arrays, objetos. O que muda é o que existe em volta dela:\n\n' +
        '- **Não tem DOM.** Nada de `document`, `window` ou `alert`. Não existe página para mexer.\n' +
        '- **Tem coisas de servidor**: o objeto `process` (informações do programa que está rodando), ' +
        '`require` para carregar módulos e acesso a arquivos.\n\n' +
        'Você escreve o código num arquivo e roda no terminal:\n\n' +
        '```\n$ node relatorio.js\nRelatório do dia pronto!\n```\n\n' +
        'O Node lê o arquivo de cima para baixo, executa e **termina** quando não sobra mais nada para fazer.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const jobs = ['Site da padaria', 'Planilha da oficina'];

console.log('Jobs de hoje: ' + jobs.length);
console.log(typeof process);
console.log(typeof document);`,
      explanation:
        '`process` existe no Node e é um objeto. `document` não existe fora do navegador, então o `typeof` ' +
        'dele é `"undefined"`.',
    },
    {
      kind: 'text',
      markdown:
        '**Duas saídas: stdout e stderr.** Todo programa de terminal tem dois "canos" de texto:\n\n' +
        '- `console.log(...)` escreve na **saída padrão** (stdout): o resultado normal do programa.\n' +
        '- `console.error(...)` escreve na **saída de erro** (stderr): avisos e problemas.\n\n' +
        'No terminal os dois aparecem juntos, mas dá para separar. Quando o servidor do cliente guarda o ' +
        'stdout num arquivo de relatório, as mensagens de erro não sujam o relatório.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `console.log('Gerando relatório...');
console.error('Aviso: cliente sem e-mail cadastrado');
console.log('Relatório pronto!');`,
      explanation:
        'As duas linhas de `console.log` vão para o stdout. O aviso vai para o stderr: no terminal você vê ' +
        'as três, mas quem lê só o stdout vê apenas as duas do `console.log`.',
    },
    {
      kind: 'text',
      markdown:
        '**Código de saída.** Quando um programa termina, ele devolve um número para quem o rodou (o ' +
        'terminal, um script de deploy, o servidor). A convenção é:\n\n' +
        '- `0`: deu tudo certo;\n' +
        '- qualquer outro número (normalmente `1`): deu errado.\n\n' +
        'É assim que um script de deploy sabe se deve continuar ou parar. Você controla esse número de ' +
        'dois jeitos:\n\n' +
        '- `process.exitCode = 1;` só **anota** o código. O programa continua rodando até o fim e sai com 1.\n' +
        '- `process.exit(1);` **encerra na hora**. Nenhuma linha depois dele roda. `process.exit()` sem ' +
        'número sai com 0.\n\n' +
        'Regra de bolso: prefira `process.exitCode` quando ainda quer terminar o que está fazendo (mostrar ' +
        'todos os problemas, por exemplo). Use `process.exit` quando não faz sentido continuar, e só ' +
        '**depois** de avisar o motivo com `console.error`.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const horas = 0;

if (horas <= 0) {
  console.error('Erro: o orçamento precisa de pelo menos 1 hora.');
  process.exitCode = 1;
}

console.log('Fim do script.');`,
      explanation:
        'O erro vai para o stderr, o código de saída fica anotado como 1 e o script ainda imprime "Fim do ' +
        'script.". Com `process.exit(1)` no lugar, a última linha nunca rodaria.',
    },
  ],
  checkQuestionIds: ['back.m01.q01', 'back.m01.q02'],
  exerciseIds: ['back.m01.e01'],
  debugExerciseIds: ['back.m01.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m01.e01',
    lessonId: 'back.m01.l01',
    kind: 'implement',
    title: 'Checklist antes do deploy',
    promptMarkdown:
      'Todo deploy de sexta-feira começa com "é rapidinho" e termina às 23h. Para evitar isso, crie a ' +
      'função `verificarChecklist(itens)`. Ela recebe uma lista de objetos `{ nome, ok }` e:\n\n' +
      '- para **cada** item com `ok: false`, escreve no **stderr** `Faltando: <nome>`;\n' +
      '- se algum item faltou, marca o código de saída como `1` com `process.exitCode` (sem ' +
      '`process.exit`, para listar **todos** os itens que faltam);\n' +
      '- se nada faltou, escreve no **stdout** `Tudo pronto para o deploy!`.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function verificarChecklist(itens) {
  // seu código aqui
}
`,
    solution: `function verificarChecklist(itens) {
  let faltando = 0;
  for (const item of itens) {
    if (!item.ok) {
      console.error('Faltando: ' + item.nome);
      faltando++;
    }
  }
  if (faltando > 0) {
    process.exitCode = 1;
  } else {
    console.log('Tudo pronto para o deploy!');
  }
}
`,
    tests: [
      {
        description: 'com tudo ok, avisa no stdout e não marca erro',
        code: `verificarChecklist([
  { nome: 'testes', ok: true },
  { nome: 'backup do banco', ok: true },
]);
assert.deepStrictEqual(__logs, ['Tudo pronto para o deploy!']);
assert.deepStrictEqual(__errors, []);
assert.ok(process.exitCode === undefined || process.exitCode === 0, 'Com tudo ok, o código de saída não deve ser 1.');`,
      },
      {
        description: 'lista todos os itens que faltam no stderr',
        code: `process.exit = () => {
  throw new Error('Não use process.exit aqui: ele para o script antes de listar todos os itens.');
};
verificarChecklist([
  { nome: 'testes', ok: false },
  { nome: 'variáveis de ambiente', ok: true },
  { nome: 'backup do banco', ok: false },
]);
assert.deepStrictEqual(__errors, ['Faltando: testes', 'Faltando: backup do banco']);`,
      },
      {
        description: 'quando falta algo, o código de saída é 1 e nada vai para o stdout',
        code: `process.exit = () => {
  throw new Error('Não use process.exit aqui: use process.exitCode.');
};
verificarChecklist([{ nome: 'testes', ok: false }]);
assert.strictEqual(process.exitCode, 1);
assert.deepStrictEqual(__logs, []);`,
      },
    ],
    hints: [
      'Percorra os itens com `for...of` e, quando `item.ok` for falso, use `console.error`.',
      'Conte quantos faltaram. Depois do laço, se o contador for maior que zero, faça `process.exitCode = 1`; senão, `console.log` a mensagem de sucesso.',
    ],
    followUpQuestionIds: ['back.m01.f01', 'back.m01.f02'],
    difficulty: 1,
  },
  {
    id: 'back.m01.d01',
    lessonId: 'back.m01.l01',
    kind: 'debug',
    title: 'A mensagem de erro que nunca aparece',
    promptMarkdown:
      'O sobrinho do cliente escreveu `validarHoras(horas)`. Quando as horas são inválidas (zero ou ' +
      'menos), o script deveria escrever no stderr `Horas inválidas: <horas>` e encerrar com código `1`. ' +
      'Ele encerra, mas ninguém nunca viu a mensagem. "No meu PC funciona", diz ele. Conserte.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function validarHoras(horas) {
  if (horas <= 0) {
    process.exit(1);
    console.error('Horas inválidas: ' + horas);
  }
  console.log('Orçamento: R$ ' + horas * 80);
}
`,
    solution: `function validarHoras(horas) {
  if (horas <= 0) {
    console.error('Horas inválidas: ' + horas);
    process.exit(1);
  }
  console.log('Orçamento: R$ ' + horas * 80);
}
`,
    tests: [
      {
        description: 'com horas válidas, imprime o orçamento',
        code: `validarHoras(3);
assert.deepStrictEqual(__logs, ['Orçamento: R$ 240']);`,
      },
      {
        description: 'com 0 horas, avisa no stderr e sai com código 1',
        code: `const codigos = [];
process.exit = (codigo) => {
  codigos.push(codigo);
  throw new Error('process.exit');
};
try {
  validarHoras(0);
} catch (erro) {
  // o process.exit "de mentira" do teste lança um erro para parar a função
}
assert.deepStrictEqual(__errors, ['Horas inválidas: 0']);
assert.deepStrictEqual(codigos, [1]);
assert.deepStrictEqual(__logs, []);`,
      },
    ],
    hints: [
      'Depois de `process.exit`, nenhuma linha roda. Em que ordem as duas linhas do `if` deveriam estar?',
    ],
    followUpQuestionIds: ['back.m01.f03', 'back.m01.f04'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m01.q01',
    lessonIds: ['back.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'O que é o Node.js?',
    options: [
      'Um runtime que roda JavaScript fora do navegador',
      'Uma nova linguagem de programação parecida com JavaScript',
      'Um navegador sem interface gráfica',
      'Uma biblioteca para manipular o DOM mais rápido',
    ],
    answerIndex: 0,
    explanation:
      'O Node executa o mesmo JavaScript que você já conhece, só que no computador ou no servidor, sem navegador.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q02',
    lessonIds: ['back.m01.l01'],
    kind: 'predict-output',
    prompt: 'Rodando este script com `node`, o que aparece no **stdout** (saída padrão)?',
    code: `console.log('Subindo o site...');
console.error('Falha no upload do logo');
console.log('Fim');`,
    expectedOutput: 'Subindo o site...\nFim',
    explanation:
      '`console.error` escreve no stderr, não no stdout. Só as duas linhas do `console.log` vão para a saída padrão.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q03',
    lessonIds: ['back.m01.l01'],
    kind: 'predict-output',
    prompt: 'O que este script imprime?',
    code: `console.log('Começou o deploy');
process.exit(0);
console.log('Deploy concluído');`,
    expectedOutput: 'Começou o deploy',
    explanation: '`process.exit` encerra o programa na hora. A última linha nunca roda, mesmo com código 0.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q04',
    lessonIds: ['back.m01.l01'],
    kind: 'predict-output',
    prompt: 'O que este script imprime?',
    code: `process.exitCode = 1;
console.log('Ainda rodando');
console.log(process.exitCode);`,
    expectedOutput: 'Ainda rodando\n1',
    explanation:
      '`process.exitCode` só anota o código de saída. O script continua até o fim e, quando termina, sai com 1.',
    difficulty: 2,
  },
  {
    id: 'back.m01.q05',
    lessonIds: ['back.m01.l01'],
    kind: 'predict-output',
    prompt: 'O cliente jura que o script dele roda "no Node e no Chrome". O que isto imprime no Node?',
    code: `console.log(typeof window);
console.log(typeof process);`,
    expectedOutput: 'undefined\nobject',
    explanation:
      'No Node não existe `window` (nem `document`): não há página. Em compensação, existe o objeto `process`.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q06',
    lessonIds: ['back.m01.l01'],
    kind: 'true-false',
    prompt: "Num script Node, `document.getElementById('total')` funciona igual ao navegador.",
    answer: false,
    explanation:
      'O Node não tem DOM. A linha dá `ReferenceError: document is not defined`. Para mostrar resultado, use `console.log`.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q07',
    lessonIds: ['back.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Um script de deploy terminou com código de saída `1`. O que isso indica, por convenção?',
    options: [
      'Que algo deu errado',
      'Que deu tudo certo',
      'Que o script rodou 1 vez',
      'Que houve 1 aviso, mas está tudo bem',
    ],
    answerIndex: 0,
    explanation:
      'Código 0 é sucesso; qualquer outro número indica falha. Scripts de deploy param quando veem um código diferente de 0.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q08',
    lessonIds: ['back.m01.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para escrever a mensagem na saída de **erro** (stderr).',
    code: `console.___('Cliente não encontrado');`,
    acceptedAnswers: ['error'],
    explanation: '`console.error` escreve no stderr; `console.log` escreve no stdout.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q09',
    lessonIds: ['back.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Qual a diferença entre `process.exitCode = 1` e `process.exit(1)`?',
    options: [
      '`exitCode` só anota o código e deixa o script terminar; `exit` encerra na hora',
      '`exit` só anota o código; `exitCode` encerra na hora',
      'Nenhuma, os dois encerram na hora com código 1',
      '`exitCode` imprime o número 1 no terminal',
    ],
    answerIndex: 0,
    explanation:
      'Com `process.exitCode` o resto do código ainda roda. Com `process.exit` nenhuma linha depois dele é executada.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'back.m01.f01',
    lessonIds: ['back.m01.l01'],
    exerciseId: 'back.m01.e01',
    kind: 'multiple-choice',
    prompt:
      'Na sua `verificarChecklist`, por que usar `process.exitCode = 1` em vez de `process.exit(1)` no primeiro item que falta?',
    options: [
      'Porque `process.exit` pararia o script e os outros itens que faltam não seriam listados',
      'Porque `process.exit` não existe no Node',
      'Porque `process.exitCode` sai com código 0',
      'Porque `process.exit` escreve no stdout',
    ],
    answerIndex: 0,
    explanation:
      'A ideia do checklist é mostrar tudo o que falta de uma vez. `process.exitCode` anota o erro e deixa o laço terminar.',
    difficulty: 1,
  },
  {
    id: 'back.m01.f02',
    lessonIds: ['back.m01.l01'],
    exerciseId: 'back.m01.e01',
    kind: 'true-false',
    prompt:
      'Se alguém salvar só o stdout da sua `verificarChecklist` num arquivo, as linhas "Faltando: ..." vão aparecer nesse arquivo.',
    answer: false,
    explanation:
      'As linhas "Faltando: ..." foram escritas com `console.error`, ou seja, no stderr. O arquivo do stdout não as recebe.',
    difficulty: 2,
  },
  {
    id: 'back.m01.f03',
    lessonIds: ['back.m01.l01'],
    exerciseId: 'back.m01.d01',
    kind: 'multiple-choice',
    prompt: 'Por que a mensagem "Horas inválidas" nunca aparecia no código original de `validarHoras`?',
    options: [
      'Porque o `process.exit(1)` vinha antes e encerrava o script na hora',
      'Porque `console.error` não funciona no Node',
      'Porque o `if` nunca era verdadeiro',
      'Porque faltava um `return` depois do `console.error`',
    ],
    answerIndex: 0,
    explanation: 'Depois de `process.exit`, nenhuma linha roda. Avise primeiro, saia depois.',
    difficulty: 1,
  },
  {
    id: 'back.m01.f04',
    lessonIds: ['back.m01.l01'],
    exerciseId: 'back.m01.d01',
    kind: 'predict-output',
    prompt: 'Com o seu conserto, o que `validarHoras(2)` imprime no stdout?',
    code: `function validarHoras(horas) {
  if (horas <= 0) {
    console.error('Horas inválidas: ' + horas);
    process.exit(1);
  }
  console.log('Orçamento: R$ ' + horas * 80);
}
validarHoras(2);`,
    expectedOutput: 'Orçamento: R$ 160',
    explanation: 'Com 2 horas o `if` é falso, o script não sai e imprime 2 × 80 = 160.',
    difficulty: 1,
  },
];
