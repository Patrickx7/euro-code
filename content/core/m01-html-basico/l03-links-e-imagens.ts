import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m01.l03',
  moduleId: 'core.m01',
  order: 3,
  title: 'Links e imagens',
  concepts: ['a', 'href', 'endereço absoluto e relativo', 'tel: e mailto:', 'img', 'src', 'alt'],
  sections: [
    {
      kind: 'text',
      markdown: `O "H" de HTML vem de **hipertexto**: texto que leva a outros textos. Quem faz isso é o
**link**, a tag \`<a>\` (de _anchor_, âncora). O endereço vai no atributo \`href\` e o que fica entre as tags
é o texto clicável:

\`\`\`html
<a href="https://petshopauau.example/agenda">Agende um banho</a>
\`\`\`

O \`href\` pode ser:

- **absoluto**, com o endereço completo: \`https://petshopauau.example/agenda\`;
- **relativo**, a partir da página atual: \`contato.html\` ou \`fotos/loja.jpg\`;
- uma **âncora** na mesma página, com \`#\` e o \`id\` de um elemento: \`#precos\`;
- \`tel:+5511900000000\` (abre o discador no celular) ou \`mailto:contato@auau.example\` (abre o e-mail).

Escreva textos de link que digam para onde vão. "Clique aqui" não ajuda ninguém.`,
    },
    {
      kind: 'text',
      markdown: `**Imagens** usam a tag vazia \`<img>\` (sem fechamento), com dois atributos que não podem faltar:

- \`src\` (_source_, origem): o endereço do arquivo da imagem;
- \`alt\` (_alternative_): o **texto alternativo**, que descreve a imagem.

O \`alt\` aparece quando a imagem não carrega (internet de 3G na Raposo Tavares, alô) e é lido em voz alta
por leitores de tela para quem não enxerga. Descreva o que importa na imagem: \`alt="Cachorro de toalha
depois do banho"\`, e não \`alt="imagem"\`.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<h2>Pet Shop Au Au Osasco</h2>
<img src="img/fachada.jpg" alt="Fachada azul do pet shop com um cachorro na porta">
<p>
  <a href="https://petshopauau.example/agenda">Agende um banho</a> ou
  <a href="#precos">veja os preços</a>.
</p>
<h3 id="precos">Preços</h3>
<p>Banho: R$ 40. Tosa: R$ 60.</p>`,
      explanation:
        'O primeiro link leva para outro site; o segundo pula para o elemento com `id="precos"` na mesma página. A imagem tem `src` (onde está o arquivo) e `alt` (o que ela mostra).',
    },
  ],
  checkQuestionIds: ['core.m01.q16'],
  exerciseIds: ['core.m01.e04', 'core.m01.e05'],
  debugExerciseIds: ['core.m01.d03'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m01.e04',
    lessonId: 'core.m01.l03',
    kind: 'implement',
    title: 'A vitrine do pet shop',
    promptMarkdown: `A Dona Cida, do **Pet Shop Au Au Osasco**, quer a foto do banho e um link para agendar:

1. Uma imagem \`<img>\` com \`src="img/banho.jpg"\` e um \`alt\` que descreva a foto (por exemplo, \`Cachorro tomando banho\`).
2. Um link \`<a>\` para \`https://petshopauau.example/agenda\` com o texto \`Agende um banho\`.`,
    language: 'web',
    starterFiles: {
      html: '<h1>Pet Shop Au Au Osasco</h1>\n<!-- A foto e o link vão aqui -->\n',
      css: 'img { width: 200px; height: 150px; background: #dde; }',
      js: '',
    },
    solutionFiles: {
      html: `<h1>Pet Shop Au Au Osasco</h1>
<img src="img/banho.jpg" alt="Cachorro tomando banho">
<a href="https://petshopauau.example/agenda">Agende um banho</a>
`,
      css: 'img { width: 200px; height: 150px; background: #dde; }',
      js: '',
    },
    editableFiles: ['html'],
    tests: [
      {
        description: 'a imagem aponta para "img/banho.jpg"',
        code: `const img = document.querySelector('img');
assert.ok(img, 'Falta a imagem <img>.');
assert.strictEqual(img.getAttribute('src'), 'img/banho.jpg', 'O src da imagem deveria ser "img/banho.jpg".');`,
      },
      {
        description: 'a imagem tem um texto alternativo de verdade',
        code: `const img = document.querySelector('img');
assert.ok(img, 'Falta a imagem <img>.');
const alt = (img.getAttribute('alt') || '').trim();
assert.ok(alt.length >= 5, 'Descreva a foto no atributo alt (pelo menos 5 letras).');`,
      },
      {
        description: 'o link leva para a agenda, com o texto pedido',
        code: `const a = document.querySelector('a');
assert.ok(a, 'Falta o link <a>.');
assert.strictEqual(a.getAttribute('href'), 'https://petshopauau.example/agenda', 'O href do link não está certo.');
assert.strictEqual(a.textContent.trim(), 'Agende um banho', 'O texto do link deveria ser "Agende um banho".');`,
      },
    ],
    hints: [
      '`<img>` é uma tag vazia: `<img src="..." alt="...">`, sem `</img>`.',
      'O endereço do link vai no `href`, e o texto clicável fica entre `<a ...>` e `</a>`.',
    ],
    followUpQuestionIds: ['core.m01.f11', 'core.m01.f12'],
    difficulty: 1,
  },
  {
    id: 'core.m01.e05',
    lessonId: 'core.m01.l03',
    kind: 'implement',
    title: 'Contatos que funcionam no celular',
    promptMarkdown: `A Dona Cida quer que o cliente consiga ligar ou mandar e-mail com um toque no celular. Dentro do
parágrafo de contato, crie dois links:

1. \`Ligar para a loja\`, com \`href="tel:+5511900000000"\`.
2. \`Mandar e-mail\`, com \`href="mailto:contato@auau.example"\`.`,
    language: 'web',
    starterFiles: {
      html: '<p class="contato">\n  <!-- Os links de contato vão aqui -->\n</p>\n',
      css: '',
      js: '',
    },
    solutionFiles: {
      html: `<p class="contato">
  <a href="tel:+5511900000000">Ligar para a loja</a>
  <a href="mailto:contato@auau.example">Mandar e-mail</a>
</p>
`,
      css: '',
      js: '',
    },
    editableFiles: ['html'],
    tests: [
      {
        description: 'há dois links dentro do parágrafo de contato',
        code: `assert.strictEqual(document.querySelectorAll('.contato a').length, 2, 'O parágrafo .contato deveria ter 2 links.');`,
      },
      {
        description: 'o link de telefone usa "tel:"',
        code: `const tel = document.querySelector('.contato a[href^="tel:"]');
assert.ok(tel, 'Nenhum link começa com "tel:".');
assert.strictEqual(tel.getAttribute('href'), 'tel:+5511900000000');
assert.strictEqual(tel.textContent.trim(), 'Ligar para a loja');`,
      },
      {
        description: 'o link de e-mail usa "mailto:"',
        code: `const email = document.querySelector('.contato a[href^="mailto:"]');
assert.ok(email, 'Nenhum link começa com "mailto:".');
assert.strictEqual(email.getAttribute('href'), 'mailto:contato@auau.example');
assert.strictEqual(email.textContent.trim(), 'Mandar e-mail');`,
      },
    ],
    hints: [
      'É um `<a>` normal; só o começo do `href` muda: `tel:` ou `mailto:`.',
      'Não coloque espaço entre `tel:` e o número.',
    ],
    followUpQuestionIds: ['core.m01.f13', 'core.m01.f14'],
    difficulty: 1,
  },
  {
    id: 'core.m01.d03',
    lessonId: 'core.m01.l03',
    kind: 'debug',
    title: 'O catálogo que não abre',
    promptMarkdown: `O Seu Valdir, da **Auto Peças Parafuso Solto**, diz que "o link do catálogo não clica e a logo
sumiu". Tem atributo escrito errado e atributo faltando. Conserte o link e a imagem.`,
    language: 'web',
    starterFiles: {
      html: `<img scr="img/logo.png">
<p><a herf="https://parafusosolto.example/catalogo">Ver catálogo</a></p>
`,
      css: 'img { width: 120px; height: 60px; background: #eee; }',
      js: '',
    },
    solutionFiles: {
      html: `<img src="img/logo.png" alt="Logo da Auto Peças Parafuso Solto">
<p><a href="https://parafusosolto.example/catalogo">Ver catálogo</a></p>
`,
      css: 'img { width: 120px; height: 60px; background: #eee; }',
      js: '',
    },
    editableFiles: ['html'],
    tests: [
      {
        description: 'o link do catálogo tem endereço',
        code: `const a = document.querySelector('a');
assert.ok(a, 'Sumiu o link do catálogo.');
assert.strictEqual(a.getAttribute('href'), 'https://parafusosolto.example/catalogo', 'O link não tem o href do catálogo. Confira o nome do atributo.');`,
      },
      {
        description: 'a imagem aponta para a logo',
        code: `const img = document.querySelector('img');
assert.ok(img, 'Sumiu a imagem.');
assert.strictEqual(img.getAttribute('src'), 'img/logo.png', 'A imagem não tem src "img/logo.png". Confira o nome do atributo.');`,
      },
      {
        description: 'a imagem tem texto alternativo',
        code: `const img = document.querySelector('img');
assert.ok(img, 'Sumiu a imagem.');
assert.ok((img.getAttribute('alt') || '').trim().length >= 3, 'Falta o atributo alt descrevendo a logo.');`,
      },
    ],
    hints: [
      'Leia devagar: é `href` (h-r-e-f) e `src` (s-r-c).',
      'Toda imagem precisa de um `alt` que descreva o que ela mostra.',
    ],
    followUpQuestionIds: ['core.m01.f15', 'core.m01.f16'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m01.q16',
    lessonIds: ['core.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Em qual atributo vai o endereço de destino de um link `<a>`?',
    options: ['href', 'src', 'alt', 'link'],
    answerIndex: 0,
    explanation: '`href` guarda o destino do link. `src` é o endereço de uma imagem.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q17',
    lessonIds: ['core.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Para que serve o atributo `alt` de uma imagem?',
    options: [
      'Descrever a imagem para quem não consegue vê-la ou quando ela não carrega',
      'Definir a altura da imagem',
      'Dizer onde está o arquivo da imagem',
    ],
    answerIndex: 0,
    explanation:
      'O `alt` é lido por leitores de tela e aparece no lugar da imagem quebrada. O arquivo vai no `src`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q18',
    lessonIds: ['core.m01.l03'],
    kind: 'true-false',
    prompt: 'A tag `<img>` precisa de uma tag de fechamento `</img>`.',
    answer: false,
    explanation: '`<img>` é uma tag vazia: tudo o que ela precisa vai nos atributos.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q19',
    lessonIds: ['core.m01.l03'],
    kind: 'fill-blank',
    prompt: 'Complete o atributo que diz onde está o arquivo da imagem.',
    code: '<img ___="fotos/bolo.jpg" alt="Bolo de cenoura com cobertura">',
    acceptedAnswers: ['src'],
    explanation: '`src` (de _source_, origem) aponta para o arquivo da imagem.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q20',
    lessonIds: ['core.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'O link `<a href="#horarios">Horários</a>` leva para onde?',
    options: [
      'Para o elemento com `id="horarios"` na mesma página',
      'Para o site horarios.com',
      'Para um arquivo chamado horarios.html',
    ],
    answerIndex: 0,
    explanation: 'O `#` no começo do `href` indica uma âncora: um `id` dentro da própria página.',
    difficulty: 2,
  },
  {
    id: 'core.m01.q21',
    lessonIds: ['core.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual destes `href` é um endereço relativo?',
    options: [
      'contato.html',
      'https://padaria.example/contato',
      'mailto:ze@padaria.example',
      'tel:+5511900000000',
    ],
    answerIndex: 0,
    explanation: 'Endereço relativo é contado a partir da página atual, sem `https://` na frente.',
    difficulty: 2,
  },
  {
    id: 'core.m01.q22',
    lessonIds: ['core.m01.l03'],
    kind: 'true-false',
    prompt: '"Clique aqui" é um ótimo texto de link, porque todo mundo entende.',
    answer: false,
    explanation: 'O texto do link deve dizer para onde ele leva, como "Ver catálogo" ou "Agende um banho".',
    difficulty: 1,
  },
  {
    id: 'core.m01.f11',
    lessonIds: ['core.m01.l03'],
    exerciseId: 'core.m01.e04',
    kind: 'multiple-choice',
    prompt: 'Na vitrine que você fez, o que aparece no lugar da foto se `img/banho.jpg` não carregar?',
    options: ['O texto do atributo `alt`', 'O texto do link', 'O endereço do `src`', 'Nada, nem um espaço'],
    answerIndex: 0,
    explanation: 'O navegador mostra o texto alternativo quando a imagem não carrega.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f12',
    lessonIds: ['core.m01.l03'],
    exerciseId: 'core.m01.e04',
    kind: 'fill-blank',
    prompt: 'Complete o link que você criou para a agenda.',
    code: '<a ___="https://petshopauau.example/agenda">Agende um banho</a>',
    acceptedAnswers: ['href'],
    explanation: 'O destino do link vai no `href`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f13',
    lessonIds: ['core.m01.l03'],
    exerciseId: 'core.m01.e05',
    kind: 'multiple-choice',
    prompt: 'O que acontece quando o cliente toca no seu link `tel:+5511900000000` no celular?',
    options: [
      'O celular abre o discador com o número da loja',
      'O celular abre o aplicativo de e-mail',
      'A página pula para o topo',
    ],
    answerIndex: 0,
    explanation: '`tel:` abre o discador; `mailto:` abre o e-mail.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f14',
    lessonIds: ['core.m01.l03'],
    exerciseId: 'core.m01.e05',
    kind: 'fill-blank',
    prompt: 'Complete o começo do `href` do seu link de e-mail.',
    code: '<a href="___contato@auau.example">Mandar e-mail</a>',
    acceptedAnswers: ['mailto:'],
    explanation: '`mailto:` seguido do endereço abre o programa de e-mail.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f15',
    lessonIds: ['core.m01.l03'],
    exerciseId: 'core.m01.d03',
    kind: 'true-false',
    prompt: 'O navegador avisa com um erro na tela quando um atributo está escrito errado, como `herf`.',
    answer: false,
    explanation: 'O navegador ignora em silêncio o atributo que não conhece. Por isso o link "não clicava".',
    difficulty: 1,
  },
  {
    id: 'core.m01.f16',
    lessonIds: ['core.m01.l03'],
    exerciseId: 'core.m01.d03',
    kind: 'multiple-choice',
    prompt: 'Além de corrigir `scr` para `src`, o que você precisou acrescentar na logo?',
    options: ['O atributo `alt`', 'A tag `</img>`', 'O atributo `href`'],
    answerIndex: 0,
    explanation: 'Toda imagem precisa de `alt`. `<img>` não tem fechamento nem `href`.',
    difficulty: 1,
  },
];
