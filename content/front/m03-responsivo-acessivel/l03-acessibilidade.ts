import type { Exercise, Lesson, Question } from '../../../src/shared/content';

/** Foto de um armário planejado (desenho simples, 240 × 120). */
const FOTO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='120'%3E%3Crect width='240' height='120' fill='%238d6e63'/%3E%3Crect x='20' y='15' width='60' height='90' fill='%23d7ccc8'/%3E%3Crect x='90' y='15' width='60' height='90' fill='%23d7ccc8'/%3E%3C/svg%3E";

const FORM_CSS = `body {
  font-family: sans-serif;
  padding: 1rem;
}

input {
  display: block;
  margin-bottom: 12px;
  padding: 8px;
}
`;

const FOCO_HTML = `<h1>Marcenaria Cupim Zero</h1>
<nav>
  <a href="#moveis">Móveis planejados</a>
  <a href="#reformas">Reformas</a>
  <a href="#contato">Contato</a>
</nav>
<button type="button" class="orcamento">Pedir orçamento</button>
`;

const FOCO_CSS_BASE = `body {
  font-family: sans-serif;
  padding: 1rem;
}

nav a {
  margin-right: 12px;
  color: #4e342e;
}

.orcamento {
  margin-top: 16px;
  padding: 10px 16px;
  background: #6d4c41;
  color: white;
  border: 0;
}
`;

const PROMO_HTML = `<h1>Marcenaria Cupim Zero</h1>
<button id="abrir" type="button">Ver queima de estoque</button>
<a id="contato" href="#contato">Falar com a gente</a>

<div id="promo" class="promo" hidden>
  <p>Armário de 3 portas pela metade do preço! (A 4ª porta o cupim levou.)</p>
  <button id="fechar" type="button">Fechar</button>
</div>
`;

const PROMO_CSS = `body {
  font-family: sans-serif;
  padding: 1rem;
}

.promo {
  margin-top: 16px;
  padding: 16px;
  border: 2px solid #6d4c41;
  background: #efebe9;
}
`;

const PROMO_JS = `const abrir = document.querySelector('#abrir');
const fechar = document.querySelector('#fechar');
const promo = document.querySelector('#promo');

function abrirPromo() {
  promo.hidden = false;
  fechar.focus();
}

function fecharPromo() {
  promo.hidden = true;
  abrir.focus();
}

abrir.addEventListener('click', abrirPromo);
fechar.addEventListener('click', fecharPromo);
`;

/** Aperta uma tecla no elemento que está com o foco (o evento sobe até o document). */
const TECLA = `const tecla = (key) => {
  const alvo = document.activeElement || document.body;
  alvo.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
};
`;

export const lesson: Lesson = {
  id: 'front.m03.l03',
  moduleId: 'front.m03',
  order: 3,
  title: 'Acessibilidade: um site para todo mundo, até para quem usa só o teclado',
  concepts: [
    'alt em imagens',
    'label ligado ao campo',
    'hierarquia de títulos',
    'botão ou link',
    ':focus-visible',
    'tabindex',
    'navegação por teclado',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Tem cliente do seu cliente que não enxerga e usa um **leitor de tela** (um programa que lê a página em voz alta). Tem gente que não usa mouse, só o **teclado**. Tem gente que só está no sol, com o celular no brilho mínimo. **Acessibilidade** é o site funcionar para todo mundo, e boa parte dela é HTML bem escrito:

- **\`alt\` em toda imagem.** Descreva o que importa: \`alt="Armário planejado de 3 portas"\`. Imagem só decorativa ganha \`alt=""\` (vazio), para o leitor de tela pular.
- **\`<label>\` ligado ao campo.** \`<label for="nome">Nome</label>\` + \`<input id="nome">\`: o leitor de tela fala "Nome, campo de texto", e clicar no texto põe o cursor no campo. Placeholder **não** substitui label: ele some quando a pessoa começa a digitar.
- **Títulos em ordem.** Um \`<h1>\` por página, depois \`<h2>\`, \`<h3>\`... sem pular nível só porque o \`<h4>\` "era do tamanho certo". Tamanho é coisa do CSS. Muita gente com leitor de tela navega pulando de título em título.
- **Botão ou link?** Leva para outro lugar (outra página, outra seção)? É \`<a href>\`. Faz alguma coisa na página (abrir menu, enviar, fechar)? É \`<button>\`.`,
    },
    {
      kind: 'text',
      markdown: `## Teclado: Tab, foco e \`:focus-visible\`

Quem usa teclado anda pela página com **Tab** (e volta com Shift+Tab). Links, botões e campos recebem o **foco**, e o navegador desenha um contorno em volta: é assim que a pessoa sabe onde está.

O crime mais comum do front-end: \`*:focus { outline: none; }\` porque "o anel azul é feio". Pronto, quem usa teclado ficou cego na página. Se o design não gosta do anel padrão, **troque, não apague**:

\`\`\`css
button:focus-visible {
  outline: 3px solid #ffb300;
  outline-offset: 2px;
}
\`\`\`

\`:focus-visible\` só aparece quando o navegador acha que o foco precisa ser visto (como na navegação por teclado), e não a cada clique do mouse. Todo mundo sai feliz.

## \`tabindex\`

- \`tabindex="0"\`: coloca na ordem do Tab um elemento que normalmente não entraria;
- \`tabindex="-1"\`: o elemento pode receber foco **pelo JavaScript** (\`el.focus()\`), mas o Tab pula ele;
- \`tabindex="5"\` (positivo): **não use**. Ele fura a fila e bagunça a ordem da página inteira.

## Teclas no JavaScript

O evento \`keydown\` diz qual tecla foi apertada em \`evento.key\` (\`'Enter'\`, \`'Escape'\`, \`'Tab'\`, \`'a'\`...). Uma janelinha que abre por cima da página precisa fechar com **Esc** e devolver o foco para quem a abriu, senão a pessoa do teclado se perde.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<h1>Marcenaria Cupim Zero</h1>
<img src="cozinha.jpg" alt="Cozinha planejada em madeira clara com bancada em L" />
<img src="enfeite.svg" alt="" />

<h2>Peça seu orçamento</h2>
<label for="email">E-mail</label>
<input id="email" type="email" />
<button type="submit">Enviar</button>

<a href="/portfolio">Ver portfólio</a>`,
      explanation:
        'A foto do serviço tem um alt que descreve; o enfeite tem alt vazio. O título desce de h1 para h2, o campo tem label, a ação é um botão e a navegação é um link.',
    },
    {
      kind: 'example',
      language: 'html',
      code: `<script>
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && !janela.hidden) {
      janela.hidden = true;
      botaoQueAbriu.focus(); // o foco volta para onde estava
    }
  });
</script>`,
      explanation:
        'O ouvinte fica no `document`, então pega o Esc de onde quer que o foco esteja. E só age se a janela estiver aberta.',
    },
  ],
  checkQuestionIds: ['front.m03.q15'],
  exerciseIds: ['front.m03.e03', 'front.m03.e06'],
  debugExerciseIds: ['front.m03.d03'],
};

export const exercises: Exercise[] = [
  {
    id: 'front.m03.e03',
    lessonId: 'front.m03.l03',
    kind: 'implement',
    title: 'O orçamento que o leitor de tela não entende',
    promptMarkdown: `Um cliente cego da **Marcenaria Cupim Zero** tentou pedir orçamento e o leitor de tela só falava "imagem, campo de texto, campo de texto". Arrume o HTML:

1. a foto \`#foto\` precisa de um texto alternativo que descreva o armário;
2. os campos \`#nome\` e \`#telefone\` precisam de um \`<label>\` ligado a cada um (com \`for\`), com os textos "Nome" e "Telefone";
3. os títulos não podem pular nível: depois do \`<h1>\` vem \`<h2>\`, não \`<h4>\`.

Mantenha os \`id\`s.`,
    language: 'web',
    starterFiles: {
      html: `<h1>Marcenaria Cupim Zero</h1>
<img id="foto" src="${FOTO}" width="240" height="120" />

<h4>Peça seu orçamento</h4>
<form>
  Nome
  <input id="nome" type="text" />
  Telefone
  <input id="telefone" type="tel" />
  <button type="submit">Pedir orçamento</button>
</form>
`,
      css: FORM_CSS,
      js: '',
    },
    solutionFiles: {
      html: `<h1>Marcenaria Cupim Zero</h1>
<img id="foto" src="${FOTO}" width="240" height="120" alt="Armário planejado de madeira com duas portas" />

<h2>Peça seu orçamento</h2>
<form>
  <label for="nome">Nome</label>
  <input id="nome" type="text" />
  <label for="telefone">Telefone</label>
  <input id="telefone" type="tel" />
  <button type="submit">Pedir orçamento</button>
</form>
`,
      css: FORM_CSS,
      js: '',
    },
    editableFiles: ['html'],
    tests: [
      {
        description: 'a foto tem um texto alternativo',
        code: `const foto = document.querySelector('#foto');
assert.ok(foto, 'Sumiu a imagem com id="foto".');
const alt = (foto.getAttribute('alt') || '').trim();
assert.ok(alt.length >= 5, 'A foto precisa de um alt que descreva o armário (por exemplo, alt="Armário planejado de madeira").');`,
      },
      {
        description: 'cada campo tem um <label> ligado a ele',
        code: `for (const [id, texto] of [['nome', /nome/i], ['telefone', /telefone/i]]) {
  const campo = document.querySelector('#' + id);
  assert.ok(campo, 'Sumiu o campo com id="' + id + '".');
  assert.ok(campo.labels.length > 0, 'O campo #' + id + ' não tem <label> ligado a ele. Use <label for="' + id + '">.');
  assert.match(campo.labels[0].textContent, texto, 'O label do #' + id + ' deveria dizer o que o campo pede.');
}`,
      },
      {
        description: 'clicar no texto "Nome" põe o cursor no campo',
        code: `const campo = document.querySelector('#nome');
assert.ok(campo && campo.labels.length > 0, 'O #nome ainda não tem label.');
campo.labels[0].click();
assert.ok(document.activeElement === campo, 'Clicar no label deveria levar o foco ao campo #nome.');`,
      },
      {
        description: 'os títulos não pulam nível',
        code: `const niveis = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1]));
assert.strictEqual(niveis[0], 1, 'A página deveria começar com um <h1>.');
for (let i = 1; i < niveis.length; i++) {
  assert.ok(niveis[i] <= niveis[i - 1] + 1, 'Depois de um <h' + niveis[i - 1] + '> veio um <h' + niveis[i] + '>: os títulos pularam nível.');
}`,
      },
    ],
    hints: [
      'Na imagem: `alt="..."` com uma descrição curta do que aparece na foto.',
      'Troque o texto solto "Nome" por `<label for="nome">Nome</label>`; faça o mesmo com o telefone.',
      'O título do formulário é um `<h2>`. Se quiser ele menor, isso é trabalho do CSS.',
    ],
    followUpQuestionIds: ['front.m03.f09', 'front.m03.f10'],
    difficulty: 1,
  },
  {
    id: 'front.m03.e06',
    lessonId: 'front.m03.l03',
    kind: 'implement',
    title: 'Fechar a promoção com Esc',
    promptMarkdown: `A janelinha da queima de estoque da **Marcenaria Cupim Zero** já abre e fecha com o mouse, e o foco vai para o botão "Fechar" quando ela abre. Mas quem usa só o teclado espera fechar com **Esc**.

Na aba JS, acrescente um ouvinte de \`keydown\` no \`document\` que, quando a tecla for \`'Escape'\` **e** a promoção estiver aberta, chama \`fecharPromo()\` (que esconde a janela e devolve o foco ao botão que abriu).

Com a promoção fechada, o Esc não deve fazer nada.`,
    language: 'web',
    starterFiles: {
      html: PROMO_HTML,
      css: PROMO_CSS,
      js: `${PROMO_JS}
// Quem usa teclado também precisa fechar: tecla Esc
`,
    },
    solutionFiles: {
      html: PROMO_HTML,
      css: PROMO_CSS,
      js: `${PROMO_JS}
// Quem usa teclado também precisa fechar: tecla Esc
document.addEventListener('keydown', function (evento) {
  if (evento.key === 'Escape' && !promo.hidden) {
    fecharPromo();
  }
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'Esc fecha a promoção',
        code: `${TECLA}click('#abrir');
assert.strictEqual(document.querySelector('#promo').hidden, false, 'O botão de abrir deveria mostrar a promoção.');
tecla('Escape');
assert.strictEqual(document.querySelector('#promo').hidden, true, 'Com a promoção aberta, o Esc deveria fechar a janela.');`,
      },
      {
        description: 'depois do Esc, o foco volta para o botão que abriu',
        code: `${TECLA}click('#abrir');
tecla('Escape');
assert.ok(document.activeElement === document.querySelector('#abrir'), 'Depois de fechar com Esc, o foco deveria voltar para o botão "Ver queima de estoque".');`,
      },
      {
        description: 'outras teclas não fecham a promoção',
        code: `${TECLA}click('#abrir');
tecla('a');
tecla('Enter');
const aberta = !document.querySelector('#promo').hidden;
click('#fechar');
assert.ok(aberta, 'Só o Esc deveria fechar a promoção.');`,
      },
      {
        description: 'com a promoção fechada, o Esc não mexe no foco',
        code: `${TECLA}const link = document.querySelector('#contato');
link.focus();
tecla('Escape');
assert.ok(document.activeElement === link, 'Com a promoção fechada, o Esc não deveria levar o foco para outro lugar.');`,
      },
    ],
    hints: [
      "Comece com `document.addEventListener('keydown', function (evento) { ... });`.",
      "Dentro, teste `evento.key === 'Escape'` e se a promoção está aberta: `!promo.hidden`.",
    ],
    followUpQuestionIds: ['front.m03.f13', 'front.m03.f14'],
    difficulty: 2,
  },
  {
    id: 'front.m03.d03',
    lessonId: 'front.m03.l03',
    kind: 'debug',
    title: 'O anel de foco que o designer apagou',
    promptMarkdown: `O designer da **Marcenaria Cupim Zero** achou "feio aquele contorno azul" e o sobrinho resolveu com uma linha de CSS. Agora quem navega com Tab não sabe onde está.

Conserte o CSS: links e botões precisam mostrar o foco com um contorno de **pelo menos 2px**, usando \`:focus-visible\` (assim o mouse não vê o anel a cada clique, e o designer fica quieto). Sugestão: \`outline: 3px solid #ffb300\`.`,
    language: 'web',
    starterFiles: {
      html: FOCO_HTML,
      css: `${FOCO_CSS_BASE}
/* "Tira esse contorno azul feio" (o designer) */
*:focus {
  outline: none;
}
`,
      js: '',
    },
    solutionFiles: {
      html: FOCO_HTML,
      css: `${FOCO_CSS_BASE}
a:focus-visible,
button:focus-visible {
  outline: 3px solid #ffb300;
  outline-offset: 2px;
}
`,
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'links e botões mostram um contorno de pelo menos 2px no foco',
        code: `for (const el of document.querySelectorAll('a, button')) {
  el.focus();
  const s = getComputedStyle(el);
  const nome = '"' + el.textContent.trim() + '"';
  assert.ok(document.activeElement === el, 'O elemento ' + nome + ' deveria receber o foco.');
  assert.notStrictEqual(s.outlineStyle, 'none', 'Com o foco no ' + nome + ', não aparece contorno nenhum.');
  assert.ok(parseFloat(s.outlineWidth) >= 2, 'O contorno do ' + nome + ' tem ' + s.outlineWidth + '; use pelo menos 2px.');
}
document.activeElement.blur();`,
      },
      {
        description: 'o estilo de foco usa :focus-visible',
        code: `const regras = [...document.styleSheets].flatMap((s) => [...s.cssRules]);
assert.ok(regras.some((r) => (r.selectorText || '').includes(':focus-visible')), 'Escreva o estilo do foco com :focus-visible.');`,
      },
    ],
    hints: [
      'A regra `*:focus { outline: none; }` apaga o contorno de todo mundo. Comece apagando ela.',
      'Depois crie `a:focus-visible, button:focus-visible { outline: 3px solid #ffb300; }`.',
    ],
    followUpQuestionIds: ['front.m03.f11', 'front.m03.f12'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'front.m03.q15',
    lessonIds: ['front.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual o `alt` certo para um enfeite de fundo, só decorativo, que não diz nada?',
    options: ['`alt="imagem"`', '`alt="enfeite.svg"`', '`alt=""` (vazio)', 'Não colocar o atributo `alt`.'],
    answerIndex: 2,
    explanation:
      'Com `alt=""`, o leitor de tela pula a imagem. Sem o atributo, ele pode ler o nome do arquivo.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q16',
    lessonIds: ['front.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'O botão "Ver portfólio" leva para a página `/portfolio`. Qual elemento usar?',
    options: [
      '`<button>`, porque é clicável.',
      '`<a href="/portfolio">`, porque leva para outro lugar.',
      '`<div>` com evento de clique.',
      '`<span>` com cursor de mãozinha.',
    ],
    answerIndex: 1,
    explanation: 'Navegar é com link. Botão é para ações na própria página.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q17',
    lessonIds: ['front.m03.l03'],
    kind: 'true-false',
    prompt: 'Um `placeholder` no campo substitui o `<label>`.',
    answer: false,
    explanation:
      'O placeholder some quando a pessoa digita e nem sempre é lido. Use um `<label>` de verdade.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q18',
    lessonIds: ['front.m03.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para ligar o label ao campo de e-mail:',
    code: '<label ___="email">E-mail</label>\n<input id="email" type="email" />',
    acceptedAnswers: ['for'],
    explanation: 'O `for` do label aponta para o `id` do campo.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q19',
    lessonIds: ['front.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'O que faz `tabindex="-1"` num elemento?',
    options: [
      'Coloca o elemento em primeiro lugar na ordem do Tab.',
      'Esconde o elemento da tela.',
      'Deixa o elemento receber foco pelo JavaScript (`el.focus()`), mas o Tab pula ele.',
      'Desativa os cliques no elemento.',
    ],
    answerIndex: 2,
    explanation: 'Útil para mandar o foco para um título ou uma janela sem pôr o elemento na fila do Tab.',
    difficulty: 2,
  },
  {
    id: 'front.m03.q20',
    lessonIds: ['front.m03.l03'],
    kind: 'multiple-choice',
    prompt: 'O título "Nossos serviços" ficou grande demais como `<h2>`. O que fazer?',
    options: [
      'Trocar por `<h5>`, que é menor.',
      'Manter o `<h2>` e diminuir a fonte no CSS.',
      'Trocar por um `<p>` em negrito.',
      'Tirar o título.',
    ],
    answerIndex: 1,
    explanation:
      'O nível do título é estrutura; o tamanho é aparência. Quem navega por títulos depende da ordem certa.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q21',
    lessonIds: ['front.m03.l03'],
    kind: 'true-false',
    prompt: 'Usar `tabindex="3"` para "furar a fila" do Tab é uma boa prática.',
    answer: false,
    explanation: 'Tabindex positivo bagunça a ordem da página inteira. Use 0, -1 ou mude a ordem do HTML.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f09',
    lessonIds: ['front.m03.l03'],
    exerciseId: 'front.m03.e03',
    kind: 'multiple-choice',
    prompt: 'No seu formulário, o que liga o `<label>` "Nome" ao campo?',
    options: [
      'Estar escrito logo antes do campo.',
      'O atributo `for="nome"` igual ao `id="nome"` do campo.',
      'O `type="text"`.',
      'O `<form>` em volta.',
    ],
    answerIndex: 1,
    explanation: 'Texto solto perto do campo não liga nada. O `for` aponta para o `id`.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f10',
    lessonIds: ['front.m03.l03'],
    exerciseId: 'front.m03.e03',
    kind: 'true-false',
    prompt:
      'Na sua solução, trocar o `<h4>` por `<h2>` deixou o título do formulário maior, e isso dá para ajustar no CSS sem mudar a tag.',
    answer: true,
    explanation: 'O tamanho padrão muda, mas `h2 { font-size: 1.1rem; }` resolve sem estragar a hierarquia.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f11',
    lessonIds: ['front.m03.l03'],
    exerciseId: 'front.m03.d03',
    kind: 'multiple-choice',
    prompt: 'O que a regra `*:focus { outline: none; }` fazia para quem navega com Tab?',
    options: [
      'Deixava o Tab mais rápido.',
      'Escondia onde está o foco: a pessoa aperta Tab e não sabe em que link ou botão está.',
      'Impedia o foco de chegar nos botões.',
      'Nada, só mudava a cor.',
    ],
    answerIndex: 1,
    explanation:
      'O foco continuava lá, mas invisível. Para quem usa teclado, é como usar o mouse sem ver a setinha.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f12',
    lessonIds: ['front.m03.l03'],
    exerciseId: 'front.m03.d03',
    kind: 'multiple-choice',
    prompt: 'Por que o seu conserto usa `:focus-visible` e não `:focus`?',
    options: [
      'Porque `:focus` não existe mais.',
      'Porque `:focus-visible` mostra o anel quando ele é necessário (como no teclado), e não a cada clique do mouse.',
      'Porque `:focus-visible` funciona só no celular.',
      'Porque é mais curto de escrever.',
    ],
    answerIndex: 1,
    explanation:
      'Quem usa teclado vê o foco; quem clica com o mouse não leva um anel na cara. Designer e usuário felizes.',
    difficulty: 2,
  },
  {
    id: 'front.m03.f13',
    lessonIds: ['front.m03.l03'],
    exerciseId: 'front.m03.e06',
    kind: 'multiple-choice',
    prompt: 'Por que o seu ouvinte de `keydown` fica no `document`, e não no botão "Fechar"?',
    options: [
      'Porque botão não recebe eventos de teclado.',
      'Porque o evento sobe até o `document`: assim o Esc funciona onde quer que o foco esteja.',
      'Porque o `document` é mais rápido.',
      'Tanto faz, nunca muda nada.',
    ],
    answerIndex: 1,
    explanation: 'Se a pessoa der Tab para outro lugar, um ouvinte só no "Fechar" não ouviria mais o Esc.',
    difficulty: 2,
  },
  {
    id: 'front.m03.f14',
    lessonIds: ['front.m03.l03'],
    exerciseId: 'front.m03.e06',
    kind: 'multiple-choice',
    prompt: 'Na sua solução, o que dava errado se você tirasse o `&& !promo.hidden`?',
    options: [
      'Nada.',
      'O Esc pararia de fechar a promoção.',
      'Com a promoção fechada, cada Esc ia jogar o foco para o botão "Ver queima de estoque", de onde quer que a pessoa estivesse.',
      'A página daria erro.',
    ],
    answerIndex: 2,
    explanation:
      'O `fecharPromo()` sempre chama `abrir.focus()`. Sem a checagem, o Esc "teleporta" o foco à toa.',
    difficulty: 2,
  },
];
