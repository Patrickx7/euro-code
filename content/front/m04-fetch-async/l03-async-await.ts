import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'front.m04.l03',
  moduleId: 'front.m04',
  order: 3,
  title: 'async/await: Promise com cara de código normal',
  concepts: [
    'async function',
    'await',
    'try/catch com await',
    'função async sempre devolve Promise',
    'estados carregando, erro e sucesso',
    'finally para limpar a tela',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Corrente de \`.then\` funciona, mas \`async\`/\`await\` deixa o código assíncrono com cara de código de cima pra baixo:

\`\`\`js
async function resumo(id) {
  const pedido = await buscarPedido(id);
  const preco = await buscarPreco(pedido.produto);
  return pedido.cliente + ' paga R$ ' + preco;
}
\`\`\`

- \`async\` antes da função diz: "aqui dentro eu uso \`await\`";
- \`await promessa\` **pausa só esta função** até a Promise resolver e entrega o valor;
- enquanto ela está pausada, o resto da página continua vivo (cliques, outros timers...).

## Função async sempre devolve Promise

Mesmo com \`return 'oi'\`, quem chama uma função \`async\` recebe uma **Promise** de \`'oi'\`. Por isso quem chama também usa \`await\` (ou \`.then\`).

E o \`await\` só vale **dentro** de uma função \`async\`. No meio de um script comum, ele dá erro de sintaxe.

## Erros: try/catch

Se a Promise rejeitar, o \`await\` **lança** o erro, como um \`throw\`. Então dá para usar o velho \`try/catch\`:

\`\`\`js
async function mostrarPreco(produto) {
  try {
    const preco = await buscarPreco(produto);
    console.log('Custa', preco);
  } catch (erro) {
    console.log('Não deu:', erro.message);
  }
}
\`\`\`

Pegadinha: o \`try/catch\` só pega a rejeição se tiver \`await\`. Sem \`await\`, a Promise rejeita **depois**, quando o \`try\` já acabou.`,
    },
    {
      kind: 'example',
      language: 'js',
      code: `function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rotinaDoFreela() {
  console.log('Abrindo o notebook');
  await esperar(50);
  console.log('Café pronto');
  return 'commit feito';
}

rotinaDoFreela().then((resultado) => console.log('Resultado:', resultado));
console.log('Enquanto isso, o cliente manda áudio');`,
      explanation:
        'A função roda até o primeiro `await` e "pausa". O código de fora segue (o áudio do cliente). Depois de 50 ms ela continua, e o `return` vira o valor da Promise.',
    },
    {
      kind: 'text',
      markdown: `## Carregando, erro e sucesso na tela

Na página, quem espera dado do servidor **sempre** tem três estados. Esquecer um deles é como o cliente percebe que o site "está quebrado":

1. **carregando**: avise antes do \`await\` ("Carregando...");
2. **sucesso**: desenhe os dados e tire o aviso;
3. **erro**: mostre uma mensagem humana, não uma tela branca.

\`\`\`js
async function mostrarAgenda() {
  aviso.textContent = 'Carregando...';
  lista.innerHTML = '';
  try {
    const horarios = await buscarAgenda();
    // desenha cada horário com createElement + appendChild
    aviso.textContent = horarios.length + ' horários hoje';
  } catch (erro) {
    aviso.textContent = 'Não deu para carregar a agenda.';
  }
}
\`\`\`

Dica: o \`finally\` também funciona com \`try/catch\` e é um bom lugar para reabilitar um botão ou esconder um spinner, dê certo ou errado.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<button id="atualizar">Atualizar</button>
<p id="aviso"></p>

<script>
  function buscarRecado() {
    return new Promise((resolve) => setTimeout(() => resolve('Cliente pediu "só mais um ajuste"'), 800));
  }

  const botao = document.querySelector('#atualizar');
  const aviso = document.querySelector('#aviso');

  botao.addEventListener('click', async () => {
    botao.disabled = true;
    aviso.textContent = 'Carregando...';
    try {
      aviso.textContent = await buscarRecado();
    } catch (erro) {
      aviso.textContent = 'Falhou. Tente de novo.';
    } finally {
      botao.disabled = false;
    }
  });
</script>`,
      explanation:
        'O callback do evento também pode ser `async`. O botão fica desabilitado enquanto carrega (sem clique duplo) e o `finally` reabilita nos dois casos.',
    },
  ],
  checkQuestionIds: ['front.m04.q18', 'front.m04.q19'],
  exerciseIds: ['front.m04.e05', 'front.m04.e06'],
  debugExerciseIds: ['front.m04.d03'],
};

const SALAO_API = `// Já pronto: o "servidor" do salão (cada consulta demora 20 ms)
const clientes = { 1: 'Dona Lurdes', 2: 'Jéssica', 3: 'Seu Nonato' };
const horarios = { 1: ['09:00', '14:00'], 2: ['10:30'], 3: [] };

function buscarCliente(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (clientes[id]) resolve(clientes[id]);
      else reject(new Error('Cliente não encontrada'));
    }, 20);
  });
}

function buscarHorarios(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(horarios[id] ?? []), 20);
  });
}
`;

const AGENDA_HTML = `<h1>Studio Franja Reta</h1>
<p id="status"></p>
<ul id="agenda"></ul>

<script>
  // "Servidor" do salão (não mexa). Demora 50 ms e, se window.__agendaFora for true, cai.
  window.__agendaFora = false;
  function buscarAgenda() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (window.__agendaFora) reject(new Error('Servidor do salão fora do ar'));
        else
          resolve([
            { hora: '09:00', cliente: 'Dona Lurdes' },
            { hora: '10:30', cliente: 'Jéssica' },
            { hora: '14:00', cliente: 'Seu Nonato' },
          ]);
      }, 50);
    });
  }
</script>`;

const AGENDA_CSS = `body { font-family: sans-serif; }
#status { color: #555; font-style: italic; }`;

const FIADO_HTML = `<h1>Mercadinho Dois Irmãos</h1>
<p id="saldo">...</p>

<script>
  // "Servidor" do caderninho de fiado (não mexa). Demora 30 ms.
  function buscarSaldo(cliente) {
    const caderno = { 'Seu Arlindo': 87, Bia: 12 };
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (cliente in caderno) resolve(caderno[cliente]);
        else reject(new Error('Cliente sem cadastro'));
      }, 30);
    });
  }
</script>`;

const FIADO_CSS = `body { font-family: sans-serif; }
#saldo { font-size: 20px; }`;

export const exercises: Exercise[] = [
  {
    id: 'front.m04.e05',
    lessonId: 'front.m04.l03',
    kind: 'implement',
    title: 'Resumo da cliente do salão',
    promptMarkdown: `O **Studio Franja Reta** (Granja Viana, Cotia) quer um resumo rápido de cada cliente. Usando as funções prontas \`buscarCliente(id)\` e \`buscarHorarios(id)\` (as duas devolvem Promises), crie a função **async** \`resumoDaCliente(id)\` que devolve:

- \`'Dona Lurdes: 2 horário(s)'\` (nome e quantidade de horários);
- \`'Cliente não encontrada'\` se \`buscarCliente\` rejeitar. Use \`try/catch\`.`,
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `${SALAO_API}
function resumoDaCliente(id) {
  // seu código aqui
}
`,
    solution: `${SALAO_API}
async function resumoDaCliente(id) {
  try {
    const nome = await buscarCliente(id);
    const lista = await buscarHorarios(id);
    return \`\${nome}: \${lista.length} horário(s)\`;
  } catch (erro) {
    return 'Cliente não encontrada';
  }
}
`,
    tests: [
      {
        description: 'devolve uma Promise (é uma função async)',
        code: `const r = resumoDaCliente(1);
assert.ok(r instanceof Promise, 'resumoDaCliente deveria ser async (e devolver uma Promise).');
await r;`,
      },
      {
        description: 'monta o resumo com nome e quantidade de horários',
        code: `assert.strictEqual(await resumoDaCliente(1), 'Dona Lurdes: 2 horário(s)');
assert.strictEqual(await resumoDaCliente(2), 'Jéssica: 1 horário(s)');
assert.strictEqual(await resumoDaCliente(3), 'Seu Nonato: 0 horário(s)');`,
      },
      {
        description: 'cliente que não existe vira mensagem, sem estourar erro',
        code: `assert.strictEqual(await resumoDaCliente(42), 'Cliente não encontrada');`,
      },
    ],
    hints: [
      'Coloque `async` antes de `function` para poder usar `await` dentro.',
      '`const nome = await buscarCliente(id);` entrega o nome, não a Promise.',
      'Envolva os `await` num `try { ... } catch (erro) { return ... }`.',
    ],
    followUpQuestionIds: ['front.m04.f13', 'front.m04.f14'],
    difficulty: 2,
  },
  {
    id: 'front.m04.e06',
    lessonId: 'front.m04.l03',
    kind: 'implement',
    title: 'Agenda do salão com "Carregando..."',
    promptMarkdown: `A Kelly, dona do Studio Franja Reta, reclamou que a agenda "fica em branco e depois aparece do nada" e, quando o servidor cai, "fica em branco pra sempre". Escreva a função **async** \`mostrarAgenda()\` que:

1. logo no começo, coloca \`Carregando...\` no \`#status\` e **limpa** a lista \`#agenda\`;
2. espera \`buscarAgenda()\` (já pronta, devolve uma Promise com um array de \`{ hora, cliente }\`);
3. **sucesso**: cria um \`<li>\` para cada horário com o texto \`09:00 - Dona Lurdes\` e coloca no \`#status\` o texto \`3 horários hoje\` (com a quantidade certa);
4. **erro**: coloca no \`#status\` o texto \`Não deu para carregar a agenda.\`

O script já chama \`mostrarAgenda()\` ao abrir a página.`,
    language: 'web',
    starterFiles: {
      html: AGENDA_HTML,
      css: AGENDA_CSS,
      js: `const aviso = document.querySelector('#status');
const lista = document.querySelector('#agenda');

async function mostrarAgenda() {
  // seu código aqui
}

mostrarAgenda();
`,
    },
    solutionFiles: {
      html: AGENDA_HTML,
      css: AGENDA_CSS,
      js: `const aviso = document.querySelector('#status');
const lista = document.querySelector('#agenda');

async function mostrarAgenda() {
  aviso.textContent = 'Carregando...';
  lista.innerHTML = '';
  try {
    const horarios = await buscarAgenda();
    for (const item of horarios) {
      const li = document.createElement('li');
      li.textContent = \`\${item.hora} - \${item.cliente}\`;
      lista.appendChild(li);
    }
    aviso.textContent = \`\${horarios.length} horários hoje\`;
  } catch (erro) {
    aviso.textContent = 'Não deu para carregar a agenda.';
  }
}

mostrarAgenda();
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'a página abre mostrando a agenda',
        code: `await wait(200);
const itens = [...document.querySelectorAll('#agenda li')].map((li) => li.textContent);
assert.deepStrictEqual(itens, ['09:00 - Dona Lurdes', '10:30 - Jéssica', '14:00 - Seu Nonato']);
assert.strictEqual(document.querySelector('#status').textContent, '3 horários hoje');`,
      },
      {
        description: 'mostra "Carregando..." enquanto espera',
        code: `await wait(200);
const p = mostrarAgenda();
assert.strictEqual(document.querySelector('#status').textContent, 'Carregando...', 'Antes do await, o #status deveria dizer "Carregando...".');
await p;
assert.strictEqual(document.querySelector('#status').textContent, '3 horários hoje');`,
      },
      {
        description: 'carregar de novo não duplica a lista',
        code: `await wait(200);
await mostrarAgenda();
await mostrarAgenda();
assert.strictEqual(document.querySelectorAll('#agenda li').length, 3, 'Limpe a lista no começo da função.');`,
      },
      {
        description: 'com o servidor fora do ar, mostra a mensagem de erro',
        code: `await wait(200);
window.__agendaFora = true;
try {
  await mostrarAgenda();
} finally {
  window.__agendaFora = false;
}
assert.strictEqual(document.querySelector('#status').textContent, 'Não deu para carregar a agenda.');
assert.strictEqual(document.querySelectorAll('#agenda li').length, 0, 'Com erro, a lista deveria ficar vazia.');`,
      },
    ],
    hints: [
      "Antes do `await`: `aviso.textContent = 'Carregando...';` e `lista.innerHTML = '';`.",
      '`const horarios = await buscarAgenda();` dentro de um `try`.',
      "Para cada item: `document.createElement('li')`, `textContent` e `lista.appendChild(li)`.",
      'No `catch (erro)`, troque o texto do `aviso`.',
    ],
    followUpQuestionIds: ['front.m04.f15', 'front.m04.f16'],
    difficulty: 2,
  },
  {
    id: 'front.m04.d03',
    lessonId: 'front.m04.l03',
    kind: 'debug',
    title: 'Fiado de R$ [object Promise]',
    promptMarkdown: `O cunhado da cliente tem o **Mercadinho Dois Irmãos** e o caderninho de fiado virou site. Só que a tela mostra \`Fiado de Seu Arlindo: R$ [object Promise]\`. E quem não tem cadastro deveria ver \`Cliente sem cadastro\`, mas o \`catch\` nunca roda.

Conserte \`mostrarSaldo(cliente)\` para mostrar \`Fiado de Seu Arlindo: R$ 87\` e, para quem não está no caderno, \`Cliente sem cadastro\`.`,
    language: 'web',
    starterFiles: {
      html: FIADO_HTML,
      css: FIADO_CSS,
      js: `async function mostrarSaldo(cliente) {
  const saldo = document.querySelector('#saldo');
  try {
    const valor = buscarSaldo(cliente);
    saldo.textContent = \`Fiado de \${cliente}: R$ \${valor}\`;
  } catch (erro) {
    saldo.textContent = 'Cliente sem cadastro';
  }
}

mostrarSaldo('Seu Arlindo');
`,
    },
    solutionFiles: {
      html: FIADO_HTML,
      css: FIADO_CSS,
      js: `async function mostrarSaldo(cliente) {
  const saldo = document.querySelector('#saldo');
  try {
    const valor = await buscarSaldo(cliente);
    saldo.textContent = \`Fiado de \${cliente}: R$ \${valor}\`;
  } catch (erro) {
    saldo.textContent = 'Cliente sem cadastro';
  }
}

mostrarSaldo('Seu Arlindo');
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'a página abre com o fiado do Seu Arlindo',
        code: `await wait(150);
assert.strictEqual(document.querySelector('#saldo').textContent, 'Fiado de Seu Arlindo: R$ 87');`,
      },
      {
        description: 'mostra o fiado da Bia',
        code: `await mostrarSaldo('Bia');
assert.strictEqual(document.querySelector('#saldo').textContent, 'Fiado de Bia: R$ 12');`,
      },
      {
        description: 'quem não está no caderno vê "Cliente sem cadastro"',
        code: `await mostrarSaldo('Turista');
await wait(60);
assert.strictEqual(document.querySelector('#saldo').textContent, 'Cliente sem cadastro');`,
      },
    ],
    hints: [
      '`buscarSaldo` devolve uma Promise. O que aparece quando uma Promise vira texto?',
      'Falta um `await` antes de `buscarSaldo(cliente)`. Com ele, o valor chega e o `catch` passa a pegar a rejeição.',
    ],
    followUpQuestionIds: ['front.m04.f17', 'front.m04.f18'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m04.q18',
    lessonIds: ['front.m04.l03'],
    kind: 'multiple-choice',
    prompt: 'O que `await` faz?',
    options: [
      'Pausa só a função async atual até a Promise resolver, e entrega o valor dela',
      'Pausa a página inteira até a Promise resolver',
      'Cria uma nova Promise',
      'Cancela a Promise se ela demorar',
    ],
    answerIndex: 0,
    explanation:
      'Só a função `async` espera. O resto da página (cliques, outros timers) continua rodando enquanto isso.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q19',
    lessonIds: ['front.m04.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `async function entregar() {
  console.log('1. saindo');
  await null;
  console.log('3. entregue');
}
entregar();
console.log('2. enquanto isso');`,
    expectedOutput: '1. saindo\n2. enquanto isso\n3. entregue',
    explanation:
      'A função roda normalmente até o `await`. Ali ela pausa e devolve o controle: "2" sai antes. Depois ela continua do ponto onde parou.',
    difficulty: 2,
  },
  // ---- gerais ----
  {
    id: 'front.m04.q20',
    lessonIds: ['front.m04.l03'],
    kind: 'true-false',
    prompt: "Uma função `async` com `return 'pronto'` devolve uma Promise que resolve com `'pronto'`.",
    answer: true,
    explanation: 'Toda função `async` devolve uma Promise. O `return` vira o valor dela.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q21',
    lessonIds: ['front.m04.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `async function cobrar() {
  try {
    await Promise.reject(new Error('cartão recusado'));
    console.log('pago');
  } catch (erro) {
    console.log('Falhou:', erro.message);
  }
}
cobrar();`,
    expectedOutput: 'Falhou: cartão recusado',
    explanation: 'O `await` numa Promise rejeitada lança o erro: a linha "pago" é pulada e o `catch` trata.',
    difficulty: 2,
  },
  {
    id: 'front.m04.q22',
    lessonIds: ['front.m04.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para poder usar `await` dentro da função.',
    code: `___ function carregar() {
  const dados = await buscarDados();
  return dados;
}`,
    acceptedAnswers: ['async'],
    explanation: '`await` só funciona dentro de funções marcadas com `async`.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q23',
    lessonIds: ['front.m04.l03'],
    kind: 'multiple-choice',
    prompt: 'Quais são os três estados que uma tela que busca dados do servidor deve mostrar?',
    options: [
      'Carregando, erro e sucesso',
      'Aberto, fechado e minimizado',
      'Início, meio e rodapé',
      'Só o sucesso: os outros nunca acontecem',
    ],
    answerIndex: 0,
    explanation:
      'Servidor demora e cai (principalmente o do cliente). Mostrar "Carregando..." e uma mensagem de erro evita a famosa tela branca.',
    difficulty: 1,
  },
  {
    id: 'front.m04.q24',
    lessonIds: ['front.m04.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `async function valorDaHora() {
  return 80;
}
valorDaHora().then((v) => console.log('Hora:', v));
console.log(typeof valorDaHora());`,
    expectedOutput: 'object\nHora: 80',
    explanation:
      'A função `async` devolve uma Promise, que é um objeto: `typeof` dá "object" (síncrono, sai primeiro). Depois o `.then` recebe o 80.',
    difficulty: 3,
  },
  {
    id: 'front.m04.q25',
    lessonIds: ['front.m04.l03'],
    kind: 'multiple-choice',
    prompt:
      'Qual o melhor lugar para reabilitar o botão "Salvar" depois de uma chamada que pode dar certo ou errado?',
    options: ['No `finally`', 'Só no `try`', 'Só no `catch`', 'Antes do `await`'],
    answerIndex: 0,
    explanation: 'O `finally` roda nos dois casos, então o botão nunca fica travado.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m04.f13',
    lessonIds: ['front.m04.l03'],
    exerciseId: 'front.m04.e05',
    kind: 'multiple-choice',
    prompt: 'Com o seu `resumoDaCliente`, o que `resumoDaCliente(1)` devolve na hora?',
    options: [
      "Uma Promise que resolve com 'Dona Lurdes: 2 horário(s)'",
      "A string 'Dona Lurdes: 2 horário(s)'",
      '`undefined`',
      "A string 'Cliente não encontrada'",
    ],
    answerIndex: 0,
    explanation: 'Toda função `async` devolve Promise. Quem chama usa `await` ou `.then` para pegar o texto.',
    difficulty: 2,
  },
  {
    id: 'front.m04.f14',
    lessonIds: ['front.m04.l03'],
    exerciseId: 'front.m04.e05',
    kind: 'true-false',
    prompt:
      'No seu `resumoDaCliente(42)`, o `catch` roda porque o `await buscarCliente(42)` lança o erro da Promise rejeitada.',
    answer: true,
    explanation:
      'A Promise de `buscarCliente(42)` rejeita; o `await` transforma isso num erro lançado, que o `catch` pega.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f15',
    lessonIds: ['front.m04.l03'],
    exerciseId: 'front.m04.e06',
    kind: 'multiple-choice',
    prompt: 'Na sua `mostrarAgenda`, por que o "Carregando..." precisa vir **antes** do `await`?',
    options: [
      'Porque é durante a espera do `await` que a pessoa precisa ver o aviso',
      'Porque depois do `await` não dá mais para mexer no DOM',
      'Porque o `await` apaga o texto do `#status`',
      'Tanto faz, o resultado na tela é o mesmo',
    ],
    answerIndex: 0,
    explanation:
      'O aviso aparece, a função pausa no `await` enquanto o servidor responde e, quando os dados chegam, o aviso é trocado.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f16',
    lessonIds: ['front.m04.l03'],
    exerciseId: 'front.m04.e06',
    kind: 'multiple-choice',
    prompt: 'O que aconteceria se a sua `mostrarAgenda` **não** limpasse a lista no começo?',
    options: [
      'Cada recarga somaria os horários de novo, duplicando a lista',
      'A lista nunca apareceria',
      'Daria erro no `appendChild`',
      'Nada: o navegador limpa a lista sozinho',
    ],
    answerIndex: 0,
    explanation:
      "`appendChild` só acrescenta. Sem `lista.innerHTML = ''`, a agenda aparece duas, três vezes...",
    difficulty: 1,
  },
  {
    id: 'front.m04.f17',
    lessonIds: ['front.m04.l03'],
    exerciseId: 'front.m04.d03',
    kind: 'multiple-choice',
    prompt: 'Por que a tela do mercadinho mostrava `R$ [object Promise]`?',
    options: [
      'Sem `await`, `valor` era a própria Promise, e uma Promise vira "[object Promise]" no texto',
      'Porque `buscarSaldo` devolvia uma string errada',
      'Porque template string não aceita números',
      'Porque a função não era `async`',
    ],
    answerIndex: 0,
    explanation: 'O `await` é que "abre" a Promise e entrega o número. Sem ele você tem só a promessa.',
    difficulty: 1,
  },
  {
    id: 'front.m04.f18',
    lessonIds: ['front.m04.l03'],
    exerciseId: 'front.m04.d03',
    kind: 'true-false',
    prompt:
      'No código com defeito, o `catch` não pegava o "Cliente sem cadastro" porque, sem `await`, a Promise só rejeitava depois do `try` acabar.',
    answer: true,
    explanation: 'O `try/catch` só enxerga a rejeição se a função esperar a Promise com `await` dentro dele.',
    difficulty: 2,
  },
];
