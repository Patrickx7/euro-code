import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'front.m04.l01',
  moduleId: 'front.m04',
  order: 1,
  title: 'Assíncrono: o código não espera ninguém',
  concepts: [
    'código síncrono e assíncrono',
    'setTimeout',
    'callback',
    'fila de tarefas',
    'callback com erro primeiro',
    'callback hell',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Até agora todo código seu era **síncrono**: uma linha termina, a próxima começa. Só que na web muita coisa **demora**: buscar dados num servidor, esperar um clique, um timer. Se o JavaScript ficasse parado esperando, a página inteira travaria (e o cliente ia ligar dizendo que "o site congelou").

Por isso o JS é **assíncrono**: ele **agenda** o que demora e segue em frente. Quando a coisa demorada termina, a função agendada roda.

## setTimeout

\`setTimeout(funcao, ms)\` agenda \`funcao\` para rodar **daqui a pelo menos** \`ms\` milissegundos:

\`\`\`js
console.log('Saí de casa');
setTimeout(() => console.log('Cheguei no cliente'), 1000);
console.log('Coloquei um podcast');
\`\`\`

Imprime "Saí de casa", "Coloquei um podcast" e, um segundo depois, "Cheguei no cliente". O \`setTimeout\` **não pausa** o código: ele só deixa um bilhete na fila.

Mesmo com \`0\` ms, a função vai pro fim da fila: ela só roda **depois** que todo o código que está rodando agora terminar.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `console.log('1. Abri o notebook');
setTimeout(() => console.log('3. O cliente respondeu o e-mail'), 0);
console.log('2. Fui pegar café');`,
      explanation:
        'Mesmo com 0 ms, o callback do `setTimeout` espera o código atual terminar. Por isso o "3" sai por último.',
    },
    {
      kind: 'text',
      markdown: `## Callback: "me liga quando terminar"

Uma função que você passa para outra chamar **depois** se chama **callback**. Você já usou: o \`addEventListener\` recebe um callback, e o \`setTimeout\` também.

O erro mais comum de quem começa é tentar **devolver com \`return\`** um valor que só fica pronto depois:

\`\`\`js
function buscarPreco() {
  let preco;
  setTimeout(() => { preco = 50; }, 100);
  return preco; // undefined: o timer ainda nem rodou!
}
\`\`\`

O jeito com callback é **receber uma função** e chamar ela quando o valor ficar pronto:

\`\`\`js
function buscarPreco(callback) {
  setTimeout(() => callback(50), 100);
}
buscarPreco((preco) => console.log('Preço:', preco));
\`\`\`

## Erro primeiro

Uma convenção bem antiga do JavaScript: o callback recebe **o erro primeiro** e o resultado depois. Se deu certo, o erro é \`null\`:

\`\`\`js
buscarCliente(7, (erro, cliente) => {
  if (erro) return console.log('Deu ruim:', erro.message);
  console.log('Cliente:', cliente);
});
\`\`\`

## Callback hell

Quando uma coisa depende da outra, os callbacks vão entrando um dentro do outro: buscar o cliente, depois o pedido, depois o preço, depois o frete... O código vira uma escada pra direita, apelidada de **callback hell**. Na próxima lição as **Promises** resolvem isso.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `function buscarCliente(id, callback) {
  const clientes = { 1: 'Padaria Pão de Ontem', 2: 'Pet Shop Au Au' };
  setTimeout(() => {
    if (clientes[id]) callback(null, clientes[id]);
    else callback(new Error('Cliente não encontrado'));
  }, 50);
}

buscarCliente(1, (erro, nome) => {
  if (erro) return console.log('Erro:', erro.message);
  console.log('Achei:', nome);
});
buscarCliente(9, (erro, nome) => {
  if (erro) return console.log('Erro:', erro.message);
  console.log('Achei:', nome);
});
console.log('Pedidos enviados, esperando...');`,
      explanation:
        'As duas buscas são agendadas e o código segue: "Pedidos enviados" aparece primeiro. Depois de 50 ms cada callback recebe `(erro, resultado)`.',
    },
  ],
  checkQuestionIds: ['front.m04.q01', 'front.m04.q02'],
  exerciseIds: ['front.m04.e01', 'front.m04.e02'],
  debugExerciseIds: ['front.m04.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'front.m04.e01',
    lessonId: 'front.m04.l01',
    kind: 'implement',
    title: 'Lembrete de vacina',
    promptMarkdown: `A **Clínica Veterinária Rabo Feliz** quer avisar os tutores na hora certa. Crie a função \`lembrete(texto, ms, callback)\` que:

1. **espera** \`ms\` milissegundos (use \`setTimeout\`);
2. depois chama \`callback\` com a mensagem \`'Lembrete: ' + texto\`.

O callback **não pode** ser chamado na hora: só depois do tempo.`,
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function lembrete(texto, ms, callback) {
  callback('Lembrete: ' + texto);
}
`,
    solution: `function lembrete(texto, ms, callback) {
  setTimeout(() => {
    callback('Lembrete: ' + texto);
  }, ms);
}
`,
    tests: [
      {
        description: 'o callback não é chamado na hora',
        code: `let recebido = null;
lembrete('vacina do Thor', 30, (msg) => { recebido = msg; });
assert.strictEqual(recebido, null, 'O callback foi chamado na hora. Ele deveria esperar o tempo passar.');`,
      },
      {
        description: 'depois do tempo, o callback recebe a mensagem certa',
        code: `let recebido = null;
lembrete('vacina do Thor', 30, (msg) => { recebido = msg; });
await new Promise((r) => setTimeout(r, 80));
assert.strictEqual(recebido, 'Lembrete: vacina do Thor');`,
      },
      {
        description: 'o lembrete mais curto chega primeiro',
        code: `const ordem = [];
lembrete('banho', 60, (msg) => ordem.push(msg));
lembrete('vermífugo', 10, (msg) => ordem.push(msg));
await new Promise((r) => setTimeout(r, 120));
assert.deepStrictEqual(ordem, ['Lembrete: vermífugo', 'Lembrete: banho']);`,
      },
    ],
    hints: [
      'Coloque a chamada do `callback` **dentro** da função que você passa para o `setTimeout`.',
      "`setTimeout(() => { callback('Lembrete: ' + texto); }, ms);`",
    ],
    followUpQuestionIds: ['front.m04.f01', 'front.m04.f02'],
    difficulty: 1,
  },
  {
    id: 'front.m04.e02',
    lessonId: 'front.m04.l01',
    kind: 'implement',
    title: 'Busca de tutor com erro primeiro',
    promptMarkdown: `O sistema da Rabo Feliz guarda os tutores no objeto \`tutores\` (já pronto). Crie \`buscarTutor(id, callback)\` que, depois de **20 ms** (simulando o servidor):

- se o \`id\` existe em \`tutores\`, chama \`callback(null, nome)\`;
- se não existe, chama \`callback(new Error('Tutor não encontrado'))\`.

É a convenção do **erro primeiro**: o primeiro argumento do callback é sempre o erro (ou \`null\`).`,
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const tutores = { 10: 'Dona Cida', 11: 'Seu Arlindo', 12: 'Bia' };

function buscarTutor(id, callback) {
  // seu código aqui
}
`,
    solution: `const tutores = { 10: 'Dona Cida', 11: 'Seu Arlindo', 12: 'Bia' };

function buscarTutor(id, callback) {
  setTimeout(() => {
    if (tutores[id]) {
      callback(null, tutores[id]);
    } else {
      callback(new Error('Tutor não encontrado'));
    }
  }, 20);
}
`,
    tests: [
      {
        description: 'acha um tutor que existe (erro é null)',
        code: `let args = null;
buscarTutor(11, (...recebidos) => { args = recebidos; });
await new Promise((r) => setTimeout(r, 60));
assert.ok(args, 'O callback não foi chamado.');
assert.strictEqual(args[0], null, 'Quando dá certo, o primeiro argumento deve ser null.');
assert.strictEqual(args[1], 'Seu Arlindo');`,
      },
      {
        description: 'id que não existe chama o callback com um Error',
        code: `let erro = null;
buscarTutor(99, (e) => { erro = e; });
await new Promise((r) => setTimeout(r, 60));
assert.ok(erro instanceof Error, 'O primeiro argumento deveria ser um new Error(...).');
assert.strictEqual(erro.message, 'Tutor não encontrado');`,
      },
      {
        description: 'a resposta não chega na hora (espera o "servidor")',
        code: `let chamado = false;
buscarTutor(10, () => { chamado = true; });
assert.strictEqual(chamado, false, 'Use setTimeout para esperar 20 ms antes de responder.');
await new Promise((r) => setTimeout(r, 60));
assert.strictEqual(chamado, true, 'O callback não foi chamado depois da espera.');`,
      },
    ],
    hints: [
      'Comece com `setTimeout(() => { ... }, 20);` e decida dentro dele.',
      '`tutores[id]` dá `undefined` quando o id não existe: use isso num `if`.',
      "No erro: `callback(new Error('Tutor não encontrado'));`.",
    ],
    followUpQuestionIds: ['front.m04.f03', 'front.m04.f04'],
    difficulty: 2,
  },
  {
    id: 'front.m04.d01',
    lessonId: 'front.m04.l01',
    kind: 'debug',
    title: 'O frete que chega undefined',
    promptMarkdown: `A função \`calcularFrete(km, callback)\` deveria entregar o preço do frete (R$ 3,50 por km) **pelo callback**, depois de consultar a "tabela" (o \`setTimeout\`). Mas o callback sempre recebe \`undefined\`.

Conserte para o callback receber o preço certo.`,
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `function calcularFrete(km, callback) {
  let preco;
  setTimeout(() => {
    preco = km * 3.5;
  }, 10);
  callback(preco);
}
`,
    solution: `function calcularFrete(km, callback) {
  setTimeout(() => {
    const preco = km * 3.5;
    callback(preco);
  }, 10);
}
`,
    tests: [
      {
        description: '10 km custam R$ 35',
        code: `let recebido;
calcularFrete(10, (p) => { recebido = p; });
await new Promise((r) => setTimeout(r, 50));
assert.strictEqual(recebido, 35);`,
      },
      {
        description: '4 km custam R$ 14',
        code: `let recebido;
calcularFrete(4, (p) => { recebido = p; });
await new Promise((r) => setTimeout(r, 50));
assert.strictEqual(recebido, 14);`,
      },
    ],
    hints: [
      'Quando a linha `callback(preco)` roda, o `setTimeout` já rodou?',
      'Chame o `callback` **dentro** do `setTimeout`, depois de calcular o preço.',
    ],
    followUpQuestionIds: ['front.m04.f05', 'front.m04.f06'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m04.q01',
    lessonIds: ['front.m04.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
console.log('C');`,
    expectedOutput: 'A\nC\nB',
    explanation:
      'O `setTimeout` só agenda o "B". Mesmo com 0 ms, ele roda depois que o código atual (que imprime "C") terminar.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q02',
    lessonIds: ['front.m04.l01'],
    kind: 'multiple-choice',
    prompt: 'O que é um **callback**?',
    options: [
      'Uma função que você passa para outra função chamar depois',
      'Uma função que sempre roda duas vezes',
      'O valor que uma função devolve com `return`',
      'Um tipo especial de variável para guardar tempo',
    ],
    answerIndex: 0,
    explanation:
      'Callback é "me liga quando terminar": você entrega a função e quem recebe decide quando chamar (num clique, num timer, quando os dados chegam).',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'front.m04.q03',
    lessonIds: ['front.m04.l01'],
    kind: 'true-false',
    prompt: '`setTimeout(fn, 1000)` pausa o código por 1 segundo antes de rodar a próxima linha.',
    answer: false,
    explanation:
      'O `setTimeout` não pausa nada: ele agenda `fn` e o código segue imediatamente para a próxima linha.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q04',
    lessonIds: ['front.m04.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `setTimeout(() => console.log('almoço'), 20);
setTimeout(() => console.log('café'), 5);
console.log('reunião');`,
    expectedOutput: 'reunião\ncafé\nalmoço',
    explanation:
      'Primeiro roda todo o código síncrono ("reunião"). Depois os timers, na ordem em que vencem: 5 ms ("café") antes de 20 ms ("almoço").',
    difficulty: 2,
  },
  {
    id: 'front.m04.q05',
    lessonIds: ['front.m04.l01'],
    kind: 'multiple-choice',
    prompt: 'Por que o JavaScript do navegador **não fica parado** esperando um servidor responder?',
    options: [
      'Porque a página inteira travaria: nada de cliques, rolagem ou animação enquanto espera',
      'Porque o navegador proíbe esperar mais de 1 segundo',
      'Porque servidores sempre respondem na hora',
      'Porque o JavaScript roda em vários computadores ao mesmo tempo',
    ],
    answerIndex: 0,
    explanation:
      'O JS da página roda numa única linha de execução. Se ela ficasse esperando, a tela congelava. Por isso o que demora é agendado.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q06',
    lessonIds: ['front.m04.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function buscarPreco() {
  let preco = 0;
  setTimeout(() => {
    preco = 120;
  }, 10);
  return preco;
}
console.log(buscarPreco());`,
    expectedOutput: '0',
    explanation:
      'O `return` acontece antes do timer rodar, então a função devolve o valor que `preco` tinha naquele momento: 0.',
    difficulty: 2,
  },
  {
    id: 'front.m04.q07',
    lessonIds: ['front.m04.l01'],
    kind: 'fill-blank',
    prompt: 'Na convenção de erro primeiro, complete o primeiro parâmetro do callback.',
    code: `buscarCliente(7, (___, cliente) => {
  if (erro) return console.log(erro.message);
  console.log(cliente);
});`,
    acceptedAnswers: ['erro', 'err', 'error'],
    explanation:
      'O primeiro parâmetro é o erro (ou `null` quando deu certo); o resultado vem depois. Aqui o código usa o nome `erro`.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q08',
    lessonIds: ['front.m04.l01'],
    kind: 'multiple-choice',
    prompt: 'O que é o famoso **callback hell**?',
    options: [
      'Vários callbacks um dentro do outro, formando uma escada de código difícil de ler',
      'Um callback que lança erro',
      'Um `setTimeout` com tempo negativo',
      'Esquecer de chamar o callback',
    ],
    answerIndex: 0,
    explanation:
      'Quando cada passo depende do anterior, os callbacks vão aninhando. As Promises (próxima lição) deixam isso em linha reta.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q09',
    lessonIds: ['front.m04.l01'],
    kind: 'true-false',
    prompt:
      "`botao.addEventListener('click', salvar)` também usa um callback: `salvar` é chamada depois, a cada clique.",
    answer: true,
    explanation:
      'Eventos e timers funcionam do mesmo jeito: você entrega a função e o navegador chama quando acontecer.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m04.f01',
    lessonIds: ['front.m04.l01'],
    exerciseId: 'front.m04.e01',
    kind: 'multiple-choice',
    prompt:
      'No seu `lembrete`, o que acontecia com o código inicial, que chamava `callback(...)` direto, fora do `setTimeout`?',
    options: [
      'O lembrete chegava na hora, ignorando o tempo `ms`',
      'O lembrete nunca chegava',
      'Dava erro de sintaxe',
      'O lembrete chegava duas vezes',
    ],
    answerIndex: 0,
    explanation: 'Sem o `setTimeout`, nada espera: o callback era chamado imediatamente.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f02',
    lessonIds: ['front.m04.l01'],
    exerciseId: 'front.m04.e01',
    kind: 'predict-output',
    prompt: 'Com o seu `lembrete`, o que este código imprime?',
    code: `function lembrete(texto, ms, callback) {
  setTimeout(() => {
    callback('Lembrete: ' + texto);
  }, ms);
}
lembrete('banho', 30, console.log);
lembrete('vacina', 10, console.log);
console.log('Agendado!');`,
    expectedOutput: 'Agendado!\nLembrete: vacina\nLembrete: banho',
    explanation:
      '"Agendado!" é síncrono e sai primeiro. Depois vence o timer de 10 ms (vacina) e por último o de 30 ms (banho).',
    difficulty: 2,
  },
  {
    id: 'front.m04.f03',
    lessonIds: ['front.m04.l01'],
    exerciseId: 'front.m04.e02',
    kind: 'multiple-choice',
    prompt: 'No seu `buscarTutor`, o que o callback recebe quando o tutor **existe**?',
    options: [
      '`null` como primeiro argumento e o nome como segundo',
      'Só o nome, como primeiro argumento',
      'Um `Error` vazio e o nome',
      '`true` e o nome',
    ],
    answerIndex: 0,
    explanation:
      'Na convenção de erro primeiro, `null` no primeiro argumento quer dizer "não deu erro". O resultado vem em seguida.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f04',
    lessonIds: ['front.m04.l01'],
    exerciseId: 'front.m04.e02',
    kind: 'true-false',
    prompt:
      'Quem chama `buscarTutor(99, cb)` precisa checar o primeiro argumento do `cb` antes de usar o nome.',
    answer: true,
    explanation:
      'Com o id 99 o tutor não existe: o primeiro argumento é um `Error` e o segundo é `undefined`. Por isso o `if (erro)` vem antes.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f05',
    lessonIds: ['front.m04.l01'],
    exerciseId: 'front.m04.d01',
    kind: 'multiple-choice',
    prompt: 'Por que o `calcularFrete` original entregava `undefined`?',
    options: [
      '`callback(preco)` rodava antes do `setTimeout` calcular o preço',
      'Porque `km * 3.5` dá `undefined`',
      'Porque `let preco` não pode ser mudado dentro de outra função',
      'Porque o `setTimeout` nunca roda',
    ],
    answerIndex: 0,
    explanation:
      'O `setTimeout` só agenda o cálculo. A linha seguinte (`callback(preco)`) roda na hora, quando `preco` ainda é `undefined`.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f06',
    lessonIds: ['front.m04.l01'],
    exerciseId: 'front.m04.d01',
    kind: 'predict-output',
    prompt: 'Com o `calcularFrete` consertado, o que este código imprime?',
    code: `function calcularFrete(km, callback) {
  setTimeout(() => {
    callback(km * 3.5);
  }, 10);
}
calcularFrete(2, (p) => console.log('Frete:', p));
console.log('Calculando...');`,
    expectedOutput: 'Calculando...\nFrete: 7',
    explanation: 'O cálculo foi agendado; "Calculando..." sai primeiro e o frete (2 × 3,5 = 7) chega depois.',
    difficulty: 1,
  },
];
