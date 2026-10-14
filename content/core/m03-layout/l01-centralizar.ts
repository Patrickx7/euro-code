import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m03.l01',
  moduleId: 'core.m03',
  order: 1,
  title: 'Flexbox: centralizar a div (finalmente)',
  concepts: ['display: flex', 'eixo principal e transversal', 'justify-content', 'align-items', '100vh'],
  sections: [
    {
      kind: 'text',
      markdown:
        'Todo freela já ouviu: *"é só centralizar, é rapidinho"*. E você dirige 38 km para isso. A boa notícia: no CSS moderno, quem resolve é o **flexbox**.\n\n' +
        'Quando você coloca `display: flex` num elemento, ele vira um **contêiner flex** e os **filhos diretos** viram **itens flex**. O contêiner organiza os itens ao longo de dois eixos:\n\n' +
        '- **Eixo principal**: por padrão é o horizontal (da esquerda para a direita).\n' +
        '- **Eixo transversal**: o perpendicular a ele; por padrão, o vertical.\n\n' +
        'Duas propriedades **do contêiner** fazem o alinhamento:\n\n' +
        '- `justify-content` alinha no **eixo principal**: `flex-start` (padrão), `center`, `flex-end`, `space-between`...\n' +
        '- `align-items` alinha no **eixo transversal**: `stretch` (padrão, estica os itens), `flex-start`, `center`, `flex-end`.\n\n' +
        'Com as duas em `center`, o item fica no meio dos dois eixos. Pronto: div centralizada.',
    },
    {
      kind: 'example',
      language: 'css',
      code:
        '.vitrine {\n' +
        '  display: flex;            /* vira contêiner flex */\n' +
        '  justify-content: center;  /* meio do eixo principal (horizontal) */\n' +
        '  align-items: center;      /* meio do eixo transversal (vertical) */\n' +
        '  height: 300px;            /* precisa de altura para ter "meio" na vertical */\n' +
        '}',
      explanation:
        'Qualquer filho da `.vitrine` fica no centro dela. As propriedades vão no **pai**, não no filho.',
    },
    {
      kind: 'text',
      markdown:
        '### As três pegadinhas clássicas\n\n' +
        '1. **Sem altura, não tem meio.** Um bloco só tem a altura do conteúdo. Para centralizar na tela, dê ao contêiner `height: 100vh` (`vh` = 1% da altura da janela, então `100vh` é a janela inteira).\n' +
        '2. **A margem do `body`.** O navegador põe `margin: 8px` no `body`. Com `height: 100vh` + 8px em cima e embaixo, a página ganha rolagem e o centro sai do lugar. Zere com `margin: 0`.\n' +
        '3. **Propriedade no elemento errado.** `justify-content` e `align-items` só funcionam no contêiner flex. No filho, não fazem nada (e o navegador não reclama). Se quiser alinhar **um** filho só, use `align-self` nele.\n\n' +
        'E um bônus: com `flex-direction: column` os eixos trocam. O principal vira o vertical, então `justify-content` passa a alinhar de cima para baixo.',
    },
    {
      kind: 'example',
      language: 'css',
      code:
        'body {\n' +
        '  margin: 0;\n' +
        '  height: 100vh;\n' +
        '  display: flex;\n' +
        '  justify-content: center;\n' +
        '  align-items: center;\n' +
        '}',
      explanation:
        'A receita para centralizar algo na tela inteira. Guarde no bolso: o cliente vai pedir de novo.',
    },
  ],
  checkQuestionIds: ['core.m03.q01'],
  exerciseIds: ['core.m03.e01'],
  debugExerciseIds: ['core.m03.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m03.e01',
    lessonId: 'core.m03.l01',
    kind: 'implement',
    title: 'Centralize a div',
    promptMarkdown:
      'O banner de promoção da pousada está grudado no canto. O cliente quer ele **bem no meio da tela**, na horizontal e na vertical.\n\n' +
      'Edite só o CSS. O banner deve continuar do tamanho dele (nada de esticar a caixa na tela toda).',
    language: 'web',
    starterFiles: {
      html: '<div class="banner">Diária com café: R$ 89!</div>\n',
      css:
        '.banner {\n' +
        '  width: 260px;\n' +
        '  padding: 16px;\n' +
        '  background: #ffd36e;\n' +
        '  border: 2px dashed #a0522d;\n' +
        '  text-align: center;\n' +
        '  font-family: sans-serif;\n' +
        '}\n',
      js: '',
    },
    solutionFiles: {
      html: '<div class="banner">Diária com café: R$ 89!</div>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '  height: 100vh;\n' +
        '  display: flex;\n' +
        '  justify-content: center;\n' +
        '  align-items: center;\n' +
        '}\n\n' +
        '.banner {\n' +
        '  width: 260px;\n' +
        '  padding: 16px;\n' +
        '  background: #ffd36e;\n' +
        '  border: 2px dashed #a0522d;\n' +
        '  text-align: center;\n' +
        '  font-family: sans-serif;\n' +
        '}\n',
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'o banner está no meio da tela na horizontal',
        code: "assert.near(box('.banner').centerX, viewport.width / 2, 2, 'O centro do banner não está no meio da tela na horizontal.');",
      },
      {
        description: 'o banner está no meio da tela na vertical',
        code: "assert.near(box('.banner').centerY, viewport.height / 2, 2, 'O centro do banner não está no meio da tela na vertical. A página tem altura? E a margem do body?');",
      },
      {
        description: 'o banner continua do tamanho dele',
        code: "assert.ok(box('.banner').width < 400, 'O banner esticou. Centralize a caixa, não estique ela até as bordas.');",
      },
    ],
    hints: [
      'Transforme o `body` num contêiner flex: `display: flex`.',
      'Para ter "meio" na vertical, o `body` precisa da altura da tela: `height: 100vh`. E zere a `margin` dele.',
      'No contêiner: `justify-content: center` (horizontal) e `align-items: center` (vertical).',
    ],
    followUpQuestionIds: ['core.m03.f01', 'core.m03.f02'],
    difficulty: 1,
  },
  {
    id: 'core.m03.d01',
    lessonId: 'core.m03.l01',
    kind: 'debug',
    title: 'O selo que não desce',
    promptMarkdown:
      'O sobrinho do cliente tentou centralizar o selo "ABERTO". Na horizontal até foi, mas na vertical o selo continua grudado no topo.\n\n' +
      'Encontre o defeito no CSS e deixe o selo no centro da tela.',
    language: 'web',
    starterFiles: {
      html: '<div class="palco">\n  <div class="selo">ABERTO</div>\n</div>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '}\n\n' +
        '.palco {\n' +
        '  display: flex;\n' +
        '  height: 100vh;\n' +
        '  justify-content: center;\n' +
        '}\n\n' +
        '.selo {\n' +
        '  align-items: center;\n' +
        '  width: 200px;\n' +
        '  height: 80px;\n' +
        '  background: #2e7d32;\n' +
        '  color: white;\n' +
        '}\n',
      js: '',
    },
    solutionFiles: {
      html: '<div class="palco">\n  <div class="selo">ABERTO</div>\n</div>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '}\n\n' +
        '.palco {\n' +
        '  display: flex;\n' +
        '  height: 100vh;\n' +
        '  justify-content: center;\n' +
        '  align-items: center;\n' +
        '}\n\n' +
        '.selo {\n' +
        '  width: 200px;\n' +
        '  height: 80px;\n' +
        '  background: #2e7d32;\n' +
        '  color: white;\n' +
        '}\n',
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'o selo está no meio da tela na horizontal',
        code: "assert.near(box('.selo').centerX, viewport.width / 2, 2, 'O selo saiu do meio na horizontal.');",
      },
      {
        description: 'o selo está no meio da tela na vertical',
        code: "assert.near(box('.selo').centerY, viewport.height / 2, 2, 'O selo continua fora do meio na vertical.');",
      },
    ],
    hints: [
      '`align-items` é uma propriedade de quem? Do contêiner ou do item?',
      'Mova o `align-items: center` da `.selo` para a `.palco`.',
    ],
    followUpQuestionIds: ['core.m03.f03', 'core.m03.f04'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m03.q01',
    lessonIds: ['core.m03.l01'],
    kind: 'multiple-choice',
    prompt:
      'Num contêiner com `display: flex` (direção padrão), qual propriedade alinha os itens no eixo **principal**, o horizontal?',
    options: ['`align-items`', '`justify-content`', '`text-align`', '`vertical-align`'],
    answerIndex: 1,
    explanation:
      '`justify-content` alinha no eixo principal (horizontal, por padrão); `align-items`, no eixo transversal.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q02',
    lessonIds: ['core.m03.l01'],
    kind: 'true-false',
    prompt:
      'Para centralizar uma caixa com flexbox, o `display: flex` vai na própria caixa que você quer centralizar.',
    answer: false,
    explanation: 'O `display: flex` vai no **contêiner** (o pai). Ele é quem organiza os filhos.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q03',
    lessonIds: ['core.m03.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para centralizar os itens também na vertical:',
    code: '.palco {\n  display: flex;\n  height: 100vh;\n  justify-content: center;\n  ___: center;\n}',
    acceptedAnswers: ['align-items'],
    explanation: '`align-items` cuida do eixo transversal, que por padrão é o vertical.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q04',
    lessonIds: ['core.m03.l01'],
    kind: 'multiple-choice',
    prompt:
      'Você pôs `display: flex` e `align-items: center` no `body`, mas a caixa continua colada no topo. Qual o motivo mais provável?',
    options: [
      'Falta `text-align: center`.',
      '`align-items` só funciona com grid.',
      'O `body` só tem a altura do conteúdo; falta dar altura a ele, como `height: 100vh`.',
      'A caixa precisa de `display: inline`.',
    ],
    answerIndex: 2,
    explanation:
      'Sem altura, o contêiner é do tamanho da caixa e não sobra espaço para centralizar na vertical.',
    difficulty: 2,
  },
  {
    id: 'core.m03.q05',
    lessonIds: ['core.m03.l01'],
    kind: 'multiple-choice',
    prompt: 'O que significa `height: 100vh`?',
    options: [
      '100 pixels de altura.',
      '100% da altura da janela do navegador (viewport).',
      '100% da altura do elemento pai.',
      '100% da largura da janela.',
    ],
    answerIndex: 1,
    explanation: '`vh` é 1% da altura da viewport. `100vh` é a janela inteira, na vertical.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q06',
    lessonIds: ['core.m03.l01'],
    kind: 'true-false',
    prompt: 'Com `flex-direction: column`, o `justify-content` passa a alinhar os itens na vertical.',
    answer: true,
    explanation:
      'Em coluna, o eixo principal vira o vertical, e `justify-content` sempre segue o eixo principal.',
    difficulty: 2,
  },
  {
    id: 'core.m03.q07',
    lessonIds: ['core.m03.l01'],
    kind: 'multiple-choice',
    prompt:
      'Qual valor de `justify-content` joga os itens para o fim do eixo principal (a direita, na direção padrão)?',
    options: ['`bottom`', '`stretch`', '`right-side`', '`flex-end`'],
    answerIndex: 3,
    explanation:
      '`flex-end` alinha no fim do eixo principal. Os outros não são valores de `justify-content`.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q08',
    lessonIds: ['core.m03.l01'],
    kind: 'true-false',
    prompt:
      'O valor padrão de `align-items` é `stretch`: itens sem altura definida esticam até a altura do contêiner.',
    answer: true,
    explanation:
      'Por isso um item sem `height` num contêiner flex alto fica "comprido" até você mudar o `align-items`.',
    difficulty: 2,
  },
  {
    id: 'core.m03.f01',
    lessonIds: ['core.m03.l01'],
    exerciseId: 'core.m03.e01',
    kind: 'multiple-choice',
    prompt: 'Na sua solução do banner, o que acontece se você apagar o `margin: 0` do `body`?',
    options: [
      'Nada muda.',
      'O banner vai para o canto superior esquerdo.',
      'O banner desce uns 8px e a página ganha rolagem.',
      'O banner some.',
    ],
    answerIndex: 2,
    explanation:
      'O navegador põe 8px de margem no `body`. Somada ao `100vh`, a página fica mais alta que a janela e o centro desce.',
    difficulty: 2,
  },
  {
    id: 'core.m03.f02',
    lessonIds: ['core.m03.l01'],
    exerciseId: 'core.m03.e01',
    kind: 'fill-blank',
    prompt: 'Na sua solução, qual propriedade centralizou o banner na **horizontal**?',
    code: 'body {\n  display: flex;\n  ___: center; /* horizontal */\n  align-items: center;\n}',
    acceptedAnswers: ['justify-content'],
    explanation:
      'Na direção padrão (linha), o eixo principal é o horizontal, e quem alinha nele é `justify-content`.',
    difficulty: 1,
  },
  {
    id: 'core.m03.f03',
    lessonIds: ['core.m03.l01'],
    exerciseId: 'core.m03.d01',
    kind: 'multiple-choice',
    prompt: 'Por que o `align-items: center` na `.selo` não fazia nada?',
    options: [
      'Porque estava escrito errado.',
      'Porque `align-items` é do contêiner flex: ele alinha os filhos, e a `.selo` não tinha filhos flex.',
      'Porque a `.selo` tinha largura fixa.',
      'Porque faltava `!important`.',
    ],
    answerIndex: 1,
    explanation:
      'A propriedade estava certa, mas no elemento errado. No pai (`.palco`), ela alinha a `.selo`.',
    difficulty: 1,
  },
  {
    id: 'core.m03.f04',
    lessonIds: ['core.m03.l01'],
    exerciseId: 'core.m03.d01',
    kind: 'true-false',
    prompt:
      'Em vez de mover o `align-items` para a `.palco`, daria para consertar com `align-self: center` na própria `.selo`.',
    answer: true,
    explanation:
      '`align-self` é a versão "só para mim" do `align-items`: vai no item e alinha só ele no eixo transversal.',
    difficulty: 2,
  },
];
