import type { Exercise, Lesson, Question } from '../../../src/shared/content';

/** Foto "grande demais" (1200 × 600) que vem do celular da cliente. */
const FOTO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'%3E%3Crect width='1200' height='600' fill='%23f8bbd0'/%3E%3Ccircle cx='600' cy='300' r='220' fill='%23ad1457'/%3E%3C/svg%3E";

const VITRINE_HTML = `<main class="pagina">
  <h1>Confeitaria Glacê Torto</h1>
  <img class="destaque" src="${FOTO}" width="1200" height="600" alt="Bolo de três andares levemente inclinado" />
  <p>Encomendas pelo zap. Entregamos em toda a Granja Viana (o bolo chega reto, quase sempre).</p>
</main>
`;

const TITULO_HTML = `<header class="topo">
  <h1 class="titulo">Bolo de pote</h1>
  <p>Agora com entrega na Granja Viana!</p>
</header>
`;

/** Todas as regras CSS da página (usado nos testes). */
const ALL_RULES = '[...document.styleSheets].flatMap((s) => [...s.cssRules])';

export const lesson: Lesson = {
  id: 'front.m03.l01',
  moduleId: 'front.m03',
  order: 1,
  title: 'Layout fluido: chega de largura fixa',
  concepts: ['unidades relativas (rem, %, vw)', 'max-width e margin auto', 'imagem fluida', 'clamp()'],
  sections: [
    {
      kind: 'text',
      markdown: `Primeiro dia de Júnior e o primeiro chamado: *"o site abre no celular com uma barra de rolagem pro lado"*. Quase sempre o culpado é o mesmo: **largura fixa em px**.

Media query você já conhece. Mas, antes de sair criando uma media query para cada celular do mercado, vale usar medidas que **se adaptam sozinhas**:

| Unidade | É relativa a... | Uso típico |
| --- | --- | --- |
| \`%\` | largura do **elemento pai** | colunas, larguras de blocos |
| \`rem\` | tamanho de fonte da raiz (\`html\`, 16px por padrão) | fontes, espaçamentos |
| \`em\` | tamanho de fonte do **próprio elemento** | espaçamento interno de botões |
| \`vw\` / \`vh\` | 1% da largura / altura da **tela** | títulos que crescem com a tela |

Por que \`rem\` em vez de \`px\` na fonte? Porque quem aumenta a fonte padrão do navegador (muita gente com a vista cansada faz isso) vê o site inteiro crescer junto. Com \`px\`, o seu site ignora essa preferência.`,
    },
    {
      kind: 'text',
      markdown: `## O contêiner que encolhe: \`max-width\` + \`margin: 0 auto\`

- \`width: 960px\` = **sempre** 960px. Num celular de 375px, estoura a tela.
- \`max-width: 960px\` = **no máximo** 960px. Em tela grande, fica com 960px; em tela pequena, encolhe junto.
- \`margin: 0 auto\` divide a sobra entre a esquerda e a direita: o bloco fica centralizado.

## Imagem fluida

Foto de celular tem 4000px de largura. Duas linhas resolvem:

\`\`\`css
img {
  max-width: 100%; /* nunca maior que o pai */
  height: auto;    /* a altura acompanha, sem achatar */
}
\`\`\`

## \`clamp(mínimo, ideal, máximo)\`

Para um título que cresce com a tela, mas sem exagero: \`font-size: clamp(1.5rem, 6vw, 3rem)\`. O navegador usa o valor **ideal** (6vw), mas nunca abaixo do **mínimo** nem acima do **máximo**. A ordem importa: mínimo primeiro, máximo por último.`,
    },
    {
      kind: 'example',
      language: 'css',
      code: `.pagina {
  max-width: 960px;  /* no máximo 960px... */
  margin: 0 auto;    /* ...e centralizada */
  padding: 0 1rem;   /* respiro nas bordas do celular */
}

img {
  max-width: 100%;
  height: auto;
}

h1 {
  /* 24px no celular, cresce com a tela, para em 48px */
  font-size: clamp(1.5rem, 6vw, 3rem);
}`,
      explanation:
        'Nenhuma media query: o mesmo CSS serve no celular e no monitor de 27". Num celular de 375px, 6vw dá 22,5px, abaixo do mínimo, então o título fica com 1.5rem (24px).',
    },
  ],
  checkQuestionIds: ['front.m03.q01'],
  exerciseIds: ['front.m03.e01'],
  debugExerciseIds: ['front.m03.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'front.m03.e01',
    lessonId: 'front.m03.l01',
    kind: 'implement',
    title: 'A vitrine da confeitaria',
    promptMarkdown: `A Dona Neide, da **Confeitaria Glacê Torto**, reclama de duas coisas: no computador o site fica grudado na esquerda, e no celular a foto do bolo "vaza" para fora da tela.

Ajuste o CSS:

1. a \`.pagina\` deve ter **no máximo** 960px e ficar **centralizada** (troque o \`width\` fixo);
2. a foto \`.destaque\` nunca pode ser mais larga que a página e deve manter a proporção.

Esta tela de teste tem 1280px, mas os testes também simulam um celular.`,
    language: 'web',
    viewport: { width: 1280, height: 800 },
    starterFiles: {
      html: VITRINE_HTML,
      css: `body {
  margin: 0;
  font-family: sans-serif;
}

.pagina {
  width: 960px;
  padding: 0 16px;
  box-sizing: border-box;
}
`,
      js: '',
    },
    solutionFiles: {
      html: VITRINE_HTML,
      css: `body {
  margin: 0;
  font-family: sans-serif;
}

.pagina {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
}

.destaque {
  max-width: 100%;
  height: auto;
}
`,
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'na tela grande, a página tem 960px e fica centralizada',
        code: `const p = box('.pagina');
assert.near(p.width, 960, 2, 'Em tela grande, a .pagina deveria ter 960px de largura.');
assert.near(p.centerX, viewport.width / 2, 2, 'A .pagina deveria estar centralizada (dica: margin: 0 auto).');`,
      },
      {
        description: 'a foto não passa da largura da página',
        code: `const p = box('.pagina');
const f = box('.destaque');
assert.ok(f.width <= p.width - 32 + 1, 'A foto tem ' + Math.round(f.width) + 'px e está vazando da página. Ela deveria ter no máximo a largura do conteúdo (' + (p.width - 32) + 'px).');`,
      },
      {
        description: 'a foto mantém a proporção (2 por 1)',
        code: `const f = box('.destaque');
assert.near(f.height, f.width / 2, 2, 'A foto está achatada: ela tem ' + Math.round(f.width) + 'px de largura e ' + Math.round(f.height) + 'px de altura. Use height: auto.');`,
      },
      {
        description: 'num celular de 375px, a página e a foto encolhem junto',
        code: `document.documentElement.style.width = '375px';
const p = box('.pagina');
const f = box('.destaque');
document.documentElement.style.width = '';
assert.ok(p.width <= 375 + 1, 'Numa tela de 375px a .pagina continua com ' + Math.round(p.width) + 'px. Com width fixo ela não encolhe: use max-width.');
assert.ok(f.width <= 375 - 32 + 1, 'Numa tela de 375px a foto ficou com ' + Math.round(f.width) + 'px e vaza da tela.');`,
      },
    ],
    hints: [
      'Troque `width: 960px` por `max-width: 960px` e acrescente `margin: 0 auto`.',
      'Para a foto: `.destaque { max-width: 100%; height: auto; }`.',
    ],
    followUpQuestionIds: ['front.m03.f01', 'front.m03.f02'],
    difficulty: 1,
  },
  {
    id: 'front.m03.d01',
    lessonId: 'front.m03.l01',
    kind: 'debug',
    title: 'O título gritando no celular',
    promptMarkdown: `O sobrinho da Dona Neide "deixou o título responsivo" com \`clamp()\`. O combinado era: no mínimo **1.5rem**, no máximo **3rem** e, no meio do caminho, \`8vw\`.

Só que no celular o título aparece **enorme**, sempre com 48px. Esta tela de teste é de celular (375 × 667): aqui, 8vw dá 30px, e é esse o tamanho esperado.`,
    language: 'web',
    viewport: { width: 375, height: 667 },
    starterFiles: {
      html: TITULO_HTML,
      css: `body {
  margin: 0;
  font-family: sans-serif;
}

.topo {
  padding: 1rem;
  background: #fce4ec;
}

.titulo {
  font-size: clamp(3rem, 8vw, 1.5rem);
  margin: 0;
}
`,
      js: '',
    },
    solutionFiles: {
      html: TITULO_HTML,
      css: `body {
  margin: 0;
  font-family: sans-serif;
}

.topo {
  padding: 1rem;
  background: #fce4ec;
}

.titulo {
  font-size: clamp(1.5rem, 8vw, 3rem);
  margin: 0;
}
`,
      js: '',
    },
    editableFiles: ['css'],
    tests: [
      {
        description: 'no celular de 375px, o título fica com 8vw (30px)',
        code: `const tamanho = parseFloat(style('.titulo').fontSize);
assert.near(tamanho, 30, 1, 'O título está com ' + tamanho + 'px; com 8vw numa tela de 375px deveria ter 30px.');`,
      },
      {
        description: 'o clamp() vai de 1.5rem (mínimo) a 3rem (máximo)',
        code: `const regra = ${ALL_RULES}.find((r) => r.selectorText === '.titulo');
assert.ok(regra && regra.style.fontSize.startsWith('clamp('), 'Mantenha o font-size do .titulo com clamp().');
const partes = regra.style.fontSize.slice(6, -1).split(',').map((p) => p.trim());
const emPx = (valor) => {
  const el = document.createElement('div');
  el.style.fontSize = valor;
  document.body.append(el);
  const px = parseFloat(getComputedStyle(el).fontSize);
  el.remove();
  return px;
};
assert.near(emPx(partes[0]), 24, 1, 'O primeiro valor do clamp() é o MÍNIMO; deveria ser 1.5rem (24px).');
assert.near(emPx(partes[2]), 48, 1, 'O último valor do clamp() é o MÁXIMO; deveria ser 3rem (48px).');`,
      },
    ],
    hints: [
      'A ordem do `clamp()` é sempre: mínimo, ideal, máximo.',
      'Se o mínimo for maior que o máximo, o mínimo vence sempre. Troque os dois de lugar.',
    ],
    followUpQuestionIds: ['front.m03.f03', 'front.m03.f04'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'front.m03.q01',
    lessonIds: ['front.m03.l01'],
    kind: 'multiple-choice',
    prompt: 'Qual a diferença entre `width: 960px` e `max-width: 960px`?',
    options: [
      'Nenhuma, são sinônimos.',
      '`width` fixa sempre 960px; `max-width` deixa o bloco encolher em telas menores, até no máximo 960px.',
      '`max-width` só funciona dentro de media query.',
      '`width` aceita só px; `max-width` aceita só %.',
    ],
    answerIndex: 1,
    explanation: 'Com `max-width`, 960px é o teto: num celular de 375px o bloco fica com 375px.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q02',
    lessonIds: ['front.m03.l01'],
    kind: 'multiple-choice',
    prompt: 'Com a fonte padrão do navegador (16px na raiz), quanto vale `1.5rem`?',
    options: ['15px', '16px', '24px', '1,5% da tela'],
    answerIndex: 2,
    explanation: '`rem` é relativo à fonte do `html`: 1.5 × 16px = 24px.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q03',
    lessonIds: ['front.m03.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para a imagem nunca ficar mais larga que o elemento pai:',
    code: 'img {\n  ___: 100%;\n  height: auto;\n}',
    acceptedAnswers: ['max-width'],
    explanation: '`max-width: 100%` limita a imagem à largura do pai; `height: auto` mantém a proporção.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q04',
    lessonIds: ['front.m03.l01'],
    kind: 'true-false',
    prompt: 'Num celular de 400px de largura, `50vw` vale 200px.',
    answer: true,
    explanation: '1vw é 1% da largura da tela: 50% de 400px = 200px.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q05',
    lessonIds: ['front.m03.l01'],
    kind: 'multiple-choice',
    prompt: 'Numa tela de 1000px, quanto vale `font-size: clamp(16px, 4vw, 32px)`?',
    options: ['16px', '32px', '40px', '4px'],
    answerIndex: 1,
    explanation: '4vw dá 40px, acima do máximo. O `clamp()` segura em 32px.',
    difficulty: 2,
  },
  {
    id: 'front.m03.q06',
    lessonIds: ['front.m03.l01'],
    kind: 'multiple-choice',
    prompt: 'Por que usar `rem` em vez de `px` no tamanho das fontes?',
    options: [
      'Porque `px` não funciona no celular.',
      'Porque o site respeita quem aumentou a fonte padrão do navegador.',
      'Porque `rem` deixa o site mais rápido.',
      'Porque o cliente pediu.',
    ],
    answerIndex: 1,
    explanation:
      '`rem` acompanha a fonte da raiz. Quem aumenta a fonte nas configurações vê o site crescer junto.',
    difficulty: 1,
  },
  {
    id: 'front.m03.q07',
    lessonIds: ['front.m03.l01'],
    kind: 'true-false',
    prompt:
      '`margin: 0 auto` centraliza na horizontal um bloco que tem largura (ou largura máxima) menor que a do pai.',
    answer: true,
    explanation: 'As margens automáticas dividem a sobra igualmente entre a esquerda e a direita.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f01',
    lessonIds: ['front.m03.l01'],
    exerciseId: 'front.m03.e01',
    kind: 'multiple-choice',
    prompt: 'Com a sua `.pagina`, que largura ela tem num monitor de 1920px?',
    options: ['1920px', '960px', '50% da tela', '1280px'],
    answerIndex: 1,
    explanation:
      'O `max-width: 960px` é o teto; a sobra vira margem dos dois lados, por causa do `margin: 0 auto`.',
    difficulty: 1,
  },
  {
    id: 'front.m03.f02',
    lessonIds: ['front.m03.l01'],
    exerciseId: 'front.m03.e01',
    kind: 'multiple-choice',
    prompt: 'Na sua solução, o que aconteceria com a foto se você tirasse o `height: auto`?',
    options: [
      'Nada, ela continuaria igual.',
      'Ela sumiria.',
      'Ela ficaria achatada: a largura encolhe, mas a altura continua 600px (do atributo `height`).',
      'Ela voltaria a vazar para fora da página.',
    ],
    answerIndex: 2,
    explanation: 'O atributo `height="600"` fixa a altura. `height: auto` faz a altura acompanhar a largura.',
    difficulty: 2,
  },
  {
    id: 'front.m03.f03',
    lessonIds: ['front.m03.l01'],
    exerciseId: 'front.m03.d01',
    kind: 'multiple-choice',
    prompt: 'Por que `clamp(3rem, 8vw, 1.5rem)` deixava o título sempre com 48px?',
    options: [
      'Porque `vw` não funciona em `font-size`.',
      'Porque o mínimo (3rem) era maior que o máximo (1.5rem), e nesse caso o mínimo sempre vence.',
      'Porque faltava `!important`.',
      'Porque o celular de teste era grande demais.',
    ],
    answerIndex: 1,
    explanation:
      'O `clamp()` nunca fica abaixo do mínimo. Com o mínimo em 48px, o título nunca fica menor que isso.',
    difficulty: 2,
  },
  {
    id: 'front.m03.f04',
    lessonIds: ['front.m03.l01'],
    exerciseId: 'front.m03.d01',
    kind: 'multiple-choice',
    prompt: 'Com o seu `clamp(1.5rem, 8vw, 3rem)`, que tamanho o título tem numa tela de 1280px?',
    options: ['24px', '30px', '48px', '102px'],
    answerIndex: 2,
    explanation: '8vw de 1280px dá 102,4px, acima do máximo: o título para em 3rem (48px).',
    difficulty: 2,
  },
];
