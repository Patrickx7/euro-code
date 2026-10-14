import type { Exercise, Lesson, Question } from '../../../src/shared/content';

/** Todas as regras CSS da página (usado nos testes). */
const ALL_RULES = '[...document.styleSheets].flatMap((s) => [...s.cssRules])';

/** Conta quantos cards ficaram na primeira linha da vitrine. */
const POR_LINHA = `const porLinha = () => {
  const topos = [...document.querySelectorAll('.produto')].map((p) => p.getBoundingClientRect().top);
  return topos.filter((t) => Math.abs(t - topos[0]) < 2).length;
};
const vitrine = document.querySelector('.vitrine');
`;

const VITRINE_HTML = `<h1>Pet Shop Latido Feliz</h1>
<section class="vitrine">
  <div class="produto">Ração premium (o gato ignora)</div>
  <div class="produto">Bolinha que apita</div>
  <div class="produto">Caminha ortopédica</div>
  <div class="produto">Coleira com GPS</div>
  <div class="produto">Arranhador de três andares</div>
  <div class="produto">Petisco de frango</div>
</section>
`;

const VITRINE_CSS_BASE = `body {
  margin: 0;
  font-family: sans-serif;
}

.vitrine {
  display: grid;
  gap: 16px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;
`;

const VITRINE_CSS_FIM = `}

.produto {
  padding: 24px 12px;
  background: #fff3e0;
  border: 1px solid #ffb74d;
  border-radius: 8px;
}
`;

const MENU_HTML = `<header class="topo">
  <span class="logo">Latido Feliz</span>
  <button class="hamburguer" type="button" aria-label="Abrir menu">☰</button>
  <nav class="menu">
    <a href="#banho">Banho e tosa</a>
    <a href="#racao">Ração</a>
    <a href="#contato">Contato</a>
  </nav>
</header>
`;

const MENU_JS = `const botao = document.querySelector('.hamburguer');
const menu = document.querySelector('.menu');

botao.addEventListener('click', function () {
  menu.classList.toggle('aberto');
});
`;

function menuCss(seletorAberto: string): string {
  return `body {
  margin: 0;
  font-family: sans-serif;
}

.topo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #4a148c;
  color: white;
}

.hamburguer {
  font-size: 1.5rem;
  background: none;
  border: 0;
  color: white;
}

/* Celular: menu escondido até clicar no hambúrguer */
.menu {
  display: none;
  width: 100%;
  flex-direction: column;
}

${seletorAberto} {
  display: flex;
}

.menu a {
  color: white;
  padding: 8px 0;
}

/* Computador: menu sempre à mostra, sem hambúrguer */
@media (min-width: 768px) {
  .hamburguer {
    display: none;
  }

  .menu {
    display: flex;
    flex-direction: row;
    gap: 16px;
    width: auto;
  }
}
`;
}

export const lesson: Lesson = {
  id: 'front.m03.l02',
  moduleId: 'front.m03',
  order: 2,
  title: 'Componentes responsivos: grade, hambúrguer e ordem',
  concepts: [
    'repeat(auto-fit, minmax())',
    'menu hambúrguer',
    'esconder e mostrar com media query',
    'order no flex',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Layout fluido resolve a página. Agora vêm os **componentes**: a vitrine de produtos, o menu, os cards. Cada um tem seus truques.

## A grade que se ajusta sozinha

No core você escreveu \`grid-template-columns: repeat(3, 1fr)\`: três colunas sempre, até no celular, com os cards espremidos. Troque o número fixo por isto:

\`\`\`css
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
\`\`\`

Leia assim: *"crie quantas colunas couberem (\`auto-fit\`), cada uma com **no mínimo 200px** e dividindo a sobra (\`1fr\`)"*. Num monitor cabem 4; num tablet, 2; no celular, 1. **Sem nenhuma media query.**`,
    },
    {
      kind: 'text',
      markdown: `## O menu hambúrguer

No celular não cabem seis links lado a lado. O padrão é:

1. um \`<button>\` (o "☰") que só aparece no celular;
2. o \`<nav>\` começa com \`display: none\` no celular;
3. um clique no botão liga uma classe (\`.aberto\`) que mostra o menu;
4. numa \`@media (min-width: 768px)\`, o botão some e o menu aparece sempre.

Cuidado com o seletor da classe: \`.menu.aberto\` (**sem espaço**) é "o elemento que tem as duas classes". Já \`.menu .aberto\` (**com espaço**) é "um elemento \`.aberto\` **dentro** do \`.menu\`". Um espaço muda tudo.

## Mudando a ordem com \`order\`

Num contêiner flex (ou grid), \`order\` muda a ordem **visual**: o padrão é 0, e quem tem número menor vem antes. Útil para, no celular, subir o botão "Pedir orçamento" para o topo.

Só que a ordem do **teclado** (Tab) e do leitor de tela continua sendo a do HTML. Se a ordem importa para entender a página, mude o HTML, não só o CSS.`,
    },
    {
      kind: 'example',
      language: 'css',
      code: `.cards {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.coluna {
  display: flex;
  flex-direction: column;
}

/* No celular, o CTA sobe para o topo da coluna */
.coluna .cta {
  order: -1;
}

@media (min-width: 768px) {
  .coluna .cta {
    order: 0; /* volta para o lugar dele no HTML */
  }
}`,
      explanation:
        'A grade não precisa de media query: o `minmax` decide quantas colunas cabem. O `order: -1` põe o CTA antes dos irmãos (que têm order 0), mas só visualmente.',
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  .menu { display: none; }
  .menu.aberto { display: block; }
  @media (min-width: 768px) {
    .hamburguer { display: none; }
    .menu { display: block; }
  }
</style>

<button class="hamburguer" type="button" aria-label="Abrir menu">☰</button>
<nav class="menu">
  <a href="#servicos">Serviços</a>
  <a href="#contato">Contato</a>
</nav>

<script>
  document.querySelector('.hamburguer').addEventListener('click', function () {
    document.querySelector('.menu').classList.toggle('aberto');
  });
</script>`,
      explanation:
        'O JavaScript só liga e desliga a classe. Quem decide como o menu fica, no celular e no computador, é o CSS.',
    },
  ],
  checkQuestionIds: ['front.m03.q08'],
  exerciseIds: ['front.m03.e02'],
  debugExerciseIds: ['front.m03.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'front.m03.e02',
    lessonId: 'front.m03.l02',
    kind: 'implement',
    title: 'A vitrine que se ajusta sozinha',
    promptMarkdown: `A vitrine do **Pet Shop Latido Feliz** tem sempre 4 colunas. No computador fica ótimo; no celular, cada produto vira um palito.

O Seu Rubens não quer "um monte de media query que depois ninguém entende". Troque o \`grid-template-columns\` da \`.vitrine\` para criar **quantas colunas couberem**, cada uma com **no mínimo 200px**, sem nenhuma \`@media\`.

Os testes medem a vitrine em três larguras: 1000px, 600px e 340px.`,
    language: 'web',
    viewport: { width: 1280, height: 800 },
    starterFiles: {
      html: VITRINE_HTML,
      css: `${VITRINE_CSS_BASE}  grid-template-columns: repeat(4, 1fr);
${VITRINE_CSS_FIM}`,
      js: '',
    },
    solutionFiles: {
      html: VITRINE_HTML,
      css: `${VITRINE_CSS_BASE}  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
${VITRINE_CSS_FIM}`,
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'numa vitrine de 1000px, cabem 4 produtos por linha',
        code: `${POR_LINHA}assert.strictEqual(porLinha(), 4, 'Na vitrine de 1000px deveriam caber 4 produtos por linha.');`,
      },
      {
        description: 'numa vitrine de 600px (tablet), ficam 2 por linha',
        code: `${POR_LINHA}vitrine.style.maxWidth = '600px';
const n = porLinha();
vitrine.style.maxWidth = '';
assert.strictEqual(n, 2, 'Numa vitrine de 600px ficaram ' + n + ' produtos por linha; com colunas de no mínimo 200px, cabem 2.');`,
      },
      {
        description: 'numa vitrine de 340px (celular), fica 1 por linha',
        code: `${POR_LINHA}vitrine.style.maxWidth = '340px';
const n = porLinha();
const largura = document.querySelector('.produto').getBoundingClientRect().width;
vitrine.style.maxWidth = '';
assert.strictEqual(n, 1, 'No celular ficaram ' + n + ' produtos por linha, cada um com ' + Math.round(largura) + 'px. Deveria ser 1 por linha.');`,
      },
      {
        description: 'sem media query',
        code: `assert.ok(!${ALL_RULES}.some((r) => r instanceof CSSMediaRule), 'O Seu Rubens pediu sem @media: o grid decide sozinho quantas colunas cabem.');`,
      },
    ],
    hints: [
      'Dentro do `repeat()`, troque o `4` por `auto-fit`.',
      'E troque o `1fr` por `minmax(200px, 1fr)`: no mínimo 200px, no máximo uma fração da sobra.',
    ],
    followUpQuestionIds: ['front.m03.f05', 'front.m03.f06'],
    difficulty: 2,
  },
  {
    id: 'front.m03.d02',
    lessonId: 'front.m03.l02',
    kind: 'debug',
    title: 'O hambúrguer que não abre',
    promptMarkdown: `O menu hambúrguer do **Pet Shop Latido Feliz** não abre no celular. O Seu Rubens jura que "clicou umas quarenta vezes".

O JavaScript está certo: ele liga e desliga a classe \`aberto\` no \`.menu\` (confira na aba JS). O defeito está no CSS. A tela de teste é de celular (375 × 667).`,
    language: 'web',
    viewport: { width: 375, height: 667 },
    starterFiles: { html: MENU_HTML, css: menuCss('.menu .aberto'), js: MENU_JS },
    solutionFiles: { html: MENU_HTML, css: menuCss('.menu.aberto'), js: MENU_JS },
    editableFiles: ['css'],
    tests: [
      {
        description: 'no celular, o menu começa fechado e o hambúrguer aparece',
        code: `assert.strictEqual(style('.menu').display, 'none', 'No celular, o menu deveria começar escondido.');
assert.notStrictEqual(style('.hamburguer').display, 'none', 'No celular, o botão ☰ deveria aparecer.');`,
      },
      {
        description: 'clicar no hambúrguer abre o menu, e clicar de novo fecha',
        code: `click('.hamburguer');
const aberto = style('.menu').display;
click('.hamburguer');
const fechado = style('.menu').display;
assert.strictEqual(aberto, 'flex', 'Depois do clique, o .menu ganhou a classe "aberto", mas continua escondido. O seletor pega o elemento certo?');
assert.strictEqual(fechado, 'none', 'Clicando de novo, o menu deveria fechar.');`,
      },
      {
        description: 'no computador, o menu aparece sem hambúrguer',
        code: `const medias = ${ALL_RULES}.filter((r) => r instanceof CSSMediaRule);
assert.ok(medias.length > 0, 'Mantenha a @media (min-width: 768px) do computador.');
const originais = medias.map((m) => m.media.mediaText);
for (const m of medias) m.media.mediaText = 'all';
const botao = style('.hamburguer').display;
const menu = style('.menu').display;
medias.forEach((m, i) => {
  m.media.mediaText = originais[i];
});
assert.strictEqual(botao, 'none', 'No computador, o botão ☰ deveria sumir.');
assert.strictEqual(menu, 'flex', 'No computador, o menu deveria aparecer sempre.');`,
      },
    ],
    hints: [
      'Compare `.menu .aberto` com `.menu.aberto`. Qual dos dois quer dizer "o elemento que tem as duas classes"?',
      'Com espaço, o seletor procura um `.aberto` **dentro** do `.menu`. Tire o espaço.',
    ],
    followUpQuestionIds: ['front.m03.f07', 'front.m03.f08'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'front.m03.q08',
    lessonIds: ['front.m03.l02'],
    kind: 'multiple-choice',
    prompt: 'O que faz `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`?',
    options: [
      'Cria sempre 200 colunas.',
      'Cria quantas colunas de no mínimo 200px couberem, dividindo a sobra entre elas.',
      'Cria uma coluna de 200px e outra de 1fr.',
      'Só funciona dentro de uma media query.',
    ],
    answerIndex: 1,
    explanation: '`auto-fit` decide a quantidade; `minmax(200px, 1fr)` garante o mínimo e reparte a sobra.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q09',
    lessonIds: ['front.m03.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual seletor pega um elemento que tem **ao mesmo tempo** as classes `menu` e `aberto`?',
    options: ['`.menu .aberto`', '`.menu.aberto`', '`.menu, .aberto`', '`.menu > .aberto`'],
    answerIndex: 1,
    explanation:
      'Classes coladas, sem espaço, exigem as duas no mesmo elemento. Com espaço, é um descendente.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q10',
    lessonIds: ['front.m03.l02'],
    kind: 'true-false',
    prompt: 'Mudar a ordem de um item com `order` também muda a ordem em que a tecla Tab passa por ele.',
    answer: false,
    explanation: '`order` muda só a ordem visual. Teclado e leitor de tela seguem a ordem do HTML.',
    difficulty: 2,
  },
  {
    id: 'front.m03.q11',
    lessonIds: ['front.m03.l02'],
    kind: 'fill-blank',
    prompt:
      'Complete para o botão de orçamento aparecer **antes** dos irmãos (que têm a ordem padrão) num contêiner flex:',
    code: '.cta {\n  order: ___;\n}',
    acceptedAnswers: ['-1'],
    explanation: 'O padrão é 0. Um número menor, como -1, vem antes.',
    difficulty: 2,
  },
  {
    id: 'front.m03.q12',
    lessonIds: ['front.m03.l02'],
    kind: 'multiple-choice',
    prompt: 'No padrão do menu hambúrguer, qual elemento HTML deve ser o "☰"?',
    options: [
      'Um `<div>` com o evento de clique.',
      'Um `<span>` bem bonito.',
      'Um `<button>`.',
      'Um `<img>` de três risquinhos.',
    ],
    answerIndex: 2,
    explanation:
      'Ele executa uma ação na página (abrir o menu): é um `<button>`, que já vem com foco e teclado.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q13',
    lessonIds: ['front.m03.l02'],
    kind: 'multiple-choice',
    prompt:
      'Uma vitrine com `repeat(auto-fit, minmax(250px, 1fr))` e sem `gap` tem 800px de largura. Quantas colunas aparecem?',
    options: ['2', '3', '4', '1'],
    answerIndex: 1,
    explanation:
      'Cabem 3 colunas de 250px (750px); a 4ª precisaria de 1000px. A sobra é dividida entre as 3.',
    difficulty: 2,
  },
  {
    id: 'front.m03.q14',
    lessonIds: ['front.m03.l02'],
    kind: 'true-false',
    prompt:
      'No menu hambúrguer, o JavaScript só precisa ligar e desligar uma classe; o CSS decide como o menu aparece em cada tela.',
    answer: true,
    explanation: 'Separar as coisas deixa o código simples: o JS cuida do estado, o CSS da aparência.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f05',
    lessonIds: ['front.m03.l02'],
    exerciseId: 'front.m03.e02',
    kind: 'multiple-choice',
    prompt: 'Na sua vitrine, o que muda o número de colunas entre o computador e o celular?',
    options: [
      'Uma media query escondida no HTML.',
      'O `auto-fit` com `minmax(200px, 1fr)`: o grid calcula quantas colunas de 200px cabem.',
      'O JavaScript da página.',
      'O `gap` de 16px.',
    ],
    answerIndex: 1,
    explanation: 'O próprio grid faz a conta a cada largura. Por isso não precisou de `@media`.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f06',
    lessonIds: ['front.m03.l02'],
    exerciseId: 'front.m03.e02',
    kind: 'multiple-choice',
    prompt: 'Se você trocasse o `200px` do seu `minmax` por `300px`, o que aconteceria na vitrine de 1000px?',
    options: [
      'Continuariam 4 colunas.',
      'Cairia para 3 colunas, porque só cabem 3 de 300px (mais o gap).',
      'Viraria 1 coluna só.',
      'Os produtos sumiriam.',
    ],
    answerIndex: 1,
    explanation: 'Quatro colunas de 300px já passariam de 1000px. Um mínimo maior = menos colunas.',
    difficulty: 2,
  },
  {
    id: 'front.m03.f07',
    lessonIds: ['front.m03.l02'],
    exerciseId: 'front.m03.d02',
    kind: 'multiple-choice',
    prompt: 'O que o seletor com defeito, `.menu .aberto`, procurava?',
    options: [
      'O `.menu` que tem a classe `aberto`.',
      'Um elemento com a classe `aberto` **dentro** do `.menu`, que não existia.',
      'Todos os links do menu.',
      'O botão ☰.',
    ],
    answerIndex: 1,
    explanation: 'O espaço é o combinador de descendente. A classe estava no próprio `.menu`, não num filho.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f08',
    lessonIds: ['front.m03.l02'],
    exerciseId: 'front.m03.d02',
    kind: 'true-false',
    prompt:
      'No seu CSS consertado, numa tela de computador o menu aparece mesmo sem ninguém clicar no hambúrguer.',
    answer: true,
    explanation: 'Dentro da `@media (min-width: 768px)`, o `.menu` tem `display: flex` sempre.',
    difficulty: 1,
  },
];
