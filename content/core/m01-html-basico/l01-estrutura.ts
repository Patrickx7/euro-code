import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m01.l01',
  moduleId: 'core.m01',
  order: 1,
  title: 'O que é uma página: tags e atributos',
  concepts: ['HTML', 'tag de abertura e de fechamento', 'elemento', 'atributo', 'estrutura do documento'],
  sections: [
    {
      kind: 'text',
      markdown: `Toda página da internet é, no fundo, um **arquivo de texto**. O navegador lê esse texto e desenha a
página na tela. A linguagem desse texto é o **HTML** (_HyperText Markup Language_), uma linguagem de
**marcação**: você não dá ordens ao computador, você **marca** o que cada pedaço do texto é.

A marcação é feita com **tags**, palavras entre os sinais \`<\` e \`>\`:

- \`<h1>\` é a **tag de abertura** de um título;
- \`</h1>\` é a **tag de fechamento** (repare na barra \`/\`);
- tudo junto, \`<h1>Padaria Pão de Ontem</h1>\`, forma um **elemento**: a abertura, o conteúdo e o fechamento.

Esqueceu a barra do fechamento? O navegador acha que você abriu **outro** título. É o erro número 1 de
todo estagiário (e de muito sênior com sono também).`,
    },
    {
      kind: 'text',
      markdown: `**Atributos** são informações extras que vão **dentro da tag de abertura**, no formato
\`nome="valor"\`:

\`\`\`html
<p class="slogan">Pão fresquinho desde ontem.</p>
\`\`\`

Aqui \`class\` é o nome do atributo e \`"slogan"\` é o valor. Use sempre aspas no valor e um espaço entre a
tag e cada atributo. Alguns atributos que você vai ver muito: \`class\` e \`id\` (dão nome ao elemento, para
o CSS e o JavaScript acharem depois), \`href\` (endereço de um link) e \`src\` (endereço de uma imagem).

Elementos podem ficar **dentro** de outros (isso se chama **aninhar**). A regra é fechar na ordem inversa
em que abriu, como caixas uma dentro da outra: \`<p>Oi, <strong>cliente</strong>!</p>\`.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Padaria Pão de Ontem</title>
  </head>
  <body>
    <h1>Padaria Pão de Ontem</h1>
    <p class="slogan">Pão fresquinho desde ontem.</p>
  </body>
</html>`,
      explanation:
        '`<!DOCTYPE html>` avisa que é HTML moderno. `<html>` embrulha tudo. O `<head>` guarda informações sobre a página (como o `<title>`, que aparece na aba do navegador) e o `<body>` guarda o que aparece na tela. Nos exercícios do jogo o esqueleto já está pronto: você escreve só o que vai dentro do `<body>`.',
    },
    {
      kind: 'text',
      markdown: `Algumas tags **não têm fechamento**, porque não têm conteúdo: são as tags **vazias**, como
\`<br>\` (quebra de linha) e \`<img>\` (imagem). E um detalhe que salva vidas: o que fica entre \`<!--\` e
\`-->\` é um **comentário**. O navegador ignora; serve para deixar recados no código (tipo "não mexa,
o cliente gostou assim").`,
    },
  ],
  checkQuestionIds: ['core.m01.q01'],
  exerciseIds: ['core.m01.e01'],
  debugExerciseIds: ['core.m01.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m01.e01',
    lessonId: 'core.m01.l01',
    kind: 'implement',
    title: 'A placa da padaria',
    promptMarkdown: `O Seu Zé, da **Padaria Pão de Ontem**, quer o site "igualzinho à placa da frente".

1. Crie um título \`<h1>\` com o texto \`Padaria Pão de Ontem\`.
2. Logo abaixo, crie um parágrafo \`<p>\` com o atributo \`class="slogan"\` e o texto \`Pão fresquinho desde ontem.\``,
    language: 'web',
    starterFiles: {
      html: '<!-- Escreva aqui a placa da padaria -->\n',
      css: '.slogan { font-style: italic; color: #8a5a2b; }',
      js: '',
    },
    solutionFiles: {
      html: '<h1>Padaria Pão de Ontem</h1>\n<p class="slogan">Pão fresquinho desde ontem.</p>\n',
      css: '.slogan { font-style: italic; color: #8a5a2b; }',
      js: '',
    },
    editableFiles: ['html'],
    tests: [
      {
        description: 'a página tem um título <h1> com o nome da padaria',
        code: `const h1 = document.querySelector('h1');
assert.ok(h1, 'Falta o título <h1>.');
assert.strictEqual(h1.textContent.trim(), 'Padaria Pão de Ontem', 'O texto do <h1> deveria ser "Padaria Pão de Ontem".');`,
      },
      {
        description: 'há um parágrafo com a classe "slogan"',
        code: `const p = document.querySelector('p.slogan');
assert.ok(p, 'Falta o parágrafo <p class="slogan">.');
assert.strictEqual(p.textContent.trim(), 'Pão fresquinho desde ontem.', 'O texto do slogan não está igual ao pedido.');`,
      },
      {
        description: 'o slogan vem depois do título, e não dentro dele',
        code: `const p = document.querySelector('p.slogan');
assert.ok(p, 'Falta o parágrafo <p class="slogan">.');
assert.ok(!p.closest('h1'), 'O parágrafo ficou dentro do <h1>. Feche o título com </h1> antes.');
assert.strictEqual(document.querySelectorAll('h1').length, 1, 'A página deveria ter só um <h1>.');`,
      },
    ],
    hints: [
      'Um elemento tem abertura, conteúdo e fechamento: `<h1>texto</h1>`.',
      'O atributo vai dentro da tag de abertura: `<p class="slogan">...</p>`.',
    ],
    followUpQuestionIds: ['core.m01.f01', 'core.m01.f02'],
    difficulty: 1,
  },
  {
    id: 'core.m01.d01',
    lessonId: 'core.m01.l01',
    kind: 'debug',
    title: 'A placa duplicada',
    promptMarkdown: `O sobrinho do Seu Zé "adiantou" o site, mas apareceu um **segundo título gigante** e o slogan
perdeu a cor. O código tem **dois defeitos**. Conserte para ficar com um único \`<h1>\` e o parágrafo com a
classe \`slogan\`.`,
    language: 'web',
    starterFiles: {
      html: '<h1>Padaria Pão de Ontem<h1>\n<p clas="slogan">Pão fresquinho desde ontem.</p>\n',
      css: '.slogan { font-style: italic; color: #8a5a2b; }',
      js: '',
    },
    solutionFiles: {
      html: '<h1>Padaria Pão de Ontem</h1>\n<p class="slogan">Pão fresquinho desde ontem.</p>\n',
      css: '.slogan { font-style: italic; color: #8a5a2b; }',
      js: '',
    },
    editableFiles: ['html'],
    tests: [
      {
        description: 'existe só um <h1>, com o nome da padaria',
        code: `const titulos = document.querySelectorAll('h1');
assert.strictEqual(titulos.length, 1, 'A página tem ' + titulos.length + ' títulos <h1>; deveria ter 1. Confira a tag de fechamento.');
assert.strictEqual(titulos[0].textContent.trim(), 'Padaria Pão de Ontem');`,
      },
      {
        description: 'o parágrafo tem a classe "slogan"',
        code: `const p = document.querySelector('p.slogan');
assert.ok(p, 'Nenhum <p> tem a classe "slogan". Confira o nome do atributo.');
assert.strictEqual(p.textContent.trim(), 'Pão fresquinho desde ontem.');`,
      },
    ],
    hints: [
      'A tag de fechamento tem uma barra: `</h1>`.',
      'O atributo que dá nome ao elemento para o CSS se chama `class`, com dois "s".',
    ],
    followUpQuestionIds: ['core.m01.f03', 'core.m01.f04'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m01.q01',
    lessonIds: ['core.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Qual destas linhas é um elemento HTML completo e correto?',
    options: ['<p>Bom dia!</p>', '<p>Bom dia!<p>', '</p>Bom dia!<p>', 'p>Bom dia!</p'],
    answerIndex: 0,
    explanation:
      'Um elemento tem a tag de abertura `<p>`, o conteúdo e a tag de fechamento com barra `</p>`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q02',
    lessonIds: ['core.m01.l01'],
    kind: 'true-false',
    prompt:
      'O HTML é uma linguagem de marcação: ele diz o que cada parte do conteúdo é (título, parágrafo, link...).',
    answer: true,
    explanation:
      'HTML marca o conteúdo com tags. A aparência fica com o CSS e o comportamento com o JavaScript.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q03',
    lessonIds: ['core.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Em `<a href="contato.html">Fale com a gente</a>`, o que é `href`?',
    options: ['Um atributo', 'Uma tag de fechamento', 'O conteúdo do elemento', 'Um comentário'],
    answerIndex: 0,
    explanation: 'Atributos ficam dentro da tag de abertura no formato `nome="valor"`. Aqui o nome é `href`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q04',
    lessonIds: ['core.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Em qual parte do documento fica o conteúdo que aparece na tela, como títulos e parágrafos?',
    options: ['<body>', '<head>', '<title>', '<!DOCTYPE html>'],
    answerIndex: 0,
    explanation:
      'O `<body>` guarda o que é exibido. O `<head>` guarda informações sobre a página, como o `<title>`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q05',
    lessonIds: ['core.m01.l01'],
    kind: 'fill-blank',
    prompt: 'Complete a tag que fecha o título.',
    code: '<h2>Promoção do dia___',
    acceptedAnswers: ['</h2>'],
    explanation: 'A tag de fechamento repete o nome da tag com uma barra antes: `</h2>`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q06',
    lessonIds: ['core.m01.l01'],
    kind: 'true-false',
    prompt: 'O texto escrito entre `<!--` e `-->` aparece na tela para o cliente ler.',
    answer: false,
    explanation: 'Isso é um comentário: o navegador ignora. Serve para recados entre quem mexe no código.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q07',
    lessonIds: ['core.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Qual destes trechos está aninhado do jeito certo?',
    options: [
      '<p>Entrega <strong>grátis</strong></p>',
      '<p>Entrega <strong>grátis</p></strong>',
      '<strong><p>Entrega grátis</strong></p>',
    ],
    answerIndex: 0,
    explanation: 'Feche na ordem inversa em que abriu: quem abriu por último (`<strong>`) fecha primeiro.',
    difficulty: 2,
  },
  {
    id: 'core.m01.q08',
    lessonIds: ['core.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Qual destas tags é vazia, ou seja, não tem tag de fechamento?',
    options: ['<br>', '<p>', '<h1>', '<title>'],
    answerIndex: 0,
    explanation: '`<br>` só quebra a linha, não tem conteúdo. Por isso não existe `</br>`.',
    difficulty: 2,
  },
  {
    id: 'core.m01.f01',
    lessonIds: ['core.m01.l01'],
    exerciseId: 'core.m01.e01',
    kind: 'multiple-choice',
    prompt: 'No parágrafo que você escreveu, `<p class="slogan">`, qual é o valor do atributo?',
    options: ['slogan', 'class', 'p', 'Pão fresquinho desde ontem.'],
    answerIndex: 0,
    explanation:
      '`class` é o nome do atributo e `"slogan"` é o valor dele. O texto entre as tags é o conteúdo.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f02',
    lessonIds: ['core.m01.l01'],
    exerciseId: 'core.m01.e01',
    kind: 'true-false',
    prompt: 'No seu `<h1>`, a tag de fechamento é `</h1>`, com uma barra antes do nome.',
    answer: true,
    explanation: 'A barra é o que diferencia o fechamento da abertura.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f03',
    lessonIds: ['core.m01.l01'],
    exerciseId: 'core.m01.d01',
    kind: 'multiple-choice',
    prompt: 'Por que aparecia um segundo título gigante na página do Seu Zé?',
    options: [
      'Porque `<h1>` sem barra no fim abre um novo título em vez de fechar o primeiro',
      'Porque a página só aceita um parágrafo',
      'Porque o CSS deixava o slogan gigante',
    ],
    answerIndex: 0,
    explanation:
      'Sem a barra, `<h1>` é uma nova abertura. O navegador fecha o primeiro título e começa outro.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f04',
    lessonIds: ['core.m01.l01'],
    exerciseId: 'core.m01.d01',
    kind: 'fill-blank',
    prompt: 'Complete o nome do atributo que você corrigiu no slogan.',
    code: '<p ___="slogan">Pão fresquinho desde ontem.</p>',
    acceptedAnswers: ['class'],
    explanation:
      'Com `clas` o navegador não reconhece o atributo, e o CSS de `.slogan` não acha o parágrafo.',
    difficulty: 1,
  },
];
