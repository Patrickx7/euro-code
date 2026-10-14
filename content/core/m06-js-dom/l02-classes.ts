import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m06.l02',
  moduleId: 'core.m06',
  order: 2,
  title: 'Estilos, classes e atributos',
  concepts: [
    'element.style',
    'classList.add',
    'classList.remove',
    'classList.toggle',
    'setAttribute',
    'src e href',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Achar o elemento é metade do trabalho. A outra metade é mudar a **cara** dele.

## element.style

Todo elemento tem a propriedade \`style\`, que muda o CSS **só daquele elemento** (como um \`style="..."\` no HTML):

- \`titulo.style.color = 'brown';\`
- \`caixa.style.backgroundColor = 'yellow';\`
- \`caixa.style.width = '300px';\`

Duas pegadinhas:

1. Propriedades com hífen viram **camelCase**: \`background-color\` vira \`backgroundColor\`, \`font-size\` vira \`fontSize\`.
2. O valor é uma **string com unidade**: \`'300px'\`. Escrever \`caixa.style.width = 300\` não dá erro, mas o navegador ignora em silêncio. Bug de quinta à noite.`,
    },
    {
      kind: 'text',
      markdown: `## classList: o jeito profissional

Mudar estilo um por um enche o JS de CSS. O melhor é deixar o visual numa **classe** no CSS e só ligar e desligar a classe pelo JS:

- \`menu.classList.add('aberto')\`: coloca a classe;
- \`menu.classList.remove('aberto')\`: tira a classe;
- \`menu.classList.toggle('aberto')\`: tira se tem, coloca se não tem;
- \`menu.classList.contains('aberto')\`: devolve \`true\` ou \`false\`.

Repare: o nome da classe vai **sem o ponto**. O ponto é coisa de seletor; \`classList.add('.aberto')\` cria uma classe chamada literalmente ".aberto", que o CSS nunca vai pegar.

## Atributos

Atributos são aquelas coisas dentro da tag: \`src\`, \`href\`, \`alt\`, \`disabled\`...

- \`foto.setAttribute('src', 'img/bolo.jpg')\` e \`foto.getAttribute('src')\` funcionam para qualquer atributo;
- os mais comuns também viram propriedades: \`foto.src\`, \`foto.alt\`, \`link.href\`;
- atributos de liga/desliga viram booleanos: \`botao.disabled = true\` desabilita, \`false\` habilita.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  .destaque { background-color: yellow; font-weight: bold; }
</style>

<h1 class="titulo">Padaria Pão de Ontem</h1>
<p class="promo">Sonho a R$ 3,00</p>

<script>
  document.querySelector('.titulo').style.fontSize = '40px';
  document.querySelector('.promo').classList.add('destaque');
</script>`,
      explanation:
        'O título ganha um estilo direto (`style.fontSize`, com unidade). A promoção ganha a classe `destaque`, e o visual fica todo no CSS.',
    },
    {
      kind: 'example',
      language: 'html',
      code: `<img id="foto" src="sem-foto.png" alt="">
<a id="contato" href="#">Fale com a gente</a>

<script>
  const foto = document.querySelector('#foto');
  foto.setAttribute('src', 'img/bolo-de-fuba.jpg');
  foto.alt = 'Bolo de fubá saindo do forno';

  document.querySelector('#contato').href = 'tel:1155550000';
</script>`,
      explanation:
        '`setAttribute` serve para qualquer atributo; `alt` e `href` também podem ser trocados como propriedade.',
    },
  ],
  checkQuestionIds: ['core.m06.q08', 'core.m06.q09'],
  exerciseIds: ['core.m06.e03', 'core.m06.e04'],
  debugExerciseIds: ['core.m06.d02'],
};

const PADARIA_HTML = `<h1 class="titulo">Padaria Pão de Ontem</h1>
<p class="promo">Sonho de padaria: R$ 3,00</p>
<p class="aviso escondido">Domingo fechado para balanço!</p>`;

const PADARIA_CSS = `body { font-family: sans-serif; }
.destaque { background-color: rgb(255, 221, 0); font-weight: bold; }
.escondido { display: none; }`;

const PET_HTML = `<h2>Banho e tosa</h2>
<img id="foto" src="sem-foto.png" alt="">
<p><a id="contato" href="#">Ligue para agendar</a></p>
<button id="agendar" disabled>Agendar banho</button>`;

const PET_CSS = `body { font-family: sans-serif; }
img { width: 200px; height: 150px; background: #ddd; display: block; }`;

const NOTURNO_HTML = `<div class="pagina">
  <h1>Pet Shop Au Au Osasco</h1>
  <p>Banho e tosa com hora marcada.</p>
</div>`;

const NOTURNO_CSS = `body { font-family: sans-serif; }
.pagina { width: 300px; padding: 0 16px; box-sizing: border-box; }
.noturno { background-color: rgb(20, 20, 40); color: rgb(240, 240, 240); }`;

export const exercises: Exercise[] = [
  {
    id: 'core.m06.e03',
    lessonId: 'core.m06.l02',
    kind: 'implement',
    title: 'Destaque na promoção da padaria',
    promptMarkdown: `O Seu Zé quer o site da Padaria Pão de Ontem "mais chamativo". O CSS já tem as classes prontas; faça o resto pelo JS:

1. coloque a classe \`destaque\` no parágrafo \`.promo\`;
2. tire a classe \`escondido\` do \`.aviso\`, para o aviso aparecer;
3. deixe o \`.titulo\` com a cor \`brown\` usando \`style.color\`.`,
    language: 'web',
    starterFiles: {
      html: PADARIA_HTML,
      css: PADARIA_CSS,
      js: `const titulo = document.querySelector('.titulo');
const promo = document.querySelector('.promo');
const aviso = document.querySelector('.aviso');

// seu código aqui
`,
    },
    solutionFiles: {
      html: PADARIA_HTML,
      css: PADARIA_CSS,
      js: `const titulo = document.querySelector('.titulo');
const promo = document.querySelector('.promo');
const aviso = document.querySelector('.aviso');

promo.classList.add('destaque');
aviso.classList.remove('escondido');
titulo.style.color = 'brown';
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'a promoção tem a classe destaque (fundo amarelo)',
        code: `assert.ok(document.querySelector('.promo').classList.contains('destaque'), 'O .promo deveria ter a classe "destaque".');
assert.strictEqual(style('.promo').backgroundColor, 'rgb(255, 221, 0)', 'O fundo da promoção deveria ficar amarelo.');`,
      },
      {
        description: 'o aviso aparece na tela',
        code: `assert.ok(!document.querySelector('.aviso').classList.contains('escondido'), 'Tire a classe "escondido" do .aviso.');
assert.notStrictEqual(style('.aviso').display, 'none', 'O aviso ainda está escondido.');`,
      },
      {
        description: 'o título está marrom',
        code: `assert.strictEqual(style('.titulo').color, 'rgb(165, 42, 42)', 'A cor do título deveria ser brown.');`,
      },
    ],
    hints: [
      "O nome da classe vai sem ponto: `promo.classList.add('destaque')`.",
      'Para tirar uma classe, use `classList.remove`.',
      "Cor direto no elemento: `titulo.style.color = 'brown';`.",
    ],
    followUpQuestionIds: ['core.m06.f07', 'core.m06.f08'],
    difficulty: 1,
  },
  {
    id: 'core.m06.e04',
    lessonId: 'core.m06.l02',
    kind: 'implement',
    title: 'Foto, telefone e botão do pet shop',
    promptMarkdown: `A Dona Cida, do **Pet Shop Au Au Osasco**, mandou a foto e o telefone por áudio de 4 minutos. Resumo:

1. a imagem \`#foto\` deve ter \`src\` igual a \`img/banho-e-tosa.jpg\` e \`alt\` igual a \`Cachorro de toalha depois do banho\`;
2. o link \`#contato\` deve ter \`href\` igual a \`tel:1155550000\`;
3. o botão \`#agendar\` está desabilitado; habilite ele.`,
    language: 'web',
    starterFiles: {
      html: PET_HTML,
      css: PET_CSS,
      js: `const foto = document.querySelector('#foto');
const contato = document.querySelector('#contato');
const agendar = document.querySelector('#agendar');

// seu código aqui
`,
    },
    solutionFiles: {
      html: PET_HTML,
      css: PET_CSS,
      js: `const foto = document.querySelector('#foto');
const contato = document.querySelector('#contato');
const agendar = document.querySelector('#agendar');

foto.setAttribute('src', 'img/banho-e-tosa.jpg');
foto.alt = 'Cachorro de toalha depois do banho';
contato.setAttribute('href', 'tel:1155550000');
agendar.disabled = false;
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'a foto aponta para img/banho-e-tosa.jpg',
        code: `assert.strictEqual(document.querySelector('#foto').getAttribute('src'), 'img/banho-e-tosa.jpg', 'O src da foto está errado.');`,
      },
      {
        description: 'a foto tem o texto alternativo certo',
        code: `assert.strictEqual(document.querySelector('#foto').getAttribute('alt'), 'Cachorro de toalha depois do banho', 'O alt da foto está errado.');`,
      },
      {
        description: 'o link liga para o pet shop',
        code: `assert.strictEqual(document.querySelector('#contato').getAttribute('href'), 'tel:1155550000', 'O href do link está errado.');`,
      },
      {
        description: 'o botão de agendar está habilitado',
        code: `assert.strictEqual(document.querySelector('#agendar').disabled, false, 'O botão #agendar continua desabilitado.');`,
      },
    ],
    hints: [
      "`foto.setAttribute('src', '...')` troca qualquer atributo; `foto.alt = '...'` também funciona.",
      'Para habilitar o botão: `agendar.disabled = false;`.',
    ],
    followUpQuestionIds: ['core.m06.f09', 'core.m06.f10'],
    difficulty: 1,
  },
  {
    id: 'core.m06.d02',
    lessonId: 'core.m06.l02',
    kind: 'debug',
    title: 'O modo noturno que não liga',
    promptMarkdown: `O pet shop pediu um "modo noturno" e a página com **500px** de largura. O estagiário anterior (que sumiu sem avisar) deixou o script abaixo. Ele roda sem erro, mas **nada muda** na tela.

Conserte para que a \`.pagina\` ganhe a classe \`noturno\` e fique com 500px de largura.`,
    language: 'web',
    starterFiles: {
      html: NOTURNO_HTML,
      css: NOTURNO_CSS,
      js: `const pagina = document.querySelector('.pagina');

pagina.classList.add('.noturno');
pagina.style.width = 500;
`,
    },
    solutionFiles: {
      html: NOTURNO_HTML,
      css: NOTURNO_CSS,
      js: `const pagina = document.querySelector('.pagina');

pagina.classList.add('noturno');
pagina.style.width = '500px';
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'a página tem a classe noturno (fundo escuro)',
        code: `assert.ok(document.querySelector('.pagina').classList.contains('noturno'), 'A .pagina deveria ter a classe "noturno" (sem ponto no nome).');
assert.strictEqual(style('.pagina').backgroundColor, 'rgb(20, 20, 40)', 'O fundo deveria ficar escuro.');`,
      },
      {
        description: 'a página tem 500px de largura',
        code: `assert.near(box('.pagina').width, 500, 2, 'A .pagina deveria ter 500px de largura. O valor precisa de unidade.');`,
      },
    ],
    hints: [
      'No `classList` o nome da classe vai sem o ponto.',
      "`style.width` precisa de uma string com unidade, tipo `'500px'`.",
    ],
    followUpQuestionIds: ['core.m06.f11', 'core.m06.f12'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'core.m06.q08',
    lessonIds: ['core.m06.l02'],
    kind: 'multiple-choice',
    prompt: 'Como se escreve `background-color` pelo `style` do JavaScript?',
    options: [
      "caixa.style.backgroundColor = 'yellow'",
      "caixa.style.background-color = 'yellow'",
      "caixa.style['background color'] = 'yellow'",
      "caixa.backgroundColor = 'yellow'",
    ],
    answerIndex: 0,
    explanation:
      'No `style`, propriedades com hífen viram camelCase. Com hífen, o JS entenderia uma subtração.',
    difficulty: 1,
  },
  {
    id: 'core.m06.q09',
    lessonIds: ['core.m06.l02'],
    kind: 'multiple-choice',
    prompt: "O menu está fechado (sem a classe `aberto`). O que `menu.classList.toggle('aberto')` faz?",
    options: [
      'Coloca a classe `aberto`',
      'Tira a classe `aberto`',
      'Dá erro, porque a classe não existe',
      'Troca todas as classes do menu por `aberto`',
    ],
    answerIndex: 0,
    explanation: '`toggle` alterna: se não tem, coloca; se tem, tira.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'core.m06.q10',
    lessonIds: ['core.m06.l02'],
    kind: 'true-false',
    prompt: '`caixa.style.width = 300;` deixa a caixa com 300px de largura.',
    answer: false,
    explanation: "Sem unidade o valor é inválido e o navegador ignora em silêncio. O certo é `'300px'`.",
    difficulty: 1,
  },
  {
    id: 'core.m06.q11',
    lessonIds: ['core.m06.l02'],
    kind: 'fill-blank',
    prompt: 'Complete para tirar a classe `escondido` do aviso.',
    code: "aviso.classList.___('escondido');",
    acceptedAnswers: ['remove'],
    explanation: '`classList.remove` tira a classe; `add` coloca; `toggle` alterna.',
    difficulty: 1,
  },
  {
    id: 'core.m06.q12',
    lessonIds: ['core.m06.l02'],
    kind: 'multiple-choice',
    prompt: 'Por que costuma ser melhor trocar uma classe do que mudar vários `style` pelo JS?',
    options: [
      'O visual fica todo no CSS e o JS só liga e desliga a classe',
      'Porque `style` não funciona em `<div>`',
      'Porque classes deixam a página mais rápida de baixar',
      'Porque `style` apaga as classes do elemento',
    ],
    answerIndex: 0,
    explanation:
      'Com classes, quem mexe no visual mexe só no CSS. O JS fica curto: `classList.add`, `remove` ou `toggle`.',
    difficulty: 2,
  },
  {
    id: 'core.m06.q13',
    lessonIds: ['core.m06.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual linha troca a imagem de `foto` para `img/coxinha.jpg`?',
    options: [
      "foto.setAttribute('src', 'img/coxinha.jpg')",
      "foto.textContent = 'img/coxinha.jpg'",
      "foto.classList.add('img/coxinha.jpg')",
      "foto.style.src = 'img/coxinha.jpg'",
    ],
    answerIndex: 0,
    explanation:
      "A imagem vem do atributo `src`. `setAttribute('src', ...)` ou `foto.src = ...` trocam a foto.",
    difficulty: 1,
  },
  {
    id: 'core.m06.q14',
    lessonIds: ['core.m06.l02'],
    kind: 'true-false',
    prompt: "`botao.classList.contains('ativo')` devolve `true` se o botão tiver a classe `ativo`.",
    answer: true,
    explanation: '`contains` só pergunta, sem mudar nada. Ótimo para um `if`.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'core.m06.f07',
    lessonIds: ['core.m06.l02'],
    exerciseId: 'core.m06.e03',
    kind: 'multiple-choice',
    prompt: 'No site da padaria, o que fez o aviso de domingo aparecer?',
    options: [
      'Tirar a classe `escondido`, que tinha `display: none` no CSS',
      'Mudar o `textContent` do aviso',
      'Colocar a classe `destaque` no aviso',
      'Apagar a regra `.escondido` do CSS',
    ],
    answerIndex: 0,
    explanation: 'O CSS esconde quem tem `.escondido`. Sem a classe, o aviso volta a aparecer.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f08',
    lessonIds: ['core.m06.l02'],
    exerciseId: 'core.m06.e03',
    kind: 'true-false',
    prompt: "Depois de `promo.classList.add('destaque')`, o parágrafo `.promo` perde a classe `promo`.",
    answer: false,
    explanation: '`add` acrescenta. O elemento fica com as duas: `promo destaque`.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f09',
    lessonIds: ['core.m06.l02'],
    exerciseId: 'core.m06.e04',
    kind: 'fill-blank',
    prompt: 'Complete a linha que você usou para habilitar o botão de agendar.',
    code: 'agendar.disabled = ___;',
    acceptedAnswers: ['false'],
    explanation: '`disabled` é um atributo de liga/desliga; como propriedade, vira booleano.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f10',
    lessonIds: ['core.m06.l02'],
    exerciseId: 'core.m06.e04',
    kind: 'multiple-choice',
    prompt: 'Para que serve o `alt` que você colocou na foto do cachorro?',
    options: [
      'Texto alternativo: aparece se a imagem não carregar e é lido por leitores de tela',
      'Define a altura da imagem',
      'É o link para onde a imagem leva',
      'É o nome do arquivo da imagem',
    ],
    answerIndex: 0,
    explanation: 'O `alt` descreve a imagem para quem não consegue vê-la. O arquivo fica no `src`.',
    difficulty: 1,
  },
  {
    id: 'core.m06.f11',
    lessonIds: ['core.m06.l02'],
    exerciseId: 'core.m06.d02',
    kind: 'multiple-choice',
    prompt: "No modo noturno quebrado, que classe `pagina.classList.add('.noturno')` colocava na página?",
    options: [
      'Uma classe chamada ".noturno", com ponto, que o CSS não pega',
      'A classe `noturno`, igualzinho',
      'Nenhuma: a linha dava erro',
      'Todas as classes que começam com "noturno"',
    ],
    answerIndex: 0,
    explanation:
      'O ponto vira parte do nome. O seletor `.noturno` do CSS procura a classe `noturno`, sem ponto.',
    difficulty: 2,
  },
  {
    id: 'core.m06.f12',
    lessonIds: ['core.m06.l02'],
    exerciseId: 'core.m06.d02',
    kind: 'true-false',
    prompt:
      'O `pagina.style.width = 500` não mudava nada porque faltava a unidade, e o navegador ignorou o valor sem mostrar erro.',
    answer: true,
    explanation: "Valores de CSS inválidos são ignorados em silêncio. Com `'500px'` funciona.",
    difficulty: 1,
  },
];
