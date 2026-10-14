import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m03.l03',
  moduleId: 'core.m03',
  order: 3,
  title: 'Grid: o cardápio em colunas',
  concepts: ['display: grid', 'grid-template-columns', 'unidade fr', 'repeat()', 'gap no grid'],
  sections: [
    {
      kind: 'text',
      markdown:
        'O flexbox organiza numa direção só: uma linha **ou** uma coluna. Quando o layout é uma **tabela de verdade**, com linhas e colunas alinhadas (cardápio, galeria, painel), quem brilha é o **grid**.\n\n' +
        '- `display: grid` transforma o elemento num contêiner grid.\n' +
        '- `grid-template-columns` define as colunas, separadas **por espaço** (sem vírgula!): `200px 1fr`.\n' +
        '- `fr` é uma **fração do espaço livre**. `1fr 1fr 1fr` são três colunas iguais; `1fr 2fr`, a segunda com o dobro da primeira.\n' +
        '- `repeat(3, 1fr)` é o atalho para `1fr 1fr 1fr`.\n' +
        '- `gap` funciona aqui também, entre linhas **e** colunas.\n\n' +
        'Os itens vão preenchendo as células na ordem, da esquerda para a direita. Acabaram as colunas? O grid cria uma linha nova sozinho.',
    },
    {
      kind: 'example',
      language: 'css',
      code:
        '.galeria {\n' +
        '  display: grid;\n' +
        '  grid-template-columns: repeat(3, 1fr); /* 3 colunas iguais */\n' +
        '  gap: 20px;\n' +
        '}',
      explanation: 'Seis fotos viram duas linhas de três, todas do mesmo tamanho e com 20px entre elas.',
    },
    {
      kind: 'text',
      markdown:
        '### Misturando medidas fixas e `fr`\n\n' +
        'Primeiro o grid separa as medidas fixas e os `gap`s; o que sobra é dividido entre os `fr`. Num painel de 800px com `grid-template-columns: 200px 1fr` e `gap: 16px`, a coluna `1fr` fica com 800 − 200 − 16 = **584px**.\n\n' +
        'E lembre: se a declaração tiver erro de sintaxe (como uma vírgula entre os tamanhos), o navegador joga ela fora e o grid fica com **uma coluna só**.',
    },
    {
      kind: 'example',
      language: 'css',
      code:
        '.painel {\n' +
        '  display: grid;\n' +
        '  grid-template-columns: 200px 1fr; /* menu fixo + conteúdo elástico */\n' +
        '  gap: 16px;\n' +
        '}',
    },
  ],
  checkQuestionIds: ['core.m03.q17'],
  exerciseIds: ['core.m03.e03'],
  debugExerciseIds: ['core.m03.d03'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m03.e03',
    lessonId: 'core.m03.l03',
    kind: 'implement',
    title: 'O cardápio da pastelaria',
    promptMarkdown:
      'O cardápio da Pastelaria Pastel de Vento está uma coluna comprida que ninguém lê. Monte um **grid de 3 colunas iguais**, com **20px** de espaço entre os itens (nas linhas e nas colunas).\n\n' +
      'Edite só o CSS.',
    language: 'web',
    starterFiles: {
      html:
        '<section class="cardapio">\n' +
        '  <div class="item">Pastel de vento</div>\n' +
        '  <div class="item">Pastel de queijo</div>\n' +
        '  <div class="item">Pastel de carne</div>\n' +
        '  <div class="item">Pastel de pizza</div>\n' +
        '  <div class="item">Caldo de cana</div>\n' +
        '  <div class="item">Pastel de nada</div>\n' +
        '</section>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.cardapio {\n' +
        '  /* 3 colunas iguais, 20px de espaço */\n' +
        '}\n\n' +
        '.item {\n' +
        '  padding: 16px;\n' +
        '  background: #fff3e0;\n' +
        '  border: 1px solid #ffb74d;\n' +
        '}\n',
      js: '',
    },
    solutionFiles: {
      html:
        '<section class="cardapio">\n' +
        '  <div class="item">Pastel de vento</div>\n' +
        '  <div class="item">Pastel de queijo</div>\n' +
        '  <div class="item">Pastel de carne</div>\n' +
        '  <div class="item">Pastel de pizza</div>\n' +
        '  <div class="item">Caldo de cana</div>\n' +
        '  <div class="item">Pastel de nada</div>\n' +
        '</section>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.cardapio {\n' +
        '  display: grid;\n' +
        '  grid-template-columns: repeat(3, 1fr);\n' +
        '  gap: 20px;\n' +
        '}\n\n' +
        '.item {\n' +
        '  padding: 16px;\n' +
        '  background: #fff3e0;\n' +
        '  border: 1px solid #ffb74d;\n' +
        '}\n',
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'os três primeiros itens estão na mesma linha',
        code:
          "const topo = box('.item:nth-child(1)').top;\n" +
          "assert.near(box('.item:nth-child(2)').top, topo, 2, 'O 2º item deveria estar na mesma linha do 1º.');\n" +
          "assert.near(box('.item:nth-child(3)').top, topo, 2, 'O 3º item deveria estar na mesma linha do 1º.');",
      },
      {
        description: 'o 4º item começa uma linha nova, embaixo do 1º',
        code:
          "const primeiro = box('.item:nth-child(1)');\n" +
          "const quarto = box('.item:nth-child(4)');\n" +
          "assert.near(quarto.left, primeiro.left, 2, 'O 4º item deveria ficar embaixo do 1º.');\n" +
          "assert.near(quarto.top - primeiro.bottom, 20, 2, 'Deveria haver 20px entre as linhas.');",
      },
      {
        description: 'as 3 colunas têm a mesma largura, com 20px entre elas',
        code:
          'const largura = (viewport.width - 2 * 20) / 3;\n' +
          'for (const n of [1, 2, 3]) {\n' +
          "  assert.near(box('.item:nth-child(' + n + ')').width, largura, 2, 'As colunas deveriam ter larguras iguais.');\n" +
          '}\n' +
          "assert.near(box('.item:nth-child(2)').left - box('.item:nth-child(1)').right, 20, 2, 'Deveria haver 20px entre as colunas.');",
      },
    ],
    hints: [
      'Comece com `display: grid` no `.cardapio`.',
      'Três colunas iguais: `grid-template-columns: 1fr 1fr 1fr` (ou `repeat(3, 1fr)`). O espaço é o `gap`.',
    ],
    followUpQuestionIds: ['core.m03.f09', 'core.m03.f10'],
    difficulty: 1,
  },
  {
    id: 'core.m03.d03',
    lessonId: 'core.m03.l03',
    kind: 'debug',
    title: 'O painel de pedidos de uma coluna só',
    promptMarkdown:
      'O painel de pedidos da pastelaria deveria ter um **menu lateral de 200px** e o conteúdo **ao lado**, ocupando o resto (com 16px de espaço). Mas o menu está esticado na tela toda e o conteúdo foi parar embaixo.\n\n' +
      'O `grid-template-columns` está lá... Ache o defeito.',
    language: 'web',
    starterFiles: {
      html:
        '<div class="painel">\n' +
        '  <aside class="lateral">Pedidos<br />Estoque<br />Caixa</aside>\n' +
        '  <main class="conteudo">Pedidos de hoje: 3 pastéis de vento.</main>\n' +
        '</div>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.painel {\n' +
        '  display: grid;\n' +
        '  grid-template-columns: 200px, 1fr;\n' +
        '  gap: 16px;\n' +
        '}\n\n' +
        '.lateral {\n' +
        '  padding: 12px;\n' +
        '  background: #37474f;\n' +
        '  color: white;\n' +
        '}\n\n' +
        '.conteudo {\n' +
        '  padding: 12px;\n' +
        '  background: #eceff1;\n' +
        '}\n',
      js: '',
    },
    solutionFiles: {
      html:
        '<div class="painel">\n' +
        '  <aside class="lateral">Pedidos<br />Estoque<br />Caixa</aside>\n' +
        '  <main class="conteudo">Pedidos de hoje: 3 pastéis de vento.</main>\n' +
        '</div>\n',
      css:
        'body {\n' +
        '  margin: 0;\n' +
        '  font-family: sans-serif;\n' +
        '}\n\n' +
        '.painel {\n' +
        '  display: grid;\n' +
        '  grid-template-columns: 200px 1fr;\n' +
        '  gap: 16px;\n' +
        '}\n\n' +
        '.lateral {\n' +
        '  padding: 12px;\n' +
        '  background: #37474f;\n' +
        '  color: white;\n' +
        '}\n\n' +
        '.conteudo {\n' +
        '  padding: 12px;\n' +
        '  background: #eceff1;\n' +
        '}\n',
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'o menu lateral tem 200px de largura',
        code: "assert.near(box('.lateral').width, 200, 2, 'O menu lateral deveria ter 200px.');",
      },
      {
        description: 'o conteúdo fica ao lado do menu, com 16px de espaço',
        code:
          "const lateral = box('.lateral');\n" +
          "const conteudo = box('.conteudo');\n" +
          "assert.near(conteudo.top, lateral.top, 2, 'O conteúdo deveria estar na mesma linha do menu, não embaixo.');\n" +
          "assert.near(conteudo.left - lateral.right, 16, 2, 'Deveria haver 16px entre o menu e o conteúdo.');",
      },
      {
        description: 'o conteúdo ocupa o resto da largura',
        code: "assert.near(box('.conteudo').right, viewport.width, 2, 'O conteúdo deveria ir até a borda direita.');",
      },
    ],
    hints: [
      'Uma declaração com erro de sintaxe é ignorada inteira. Olhe a pontuação do `grid-template-columns`.',
      'Os tamanhos das colunas são separados só por espaço: `200px 1fr`.',
    ],
    followUpQuestionIds: ['core.m03.f11', 'core.m03.f12'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m03.q17',
    lessonIds: ['core.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'O que `grid-template-columns: 1fr 1fr 1fr` cria?',
    options: [
      '3 linhas de alturas iguais.',
      '3 colunas de 1px cada.',
      '3 colunas de larguras iguais, dividindo o espaço livre.',
      '1 coluna dividida em 3 partes invisíveis.',
    ],
    answerIndex: 2,
    explanation: '`fr` é uma fração do espaço livre; três `1fr` dividem ele em partes iguais.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q18',
    lessonIds: ['core.m03.l03'],
    kind: 'true-false',
    prompt:
      'Em `grid-template-columns`, os tamanhos das colunas são separados por vírgula, como em `200px, 1fr`.',
    answer: false,
    explanation: 'São separados só por espaço: `200px 1fr`. Com vírgula, a declaração é inválida e ignorada.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q19',
    lessonIds: ['core.m03.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para criar 4 colunas iguais sem escrever `1fr` quatro vezes:',
    code: '.galeria {\n  display: grid;\n  grid-template-columns: ___(4, 1fr);\n}',
    acceptedAnswers: ['repeat'],
    explanation: '`repeat(4, 1fr)` é o mesmo que `1fr 1fr 1fr 1fr`.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q20',
    lessonIds: ['core.m03.l03'],
    kind: 'multiple-choice',
    prompt:
      'Um grid de 1000px de largura tem `grid-template-columns: 200px 1fr` e nenhum `gap`. Qual a largura da segunda coluna?',
    options: ['1000px', '800px', '500px', '200px'],
    answerIndex: 1,
    explanation: 'Primeiro sai a medida fixa: 1000 − 200 = 800px para o `1fr`.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q21',
    lessonIds: ['core.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual a diferença principal entre flexbox e grid?',
    options: [
      'Grid só funciona no celular.',
      'Flexbox é mais novo e substituiu o grid.',
      'Não há diferença; são nomes diferentes para a mesma coisa.',
      'Flexbox organiza numa direção (linha ou coluna); grid organiza linhas e colunas ao mesmo tempo.',
    ],
    answerIndex: 3,
    explanation: 'Flexbox é unidimensional; grid é bidimensional. Os dois convivem bem no mesmo site.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q22',
    lessonIds: ['core.m03.l03'],
    kind: 'true-false',
    prompt: 'No grid, `gap` cria espaço tanto entre as linhas quanto entre as colunas.',
    answer: true,
    explanation: 'Um valor só vale para os dois. Dá para separar com `row-gap` e `column-gap`.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q23',
    lessonIds: ['core.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'Com `grid-template-columns: 1fr 2fr`, como fica a segunda coluna?',
    options: [
      'Com o dobro da largura da primeira.',
      'Com 2px de largura.',
      'Igual à primeira.',
      'Com metade da largura da primeira.',
    ],
    answerIndex: 0,
    explanation: 'O espaço livre é dividido em 3 partes: 1 para a primeira coluna, 2 para a segunda.',
    difficulty: 1,
  },
  {
    id: 'core.m03.q24',
    lessonIds: ['core.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'Num grid com 3 colunas e 7 itens, onde fica o 7º item?',
    options: [
      'Numa 4ª coluna criada na hora.',
      'Na primeira coluna da terceira linha.',
      'Em cima do 1º item.',
      'Ele some.',
    ],
    answerIndex: 1,
    explanation: 'Os itens preenchem linha por linha; 6 itens enchem 2 linhas e o 7º abre a terceira.',
    difficulty: 1,
  },
  {
    id: 'core.m03.f09',
    lessonIds: ['core.m03.l03'],
    exerciseId: 'core.m03.e03',
    kind: 'multiple-choice',
    prompt:
      'No seu cardápio (tela de 800px, 3 colunas, `gap: 20px`), qual a largura aproximada de cada coluna?',
    options: ['266px', '800px', '253px', '240px'],
    answerIndex: 2,
    explanation: 'Dois gaps de 20px saem primeiro: (800 − 40) ÷ 3 ≈ 253px.',
    difficulty: 2,
  },
  {
    id: 'core.m03.f10',
    lessonIds: ['core.m03.l03'],
    exerciseId: 'core.m03.e03',
    kind: 'fill-blank',
    prompt: 'Na sua solução, qual propriedade define as 3 colunas iguais?',
    code: '.cardapio {\n  display: grid;\n  ___: 1fr 1fr 1fr;\n  gap: 20px;\n}',
    acceptedAnswers: ['grid-template-columns'],
    explanation: '`grid-template-columns` lista a largura de cada coluna do grid.',
    difficulty: 1,
  },
  {
    id: 'core.m03.f11',
    lessonIds: ['core.m03.l03'],
    exerciseId: 'core.m03.d03',
    kind: 'multiple-choice',
    prompt: 'O que estava errado em `grid-template-columns: 200px, 1fr;`?',
    options: [
      'Faltou `px` no `1fr`.',
      'A vírgula: os tamanhos são separados só por espaço, então a declaração inválida foi ignorada.',
      'O grid não aceita medidas em `px`.',
      '200px é largo demais para um menu.',
    ],
    answerIndex: 1,
    explanation: 'Sem a declaração, o grid ficou com uma coluna só, e cada filho foi para uma linha.',
    difficulty: 1,
  },
  {
    id: 'core.m03.f12',
    lessonIds: ['core.m03.l03'],
    exerciseId: 'core.m03.d03',
    kind: 'multiple-choice',
    prompt:
      'No painel consertado (tela de 800px, menu de 200px, `gap: 16px`), qual a largura da coluna `1fr`?',
    options: ['600px', '800px', '400px', '584px'],
    answerIndex: 3,
    explanation: '800 − 200 − 16 = 584px. O `fr` só divide o que sobra depois das medidas fixas e dos gaps.',
    difficulty: 2,
  },
];
