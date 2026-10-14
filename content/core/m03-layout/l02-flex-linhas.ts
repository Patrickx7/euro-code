import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m03.l02',
  moduleId: 'core.m03',
  order: 2,
  title: 'Flexbox: menus e cards lado a lado',
  concepts: ['gap', 'flex-direction', 'flex-wrap', 'flex-grow', 'valor inválido é ignorado'],
  sections: [
    {
      kind: 'text',
      markdown:
        'Centralizar foi só o aquecimento. O flexbox é o que monta barras de navegação, listas de cards e quase todo "lado a lado" de um site.\n\n' +
        '- `flex-direction` escolhe o eixo principal: `row` (padrão, em linha) ou `column` (empilhado).\n' +
        '- `gap` põe um espaço fixo **entre** os itens (não nas bordas). Com 4 itens e `gap: 16px`, são 3 espaços de 16px.\n' +
        '- `flex-wrap: wrap` deixa os itens quebrarem para a linha de baixo quando não cabem. Sem ele (o padrão é `nowrap`), o flexbox **encolhe** os itens para caber tudo numa linha só.\n' +
        '- `flex-grow: 1` num item faz ele ocupar o espaço que sobrou no contêiner.\n\n' +
        'As três primeiras vão no **contêiner**; o `flex-grow` vai no **item**.',
    },
    {
      kind: 'example',
      language: 'html',
      code:
        '<nav class="menu">\n' +
        '  <span class="logo">Lava-Rápido Bolha Feliz</span>\n' +
        '  <a href="#">Serviços</a>\n' +
        '  <a href="#">Preços</a>\n' +
        '</nav>',
      explanation: 'Uma barra de navegação típica: o logo e alguns links.',
    },
    {
      kind: 'example',
      language: 'css',
      code:
        '.menu {\n' +
        '  display: flex;\n' +
        '  gap: 16px;      /* 16px entre cada item */\n' +
        '}\n\n' +
        '.logo {\n' +
        '  flex-grow: 1;   /* o logo engole a sobra e empurra os links para a direita */\n' +
        '}',
      explanation: 'O logo cresce, os links ficam no canto direito, todos com o mesmo espaçamento.',
    },
    {
      kind: 'text',
      markdown:
        '### Cards que quebram linha\n\n' +
        'Uma lista de cards com `width: 300px` numa tela de 800px: sem `flex-wrap`, os quatro cards se espremem numa linha só (cada um fica com menos de 300px). Com `flex-wrap: wrap`, cabem dois por linha e o resto desce.\n\n' +
        '### Cuidado: CSS errado não dá erro\n\n' +
        'Se você escreve um valor que não existe, como `flex-direction: wrap`, o navegador **ignora a linha em silêncio**. Nada de mensagem vermelha: a página só fica do jeito errado. Quando "não acontece nada", desconfie de propriedade ou valor trocado (o DevTools risca a declaração inválida).',
    },
    {
      kind: 'example',
      language: 'css',
      code:
        '.vitrine {\n' +
        '  display: flex;\n' +
        '  flex-wrap: wrap;  /* não coube? desce */\n' +
        '  gap: 16px;\n' +
        '}\n\n' +
        '.card {\n' +
        '  width: 300px;\n' +
        '}',
    },
  ],
  checkQuestionIds: ['core.m03.q09'],
  exerciseIds: ['core.m03.e02'],
  debugExerciseIds: ['core.m03.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m03.e02',
    lessonId: 'core.m03.l02',
    kind: 'implement',
    title: 'O menu da auto peças',
    promptMarkdown:
      'O menu da Auto Peças Parafuso Solto está com tudo empilhado. O dono quer:\n\n' +
      '- o logo e os links **na mesma linha**;\n' +
      '- **16px** de espaço entre os itens;\n' +
      '- o logo **ocupando a sobra**, empurrando os links para o canto direito.\n\n' +
      'Edite só o CSS.',
    language: 'web',
    starterFiles: {
      html:
        '<nav class="menu">\n' +
        '  <span class="logo">Parafuso Solto</span>\n' +
        '  <a href="#">Peças</a>\n' +
        '  <a href="#">Ofertas</a>\n' +
        '  <a href="#">Contato</a>\n' +
        '</nav>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.menu {\n' +
        '  background: #263238;\n' +
        '}\n\n' +
        '.menu > * {\n' +
        '  display: block;\n' +
        '  padding: 12px;\n' +
        '  color: white;\n' +
        '  text-decoration: none;\n' +
        '}\n',
      js: '',
    },
    solutionFiles: {
      html:
        '<nav class="menu">\n' +
        '  <span class="logo">Parafuso Solto</span>\n' +
        '  <a href="#">Peças</a>\n' +
        '  <a href="#">Ofertas</a>\n' +
        '  <a href="#">Contato</a>\n' +
        '</nav>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.menu {\n' +
        '  background: #263238;\n' +
        '  display: flex;\n' +
        '  gap: 16px;\n' +
        '}\n\n' +
        '.menu > * {\n' +
        '  display: block;\n' +
        '  padding: 12px;\n' +
        '  color: white;\n' +
        '  text-decoration: none;\n' +
        '}\n\n' +
        '.logo {\n' +
        '  flex-grow: 1;\n' +
        '}\n',
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'o logo e os links estão na mesma linha',
        code:
          "const tops = [...document.querySelectorAll('.menu > *')].map((el) => el.getBoundingClientRect().top);\n" +
          "assert.ok(tops.every((t) => Math.abs(t - tops[0]) < 2), 'Os itens do menu não estão lado a lado.');",
      },
      {
        description: 'há 16px de espaço entre os links',
        code:
          "const links = [...document.querySelectorAll('.menu a')].map((el) => el.getBoundingClientRect());\n" +
          'assert.near(links[1].left - links[0].right, 16, 2, \'O espaço entre "Peças" e "Ofertas" deveria ser de 16px.\');\n' +
          'assert.near(links[2].left - links[1].right, 16, 2, \'O espaço entre "Ofertas" e "Contato" deveria ser de 16px.\');',
      },
      {
        description: 'o logo ocupa a sobra e os links ficam no canto direito',
        code:
          "assert.near(box('.menu > :last-child').right, viewport.width, 2, 'O último link deveria encostar na borda direita.');\n" +
          "assert.ok(box('.menu > :last-child').width < 200, 'Os links deveriam ter só o tamanho do texto; quem cresce é o logo.');\n" +
          "assert.ok(box('.logo').width > viewport.width / 2, 'O logo deveria crescer e ocupar o espaço que sobra.');",
      },
    ],
    hints: [
      'O `.menu` vira contêiner flex: `display: flex`. O espaço entre os itens é o `gap`.',
      'Para o logo engolir a sobra, use `flex-grow: 1` no `.logo`.',
    ],
    followUpQuestionIds: ['core.m03.f05', 'core.m03.f06'],
    difficulty: 1,
  },
  {
    id: 'core.m03.d02',
    lessonId: 'core.m03.l02',
    kind: 'debug',
    title: 'Os imóveis espremidos',
    promptMarkdown:
      'Na vitrine da Imobiliária Lar Doce Cotia, os quatro cards de imóveis deveriam ter **300px** cada e quebrar para a linha de baixo quando não coubessem. Mas estão todos espremidos numa linha só.\n\n' +
      'O estagiário anterior jura que "colocou o wrap". Ache o defeito.',
    language: 'web',
    starterFiles: {
      html:
        '<section class="lista">\n' +
        '  <article class="card">Sobrado na Granja Viana</article>\n' +
        '  <article class="card">Kitnet no Centro de Osasco</article>\n' +
        '  <article class="card">Casa com quintal em Carapicuíba</article>\n' +
        '  <article class="card">Chácara em Caucaia do Alto</article>\n' +
        '</section>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.lista {\n' +
        '  display: flex;\n' +
        '  gap: 16px;\n' +
        '  flex-direction: wrap;\n' +
        '}\n\n' +
        '.card {\n' +
        '  box-sizing: border-box;\n' +
        '  width: 300px;\n' +
        '  height: 120px;\n' +
        '  padding: 12px;\n' +
        '  background: #e3f2fd;\n' +
        '}\n',
      js: '',
    },
    solutionFiles: {
      html:
        '<section class="lista">\n' +
        '  <article class="card">Sobrado na Granja Viana</article>\n' +
        '  <article class="card">Kitnet no Centro de Osasco</article>\n' +
        '  <article class="card">Casa com quintal em Carapicuíba</article>\n' +
        '  <article class="card">Chácara em Caucaia do Alto</article>\n' +
        '</section>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.lista {\n' +
        '  display: flex;\n' +
        '  gap: 16px;\n' +
        '  flex-wrap: wrap;\n' +
        '}\n\n' +
        '.card {\n' +
        '  box-sizing: border-box;\n' +
        '  width: 300px;\n' +
        '  height: 120px;\n' +
        '  padding: 12px;\n' +
        '  background: #e3f2fd;\n' +
        '}\n',
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'cada card tem 300px de largura',
        code:
          "for (const card of document.querySelectorAll('.card')) {\n" +
          "  assert.near(card.getBoundingClientRect().width, 300, 2, 'Algum card não está com 300px: eles ainda estão sendo espremidos.');\n" +
          '}',
      },
      {
        description: 'os dois primeiros cards ficam lado a lado',
        code: "assert.near(box('.card:nth-child(2)').top, box('.card:nth-child(1)').top, 2, 'Os dois primeiros cards deveriam estar na mesma linha.');",
      },
      {
        description: 'o terceiro card desce para a linha de baixo',
        code:
          "const primeiro = box('.card:nth-child(1)');\n" +
          "const terceiro = box('.card:nth-child(3)');\n" +
          "assert.ok(terceiro.top >= primeiro.bottom, 'O terceiro card deveria quebrar para a linha de baixo.');\n" +
          "assert.near(terceiro.left, primeiro.left, 2, 'O terceiro card deveria começar a nova linha na esquerda.');",
      },
    ],
    hints: [
      '`wrap` é um valor válido para `flex-direction`? Quando o valor não existe, o navegador ignora a linha.',
      'Quem quebra linha é `flex-wrap: wrap`.',
    ],
    followUpQuestionIds: ['core.m03.f07', 'core.m03.f08'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m03.q09',
    lessonIds: ['core.m03.l02'],
    kind: 'multiple-choice',
    prompt:
      'Qual propriedade do contêiner flex cria um espaço fixo **entre** os itens, sem colocar espaço nas bordas?',
    options: ['`padding`', '`margin`', '`gap`', '`space`'],
    answerIndex: 2,
    explanation: '`gap` só cria espaço entre os itens. `padding` fica dentro das bordas do contêiner.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q10',
    lessonIds: ['core.m03.l02'],
    kind: 'multiple-choice',
    prompt:
      'Os cards estão espremidos numa linha só. Qual declaração deixa eles quebrarem para a linha de baixo?',
    options: ['`flex-direction: column`', '`flex-wrap: wrap`', '`gap: wrap`', '`overflow: wrap`'],
    answerIndex: 1,
    explanation: '`flex-wrap: wrap` permite várias linhas. `column` empilharia todos, um por linha.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q11',
    lessonIds: ['core.m03.l02'],
    kind: 'true-false',
    prompt: '`flex-grow: 1` num item faz ele ocupar o espaço livre que sobra no contêiner.',
    answer: true,
    explanation: 'O espaço que sobra é dividido entre os itens com `flex-grow`, na proporção dos valores.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q12',
    lessonIds: ['core.m03.l02'],
    kind: 'fill-blank',
    prompt: 'Complete para empilhar os itens, um embaixo do outro:',
    code: '.lista {\n  display: flex;\n  flex-direction: ___;\n}',
    acceptedAnswers: ['column'],
    explanation: 'Com `column`, o eixo principal vira o vertical e os itens se empilham.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q13',
    lessonIds: ['core.m03.l02'],
    kind: 'multiple-choice',
    prompt: 'Num contêiner flex sem `flex-wrap`, o que acontece quando os itens não cabem na largura?',
    options: [
      'Eles vão sozinhos para a linha de baixo.',
      'O navegador mostra um erro.',
      'O contêiner some.',
      'Eles encolhem para caber na mesma linha (e, se não der, vazam para fora).',
    ],
    answerIndex: 3,
    explanation:
      'O padrão é `flex-wrap: nowrap` com `flex-shrink: 1`: tudo numa linha, encolhendo até o mínimo que o conteúdo permite.',
    difficulty: 2,
  },
  {
    id: 'core.m03.q14',
    lessonIds: ['core.m03.l02'],
    kind: 'true-false',
    prompt:
      'Se você escrever um valor inválido, como `flex-direction: wrap`, o navegador mostra um erro na página.',
    answer: false,
    explanation: 'O CSS ignora declarações inválidas em silêncio. Só o DevTools mostra a linha riscada.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q15',
    lessonIds: ['core.m03.l02'],
    kind: 'multiple-choice',
    prompt: 'Num menu com um logo e 3 links, onde ficam os links com este CSS?',
    code: '.menu {\n  display: flex;\n}\n\n.logo {\n  flex-grow: 1;\n}',
    options: [
      'Centralizados no menu.',
      'Empurrados para a direita, porque o logo ocupa a sobra.',
      'Embaixo do logo.',
      'Em cima do logo.',
    ],
    answerIndex: 1,
    explanation: 'O logo cresce até preencher o espaço livre, e os links ficam encostados no fim da linha.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q16',
    lessonIds: ['core.m03.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual é o `flex-direction` padrão de um contêiner flex?',
    options: ['`row`', '`column`', '`row-reverse`', '`wrap`'],
    answerIndex: 0,
    explanation: 'O padrão é `row`: os itens ficam em linha, da esquerda para a direita.',
    difficulty: 1,
  },
  {
    id: 'core.m03.f05',
    lessonIds: ['core.m03.l02'],
    exerciseId: 'core.m03.e02',
    kind: 'multiple-choice',
    prompt: 'No seu menu, o que aconteceria com os links se você tirasse o `flex-grow: 1` do `.logo`?',
    options: [
      'Continuariam no canto direito.',
      'Iriam para baixo do logo.',
      'Ficariam logo depois do logo, todos à esquerda, e sobraria espaço na direita.',
      'Sumiriam.',
    ],
    answerIndex: 2,
    explanation: 'Sem ninguém crescendo, os itens ficam no início do eixo (`justify-content: flex-start`).',
    difficulty: 1,
  },
  {
    id: 'core.m03.f06',
    lessonIds: ['core.m03.l02'],
    exerciseId: 'core.m03.e02',
    kind: 'multiple-choice',
    prompt: 'Você usou `gap: 16px` no `.menu`, que tem 4 itens. Quantos espaços de 16px aparecem?',
    options: ['4', '3', '5', '8'],
    answerIndex: 1,
    explanation: 'O `gap` só fica entre itens vizinhos: 4 itens, 3 espaços.',
    difficulty: 1,
  },
  {
    id: 'core.m03.f07',
    lessonIds: ['core.m03.l02'],
    exerciseId: 'core.m03.d02',
    kind: 'multiple-choice',
    prompt: 'Por que o `flex-direction: wrap` não fazia nada?',
    options: [
      '`wrap` não é valor de `flex-direction`, então o navegador ignorou a declaração.',
      'Porque faltava `!important`.',
      'Porque o `gap` desliga a quebra de linha.',
      'Porque os cards tinham largura fixa.',
    ],
    answerIndex: 0,
    explanation:
      '`flex-direction` aceita `row`, `column` e as versões `-reverse`. Quebra de linha é com `flex-wrap`.',
    difficulty: 1,
  },
  {
    id: 'core.m03.f08',
    lessonIds: ['core.m03.l02'],
    exerciseId: 'core.m03.d02',
    kind: 'multiple-choice',
    prompt:
      'Na vitrine consertada (tela de 800px, cards de 300px, `gap: 16px`), quantos cards cabem por linha?',
    options: ['1', '3', '4', '2'],
    answerIndex: 3,
    explanation: '300 + 16 + 300 = 616px cabe; com o terceiro seriam 932px, mais que 800px.',
    difficulty: 2,
  },
];
