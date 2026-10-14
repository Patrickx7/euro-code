import type { Exercise, Lesson, Question } from '../../../src/shared/content';

const CARRINHO_CSS = `body {
  font-family: sans-serif;
  padding: 1rem;
}

.item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item button {
  min-width: 44px;
  min-height: 44px;
  font-size: 1.2rem;
}
`;

const CARRINHO_JS = `let quantidade = 1;
const qtd = document.querySelector('#qtd');
const aviso = document.querySelector('#aviso');

function atualizar(texto) {
  qtd.textContent = quantidade;
  aviso.textContent = texto;
}

document.querySelector('#mais').addEventListener('click', function () {
  quantidade = quantidade + 1;
  atualizar('Agora são ' + quantidade + ' marmitas.');
});

document.querySelector('#menos').addEventListener('click', function () {
  if (quantidade > 1) {
    quantidade = quantidade - 1;
  }
  atualizar('Agora são ' + quantidade + ' marmitas.');
});

document.querySelector('#remover').addEventListener('click', function () {
  quantidade = 0;
  atualizar('Marmita removida do pedido.');
});
`;

const FILTROS_HTML = `<h1>Cardápio da semana</h1>
<button id="botao-filtros" type="button" aria-expanded="false" aria-controls="filtros">Filtros</button>
<div id="filtros" hidden>
  <label><input type="checkbox" /> Vegetariana</label>
  <label><input type="checkbox" /> Sem glúten</label>
  <label><input type="checkbox" /> Com farofa extra</label>
</div>
`;

const FILTROS_CSS = `body {
  font-family: sans-serif;
  padding: 1rem;
}

#filtros label {
  display: block;
  margin-top: 8px;
}
`;

const LUMINANCIA = `// Já pronto: luminância relativa de uma cor "#rrggbb" (0 = preto, 1 = branco), pela fórmula da WCAG.
function luminancia(hex) {
  const canais = [1, 3, 5].map(function (i) {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}
`;

export const lesson: Lesson = {
  id: 'front.m03.l04',
  moduleId: 'front.m03',
  order: 4,
  title: 'ARIA e contraste: o que o leitor de tela fala e o que o olho enxerga',
  concepts: [
    'aria-label',
    'aria-expanded',
    'aria-live e role="status"',
    'role',
    'primeira regra da ARIA',
    'razão de contraste (WCAG AA 4,5:1)',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `O leitor de tela lê o **nome**, o **papel** e o **estado** de cada elemento: *"Filtros, botão, recolhido"*. O HTML certo já entrega quase tudo. Quando não entrega, entram os atributos **ARIA**:

- **\`aria-label\`**: dá nome a quem não tem texto. Um botão que é só "🗑" vira \`<button aria-label="Remover item">🗑</button>\`, e o leitor fala "Remover item, botão" em vez de "lixeira" ou nada.
- **\`aria-expanded="true"\` / \`"false"\`**: diz se o que o botão controla está aberto ou fechado. Todo botão de menu ou acordeão precisa dele, **atualizado pelo JavaScript** a cada clique.
- **\`aria-live="polite"\`** (ou \`role="status"\`): numa área que muda sozinha ("Item adicionado!", "Pedido enviado"), faz o leitor de tela **anunciar** o texto novo assim que puder. Sem isso, a mensagem aparece na tela e quem não enxerga nem fica sabendo.
- **\`role\`**: diz o papel de um elemento (\`role="status"\`, \`role="alert"\`, \`role="dialog"\`).

Atenção: atributo ARIA é sempre **texto**. \`getAttribute('aria-expanded')\` devolve \`"true"\` ou \`"false"\`, e a string \`"false"\` é *truthy*. Compare com \`=== 'true'\`.`,
    },
    {
      kind: 'text',
      markdown: `## A primeira regra da ARIA: não use ARIA (se o HTML resolve)

\`<div onclick="enviar()">Enviar</div>\` parece botão, mas não é: não recebe Tab, não responde ao Enter nem ao Espaço, e o leitor de tela fala "Enviar" como se fosse texto. Dá para remendar com \`role="button"\`, \`tabindex="0"\` e um \`keydown\`... ou usar \`<button>\`, que já vem com tudo isso de fábrica. ARIA **não acrescenta comportamento**, só informação.

## Contraste

Texto cinza-clarinho em fundo branco "fica elegante" no Figma e ilegível no sol do ponto de ônibus. A **razão de contraste** compara a luminância (o quanto a cor é clara, de 0 a 1) das duas cores:

\`\`\`
contraste = (mais clara + 0.05) / (mais escura + 0.05)
\`\`\`

Vai de **1** (cores iguais) a **21** (preto no branco). A recomendação **WCAG nível AA** pede pelo menos **4,5** para texto normal e **3** para texto grande (uns 24px, ou 18,5px em negrito).`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<button id="menu" type="button" aria-expanded="false" aria-controls="lista">Menu</button>
<ul id="lista" hidden>...</ul>
<p id="aviso" role="status"></p>

<script>
  const botao = document.querySelector('#menu');
  const lista = document.querySelector('#lista');

  botao.addEventListener('click', function () {
    const aberto = botao.getAttribute('aria-expanded') === 'true';
    botao.setAttribute('aria-expanded', String(!aberto));
    lista.hidden = aberto;
    document.querySelector('#aviso').textContent = aberto ? 'Menu fechado' : 'Menu aberto';
  });
</script>`,
      explanation:
        'O `aria-expanded` acompanha o estado real do menu, e o `role="status"` faz o leitor de tela anunciar a mensagem. Note o `=== \'true\'`: o atributo é texto.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const luminanciaBranco = 1;
const luminanciaCinza = 0.1845; // #777777

const razao = (luminanciaBranco + 0.05) / (luminanciaCinza + 0.05);
console.log(razao.toFixed(2)); // 4.48
console.log(razao >= 4.5 ? 'passa no AA' : 'não passa no AA');`,
      explanation:
        'O cinza #777777 no branco fica em 4,48: por um triz não passa. O #767676 já passa (4,54).',
    },
  ],
  checkQuestionIds: ['front.m03.q22'],
  exerciseIds: ['front.m03.e04', 'front.m03.e05'],
  debugExerciseIds: ['front.m03.d04'],
};

export const exercises: Exercise[] = [
  {
    id: 'front.m03.e04',
    lessonId: 'front.m03.l04',
    kind: 'implement',
    title: 'O carrinho que fala',
    promptMarkdown: `O carrinho da **Marmitaria Tempero da Vó** tem três botões só com ícone: "−", "+" e "🗑". O leitor de tela fala "menos", "mais" e "lixeira", e ninguém sabe do quê. E a mensagem "Agora são 2 marmitas" aparece na tela, mas não é anunciada.

No HTML:

1. dê um \`aria-label\` a cada botão: \`#menos\` diminui a quantidade, \`#mais\` aumenta e \`#remover\` remove a marmita;
2. faça o \`#aviso\` ser anunciado quando mudar (\`aria-live="polite"\` ou \`role="status"\`).

O JavaScript já está pronto; mantenha os \`id\`s.`,
    language: 'web',
    starterFiles: {
      html: `<h1>Seu pedido</h1>
<div class="item">
  <span>Marmita de feijoada (sexta é sagrado)</span>
  <button id="menos" type="button">−</button>
  <span id="qtd">1</span>
  <button id="mais" type="button">+</button>
  <button id="remover" type="button">🗑</button>
</div>
<p id="aviso"></p>
`,
      css: CARRINHO_CSS,
      js: CARRINHO_JS,
    },
    solutionFiles: {
      html: `<h1>Seu pedido</h1>
<div class="item">
  <span>Marmita de feijoada (sexta é sagrado)</span>
  <button id="menos" type="button" aria-label="Diminuir quantidade">−</button>
  <span id="qtd">1</span>
  <button id="mais" type="button" aria-label="Aumentar quantidade">+</button>
  <button id="remover" type="button" aria-label="Remover marmita">🗑</button>
</div>
<p id="aviso" role="status"></p>
`,
      css: CARRINHO_CSS,
      js: CARRINHO_JS,
    },
    editableFiles: ['html'],
    tests: [
      {
        description: 'os botões de ícone têm um aria-label que diz o que fazem',
        code: `const esperado = [
  ['menos', /diminu|menos|tirar|reduz/i, 'diminuir a quantidade'],
  ['mais', /aument|mais|adicion|acrescent/i, 'aumentar a quantidade'],
  ['remover', /remov|exclu|apag|tirar/i, 'remover a marmita'],
];
for (const [id, padrao, acao] of esperado) {
  const botao = document.querySelector('#' + id);
  assert.ok(botao, 'Sumiu o botão #' + id + '.');
  const rotulo = (botao.getAttribute('aria-label') || '').trim();
  assert.ok(rotulo.length > 0, 'O botão #' + id + ' não tem aria-label.');
  assert.match(rotulo, padrao, 'O aria-label do #' + id + ' ("' + rotulo + '") deveria dizer que ele serve para ' + acao + '.');
}`,
      },
      {
        description: 'o #aviso é anunciado pelo leitor de tela',
        code: `const aviso = document.querySelector('#aviso');
assert.ok(aviso, 'Sumiu o parágrafo #aviso.');
const live = aviso.getAttribute('aria-live');
const role = aviso.getAttribute('role');
assert.ok(['polite', 'assertive'].includes(live) || ['status', 'alert'].includes(role), 'O #aviso precisa de aria-live="polite" (ou role="status") para ser anunciado.');`,
      },
      {
        description: 'os botões continuam funcionando',
        code: `click('#mais');
assert.strictEqual(document.querySelector('#qtd').textContent, '2', 'Clicar no + deveria aumentar a quantidade.');
assert.match(document.querySelector('#aviso').textContent, /2 marmitas/, 'O aviso deveria contar a nova quantidade.');
click('#menos');`,
      },
    ],
    hints: [
      'Acrescente o atributo no próprio botão: `<button id="mais" type="button" aria-label="Aumentar quantidade">+</button>`.',
      'No parágrafo: `<p id="aviso" role="status"></p>`.',
    ],
    followUpQuestionIds: ['front.m03.f15', 'front.m03.f16'],
    difficulty: 1,
  },
  {
    id: 'front.m03.e05',
    lessonId: 'front.m03.l04',
    kind: 'implement',
    title: 'Dá para ler esse laranja?',
    promptMarkdown: `A neta da dona da **Marmitaria Tempero da Vó** escolheu as cores do site: laranja no amarelo, "pra dar fome". Antes de discutir, você vai medir.

A função \`luminancia(hex)\` já está pronta. Escreva:

1. \`contraste(corA, corB)\`: a razão de contraste entre duas cores \`"#rrggbb"\`, **arredondada com 2 casas** (use \`Math.round(valor * 100) / 100\`). A mais clara vai em cima, não importa a ordem dos argumentos;
2. \`passaAA(texto, fundo)\`: \`true\` se o contraste for de pelo menos **4.5**.`,
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: `${LUMINANCIA}
function contraste(corA, corB) {
  // seu código aqui
}

function passaAA(texto, fundo) {
  // seu código aqui
}

console.log(contraste('#ff9800', '#ffeb3b')); // laranja no amarelo
`,
    solution: `${LUMINANCIA}
function contraste(corA, corB) {
  const a = luminancia(corA);
  const b = luminancia(corB);
  const clara = Math.max(a, b);
  const escura = Math.min(a, b);
  return Math.round(((clara + 0.05) / (escura + 0.05)) * 100) / 100;
}

function passaAA(texto, fundo) {
  return contraste(texto, fundo) >= 4.5;
}

console.log(contraste('#ff9800', '#ffeb3b')); // laranja no amarelo
`,
    tests: [
      {
        description: 'preto no branco dá 21',
        code: "assert.strictEqual(contraste('#000000', '#ffffff'), 21);",
      },
      {
        description: 'duas cores iguais dão 1',
        code: "assert.strictEqual(contraste('#ff9800', '#ff9800'), 1);",
      },
      {
        description: 'a ordem dos argumentos não importa',
        code: "assert.strictEqual(contraste('#ffffff', '#777777'), 4.48);\nassert.strictEqual(contraste('#777777', '#ffffff'), 4.48);",
      },
      {
        description: 'laranja no amarelo dá 1.77',
        code: "assert.strictEqual(contraste('#ff9800', '#ffeb3b'), 1.77);",
      },
      {
        description: 'passaAA aprova a partir de 4.5',
        code: "assert.strictEqual(passaAA('#767676', '#ffffff'), true);\nassert.strictEqual(passaAA('#777777', '#ffffff'), false);\nassert.strictEqual(passaAA('#ff9800', '#ffeb3b'), false);\nassert.strictEqual(passaAA('#1b5e20', '#ffffff'), true);",
      },
    ],
    hints: [
      'Calcule a luminância das duas cores e use `Math.max` e `Math.min` para saber qual é a clara e qual é a escura.',
      'A fórmula é `(clara + 0.05) / (escura + 0.05)`. Depois arredonde com `Math.round(valor * 100) / 100`.',
      '`passaAA` pode reaproveitar `contraste`: `return contraste(texto, fundo) >= 4.5;`.',
    ],
    followUpQuestionIds: ['front.m03.f19', 'front.m03.f20'],
    difficulty: 2,
  },
  {
    id: 'front.m03.d04',
    lessonId: 'front.m03.l04',
    kind: 'debug',
    title: 'Os filtros que nunca abrem',
    promptMarkdown: `O botão "Filtros" do cardápio da **Marmitaria Tempero da Vó** não abre o painel, e o leitor de tela diz "recolhido" para sempre. Quem escreveu jura que "a lógica está certinha: é só inverter o aria-expanded".

Conserte a aba JS. Pista: o que \`getAttribute\` devolve?`,
    language: 'web',
    starterFiles: {
      html: FILTROS_HTML,
      css: FILTROS_CSS,
      js: `const botao = document.querySelector('#botao-filtros');
const filtros = document.querySelector('#filtros');

botao.addEventListener('click', function () {
  const aberto = botao.getAttribute('aria-expanded');
  botao.setAttribute('aria-expanded', !aberto);
  filtros.hidden = aberto;
});
`,
    },
    solutionFiles: {
      html: FILTROS_HTML,
      css: FILTROS_CSS,
      js: `const botao = document.querySelector('#botao-filtros');
const filtros = document.querySelector('#filtros');

botao.addEventListener('click', function () {
  const aberto = botao.getAttribute('aria-expanded') === 'true';
  botao.setAttribute('aria-expanded', String(!aberto));
  filtros.hidden = aberto;
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'o painel começa fechado, com aria-expanded="false"',
        code: `assert.strictEqual(document.querySelector('#botao-filtros').getAttribute('aria-expanded'), 'false');
assert.strictEqual(document.querySelector('#filtros').hidden, true, 'Os filtros deveriam começar escondidos.');`,
      },
      {
        description: 'um clique abre o painel e marca aria-expanded="true"',
        code: `click('#botao-filtros');
const expandido = document.querySelector('#botao-filtros').getAttribute('aria-expanded');
const escondido = document.querySelector('#filtros').hidden;
click('#botao-filtros');
assert.strictEqual(escondido, false, 'Depois do clique, os filtros deveriam aparecer.');
assert.strictEqual(expandido, 'true', 'Depois do clique, o aria-expanded deveria virar "true".');`,
      },
      {
        description: 'o segundo clique fecha de novo',
        code: `click('#botao-filtros');
click('#botao-filtros');
assert.strictEqual(document.querySelector('#botao-filtros').getAttribute('aria-expanded'), 'false', 'Depois de dois cliques, o aria-expanded deveria voltar para "false".');
assert.strictEqual(document.querySelector('#filtros').hidden, true, 'Depois de dois cliques, os filtros deveriam estar escondidos.');`,
      },
    ],
    hints: [
      '`getAttribute` devolve texto: `"false"`. E `!"false"` dá `false`, porque toda string não vazia é truthy.',
      "Transforme em booleano comparando: `botao.getAttribute('aria-expanded') === 'true'`.",
    ],
    followUpQuestionIds: ['front.m03.f17', 'front.m03.f18'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'front.m03.q22',
    lessonIds: ['front.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'Um botão só com o ícone "✕" fecha um aviso. Como dar a ele um nome que o leitor de tela fale?',
    options: [
      '`<button title="x">✕</button>`',
      '`<button aria-label="Fechar aviso">✕</button>`',
      '`<button role="fechar">✕</button>`',
      'Não precisa; o leitor de tela adivinha.',
    ],
    answerIndex: 1,
    explanation: 'O `aria-label` vira o nome acessível: "Fechar aviso, botão".',
    difficulty: 1,
  },
  {
    id: 'front.m03.q23',
    lessonIds: ['front.m03.l04'],
    kind: 'predict-output',
    prompt: 'O atributo ARIA é texto. O que este código imprime?',
    code: "const atributo = 'false';\nconsole.log(!atributo);\nconsole.log(atributo === 'true');",
    expectedOutput: 'false\nfalse',
    explanation:
      'A string `"false"` não é vazia, então é truthy: `!"false"` dá `false`. A comparação com `\'true\'` também dá `false`, que é o que se quer.',
    difficulty: 2,
  },
  {
    id: 'front.m03.q24',
    lessonIds: ['front.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'Para que serve `aria-live="polite"` numa área de mensagens?',
    options: [
      'Para a mensagem aparecer com letras educadas.',
      'Para o leitor de tela anunciar o texto novo quando ele mudar, sem interromper o que está lendo.',
      'Para a mensagem piscar.',
      'Para esconder a mensagem de quem enxerga.',
    ],
    answerIndex: 1,
    explanation:
      '"Polite" espera o leitor terminar a frase atual. `assertive` interrompe, e é para emergências.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q25',
    lessonIds: ['front.m03.l04'],
    kind: 'true-false',
    prompt: 'Colocar `role="button"` numa `<div>` faz ela receber Tab e responder ao Enter automaticamente.',
    answer: false,
    explanation:
      'ARIA só muda o que o leitor de tela fala. Foco e teclado você teria que programar; com `<button>` já vem pronto.',
    difficulty: 2,
  },
  {
    id: 'front.m03.q26',
    lessonIds: ['front.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual a razão de contraste mínima do nível AA da WCAG para texto de tamanho normal?',
    options: ['1,5', '3', '4,5', '21'],
    answerIndex: 2,
    explanation:
      '4,5:1 para texto normal; 3:1 para texto grande. 21:1 é o máximo possível (preto no branco).',
    difficulty: 1,
  },
  {
    id: 'front.m03.q27',
    lessonIds: ['front.m03.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para o leitor de tela saber que o menu controlado por este botão está aberto:',
    code: '<button aria-___="true" aria-controls="menu">Menu</button>',
    acceptedAnswers: ['expanded'],
    explanation:
      '`aria-expanded` diz se o conteúdo controlado está expandido ("true") ou recolhido ("false").',
    difficulty: 1,
  },
  {
    id: 'front.m03.q28',
    lessonIds: ['front.m03.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: 'const clara = 1;\nconst escura = 0;\nconsole.log((clara + 0.05) / (escura + 0.05));',
    expectedOutput: '21',
    explanation: 'Branco (luminância 1) com preto (luminância 0): 1,05 / 0,05 = 21, o contraste máximo.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f15',
    lessonIds: ['front.m03.l04'],
    exerciseId: 'front.m03.e04',
    kind: 'multiple-choice',
    prompt: 'Com o seu `aria-label` no botão "🗑", o que o leitor de tela fala?',
    options: [
      '"Lixeira".',
      'O texto do seu `aria-label` (por exemplo, "Remover marmita, botão").',
      'Nada, ícone não é lido.',
      '"🗑".',
    ],
    answerIndex: 1,
    explanation: 'O `aria-label` substitui o conteúdo do botão como nome acessível.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f16',
    lessonIds: ['front.m03.l04'],
    exerciseId: 'front.m03.e04',
    kind: 'true-false',
    prompt: 'Na sua solução, o JavaScript precisou mudar para o `#aviso` ser anunciado.',
    answer: false,
    explanation:
      'O JS continuou só trocando o texto. O `role="status"` (ou `aria-live`) no HTML faz o resto.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f17',
    lessonIds: ['front.m03.l04'],
    exerciseId: 'front.m03.d04',
    kind: 'multiple-choice',
    prompt: 'No código com defeito, por que `!aberto` dava sempre `false`?',
    options: [
      'Porque `getAttribute` devolvia a string `"false"`, que é truthy; a negação dela é `false`.',
      'Porque o `!` não funciona com atributos.',
      'Porque o botão estava desativado.',
      'Porque faltava `aria-controls`.',
    ],
    answerIndex: 0,
    explanation: 'Toda string não vazia é truthy, inclusive `"false"`. Por isso o painel nunca abria.',
    difficulty: 2,
  },
  {
    id: 'front.m03.f18',
    lessonIds: ['front.m03.l04'],
    exerciseId: 'front.m03.d04',
    kind: 'multiple-choice',
    prompt:
      "Na sua correção, o que `botao.getAttribute('aria-expanded') === 'true'` devolve com o painel fechado?",
    options: ['`"false"` (texto)', '`false` (booleano)', '`undefined`', '`null`'],
    answerIndex: 1,
    explanation: 'A comparação transforma o texto num booleano de verdade, que pode ser negado com `!`.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f19',
    lessonIds: ['front.m03.l04'],
    exerciseId: 'front.m03.e05',
    kind: 'multiple-choice',
    prompt: "Com a sua função, `contraste('#ff9800', '#ffeb3b')` dá 1.77. O que dizer para a neta da dona?",
    options: [
      'Passa folgado no AA.',
      'Passa só para texto grande.',
      'Não passa nem para texto grande (que pede 3): é melhor um texto escuro no amarelo.',
      'Contraste não importa em site de comida.',
    ],
    answerIndex: 2,
    explanation:
      '1,77 está abaixo de 3 e de 4,5. Um marrom escuro sobre o amarelo resolve e continua dando fome.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f20',
    lessonIds: ['front.m03.l04'],
    exerciseId: 'front.m03.e05',
    kind: 'multiple-choice',
    prompt: 'Por que a sua função usa `Math.max` e `Math.min` nas luminâncias?',
    options: [
      'Para arredondar o resultado.',
      'Para a cor mais clara ficar sempre em cima, e o resultado ser o mesmo em qualquer ordem dos argumentos.',
      'Porque a luminância pode ser negativa.',
      'Para o resultado passar de 21.',
    ],
    answerIndex: 1,
    explanation: 'Sem isso, `contraste(escura, clara)` daria um número menor que 1.',
    difficulty: 1,
  },
];
