import type { Exercise, Lesson, Question } from '../../../src/shared/content';

/** Junta as regras de todas as folhas de estilo da página (usado nos testes). */
const ALL_RULES = '[...document.styleSheets].flatMap((s) => [...s.cssRules])';

/** A media query vale para telas "a partir de" (aceita `min-width` e a sintaxe nova `width >=`). */
const IS_MIN_WIDTH = '/min-width|width >/.test(m.media.mediaText)';

export const lesson: Lesson = {
  id: 'core.m03.l04',
  moduleId: 'core.m03',
  order: 4,
  title: 'Responsivo: o cliente abriu no celular',
  concepts: ['media queries', 'min-width e max-width', 'mobile first', 'meta viewport'],
  sections: [
    {
      kind: 'text',
      markdown:
        'Você entrega o site lindo no notebook. Dez minutos depois: *"abri no celular e tá tudo espremido"*. Bem-vindo ao **design responsivo**.\n\n' +
        'Uma **media query** aplica um bloco de CSS só quando a tela atende a uma condição:\n\n' +
        '- `@media (min-width: 768px) { ... }` vale para telas com **768px ou mais**;\n' +
        '- `@media (max-width: 768px) { ... }` vale para telas com **768px ou menos**.\n\n' +
        'As regras de dentro **somam** com as de fora: só o que você reescrever muda; o resto continua valendo.',
    },
    {
      kind: 'text',
      markdown:
        '### Mobile first\n\n' +
        'A maioria dos clientes do seu cliente vai abrir no celular. Então a estratégia **mobile first** é:\n\n' +
        '1. O CSS **fora** de media query é o layout do **celular** (geralmente tudo empilhado, uma coluna).\n' +
        '2. Media queries com **`min-width`** acrescentam o layout das telas maiores (colunas, itens lado a lado).\n\n' +
        'Assim o celular recebe o CSS mais simples, e cada tela maior só "liga" o que precisa.\n\n' +
        'Um detalhe obrigatório em páginas reais: a tag `<meta name="viewport" content="width=device-width, initial-scale=1">` no `<head>`. Sem ela, o celular finge ter uma tela de uns 980px, encolhe tudo e suas media queries não disparam como você espera.',
    },
    {
      kind: 'example',
      language: 'css',
      code:
        '/* Celular (padrão): um card embaixo do outro */\n' +
        '.servicos {\n' +
        '  display: flex;\n' +
        '  flex-direction: column;\n' +
        '  gap: 12px;\n' +
        '}\n\n' +
        '/* Tablet e computador: lado a lado */\n' +
        '@media (min-width: 768px) {\n' +
        '  .servicos {\n' +
        '    flex-direction: row;\n' +
        '  }\n' +
        '}',
      explanation:
        'Dentro da media query só muda a direção; `display` e `gap` vêm da regra de fora. Numa tela de 375px a media query não vale e os cards ficam empilhados.',
    },
  ],
  checkQuestionIds: ['core.m03.q25'],
  exerciseIds: ['core.m03.e04'],
  debugExerciseIds: ['core.m03.d04'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m03.e04',
    lessonId: 'core.m03.l04',
    kind: 'implement',
    title: 'Os planos da autoescola',
    promptMarkdown:
      'A página da Autoescola Baliza Perfeita já está pronta para o celular: os planos ficam um embaixo do outro. Agora o dono quer que, em telas de **768px ou mais**, os planos fiquem **lado a lado**.\n\n' +
      'Faça do jeito mobile first: **não mexa** na regra de fora; acrescente uma `@media (min-width: 768px)`. Esta tela de teste tem 1024px.',
    language: 'web',
    viewport: { width: 1024, height: 768 },
    starterFiles: {
      html:
        '<h1>Autoescola Baliza Perfeita</h1>\n' +
        '<section class="planos">\n' +
        '  <div class="plano">Básico: 10 aulas</div>\n' +
        '  <div class="plano">Completo: 20 aulas + baliza</div>\n' +
        '  <div class="plano">Desesperado: a prova é amanhã</div>\n' +
        '</section>\n',
      css:
        '/* Mobile first: o padrão é a tela do celular */\n' +
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.planos {\n' +
        '  display: flex;\n' +
        '  flex-direction: column;\n' +
        '  gap: 12px;\n' +
        '  padding: 12px;\n' +
        '}\n\n' +
        '.plano {\n' +
        '  padding: 16px;\n' +
        '  background: #e8f5e9;\n' +
        '  border: 1px solid #66bb6a;\n' +
        '}\n\n' +
        '/* Telas de 768px ou mais: planos lado a lado */\n',
      js: '',
    },
    solutionFiles: {
      html:
        '<h1>Autoescola Baliza Perfeita</h1>\n' +
        '<section class="planos">\n' +
        '  <div class="plano">Básico: 10 aulas</div>\n' +
        '  <div class="plano">Completo: 20 aulas + baliza</div>\n' +
        '  <div class="plano">Desesperado: a prova é amanhã</div>\n' +
        '</section>\n',
      css:
        '/* Mobile first: o padrão é a tela do celular */\n' +
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.planos {\n' +
        '  display: flex;\n' +
        '  flex-direction: column;\n' +
        '  gap: 12px;\n' +
        '  padding: 12px;\n' +
        '}\n\n' +
        '.plano {\n' +
        '  padding: 16px;\n' +
        '  background: #e8f5e9;\n' +
        '  border: 1px solid #66bb6a;\n' +
        '}\n\n' +
        '/* Telas de 768px ou mais: planos lado a lado */\n' +
        '@media (min-width: 768px) {\n' +
        '  .planos {\n' +
        '    flex-direction: row;\n' +
        '  }\n' +
        '}\n',
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'na tela de 1024px os planos ficam lado a lado',
        code:
          "const a = box('.plano:nth-child(1)');\n" +
          "const b = box('.plano:nth-child(2)');\n" +
          "const c = box('.plano:nth-child(3)');\n" +
          "assert.near(b.top, a.top, 2, 'Na tela grande, o 2º plano deveria estar ao lado do 1º.');\n" +
          "assert.near(c.top, a.top, 2, 'Na tela grande, o 3º plano deveria estar ao lado do 1º.');\n" +
          "assert.ok(b.left > a.right && c.left > b.right, 'Os planos deveriam estar em ordem, da esquerda para a direita.');",
      },
      {
        description: 'o lado a lado está numa media query com min-width',
        code:
          `const medias = ${ALL_RULES}.filter((r) => r instanceof CSSMediaRule);\n` +
          `assert.ok(medias.some((m) => ${IS_MIN_WIDTH}), 'Use uma @media (min-width: 768px) para o layout de tela grande.');`,
      },
      {
        description: 'sem as media queries (como no celular), os planos continuam empilhados',
        code:
          `const medias = ${ALL_RULES}.filter((r) => r instanceof CSSMediaRule);\n` +
          'const originais = medias.map((m) => m.media.mediaText);\n' +
          "for (const m of medias) m.media.mediaText = 'not all';\n" +
          "const a = box('.plano:nth-child(1)');\n" +
          "const b = box('.plano:nth-child(2)');\n" +
          'medias.forEach((m, i) => {\n' +
          '  m.media.mediaText = originais[i];\n' +
          '});\n' +
          "assert.ok(b.top >= a.bottom, 'Fora da media query, os planos devem continuar um embaixo do outro: o padrão é o celular.');",
      },
    ],
    hints: [
      'Escreva no fim do CSS: `@media (min-width: 768px) { ... }`.',
      'Dentro dela, reescreva só o que muda: `.planos { flex-direction: row; }`.',
    ],
    followUpQuestionIds: ['core.m03.f13', 'core.m03.f14'],
    difficulty: 2,
  },
  {
    id: 'core.m03.d04',
    lessonId: 'core.m03.l04',
    kind: 'debug',
    title: 'O menu que engoliu o celular',
    promptMarkdown:
      'O dono da autoescola abriu o site no celular (375px) e o menu lateral está ocupando metade da tela, com o texto espremido do lado. No computador, o menu de 200px ao lado do conteúdo é para continuar.\n\n' +
      'Esta tela de teste é de celular: **375 × 667**. Ache o defeito na media query.',
    language: 'web',
    viewport: { width: 375, height: 667 },
    starterFiles: {
      html:
        '<div class="pagina">\n' +
        '  <nav class="lateral">Aulas<br />Preços<br />Contato</nav>\n' +
        '  <main class="conteudo">Aprenda baliza na ladeira mais temida da Granja Viana!</main>\n' +
        '</div>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.pagina {\n' +
        '  display: grid;\n' +
        '  gap: 12px;\n' +
        '}\n\n' +
        '.lateral {\n' +
        '  padding: 12px;\n' +
        '  background: #1565c0;\n' +
        '  color: white;\n' +
        '}\n\n' +
        '.conteudo {\n' +
        '  padding: 12px;\n' +
        '}\n\n' +
        '/* Computador: menu de 200px ao lado do conteúdo */\n' +
        '@media (max-width: 768px) {\n' +
        '  .pagina {\n' +
        '    grid-template-columns: 200px 1fr;\n' +
        '  }\n' +
        '}\n',
      js: '',
    },
    solutionFiles: {
      html:
        '<div class="pagina">\n' +
        '  <nav class="lateral">Aulas<br />Preços<br />Contato</nav>\n' +
        '  <main class="conteudo">Aprenda baliza na ladeira mais temida da Granja Viana!</main>\n' +
        '</div>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.pagina {\n' +
        '  display: grid;\n' +
        '  gap: 12px;\n' +
        '}\n\n' +
        '.lateral {\n' +
        '  padding: 12px;\n' +
        '  background: #1565c0;\n' +
        '  color: white;\n' +
        '}\n\n' +
        '.conteudo {\n' +
        '  padding: 12px;\n' +
        '}\n\n' +
        '/* Computador: menu de 200px ao lado do conteúdo */\n' +
        '@media (min-width: 768px) {\n' +
        '  .pagina {\n' +
        '    grid-template-columns: 200px 1fr;\n' +
        '  }\n' +
        '}\n',
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'no celular, o conteúdo ocupa a largura toda',
        code: "assert.near(box('.conteudo').width, viewport.width, 2, 'No celular, o conteúdo deveria ocupar a tela inteira.');",
      },
      {
        description: 'no celular, o menu fica em cima do conteúdo',
        code: "assert.ok(box('.conteudo').top >= box('.lateral').bottom, 'No celular, o menu deveria ficar em cima do conteúdo, não ao lado.');",
      },
      {
        description: 'em telas grandes, o menu de 200px continua ao lado do conteúdo',
        code:
          `const medias = ${ALL_RULES}.filter((m) => m instanceof CSSMediaRule && ${IS_MIN_WIDTH});\n` +
          "assert.ok(medias.length > 0, 'O layout de computador deveria estar numa @media (min-width: ...).');\n" +
          'const originais = medias.map((m) => m.media.mediaText);\n' +
          "for (const m of medias) m.media.mediaText = 'all';\n" +
          "const lateral = box('.lateral');\n" +
          "const conteudo = box('.conteudo');\n" +
          'medias.forEach((m, i) => {\n' +
          '  m.media.mediaText = originais[i];\n' +
          '});\n' +
          "assert.near(lateral.width, 200, 2, 'Com a media query valendo, o menu deveria ter 200px.');\n" +
          "assert.near(conteudo.top, lateral.top, 2, 'Com a media query valendo, o conteúdo deveria ficar ao lado do menu.');",
      },
    ],
    hints: [
      '`max-width: 768px` vale para telas de **até** 768px. Um celular de 375px entra nessa?',
      'Para o layout de computador valer só em telas grandes, troque por `min-width`.',
    ],
    followUpQuestionIds: ['core.m03.f15', 'core.m03.f16'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m03.q25',
    lessonIds: ['core.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'No mobile first, para qual tela é o CSS que fica **fora** das media queries?',
    options: [
      'Para a tela grande; o celular fica nas media queries com `max-width`.',
      'Para o celular; media queries com `min-width` acrescentam o layout das telas maiores.',
      'Só para a impressora.',
      'Para nenhuma tela; ele é ignorado.',
    ],
    answerIndex: 1,
    explanation: 'Mobile first: o padrão é o celular e cada `min-width` liga o layout de telas maiores.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q26',
    lessonIds: ['core.m03.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para aplicar as regras só em telas com 768px **ou mais**:',
    code: '@media (___: 768px) {\n  .planos {\n    flex-direction: row;\n  }\n}',
    acceptedAnswers: ['min-width'],
    explanation: '`min-width: 768px` = "largura mínima de 768px", ou seja, 768px ou mais.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q27',
    lessonIds: ['core.m03.l04'],
    kind: 'true-false',
    prompt: '`@media (max-width: 600px)` aplica as regras em telas com 600px ou menos.',
    answer: true,
    explanation: '`max-width` é a largura máxima: vale de 0 até 600px, inclusive.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q28',
    lessonIds: ['core.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'Para que serve a tag `<meta name="viewport" content="width=device-width, initial-scale=1">`?',
    options: [
      'Para o site aparecer nos buscadores.',
      'Para a página carregar mais rápido.',
      'Para o celular usar a largura real da tela; sem ela, ele finge ter uns 980px e encolhe tudo.',
      'Para liberar o uso de flexbox.',
    ],
    answerIndex: 2,
    explanation:
      'Sem a meta viewport, as media queries "de celular" nem disparam, porque o aparelho finge ser largo.',
    difficulty: 2,
  },
  {
    id: 'core.m03.q29',
    lessonIds: ['core.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'Numa tela de 375px de largura, qual destas media queries é aplicada?',
    options: [
      '`@media (min-width: 768px)`',
      '`@media (min-width: 400px)`',
      '`@media (min-width: 1024px)`',
      '`@media (max-width: 480px)`',
    ],
    answerIndex: 3,
    explanation: '375px é no máximo 480px. As outras exigem pelo menos 400px, 768px ou 1024px.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q30',
    lessonIds: ['core.m03.l04'],
    kind: 'true-false',
    prompt:
      'Dentro de uma media query você pode reescrever só algumas propriedades; as regras de fora continuam valendo para o resto.',
    answer: true,
    explanation: 'A media query só acrescenta regras. Por isso basta escrever o que muda.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q31',
    lessonIds: ['core.m03.l04'],
    kind: 'multiple-choice',
    prompt:
      'O cliente abre o site no celular e o menu lateral ocupa metade da tela. Seguindo mobile first, qual a correção?',
    options: [
      'Pedir para o cliente comprar um celular maior.',
      'Deixar uma coluna como padrão e pôr as duas colunas dentro de `@media (min-width: ...)`.',
      'Diminuir a fonte do site para 6px.',
      'Usar `position: absolute` em tudo.',
    ],
    answerIndex: 1,
    explanation: 'O padrão atende o celular; o layout de duas colunas só liga em telas largas.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q32',
    lessonIds: ['core.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual destas unidades é relativa à **largura** da janela?',
    options: ['`vh`', '`px`', '`vw`', '`fr`'],
    answerIndex: 2,
    explanation: '`vw` é 1% da largura da viewport; `vh`, 1% da altura. `fr` é só do grid.',
    difficulty: 1,
  },
  {
    id: 'core.m03.f13',
    lessonIds: ['core.m03.l04'],
    exerciseId: 'core.m03.e04',
    kind: 'multiple-choice',
    prompt: 'Com a sua `@media (min-width: 768px)`, como ficam os planos num celular de 375px?',
    options: [
      'Lado a lado, espremidos.',
      'Escondidos.',
      'Numa grade de 2 por 2.',
      'Um embaixo do outro, pela regra de fora da media query.',
    ],
    answerIndex: 3,
    explanation: '375px não chega a 768px, então a media query não vale e fica o `flex-direction: column`.',
    difficulty: 1,
  },
  {
    id: 'core.m03.f14',
    lessonIds: ['core.m03.l04'],
    exerciseId: 'core.m03.e04',
    kind: 'true-false',
    prompt: 'Na sua solução, numa tela de exatamente 768px os planos ficam lado a lado.',
    answer: true,
    explanation: '`min-width: 768px` inclui o próprio 768px.',
    difficulty: 2,
  },
  {
    id: 'core.m03.f15',
    lessonIds: ['core.m03.l04'],
    exerciseId: 'core.m03.d04',
    kind: 'multiple-choice',
    prompt: 'Por que a `@media (max-width: 768px)` estragava o site no celular?',
    options: [
      'Ela vale para telas de até 768px, então o layout de duas colunas ia justamente para o celular.',
      '`max-width` não existe em media queries.',
      'Media query não funciona com grid.',
      'Porque faltava `!important` dentro dela.',
    ],
    answerIndex: 0,
    explanation: 'Era o contrário do desejado: o layout de computador ligava nas telas pequenas.',
    difficulty: 1,
  },
  {
    id: 'core.m03.f16',
    lessonIds: ['core.m03.l04'],
    exerciseId: 'core.m03.d04',
    kind: 'multiple-choice',
    prompt: 'Depois do seu conserto, em que telas o menu de 200px aparece ao lado do conteúdo?',
    options: ['Só em telas de 375px.', 'Em telas de até 768px.', 'Em telas de 768px ou mais.', 'Em nenhuma.'],
    answerIndex: 2,
    explanation: 'Com `min-width: 768px`, as duas colunas só ligam a partir de 768px.',
    difficulty: 1,
  },
];
