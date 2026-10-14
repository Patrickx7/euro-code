import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'front.m04.l02',
  moduleId: 'front.m04',
  order: 2,
  title: 'Promises: a promessa de um valor',
  concepts: [
    'Promise',
    'pendente, resolvida e rejeitada',
    'then',
    'catch',
    'finally',
    'encadear then com return',
    'new Promise(resolve, reject)',
    'Promise.all',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Uma **Promise** é um objeto que representa um valor que **ainda vai chegar**. Tipo o cliente dizendo "te pago na sexta": você ainda não tem o dinheiro, mas tem a promessa.

Toda Promise está em um de três estados:

- **pendente**: ainda esperando;
- **resolvida** (cumprida): o valor chegou;
- **rejeitada**: deu erro (o cliente sumiu).

Depois que resolve ou rejeita, ela **não muda mais**.

## then, catch e finally

Em vez de passar um callback para a função, você recebe a Promise e pendura funções nela:

\`\`\`js
buscarPreco('cafe')
  .then((preco) => console.log('Custa', preco))   // quando resolver
  .catch((erro) => console.log('Erro:', erro.message)) // se rejeitar
  .finally(() => console.log('Terminei'));        // nos dois casos
\`\`\`

## Encadeando: o return é tudo

Cada \`.then\` devolve **uma nova Promise** com o valor que você der \`return\`. Se você devolver **outra Promise**, o próximo \`.then\` espera ela. Assim a escada de callbacks vira uma linha reta:

\`\`\`js
buscarPedido(7)
  .then((pedido) => buscarPreco(pedido.produto)) // return de outra Promise
  .then((preco) => console.log('Total:', preco));
\`\`\`

Esqueceu o \`return\`? O próximo \`.then\` recebe \`undefined\`. É o bug número 1 de Promise.

Um único \`.catch\` no fim pega erro de **qualquer** passo da corrente.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `const pagamento = Promise.resolve(250);

pagamento
  .then((valor) => valor - 50)
  .then((liquido) => console.log('Sobrou R$', liquido, 'depois do imposto'))
  .finally(() => console.log('Extrato fechado'));

console.log('Esperando o pix...');`,
      explanation:
        '`Promise.resolve(250)` já nasce resolvida, mas mesmo assim o `.then` só roda depois do código síncrono: "Esperando o pix..." sai primeiro. O `return` implícito da arrow (`valor - 50`) passa 200 adiante.',
    },
    {
      kind: 'text',
      markdown: `## Criando uma Promise

Para transformar algo com callback em Promise, use \`new Promise\`. Ela recebe uma função com dois parâmetros: \`resolve\` (deu certo) e \`reject\` (deu errado):

\`\`\`js
function esperar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
esperar(500).then(() => console.log('Meio segundo depois'));
\`\`\`

Para rejeitar, passe um \`Error\`: \`reject(new Error('Produto não encontrado'))\`.

## Promise.all: tudo junto

Precisa de várias coisas que não dependem uma da outra? Dispare todas **ao mesmo tempo** e espere todas com \`Promise.all\`:

\`\`\`js
Promise.all([buscarPreco('cafe'), buscarPreco('pao')])
  .then((precos) => console.log(precos)); // [6, 1]
\`\`\`

- o resultado é um array **na mesma ordem** do array de entrada (não na ordem em que chegaram);
- se **uma** rejeitar, o \`Promise.all\` inteiro rejeita.

Esperar uma por uma, em sequência, soma os tempos. Com \`Promise.all\`, o tempo total é o da mais lenta.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `const tabela = { cafe: 6, pao: 1, coxinha: 8 };

function buscarPreco(produto) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (produto in tabela) resolve(tabela[produto]);
      else reject(new Error('Produto não encontrado: ' + produto));
    }, 30);
  });
}

Promise.all([buscarPreco('cafe'), buscarPreco('coxinha')])
  .then((precos) => console.log('Preços:', precos.join(' e ')));

buscarPreco('sushi')
  .then((p) => console.log('Sushi custa', p))
  .catch((erro) => console.log(erro.message));`,
      explanation:
        'Os pedidos saem juntos e chegam depois de ~30 ms. O de sushi rejeita, então o `.then` dele é pulado e o `.catch` imprime a mensagem.',
    },
  ],
  checkQuestionIds: ['front.m04.q10', 'front.m04.q11'],
  exerciseIds: ['front.m04.e03', 'front.m04.e04'],
  debugExerciseIds: ['front.m04.d02'],
};

const TABELA = `const tabela = { cafe: 6, pao: 1, coxinha: 8, suco: 7 };
`;

const BUSCAR_PRECO_PRONTO = `// Já pronto: consulta a tabela da lanchonete (demora 60 ms)
const tabela = { cafe: 6, pao: 1, coxinha: 8, suco: 7 };

function buscarPreco(produto) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (produto in tabela) resolve(tabela[produto]);
      else reject(new Error('Produto não encontrado: ' + produto));
    }, 60);
  });
}
`;

const PECAS = `// Já pronto: o "servidor" da funilaria (cada consulta demora 20 ms)
const pedidos = { 7: { cliente: 'Marcão', peca: 'parachoque' }, 8: { cliente: 'Rita', peca: 'retrovisor' } };
const precos = { parachoque: 480, retrovisor: 150 };

function buscarPedido(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (pedidos[id]) resolve(pedidos[id]);
      else reject(new Error('Pedido não encontrado'));
    }, 20);
  });
}

function buscarPrecoPeca(peca) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(precos[peca]), 20);
  });
}
`;

export const exercises: Exercise[] = [
  {
    id: 'front.m04.e03',
    lessonId: 'front.m04.l02',
    kind: 'implement',
    title: 'A tabela de preços da lanchonete',
    promptMarkdown: `A **Lanchonete Bom Bocado** (Vila Yara, Osasco) vai ter um app de pedidos. Crie \`buscarPreco(produto)\` que **devolve uma Promise** e, depois de **30 ms**:

- **resolve** com o preço, se o produto está na \`tabela\`;
- **rejeita** com \`new Error('Produto não encontrado: ' + produto)\`, se não está.`,
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `${TABELA}
function buscarPreco(produto) {
  return tabela[produto];
}
`,
    solution: `${TABELA}
function buscarPreco(produto) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (produto in tabela) {
        resolve(tabela[produto]);
      } else {
        reject(new Error('Produto não encontrado: ' + produto));
      }
    }, 30);
  });
}
`,
    tests: [
      {
        description: 'devolve uma Promise',
        code: `const p = buscarPreco('cafe');
assert.ok(p instanceof Promise, 'buscarPreco deveria devolver uma Promise (new Promise(...)).');
await p;`,
      },
      {
        description: 'resolve com o preço do produto',
        code: `assert.strictEqual(await buscarPreco('coxinha'), 8);
assert.strictEqual(await buscarPreco('pao'), 1);`,
      },
      {
        description: 'rejeita com um Error quando o produto não existe',
        code: `const p = buscarPreco('sushi');
assert.ok(p instanceof Promise, 'buscarPreco deveria devolver uma Promise.');
await assert.rejects(p, { message: 'Produto não encontrado: sushi' });`,
      },
      {
        description: 'espera o "servidor" antes de responder',
        code: `let pronto = false;
const p = buscarPreco('suco');
assert.ok(p instanceof Promise, 'buscarPreco deveria devolver uma Promise.');
p.then(() => { pronto = true; });
await new Promise((r) => setTimeout(r, 5));
assert.strictEqual(pronto, false, 'Use setTimeout de 30 ms antes de resolver.');
await p;`,
      },
    ],
    hints: [
      'Comece com `return new Promise((resolve, reject) => { ... });`.',
      'Dentro, um `setTimeout` de 30 ms decide entre `resolve(tabela[produto])` e `reject(new Error(...))`.',
      '`produto in tabela` diz se a chave existe no objeto.',
    ],
    followUpQuestionIds: ['front.m04.f07', 'front.m04.f08'],
    difficulty: 2,
  },
  {
    id: 'front.m04.e04',
    lessonId: 'front.m04.l02',
    kind: 'implement',
    title: 'Total do pedido em paralelo',
    promptMarkdown: `Com o \`buscarPreco\` pronto (cada consulta demora **60 ms**), crie \`totalDoPedido(produtos)\` que **devolve uma Promise** com a **soma** dos preços.

Regras do dono, que "não quer cliente esperando":

- busque todos os preços **ao mesmo tempo** com \`Promise.all\` (um pedido de 4 itens tem que ficar pronto em bem menos de 4 × 60 ms);
- use \`.then\` para somar;
- se algum produto não existir, a Promise do total deve **rejeitar** (o \`Promise.all\` já faz isso para você).`,
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `${BUSCAR_PRECO_PRONTO}
function totalDoPedido(produtos) {
  // seu código aqui
}
`,
    solution: `${BUSCAR_PRECO_PRONTO}
function totalDoPedido(produtos) {
  const buscas = produtos.map((produto) => buscarPreco(produto));
  return Promise.all(buscas).then((lista) => lista.reduce((soma, preco) => soma + preco, 0));
}
`,
    tests: [
      {
        description: 'soma os preços de um pedido',
        code: `const total = totalDoPedido(['cafe', 'coxinha', 'pao']);
assert.ok(total instanceof Promise, 'totalDoPedido deveria devolver uma Promise.');
assert.strictEqual(await total, 15);`,
      },
      {
        description: 'busca os preços ao mesmo tempo',
        code: `const inicio = Date.now();
const total = await totalDoPedido(['cafe', 'pao', 'suco', 'coxinha']);
const tempo = Date.now() - inicio;
assert.strictEqual(total, 22);
assert.ok(tempo < 160, 'Demorou ' + tempo + ' ms: parece que os preços foram buscados um de cada vez. Use Promise.all.');`,
      },
      {
        description: 'rejeita se algum produto não existe',
        code: `const total = totalDoPedido(['cafe', 'lasanha']);
assert.ok(total instanceof Promise, 'totalDoPedido deveria devolver uma Promise.');
await assert.rejects(total, { message: 'Produto não encontrado: lasanha' });`,
      },
      {
        description: 'pedido vazio dá 0',
        code: `assert.strictEqual(await totalDoPedido([]), 0);`,
      },
    ],
    hints: [
      '`produtos.map((p) => buscarPreco(p))` cria um array de Promises, todas disparadas juntas.',
      '`Promise.all(array)` resolve com o array de preços, na mesma ordem.',
      'No `.then`, some com `reduce` e não esqueça o valor inicial `0` (pedido vazio).',
    ],
    followUpQuestionIds: ['front.m04.f09', 'front.m04.f10'],
    difficulty: 2,
  },
  {
    id: 'front.m04.d02',
    lessonId: 'front.m04.l02',
    kind: 'debug',
    title: 'Orçamento da funilaria: R$ undefined',
    promptMarkdown: `Na **Funilaria Amassadinho** (Carapicuíba), \`resumoDoPedido(id)\` deveria devolver uma Promise com o texto \`'Marcão: parachoque por R$ 480'\`. Mas sai \`'Marcão: parachoque por R$ undefined'\`, e o Marcão já ligou três vezes.

Conserte a corrente de \`.then\`. As funções de "servidor" estão prontas e não têm defeito.`,
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `${PECAS}
function resumoDoPedido(id) {
  let pedido;
  return buscarPedido(id)
    .then((p) => {
      pedido = p;
      buscarPrecoPeca(p.peca);
    })
    .then((preco) => \`\${pedido.cliente}: \${pedido.peca} por R$ \${preco}\`);
}
`,
    solution: `${PECAS}
function resumoDoPedido(id) {
  let pedido;
  return buscarPedido(id)
    .then((p) => {
      pedido = p;
      return buscarPrecoPeca(p.peca);
    })
    .then((preco) => \`\${pedido.cliente}: \${pedido.peca} por R$ \${preco}\`);
}
`,
    tests: [
      {
        description: 'pedido 7 sai com o preço do parachoque',
        code: `assert.strictEqual(await resumoDoPedido(7), 'Marcão: parachoque por R$ 480');`,
      },
      {
        description: 'pedido 8 sai com o preço do retrovisor',
        code: `assert.strictEqual(await resumoDoPedido(8), 'Rita: retrovisor por R$ 150');`,
      },
      {
        description: 'pedido que não existe continua rejeitando',
        code: `await assert.rejects(resumoDoPedido(99), { message: 'Pedido não encontrado' });`,
      },
    ],
    hints: [
      'O que o primeiro `.then` devolve? O valor dele vira o `preco` do segundo.',
      'Falta um `return` antes de `buscarPrecoPeca(p.peca)`.',
    ],
    followUpQuestionIds: ['front.m04.f11', 'front.m04.f12'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m04.q10',
    lessonIds: ['front.m04.l02'],
    kind: 'multiple-choice',
    prompt: 'Quais são os três estados de uma Promise?',
    options: [
      'Pendente, resolvida e rejeitada',
      'Começo, meio e fim',
      'Carregando, pronto e cancelado',
      'Síncrona, assíncrona e paralela',
    ],
    answerIndex: 0,
    explanation:
      'Ela nasce pendente e termina resolvida (com um valor) ou rejeitada (com um erro). Depois disso não muda mais.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q11',
    lessonIds: ['front.m04.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `Promise.resolve(10)
  .then((n) => n * 2)
  .then((n) => console.log('Valor:', n));
console.log('Primeiro eu');`,
    expectedOutput: 'Primeiro eu\nValor: 20',
    explanation:
      'O `.then` nunca roda na hora, nem com uma Promise já resolvida: espera o código síncrono acabar. O primeiro `.then` devolve 20 para o segundo.',
    difficulty: 2,
  },
  // ---- gerais ----
  {
    id: 'front.m04.q12',
    lessonIds: ['front.m04.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('then'));
console.log('sync');`,
    expectedOutput: 'sync\nthen\ntimeout',
    explanation:
      'Primeiro o código síncrono. Depois o `.then` de uma Promise resolvida (que tem prioridade, numa fila própria) e só então o `setTimeout`, mesmo com 0 ms.',
    difficulty: 3,
  },
  {
    id: 'front.m04.q13',
    lessonIds: ['front.m04.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `Promise.reject(new Error('cliente sumiu'))
  .then(() => console.log('recebi o pix'))
  .catch((e) => console.log('Erro:', e.message))
  .finally(() => console.log('fim do mês'));`,
    expectedOutput: 'Erro: cliente sumiu\nfim do mês',
    explanation:
      'Com a Promise rejeitada, o `.then` é pulado e o `.catch` trata o erro. O `.finally` roda nos dois casos.',
    difficulty: 2,
  },
  {
    id: 'front.m04.q14',
    lessonIds: ['front.m04.l02'],
    kind: 'fill-blank',
    prompt: 'Complete para a Promise rejeitar com um erro.',
    code: `return new Promise((resolve, reject) => {
  ___(new Error('Fora do horário'));
});`,
    acceptedAnswers: ['reject'],
    explanation: '`resolve` cumpre a Promise com um valor; `reject` rejeita com um erro.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q15',
    lessonIds: ['front.m04.l02'],
    kind: 'true-false',
    prompt: 'Se uma das Promises passadas para `Promise.all` rejeitar, o `Promise.all` inteiro rejeita.',
    answer: true,
    explanation:
      'É tudo ou nada: basta uma falhar para o `Promise.all` rejeitar com aquele erro (e você pode tratar num `.catch`).',
    difficulty: 1,
  },
  {
    id: 'front.m04.q16',
    lessonIds: ['front.m04.l02'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function esperar(ms, valor) {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}
Promise.all([esperar(40, 'logo'), esperar(10, 'site')]).then((r) => console.log(r.join(' + ')));`,
    expectedOutput: 'logo + site',
    explanation:
      'O resultado do `Promise.all` segue a ordem do array de entrada, não a ordem em que cada Promise terminou.',
    difficulty: 2,
  },
  {
    id: 'front.m04.q17',
    lessonIds: ['front.m04.l02'],
    kind: 'multiple-choice',
    prompt: 'Para que serve o `.finally`?',
    options: [
      'Rodar algo no fim, tanto se a Promise resolveu quanto se rejeitou',
      'Rodar só quando a Promise deu certo',
      'Cancelar uma Promise que está demorando',
      'Transformar a Promise em síncrona',
    ],
    answerIndex: 0,
    explanation:
      'Ótimo para limpar a tela, como esconder o "Carregando...", que tem que sumir com sucesso ou com erro.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m04.f07',
    lessonIds: ['front.m04.l02'],
    exerciseId: 'front.m04.e03',
    kind: 'multiple-choice',
    prompt: "No seu `buscarPreco`, o que acontece com `buscarPreco('sushi')`?",
    options: [
      "A Promise rejeita com o erro 'Produto não encontrado: sushi'",
      'A Promise resolve com `undefined`',
      'A função lança o erro na hora, antes de devolver a Promise',
      'A Promise fica pendente para sempre',
    ],
    answerIndex: 0,
    explanation:
      'Depois dos 30 ms, como `sushi` não está na tabela, o código chama `reject(new Error(...))`. Quem usa trata com `.catch`.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f08',
    lessonIds: ['front.m04.l02'],
    exerciseId: 'front.m04.e03',
    kind: 'true-false',
    prompt: "Com o seu `buscarPreco`, `console.log(buscarPreco('cafe'))` imprime `6`.",
    answer: false,
    explanation:
      "A função devolve uma **Promise**, não o número. Para pegar o 6: `buscarPreco('cafe').then((p) => console.log(p))`.",
    difficulty: 1,
  },
  {
    id: 'front.m04.f09',
    lessonIds: ['front.m04.l02'],
    exerciseId: 'front.m04.e04',
    kind: 'multiple-choice',
    prompt:
      'No seu `totalDoPedido`, quanto tempo leva, mais ou menos, um pedido de 4 itens (cada consulta leva 60 ms)?',
    options: ['Uns 60 ms', 'Uns 240 ms', 'Uns 15 ms', 'Uns 4 ms'],
    answerIndex: 0,
    explanation:
      'Com `Promise.all`, as 4 consultas rodam ao mesmo tempo: o total é o tempo da mais lenta, não a soma.',
    difficulty: 2,
  },
  {
    id: 'front.m04.f10',
    lessonIds: ['front.m04.l02'],
    exerciseId: 'front.m04.e04',
    kind: 'multiple-choice',
    prompt: "O que o `Promise.all` do seu `totalDoPedido` entrega para o `.then` com `['cafe', 'pao']`?",
    options: ['O array `[6, 1]`', 'O número `7`', 'Só o primeiro preço, `6`', 'Um array de Promises'],
    answerIndex: 0,
    explanation:
      'O `Promise.all` resolve com o array de resultados, na ordem dos produtos. A soma é trabalho do seu `reduce`.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f11',
    lessonIds: ['front.m04.l02'],
    exerciseId: 'front.m04.d02',
    kind: 'multiple-choice',
    prompt: 'No `resumoDoPedido` com defeito, por que o preço chegava `undefined`?',
    options: [
      'O primeiro `.then` não dava `return` na Promise do preço, então devolvia `undefined`',
      '`buscarPrecoPeca` estava com defeito',
      'O segundo `.then` rodava antes do `buscarPedido`',
      'Template string não funciona dentro de `.then`',
    ],
    answerIndex: 0,
    explanation:
      'O próximo `.then` recebe o que o anterior devolve. Sem `return`, a função devolve `undefined` e a corrente nem espera a busca do preço.',
    difficulty: 2,
  },
  {
    id: 'front.m04.f12',
    lessonIds: ['front.m04.l02'],
    exerciseId: 'front.m04.d02',
    kind: 'true-false',
    prompt:
      'Ao dar `return` de uma Promise dentro de um `.then`, o próximo `.then` espera essa Promise resolver e recebe o valor dela.',
    answer: true,
    explanation: 'É isso que permite encadear passos assíncronos em linha reta, sem callback hell.',
    difficulty: 1,
  },
];
