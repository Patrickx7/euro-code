import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m01.l02',
  moduleId: 'core.m01',
  order: 2,
  title: 'Títulos, parágrafos, ênfase e listas',
  concepts: ['h1 a h6', 'p', 'br', 'strong e em', 'ul', 'ol', 'li'],
  sections: [
    {
      kind: 'text',
      markdown: `Texto de site tem hierarquia, igual a jornal. Os **títulos** vão de \`<h1>\` (o mais importante)
até \`<h6>\` (o menos importante):

- \`<h1>\`: o assunto da página inteira. Use **um só** por página;
- \`<h2>\`: as seções (Cardápio, Contato...);
- \`<h3>\` em diante: subdivisões dentro de uma seção.

Não escolha o título pelo tamanho da letra ("o h4 é mais bonitinho"): escolha pelo **nível** do assunto.
Tamanho é trabalho do CSS.

Texto corrido vai em **parágrafos**, \`<p>\`. Apertar Enter no código **não** quebra a linha na tela: o
navegador junta espaços e quebras de linha num espaço só. Para pular linha dentro de um parágrafo, use
\`<br>\`; para um novo assunto, abra outro \`<p>\`.`,
    },
    {
      kind: 'text',
      markdown: `Para destacar palavras:

- \`<strong>\`: **importância** ("pagamento **somente** adiantado"). Aparece em negrito;
- \`<em>\`: **ênfase**, aquele tom diferente na fala ("eu disse que era _rapidinho_"). Aparece em itálico.

Existem também \`<b>\` e \`<i>\`, que só mudam o visual. Prefira \`<strong>\` e \`<em>\`: eles dizem o
**significado**, e leitores de tela (programas que leem a página em voz alta) usam isso.`,
    },
    {
      kind: 'text',
      markdown: `**Listas** têm um contêiner e itens \`<li>\` dentro dele:

- \`<ul>\` (_unordered list_): lista **sem ordem**, com bolinhas. Ex.: o cardápio;
- \`<ol>\` (_ordered list_): lista **numerada**, quando a ordem importa. Ex.: passo a passo.

Todo \`<li>\` precisa morar dentro de um \`<ul>\` ou de um \`<ol>\`. Item solto não vira lista.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<h1>Padaria Pão de Ontem</h1>
<h2>Cardápio</h2>
<ul>
  <li>Pão francês</li>
  <li>Sonho</li>
</ul>
<h2>Como encomendar</h2>
<ol>
  <li>Escolha os pães.</li>
  <li>Pague <strong>adiantado</strong>.</li>
  <li>Retire no balcão.</li>
</ol>
<p>Atendemos até as 18h.<br>Domingo só até o meio-dia.</p>`,
      explanation:
        'Um `<h1>` para a página, `<h2>` para cada seção, `<ul>` para o cardápio (a ordem não importa) e `<ol>` para os passos (a ordem importa).',
    },
  ],
  checkQuestionIds: ['core.m01.q09'],
  exerciseIds: ['core.m01.e02', 'core.m01.e03'],
  debugExerciseIds: ['core.m01.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m01.e02',
    lessonId: 'core.m01.l02',
    kind: 'implement',
    title: 'O cardápio da padaria',
    promptMarkdown: `Embaixo do título da padaria, crie a seção do cardápio:

1. Um título de seção \`<h2>\` com o texto \`Cardápio\`.
2. Uma lista **sem ordem** (\`<ul>\`) com 3 itens, nesta ordem: \`Pão francês\`, \`Sonho\` e \`Café coado\`.`,
    language: 'web',
    starterFiles: {
      html: '<h1>Padaria Pão de Ontem</h1>\n<!-- O cardápio vai aqui -->\n',
      css: '',
      js: '',
    },
    solutionFiles: {
      html: `<h1>Padaria Pão de Ontem</h1>
<h2>Cardápio</h2>
<ul>
  <li>Pão francês</li>
  <li>Sonho</li>
  <li>Café coado</li>
</ul>
`,
      css: '',
      js: '',
    },
    editableFiles: ['html'],
    tests: [
      {
        description: 'há um <h2> com o texto "Cardápio"',
        code: `const h2 = document.querySelector('h2');
assert.ok(h2, 'Falta o título de seção <h2>.');
assert.strictEqual(h2.textContent.trim(), 'Cardápio');`,
      },
      {
        description: 'a lista <ul> tem 3 itens',
        code: `assert.ok(document.querySelector('ul'), 'Falta a lista <ul>.');
assert.strictEqual(document.querySelectorAll('ul > li').length, 3, 'A lista <ul> deveria ter 3 itens <li>.');`,
      },
      {
        description: 'os itens são os produtos pedidos, na ordem',
        code: `const itens = [...document.querySelectorAll('ul > li')].map((li) => li.textContent.trim());
assert.deepStrictEqual(itens, ['Pão francês', 'Sonho', 'Café coado']);`,
      },
    ],
    hints: [
      'A lista tem um contêiner `<ul>` e cada produto vai num `<li>` dentro dele.',
      'Feche cada item: `<li>Sonho</li>`.',
    ],
    followUpQuestionIds: ['core.m01.f05', 'core.m01.f06'],
    difficulty: 1,
  },
  {
    id: 'core.m01.e03',
    lessonId: 'core.m01.l02',
    kind: 'implement',
    title: 'O aviso da barbearia',
    promptMarkdown: `O Seu Nelson, da **Barbearia Navalha Cega**, cansou de cliente chegando 19h05. No aviso:

1. Marque \`19h\` como **importante**, com \`<strong>\`.
2. Dê **ênfase** à palavra \`não\`, com \`<em>\`.

Não mude o resto do texto.`,
    language: 'web',
    starterFiles: {
      html: '<p class="aviso">Atendemos só até as 19h. O corte não inclui a barba.</p>\n',
      css: '.aviso { font-size: 20px; }',
      js: '',
    },
    solutionFiles: {
      html: '<p class="aviso">Atendemos só até as <strong>19h</strong>. O corte <em>não</em> inclui a barba.</p>\n',
      css: '.aviso { font-size: 20px; }',
      js: '',
    },
    editableFiles: ['html'],
    tests: [
      {
        description: '"19h" está dentro de um <strong>',
        code: `const forte = document.querySelector('.aviso strong');
assert.ok(forte, 'Falta um <strong> dentro do aviso.');
assert.strictEqual(forte.textContent.trim(), '19h', 'O <strong> deveria envolver só "19h".');`,
      },
      {
        description: '"não" está dentro de um <em>',
        code: `const enfase = document.querySelector('.aviso em');
assert.ok(enfase, 'Falta um <em> dentro do aviso.');
assert.strictEqual(enfase.textContent.trim(), 'não', 'O <em> deveria envolver só "não".');`,
      },
      {
        description: 'o texto do aviso continua o mesmo',
        code: `const aviso = document.querySelector('.aviso');
assert.ok(aviso, 'Sumiu o parágrafo com a classe "aviso".');
assert.strictEqual(aviso.textContent.replace(/\\s+/g, ' ').trim(), 'Atendemos só até as 19h. O corte não inclui a barba.', 'O texto do aviso mudou.');`,
      },
    ],
    hints: [
      'Envolva só a palavra: `as <strong>19h</strong>.`',
      'O mesmo vale para a ênfase: `<em>não</em>`.',
    ],
    followUpQuestionIds: ['core.m01.f07', 'core.m01.f08'],
    difficulty: 1,
  },
  {
    id: 'core.m01.d02',
    lessonId: 'core.m01.l02',
    kind: 'debug',
    title: 'O passo a passo sem número',
    promptMarkdown: `O Seu Nelson quer o passo a passo do agendamento **numerado** (1, 2, 3), mas na tela aparecem
bolinhas e o último passo ficou fora da lista. Conserte para ficar uma lista numerada com os 3 passos.`,
    language: 'web',
    starterFiles: {
      html: `<h2>Como agendar seu corte</h2>
<ul>
  <li>Escolha o dia e o horário.</li>
  <li>Mande uma mensagem para a barbearia.</li>
</ul>
<li>Chegue 5 minutos antes.</li>
`,
      css: '',
      js: '',
    },
    solutionFiles: {
      html: `<h2>Como agendar seu corte</h2>
<ol>
  <li>Escolha o dia e o horário.</li>
  <li>Mande uma mensagem para a barbearia.</li>
  <li>Chegue 5 minutos antes.</li>
</ol>
`,
      css: '',
      js: '',
    },
    editableFiles: ['html'],
    tests: [
      {
        description: 'os passos estão numa lista numerada <ol>',
        code: `assert.ok(document.querySelector('ol'), 'Falta a lista numerada <ol>. Com <ul> aparecem bolinhas.');
assert.strictEqual(document.querySelectorAll('ul').length, 0, 'Ainda sobrou uma lista <ul> na página.');`,
      },
      {
        description: 'a lista numerada tem os 3 passos, na ordem',
        code: `const passos = [...document.querySelectorAll('ol > li')].map((li) => li.textContent.trim());
assert.deepStrictEqual(passos, ['Escolha o dia e o horário.', 'Mande uma mensagem para a barbearia.', 'Chegue 5 minutos antes.']);`,
      },
      {
        description: 'nenhum item ficou fora de uma lista',
        code: `const soltos = [...document.querySelectorAll('li')].filter((li) => !li.parentElement.matches('ul, ol'));
assert.strictEqual(soltos.length, 0, 'Há ' + soltos.length + ' item <li> fora de uma lista.');`,
      },
    ],
    hints: [
      'Lista numerada é `<ol>`. Troque a abertura **e** o fechamento.',
      'Todo `<li>` precisa ficar antes do `</ol>`.',
    ],
    followUpQuestionIds: ['core.m01.f09', 'core.m01.f10'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'core.m01.q09',
    lessonIds: ['core.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'Você vai listar os passos para o cliente pagar um boleto, e a ordem importa. Qual lista usar?',
    options: ['<ol>', '<ul>', '<li>', '<p>'],
    answerIndex: 0,
    explanation: '`<ol>` é a lista numerada, para quando a ordem importa. `<li>` é o item, não a lista.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q10',
    lessonIds: ['core.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual título representa o assunto principal da página inteira?',
    options: ['<h1>', '<h2>', '<h6>', '<p>'],
    answerIndex: 0,
    explanation: '`<h1>` é o título mais importante. Use um por página; as seções usam `<h2>`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q11',
    lessonIds: ['core.m01.l02'],
    kind: 'true-false',
    prompt: 'Apertar Enter no meio do texto de um `<p>`, no código, faz a linha quebrar na tela.',
    answer: false,
    explanation:
      'O navegador junta espaços e quebras de linha num espaço só. Para quebrar a linha, use `<br>`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q12',
    lessonIds: ['core.m01.l02'],
    kind: 'multiple-choice',
    prompt:
      'O cliente quer deixar claro que o pagamento é obrigatório antes da entrega. Qual tag marca essa importância?',
    options: ['<strong>', '<em>', '<i>', '<br>'],
    answerIndex: 0,
    explanation: '`<strong>` marca importância. `<em>` é ênfase de entonação, e `<i>` só muda o visual.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q13',
    lessonIds: ['core.m01.l02'],
    kind: 'fill-blank',
    prompt: 'Complete a tag que abre um item de lista.',
    code: '<ul>\n  ___Coxinha</li>\n</ul>',
    acceptedAnswers: ['<li>'],
    explanation: 'Cada item de `<ul>` ou `<ol>` fica dentro de um `<li>`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.q14',
    lessonIds: ['core.m01.l02'],
    kind: 'true-false',
    prompt:
      'Está tudo bem usar `<h4>` no lugar de `<h2>` só porque a letra do `<h4>` é menor e fica mais bonita.',
    answer: false,
    explanation: 'O título é escolhido pelo nível do assunto. O tamanho da letra se ajusta com CSS.',
    difficulty: 2,
  },
  {
    id: 'core.m01.q15',
    lessonIds: ['core.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'Por que preferir `<strong>` a `<b>`?',
    options: [
      'Porque `<strong>` diz o significado (importância), e leitores de tela usam isso',
      'Porque `<b>` não funciona em nenhum navegador',
      'Porque `<strong>` deixa a letra maior',
    ],
    answerIndex: 0,
    explanation: 'Os dois ficam em negrito, mas só `<strong>` diz que o trecho é importante.',
    difficulty: 2,
  },
  {
    id: 'core.m01.f05',
    lessonIds: ['core.m01.l02'],
    exerciseId: 'core.m01.e02',
    kind: 'multiple-choice',
    prompt: 'No seu cardápio, por que usar `<ul>` e não `<ol>`?',
    options: [
      'Porque a ordem dos produtos não importa',
      'Porque `<ol>` não aceita mais de 2 itens',
      'Porque `<ul>` deixa o texto em negrito',
    ],
    answerIndex: 0,
    explanation: 'Cardápio não tem "primeiro passo": é uma lista sem ordem, com bolinhas.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f06',
    lessonIds: ['core.m01.l02'],
    exerciseId: 'core.m01.e02',
    kind: 'fill-blank',
    prompt: 'Complete o item que você escreveu no cardápio.',
    code: '<ul>\n  <li>Pão francês</li>\n  <li>Sonho___\n</ul>',
    acceptedAnswers: ['</li>'],
    explanation: 'Cada `<li>` fecha com `</li>`.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f07',
    lessonIds: ['core.m01.l02'],
    exerciseId: 'core.m01.e03',
    kind: 'multiple-choice',
    prompt: 'No aviso da barbearia, como o navegador mostra o `<em>não</em>` que você escreveu, por padrão?',
    options: ['Em itálico', 'Em negrito', 'Sublinhado', 'Numa linha separada'],
    answerIndex: 0,
    explanation: '`<em>` aparece em itálico e `<strong>` em negrito (dá para mudar com CSS).',
    difficulty: 1,
  },
  {
    id: 'core.m01.f08',
    lessonIds: ['core.m01.l02'],
    exerciseId: 'core.m01.e03',
    kind: 'true-false',
    prompt: 'O `<strong>` que você colocou em volta de `19h` ficou dentro do `<p class="aviso">`.',
    answer: true,
    explanation: '`<strong>` e `<em>` marcam pedaços de um texto, então ficam dentro do parágrafo.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f09',
    lessonIds: ['core.m01.l02'],
    exerciseId: 'core.m01.d02',
    kind: 'multiple-choice',
    prompt: 'O que você trocou para os passos aparecerem com 1, 2, 3 em vez de bolinhas?',
    options: ['`<ul>` por `<ol>`', '`<li>` por `<p>`', '`<h2>` por `<h1>`'],
    answerIndex: 0,
    explanation: '`<ol>` numera os itens; `<ul>` usa bolinhas.',
    difficulty: 1,
  },
  {
    id: 'core.m01.f10',
    lessonIds: ['core.m01.l02'],
    exerciseId: 'core.m01.d02',
    kind: 'true-false',
    prompt: 'O passo "Chegue 5 minutos antes" estava com problema porque o `<li>` estava fora do `<ul>`.',
    answer: true,
    explanation: 'Item de lista precisa ficar dentro do contêiner da lista. Solto, ele não ganha número.',
    difficulty: 1,
  },
];
