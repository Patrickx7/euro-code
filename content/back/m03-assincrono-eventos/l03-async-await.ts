import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'back.m03.l03',
  moduleId: 'back.m03',
  order: 3,
  title: 'async/await: código assíncrono com cara de síncrono',
  concepts: [
    'async function',
    'await',
    'try/catch/finally com await',
    'await em sequência',
    'await em paralelo com Promise.all',
    'retry com espera',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        '`async/await` é um jeito mais legível de usar Promises. Duas regras:\n\n' +
        '- uma função marcada com **`async`** **sempre devolve uma Promise**. O `return x` vira uma Promise ' +
        'cumprida com `x`; um `throw` vira uma Promise rejeitada;\n' +
        '- dentro dela, **`await promise`** pausa _aquela função_ até a Promise terminar e entrega o valor. Se ' +
        'a Promise rejeitar, o `await` **lança** o erro, e você trata com o bom e velho `try/catch`.\n\n' +
        'A pausa é só da função: o resto do programa continua rodando enquanto ela espera. E o `finally` ' +
        'roda nos dois casos, ótimo para "desligar o carregando" ou fechar uma conexão.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function emitirNota(valor) {
  await esperar(10); // a prefeitura é lenta
  if (valor <= 0) throw new Error('Valor inválido');
  return 'NF-' + valor;
}

async function fecharServico(valor) {
  try {
    const nota = await emitirNota(valor);
    console.log('Nota emitida:', nota);
  } catch (err) {
    console.log('Falhou:', err.message);
  } finally {
    console.log('Cliente avisado');
  }
}

fecharServico(350);
fecharServico(0);`,
      explanation:
        'O `throw` dentro da função `async` vira rejeição, e o `await` transforma a rejeição de volta em erro que o `catch` pega.',
    },
    {
      kind: 'text',
      markdown:
        '**Sequência ou paralelo?** Um `await` dentro de um `for...of` espera cada tarefa terminar antes de ' +
        'começar a próxima. Isso é o certo quando uma depende da outra (ou quando a impressora só aguenta ' +
        'uma folha por vez). Mas se as tarefas são independentes, é desperdício: três consultas de 100 ms ' +
        'levam 300 ms.\n\n' +
        'Para rodar em **paralelo**, dispare todas antes e espere o conjunto:\n\n' +
        '```js\n// sequência: ~300 ms\nfor (const t of transportadoras) {\n  precos.push(await cotar(t));\n}\n\n' +
        '// paralelo: ~100 ms\nconst precos = await Promise.all(transportadoras.map((t) => cotar(t)));\n```\n\n' +
        '**Armadilha clássica**: `array.forEach(async (x) => { await ... })` **não espera nada**. O ' +
        '`forEach` ignora as Promises que o callback devolve e segue em frente. Use `for...of` (sequência) ' +
        'ou `Promise.all` com `map` (paralelo).',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const tabela = { 'Leva e Traz': 80, Rapidão: 65, 'Tartaruga Express': 70 };

async function cotar(nome) {
  await esperar(30); // cada transportadora leva 30 ms para responder
  return nome + ': R$ ' + tabela[nome];
}

async function main() {
  const inicio = Date.now();
  const cotacoes = await Promise.all(Object.keys(tabela).map((nome) => cotar(nome)));
  console.log(cotacoes.join(' | '));
  console.log(Date.now() - inicio < 80 ? 'As três juntas, em uns 30 ms' : 'Uma de cada vez...');
}

main();`,
      explanation:
        'O `map` chama `cotar` três vezes sem esperar (dispara tudo) e o `Promise.all` espera o conjunto. Em sequência seriam uns 90 ms.',
    },
    {
      kind: 'text',
      markdown:
        '**Retry**: serviços externos falham de vez em quando (a impressora fiscal da padaria, a API do ' +
        'banco...). Um padrão comum é tentar de novo algumas vezes, com uma espera entre as tentativas:\n\n' +
        '```js\nfor (let tentativa = 1; tentativa <= 3; tentativa++) {\n  try {\n    return await imprimir();\n' +
        '  } catch (err) {\n    if (tentativa === 3) throw err; // desistiu\n    await esperar(100);\n  }\n}\n```\n\n' +
        'Repare no `return await` dentro do `try`: assim, se a Promise rejeitar, o erro cai no `catch` ' +
        'daquela tentativa.',
    },
  ],
  checkQuestionIds: ['back.m03.q19'],
  exerciseIds: ['back.m03.e04', 'back.m03.e05'],
  debugExerciseIds: ['back.m03.d03'],
};

/** Cria uma função `cotar` falsa que mede quantas chamadas rodam ao mesmo tempo. */
const COTAR_FALSO = `let emAndamento = 0;
let maxSimultaneas = 0;
const chamadas = [];
function criarCotar(tabela) {
  return async (nome) => {
    chamadas.push(nome);
    emAndamento++;
    maxSimultaneas = Math.max(maxSimultaneas, emAndamento);
    await new Promise((r) => setTimeout(r, 15));
    emAndamento--;
    if (tabela[nome] === undefined) throw new Error(nome + ' fora do ar');
    return tabela[nome];
  };
}
`;

export const exercises: Exercise[] = [
  {
    id: 'back.m03.e04',
    lessonId: 'back.m03.l03',
    kind: 'implement',
    title: 'O frete mais barato, em paralelo',
    promptMarkdown:
      'A Móveis Montados Pela Metade quer o frete mais barato entre várias transportadoras. Crie a função ' +
      '**async** `melhorFrete(transportadoras, cotar)`:\n\n' +
      '- `transportadoras` é um array de nomes e `cotar(nome)` é uma função async que devolve o preço (ou ' +
      'rejeita, quando o sistema da transportadora está fora do ar);\n' +
      '- consulte **todas em paralelo** (nada de uma por vez: o cliente está olhando);\n' +
      '- ignore as que falharam e devolva `{ transportadora, preco }` da mais barata;\n' +
      '- se **todas** falharem, lance um `Error` com a mensagem `Nenhuma transportadora respondeu`.\n\n' +
      "Exemplo: com preços `{ 'Leva e Traz': 80, 'Rapidão': 65 }` o resultado é `{ transportadora: 'Rapidão', preco: 65 }`.",
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `async function melhorFrete(transportadoras, cotar) {
  let melhor = null;
  for (const nome of transportadoras) {
    const preco = await cotar(nome);
    if (melhor === null || preco < melhor.preco) {
      melhor = { transportadora: nome, preco };
    }
  }
  return melhor;
}
`,
    solution: `async function melhorFrete(transportadoras, cotar) {
  const resultados = await Promise.allSettled(transportadoras.map((nome) => cotar(nome)));
  let melhor = null;
  resultados.forEach((r, i) => {
    if (r.status !== 'fulfilled') return;
    if (melhor === null || r.value < melhor.preco) {
      melhor = { transportadora: transportadoras[i], preco: r.value };
    }
  });
  if (melhor === null) throw new Error('Nenhuma transportadora respondeu');
  return melhor;
}
`,
    tests: [
      {
        description: 'devolve a mais barata',
        code: `${COTAR_FALSO}
const cotar = criarCotar({ 'Leva e Traz': 80, 'Rapidão': 65, 'Tartaruga Express': 70 });
const r = await melhorFrete(['Leva e Traz', 'Rapidão', 'Tartaruga Express'], cotar);
assert.deepStrictEqual(r, { transportadora: 'Rapidão', preco: 65 });`,
      },
      {
        description: 'consulta todas ao mesmo tempo (em paralelo)',
        code: `${COTAR_FALSO}
const cotar = criarCotar({ A: 10, B: 20, C: 30 });
await melhorFrete(['A', 'B', 'C'], cotar);
assert.strictEqual(maxSimultaneas, 3, 'As consultas rodaram uma de cada vez. Dispare todas e espere juntas.');`,
      },
      {
        description: 'ignora as transportadoras fora do ar',
        code: `${COTAR_FALSO}
const cotar = criarCotar({ 'Leva e Traz': 80, 'Tartaruga Express': 70 });
const r = await melhorFrete(['Rapidão', 'Leva e Traz', 'Tartaruga Express'], cotar);
assert.deepStrictEqual(r, { transportadora: 'Tartaruga Express', preco: 70 });`,
      },
      {
        description: 'todas fora do ar: rejeita com "Nenhuma transportadora respondeu"',
        code: `${COTAR_FALSO}
const cotar = criarCotar({});
await assert.rejects(melhorFrete(['A', 'B'], cotar), { message: 'Nenhuma transportadora respondeu' });`,
      },
    ],
    hints: [
      '`transportadoras.map((nome) => cotar(nome))` dispara todas de uma vez e dá um array de Promises.',
      "`await Promise.allSettled(...)` espera todas, sem rejeitar. Fique só com as de `status === 'fulfilled'`; o índice `i` liga o resultado ao nome.",
      'No fim, se ninguém respondeu, `throw new Error(...)`: dentro de uma função `async`, isso vira rejeição.',
    ],
    followUpQuestionIds: ['back.m03.f11', 'back.m03.f12'],
    difficulty: 3,
  },
  {
    id: 'back.m03.e05',
    lessonId: 'back.m03.l03',
    kind: 'implement',
    title: 'Retry na impressora de comandas',
    promptMarkdown:
      'A impressora de comandas da pizzaria falha de vez em quando ("papel enroscou"). Crie a função **async** ' +
      '`comRetry(tarefa, tentativas, esperaMs)`:\n\n' +
      '- chame `await tarefa()` (uma função async sem parâmetros);\n' +
      '- se der certo, devolva o resultado;\n' +
      '- se falhar, espere `esperaMs` milissegundos e tente de novo, até um total de `tentativas` chamadas;\n' +
      '- se a última tentativa também falhar, lance (rejeite com) **o erro da última tentativa**.\n\n' +
      'A função `esperar(ms)` já está pronta.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function comRetry(tarefa, tentativas, esperaMs) {
  return await tarefa();
}
`,
    solution: `const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function comRetry(tarefa, tentativas, esperaMs) {
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      return await tarefa();
    } catch (err) {
      if (tentativa === tentativas) throw err;
      await esperar(esperaMs);
    }
  }
}
`,
    tests: [
      {
        description: 'falha 2 vezes e imprime na 3ª tentativa',
        code: `let chamadas = 0;
const imprimir = async () => {
  chamadas++;
  if (chamadas < 3) throw new Error('Papel enroscou');
  return 'impresso';
};
assert.strictEqual(await comRetry(imprimir, 3, 5), 'impresso');
assert.strictEqual(chamadas, 3);`,
      },
      {
        description:
          'sempre falha: rejeita com o erro da última tentativa, depois de tentar o número certo de vezes',
        code: `let chamadas = 0;
const imprimir = async () => {
  chamadas++;
  throw new Error('Falha ' + chamadas);
};
await assert.rejects(comRetry(imprimir, 4, 5), { message: 'Falha 4' });
assert.strictEqual(chamadas, 4);`,
      },
      {
        description: 'se der certo de primeira, não tenta de novo',
        code: `let chamadas = 0;
const imprimir = async () => {
  chamadas++;
  return 'ok';
};
assert.strictEqual(await comRetry(imprimir, 3, 5), 'ok');
assert.strictEqual(chamadas, 1);`,
      },
      {
        description: 'espera entre as tentativas',
        code: `let chamadas = 0;
const inicio = Date.now();
const imprimir = async () => {
  chamadas++;
  if (chamadas < 3) throw new Error('Papel enroscou');
  return 'impresso';
};
await comRetry(imprimir, 3, 25);
const tempo = Date.now() - inicio;
assert.ok(tempo >= 40, 'Esperava pelo menos 2 esperas de 25 ms entre as tentativas, mas levou ' + tempo + ' ms.');`,
      },
    ],
    hints: [
      'Use um `for` de 1 até `tentativas` com um `try/catch` dentro.',
      'No `try`, `return await tarefa();`. No `catch`, se for a última tentativa, `throw err`; senão, `await esperar(esperaMs)`.',
    ],
    followUpQuestionIds: ['back.m03.f13', 'back.m03.f14'],
    difficulty: 2,
  },
  {
    id: 'back.m03.d03',
    lessonId: 'back.m03.l03',
    kind: 'debug',
    title: 'Os avisos de entrega que ninguém esperou',
    promptMarkdown:
      '`avisarClientes(pedidos, enviarSms)` deveria mandar um SMS por pedido, **um de cada vez** (o plano de ' +
      'SMS do cliente não deixa mandar dois juntos), e devolver quantos foram enviados. Mas ela devolve ' +
      '`0` antes de enviar qualquer coisa. Conserte.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `async function avisarClientes(pedidos, enviarSms) {
  let enviados = 0;
  pedidos.forEach(async (pedido) => {
    await enviarSms(pedido.telefone, 'Seu pedido ' + pedido.id + ' saiu para entrega!');
    enviados++;
  });
  return enviados;
}
`,
    solution: `async function avisarClientes(pedidos, enviarSms) {
  let enviados = 0;
  for (const pedido of pedidos) {
    await enviarSms(pedido.telefone, 'Seu pedido ' + pedido.id + ' saiu para entrega!');
    enviados++;
  }
  return enviados;
}
`,
    tests: [
      {
        description: 'devolve quantos SMS foram enviados',
        code: `const enviarSms = (tel, msg) => new Promise((r) => setTimeout(r, 5));
const pedidos = [
  { id: 1, telefone: '11 90000-0001' },
  { id: 2, telefone: '11 90000-0002' },
  { id: 3, telefone: '11 90000-0003' },
];
assert.strictEqual(await avisarClientes(pedidos, enviarSms), 3);`,
      },
      {
        description: 'envia um de cada vez, na ordem dos pedidos',
        code: `let simultaneos = 0;
let max = 0;
const mensagens = [];
const enviarSms = async (tel, msg) => {
  simultaneos++;
  max = Math.max(max, simultaneos);
  await new Promise((r) => setTimeout(r, 5));
  mensagens.push(msg);
  simultaneos--;
};
await avisarClientes([{ id: 7, telefone: 'a' }, { id: 8, telefone: 'b' }], enviarSms);
assert.strictEqual(max, 1, 'Mais de um SMS foi enviado ao mesmo tempo.');
assert.deepStrictEqual(mensagens, ['Seu pedido 7 saiu para entrega!', 'Seu pedido 8 saiu para entrega!']);`,
      },
    ],
    hints: [
      'O `forEach` não espera as Promises que o callback `async` devolve: ele dispara tudo e segue para o `return`.',
      'Troque o `forEach` por um `for (const pedido of pedidos) { ... }` com o `await` dentro.',
    ],
    followUpQuestionIds: ['back.m03.f15', 'back.m03.f16'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m03.q19',
    lessonIds: ['back.m03.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `async function buscarCliente() {
  console.log('buscando');
  await null;
  console.log('achei');
}
buscarCliente();
console.log('enquanto isso...');`,
    expectedOutput: 'buscando\nenquanto isso...\nachei',
    explanation:
      'A função roda normalmente até o primeiro `await`. Ali ela pausa, o código de fora continua, e só depois ela volta.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q20',
    lessonIds: ['back.m03.l03'],
    kind: 'true-false',
    prompt: 'Uma função marcada com `async` sempre devolve uma Promise, mesmo que o `return` seja um número.',
    answer: true,
    explanation:
      '`async function f() { return 5; }` devolve uma Promise cumprida com 5. Para pegar o 5, use `await` ou `.then`.',
    difficulty: 1,
  },
  {
    id: 'back.m03.q21',
    lessonIds: ['back.m03.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `async function cobrar() {
  throw new Error('cartão recusado');
}
async function main() {
  try {
    await cobrar();
    console.log('pago');
  } catch (err) {
    console.log('erro:', err.message);
  } finally {
    console.log('recibo impresso');
  }
}
main();`,
    expectedOutput: 'erro: cartão recusado\nrecibo impresso',
    explanation:
      'O `throw` vira rejeição; o `await` relança o erro, o `catch` trata e o `finally` roda de qualquer jeito. A linha "pago" é pulada.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q22',
    lessonIds: ['back.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'Cada `buscar` leva 100 ms. Quanto tempo, aproximadamente, este trecho leva?',
    code: `const a = await buscar(1);
const b = await buscar(2);
const c = await buscar(3);`,
    options: ['300 ms', '100 ms', '0 ms', '33 ms'],
    answerIndex: 0,
    explanation:
      'Cada `await` espera o anterior terminar antes de começar o próximo: 3 × 100 ms. Em paralelo, com `Promise.all`, seriam uns 100 ms.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q23',
    lessonIds: ['back.m03.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para buscar os três CEPs em paralelo e esperar todos.',
    code: "const enderecos = await Promise.___(['06010-000', '06700-000', '06460-000'].map((cep) => buscarCep(cep)));",
    acceptedAnswers: ['all'],
    explanation:
      '`map` dispara todas as buscas na hora e `Promise.all` espera o conjunto (rejeitando se alguma falhar).',
    difficulty: 2,
  },
  {
    id: 'back.m03.q24',
    lessonIds: ['back.m03.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `async function total() {
  return 42;
}
const r = total();
console.log(typeof r.then);
total().then((v) => console.log(v));`,
    expectedOutput: 'function\n42',
    explanation:
      'Sem `await`, `total()` devolve a Promise (que tem o método `then`), e não o 42. O valor chega no `.then`.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q25',
    lessonIds: ['back.m03.l03'],
    kind: 'true-false',
    prompt:
      '`lista.forEach(async (item) => { await salvar(item); })` espera cada `salvar` terminar antes de seguir para a linha depois do `forEach`.',
    answer: false,
    explanation:
      'O `forEach` não sabe esperar Promises: ele dispara todos os callbacks e segue na hora. Use `for...of` com `await` ou `Promise.all`.',
    difficulty: 2,
  },
  {
    id: 'back.m03.q26',
    lessonIds: ['back.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'Dentro de uma função `async`, o que acontece quando você dá `await` numa Promise que rejeita?',
    options: [
      'O `await` lança o erro, que pode ser pego com `try/catch`',
      'O `await` devolve `undefined` e segue',
      'O Node ignora a rejeição',
      'A função recomeça do início',
    ],
    answerIndex: 0,
    explanation:
      'A rejeição vira uma exceção na linha do `await`. Sem `try/catch`, a Promise da função também rejeita.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'back.m03.f11',
    lessonIds: ['back.m03.l03'],
    exerciseId: 'back.m03.e04',
    kind: 'multiple-choice',
    prompt: 'Por que a sua `melhorFrete` usa `Promise.allSettled` e não `Promise.all`?',
    options: [
      'Para não perder as outras cotações quando uma transportadora estiver fora do ar',
      'Porque `Promise.all` roda as consultas uma de cada vez',
      'Porque `Promise.all` não funciona com `await`',
      'Para as consultas ficarem mais rápidas',
    ],
    answerIndex: 0,
    explanation:
      '`Promise.all` também roda em paralelo, mas rejeita na primeira falha. Com `allSettled` você recebe todas e escolhe entre as que deram certo.',
    difficulty: 2,
  },
  {
    id: 'back.m03.f12',
    lessonIds: ['back.m03.l03'],
    exerciseId: 'back.m03.e04',
    kind: 'true-false',
    prompt:
      'No código inicial de `melhorFrete`, com `await cotar(nome)` dentro do `for...of`, as consultas eram feitas uma de cada vez.',
    answer: true,
    explanation:
      'O `await` dentro do laço espera cada consulta antes de começar a próxima. Além de lento, uma transportadora fora do ar derrubava tudo.',
    difficulty: 1,
  },
  {
    id: 'back.m03.f13',
    lessonIds: ['back.m03.l03'],
    exerciseId: 'back.m03.e05',
    kind: 'multiple-choice',
    prompt:
      'Com a sua `comRetry(tarefa, 3, 100)` e uma tarefa que sempre falha, quantas vezes a tarefa é chamada?',
    options: ['3', '2', '4', 'Infinitas'],
    answerIndex: 0,
    explanation: '`tentativas` é o total de chamadas. Na terceira falha, a função desiste e lança o erro.',
    difficulty: 1,
  },
  {
    id: 'back.m03.f14',
    lessonIds: ['back.m03.l03'],
    exerciseId: 'back.m03.e05',
    kind: 'multiple-choice',
    prompt:
      'Na sua `comRetry`, o que aconteceria se você trocasse `return await tarefa();` por `return tarefa();` dentro do `try`?',
    options: [
      'A rejeição escaparia do `try/catch` e não haveria nova tentativa',
      'Nada muda, funciona igual',
      'A tarefa seria chamada duas vezes',
      'O código não compila',
    ],
    answerIndex: 0,
    explanation:
      'Sem o `await`, a função devolve a Promise antes dela terminar. Quando ela rejeita, já saímos do `try`, e o `catch` não vê o erro.',
    difficulty: 3,
  },
  {
    id: 'back.m03.f15',
    lessonIds: ['back.m03.l03'],
    exerciseId: 'back.m03.d03',
    kind: 'multiple-choice',
    prompt: 'Por que a versão com `forEach` devolvia 0?',
    options: [
      'O `forEach` não espera os callbacks `async`; o `return enviados` rodava antes de qualquer SMS terminar',
      'Porque `enviados` era `const`',
      'Porque `enviarSms` rejeitava',
      'Porque `forEach` não funciona com arrays de objetos',
    ],
    answerIndex: 0,
    explanation: 'Os `enviados++` só aconteciam depois, quando a função já tinha devolvido 0.',
    difficulty: 2,
  },
  {
    id: 'back.m03.f16',
    lessonIds: ['back.m03.l03'],
    exerciseId: 'back.m03.d03',
    kind: 'true-false',
    prompt:
      'Se o plano de SMS deixasse mandar todos ao mesmo tempo, daria para usar `await Promise.all(pedidos.map(...))` em vez do `for...of`.',
    answer: true,
    explanation:
      'Com `map` + `Promise.all` os envios rodam em paralelo e a função ainda espera todos terminarem antes do `return`.',
    difficulty: 2,
  },
];
