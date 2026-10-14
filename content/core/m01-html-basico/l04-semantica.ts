import type { Exercise, Lesson, Question } from '../../../src/shared/content';

const SITE_COM_DIVS = `<div class="topo">
  <h1>Auto Peças Parafuso Solto</h1>
  <div class="menu">
    <a href="#pecas">Peças</a>
    <a href="#contato">Contato</a>
  </div>
</div>
<div class="conteudo">
  <div class="secao" id="pecas">
    <h2>Peças</h2>
    <p>Parafuso de todo tamanho, inclusive os que sobram depois da montagem.</p>
  </div>
  <div class="secao" id="contato">
    <h2>Contato</h2>
    <p>Rua das Arruelas, 12, Granja Viana, Cotia.</p>
  </div>
</div>
<div class="rodape">
  <p>© 2026 Auto Peças Parafuso Solto</p>
</div>
`;

const SITE_SEMANTICO = `<header>
  <h1>Auto Peças Parafuso Solto</h1>
  <nav>
    <a href="#pecas">Peças</a>
    <a href="#contato">Contato</a>
  </nav>
</header>
<main>
  <section id="pecas">
    <h2>Peças</h2>
    <p>Parafuso de todo tamanho, inclusive os que sobram depois da montagem.</p>
  </section>
  <section id="contato">
    <h2>Contato</h2>
    <p>Rua das Arruelas, 12, Granja Viana, Cotia.</p>
  </section>
</main>
<footer>
  <p>© 2026 Auto Peças Parafuso Solto</p>
</footer>
`;

const BOTAO_CSS = `.botao { padding: 8px 16px; background: #c0392b; color: #fff; border: none; border-radius: 4px; cursor: pointer; }`;

const BOTAO_JS = `document.querySelector('#orcamento').addEventListener('click', () => {
  document.querySelector('#status').textContent = 'Pedido enviado! O Seu Valdir responde já já.';
});
`;

export const lesson: Lesson = {
  id: 'core.m01.l04',
  moduleId: 'core.m01',
  order: 4,
  title: 'HTML semântico',
  concepts: ['div e span', 'header', 'nav', 'main', 'section', 'footer', 'button', 'acessibilidade'],
  sections: [
    {
      kind: 'text',
      markdown: `\`<div>\` é uma caixa **genérica**: serve para agrupar coisas, mas não diz nada sobre o que tem
dentro. (A irmã dela para pedaços de texto é a \`<span>\`.) Um site feito só de \`<div>\` funciona, mas
é como uma oficina com todas as gavetas sem etiqueta: só quem montou acha as coisas.

**HTML semântico** é usar a tag que diz **o que** cada parte da página é:

| Tag | Para quê |
| --- | --- |
| \`<header>\` | o topo: logo, nome, menu |
| \`<nav>\` | o menu de navegação (os links principais) |
| \`<main>\` | o conteúdo principal; **um só** por página |
| \`<section>\` | uma seção com assunto próprio, normalmente com um título |
| \`<footer>\` | o rodapé: contato, direitos, endereço |

Na tela, elas parecem iguais a uma \`<div>\`. A diferença é para quem **lê** o código: leitores de tela
pulam direto para o \`<main>\` ou para o \`<nav>\`, buscadores entendem melhor a página e o próximo dev
(talvez você daqui a seis meses) agradece.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<header>
  <h1>Pet Shop Au Au Osasco</h1>
  <nav>
    <a href="#servicos">Serviços</a>
    <a href="#contato">Contato</a>
  </nav>
</header>
<main>
  <section id="servicos">
    <h2>Serviços</h2>
    <p>Banho, tosa e cafuné.</p>
  </section>
</main>
<footer>
  <p>Vila Yara, Osasco</p>
</footer>`,
      explanation:
        'Topo no `<header>`, menu no `<nav>`, conteúdo no `<main>` dividido em `<section>` e rodapé no `<footer>`.',
    },
    {
      kind: 'text',
      markdown: `O caso mais importante: **botão é \`<button>\`**, não \`<div>\`.

Uma \`<div>\` com cara de botão até responde ao clique do mouse, mas:

- não recebe **foco** pelo teclado (a tecla Tab passa direto por ela);
- não funciona com **Enter** nem **Espaço**;
- o leitor de tela não anuncia que aquilo é um botão.

O \`<button>\` já vem com tudo isso de graça:

\`\`\`html
<button type="button">Pedir orçamento</button>
\`\`\`

E a regra de bolso: se **leva para outro lugar**, é link (\`<a href>\`); se **faz uma ação** na página
(enviar, abrir, calcular), é \`<button>\`.`,
    },
  ],
  checkQuestionIds: ['core.m01.q23'],
  exerciseIds: ['core.m01.e06'],
  debugExerciseIds: ['core.m01.d04'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m01.e06',
    lessonId: 'core.m01.l04',
    kind: 'implement',
    title: 'Etiquetando as gavetas da auto peças',
    promptMarkdown: `O site da **Auto Peças Parafuso Solto** foi feito só com \`<div>\`. Troque cada \`<div>\` pela tag
semântica certa (pode manter ou tirar as classes):

- \`.topo\` → \`<header>\`
- \`.menu\` → \`<nav>\`
- \`.conteudo\` → \`<main>\`
- cada \`.secao\` → \`<section>\` (mantenha os \`id\`)
- \`.rodape\` → \`<footer>\`

Não esqueça de trocar também as tags de fechamento.`,
    language: 'web',
    starterFiles: { html: SITE_COM_DIVS, css: '', js: '' },
    solutionFiles: { html: SITE_SEMANTICO, css: '', js: '' },
    editableFiles: ['html'],
    tests: [
      {
        description: 'o topo é um <header> com o nome da loja',
        code: `const h1 = document.querySelector('header h1');
assert.ok(h1, 'Falta um <header> com o <h1> dentro.');
assert.strictEqual(h1.textContent.trim(), 'Auto Peças Parafuso Solto');`,
      },
      {
        description: 'o menu é um <nav> dentro do <header>, com os 2 links',
        code: `assert.ok(document.querySelector('header nav'), 'Falta o <nav> dentro do <header>.');
assert.strictEqual(document.querySelectorAll('nav a').length, 2, 'O <nav> deveria ter os 2 links do menu.');`,
      },
      {
        description: 'o conteúdo é um <main> com as duas <section>',
        code: `assert.strictEqual(document.querySelectorAll('main').length, 1, 'A página deveria ter exatamente um <main>.');
assert.ok(document.querySelector('main > section#pecas'), 'Falta a <section id="pecas"> dentro do <main>.');
assert.ok(document.querySelector('main > section#contato'), 'Falta a <section id="contato"> dentro do <main>.');`,
      },
      {
        description: 'o rodapé é um <footer>',
        code: `const footer = document.querySelector('footer');
assert.ok(footer, 'Falta o <footer>.');
assert.match(footer.textContent, /Auto Peças Parafuso Solto/, 'O texto do rodapé sumiu.');`,
      },
      {
        description: 'não sobrou nenhuma <div>',
        code: `const divs = document.querySelectorAll('div').length;
assert.strictEqual(divs, 0, 'Ainda há ' + divs + ' <div> na página.');`,
      },
    ],
    hints: [
      'Troque a abertura e o fechamento juntos: `<div class="topo">` ... `</div>` vira `<header>` ... `</header>`.',
      'Comece de dentro para fora (o menu, as seções) para não se perder em qual `</div>` fecha o quê.',
    ],
    followUpQuestionIds: ['core.m01.f17', 'core.m01.f18'],
    difficulty: 2,
  },
  {
    id: 'core.m01.d04',
    lessonId: 'core.m01.l04',
    kind: 'debug',
    title: 'O botão que o teclado não acha',
    promptMarkdown: `Um cliente da **Auto Peças Parafuso Solto** navega só pelo teclado e reclamou que não consegue
pedir orçamento: a tecla Tab passa direto pelo "botão". Conserte o HTML para o \`#orcamento\` ser um botão
de verdade.

A aba JS já está pronta (você aprende JavaScript mais para a frente); mexa só no HTML e mantenha o
\`id="orcamento"\`.`,
    language: 'web',
    starterFiles: {
      html: `<h2>Orçamento</h2>
<div id="orcamento" class="botao">Pedir orçamento</div>
<p id="status"></p>
`,
      css: BOTAO_CSS,
      js: BOTAO_JS,
    },
    solutionFiles: {
      html: `<h2>Orçamento</h2>
<button type="button" id="orcamento" class="botao">Pedir orçamento</button>
<p id="status"></p>
`,
      css: BOTAO_CSS,
      js: BOTAO_JS,
    },
    editableFiles: ['html'],
    tests: [
      {
        description: 'o #orcamento é um <button>',
        code: `const el = document.querySelector('#orcamento');
assert.ok(el, 'Sumiu o elemento com id="orcamento".');
assert.strictEqual(el.tagName, 'BUTTON', 'O #orcamento é um <' + el.tagName.toLowerCase() + '>; deveria ser um <button>.');`,
      },
      {
        description: 'o botão recebe o foco do teclado',
        code: `const el = document.querySelector('#orcamento');
assert.ok(el, 'Sumiu o elemento com id="orcamento".');
el.focus();
assert.ok(document.activeElement === el, 'O #orcamento não recebe foco: quem usa Tab não consegue chegar nele.');`,
      },
      {
        description: 'clicar no botão envia o pedido',
        code: `click('#orcamento');
assert.match(document.querySelector('#status').textContent, /Pedido enviado/, 'Clicar no botão não mostrou a mensagem de pedido enviado.');`,
      },
    ],
    hints: [
      'Troque `<div ...>` por `<button ...>` e `</div>` por `</button>`.',
      'Mantenha o `id="orcamento"`: é por ele que o JavaScript acha o botão.',
    ],
    followUpQuestionIds: ['core.m01.f19', 'core.m01.f20'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m01.q23',
    lessonIds: ['core.m01.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual tag guarda o menu com os links principais do site?',
    options: ['<nav>', '<footer>', '<main>', '<section>'],
    answerIndex: 0,
    explanation: '`<nav>` é a navegação. O `<footer>` é o rodapé e o `<main>` é o conteúdo principal.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q24',
    lessonIds: ['core.m01.l04'],
    kind: 'true-false',
    prompt: 'Uma página pode ter vários `<main>`, um para cada assunto.',
    answer: false,
    explanation: 'O `<main>` é o conteúdo principal e aparece uma vez só. Os assuntos ficam em `<section>`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q25',
    lessonIds: ['core.m01.l04'],
    kind: 'multiple-choice',
    prompt: 'O que uma `<div>` com cara de botão NÃO faz sozinha, e um `<button>` faz?',
    options: [
      'Recebe foco com a tecla Tab e funciona com Enter',
      'Aparece na tela',
      'Pode ter texto dentro',
      'Pode ter uma classe',
    ],
    answerIndex: 0,
    explanation: 'O `<button>` já vem com foco, teclado e o anúncio de "botão" para leitores de tela.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q26',
    lessonIds: ['core.m01.l04'],
    kind: 'multiple-choice',
    prompt:
      '"Ver nossos preços" leva para outra página. "Calcular frete" faz uma conta na própria página. Qual tag usar em cada um?',
    options: [
      '`<a href>` para "Ver nossos preços" e `<button>` para "Calcular frete"',
      '`<button>` para os dois',
      '`<a href>` para os dois',
      '`<div>` para os dois',
    ],
    answerIndex: 0,
    explanation: 'Se leva para outro lugar, é link; se faz uma ação, é botão.',
    difficulty: 2,
  },
  {
    id: 'core.m01.q27',
    lessonIds: ['core.m01.l04'],
    kind: 'true-false',
    prompt:
      'Trocar `<div>` por `<header>`, `<main>` e `<footer>` muda bastante a aparência da página, mesmo sem CSS.',
    answer: false,
    explanation:
      'Visualmente elas se comportam como uma `<div>`. O ganho é no significado: acessibilidade, buscadores e leitura do código.',
    difficulty: 2,
  },
  {
    id: 'core.m01.q28',
    lessonIds: ['core.m01.l04'],
    kind: 'fill-blank',
    prompt: 'Complete a tag do rodapé da página.',
    code: '<___>\n  <p>Km 18, Osasco</p>\n</footer>',
    acceptedAnswers: ['footer'],
    explanation: 'O rodapé é o `<footer>`; abertura e fechamento têm o mesmo nome.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q29',
    lessonIds: ['core.m01.l04', 'core.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'Dentro de uma `<section>` de "Serviços", qual título costuma abrir a seção?',
    options: ['<h2>', '<h1>', '<strong>', '<nav>'],
    answerIndex: 0,
    explanation: 'O `<h1>` é o da página inteira; cada seção abre com um `<h2>`.',
    difficulty: 2,
  },
  {
    id: 'core.m01.f17',
    lessonIds: ['core.m01.l04'],
    exerciseId: 'core.m01.e06',
    kind: 'multiple-choice',
    prompt: 'No site da auto peças, por que o `<nav>` ficou dentro do `<header>`?',
    options: [
      'Porque o menu faz parte do topo do site',
      'Porque o `<nav>` só funciona dentro do `<header>`',
      'Porque o `<header>` não aceita links soltos',
    ],
    answerIndex: 0,
    explanation: 'É comum o menu ficar no topo, mas o `<nav>` também pode ficar em outros lugares.',
    difficulty: 2,
  },
  {
    id: 'core.m01.f18',
    lessonIds: ['core.m01.l04'],
    exerciseId: 'core.m01.e06',
    kind: 'fill-blank',
    prompt: 'Complete o fechamento da seção de peças que você escreveu.',
    code: '<section id="pecas">\n  <h2>Peças</h2>\n  ...\n___',
    acceptedAnswers: ['</section>'],
    explanation: 'Trocou a abertura para `<section>`? O fechamento tem que ser `</section>`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f19',
    lessonIds: ['core.m01.l04'],
    exerciseId: 'core.m01.d04',
    kind: 'true-false',
    prompt: 'Antes do conserto, o clique do mouse no "botão" de orçamento já funcionava.',
    answer: true,
    explanation: 'A `<div>` responde ao clique do mouse; o problema era o teclado e o leitor de tela.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f20',
    lessonIds: ['core.m01.l04'],
    exerciseId: 'core.m01.d04',
    kind: 'multiple-choice',
    prompt: 'Por que foi importante manter o `id="orcamento"` no seu `<button>`?',
    options: [
      'Porque o JavaScript da página procura o elemento por esse id',
      'Porque todo `<button>` precisa de um id',
      'Porque sem id o botão não aparece na tela',
    ],
    answerIndex: 0,
    explanation: 'O JS usa `#orcamento` para achar o botão. Sem o id, ele não liga o clique à mensagem.',
    difficulty: 1,
  },
];
