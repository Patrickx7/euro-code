import type { Exercise, Lesson, Question } from '../../../src/shared/content';

const FRETE_JS = `export const TAXA_MINIMA = 25;

export default function calcularFrete(km) {
  return km * 2;
}
`;

const MOEDA_JS = `export default function formatarReal(valor) {
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}
`;

export const lesson: Lesson = {
  id: 'back.m01.l03',
  moduleId: 'back.m01',
  order: 3,
  title: 'Módulos ES: import e export',
  concepts: ['ESM', 'export nomeado', 'export default', 'import', 'diferenças entre ESM e CommonJS'],
  sections: [
    {
      kind: 'text',
      markdown:
        'O `require` é do tempo em que o JavaScript não tinha módulos próprios. Hoje a linguagem tem um ' +
        'sistema oficial, os **módulos ES** (ESM, de ECMAScript Modules), que funciona no navegador e no ' +
        'Node. Projeto novo de cliente quase sempre vem assim.\n\n' +
        'Em vez de `module.exports`, você marca o que quer entregar com **`export`**:\n\n' +
        '```js\n// frete.js\nexport const TAXA_MINIMA = 25;\n\nexport function freteExpresso(km) {\n' +
        '  return km * 3;\n}\n```\n\n' +
        'E em vez de `require`, você usa **`import`**, no topo do arquivo, com chaves e os **nomes exatos** ' +
        'que foram exportados:\n\n' +
        "```js\n// cotacao.js\nimport { TAXA_MINIMA, freteExpresso } from './frete.js';\n\n" +
        'console.log(freteExpresso(10) + TAXA_MINIMA); // 55\n```\n\n' +
        'Repare no `./frete.js`: no ESM do Node, a **extensão `.js` é obrigatória** nos arquivos do projeto.',
    },
    {
      kind: 'text',
      markdown:
        '**`export default`: o "principal" do arquivo.** Cada arquivo pode ter **um** export default, ' +
        'além de quantos exports nomeados quiser. Na hora de importar, o default vem **sem chaves** e você ' +
        'escolhe o nome que quiser:\n\n' +
        '```js\n// moeda.js\nexport default function formatarReal(valor) { /* ... */ }\n\n' +
        "// recibo.js\nimport formatar from './moeda.js';       // default: qualquer nome\n" +
        "import calcularFrete, { TAXA_MINIMA } from './frete.js'; // default + nomeados\n```\n\n" +
        "O erro clássico é misturar os dois: `import { formatarReal } from './moeda.js'` procura um export " +
        '**nomeado** `formatarReal`, que não existe, porque a função foi exportada como default.\n\n' +
        'Também dá para trocar o nome de um export nomeado com `as`: `import { TAXA_MINIMA as minimo } ' +
        "from './frete.js';`.",
    },
    {
      kind: 'text',
      markdown:
        '**Como o Node sabe que é ESM?** Arquivos `.mjs` são sempre ESM; arquivos `.cjs` são sempre ' +
        'CommonJS. Para os `.js`, vale o `package.json` do projeto: com `"type": "module"` eles são ESM; ' +
        'sem isso, são CommonJS.\n\n' +
        '**O que muda no ESM:**\n\n' +
        '| | CommonJS | ESM |\n|---|---|---|\n' +
        '| Exportar | `module.exports = { a }` | `export const a = ...` / `export default` |\n' +
        "| Importar | `const { a } = require('./x')` | `import { a } from './x.js'` |\n" +
        '| Extensão no caminho | opcional | obrigatória |\n' +
        '| `require`, `module`, `__dirname` | existem | **não existem** |\n' +
        '| Modo estrito | só com `"use strict"` | sempre ligado |\n\n' +
        'Modo estrito sempre ligado quer dizer, por exemplo, que atribuir a uma variável nunca declarada ' +
        '(`total = 10` sem `let`/`const`) dá `ReferenceError` em vez de criar uma variável global escondida. ' +
        'E os `import` são lidos **antes** de o arquivo rodar: por isso ficam sempre no topo e com o caminho ' +
        'escrito direto, sem montar o texto em variável.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `export const VALOR_HORA = 90;

export default function orcamento(horas) {
  return horas * VALOR_HORA;
}

console.log(orcamento(2));`,
      explanation:
        'Um arquivo com um export nomeado (`VALOR_HORA`) e um export default (`orcamento`). Quem importar ' +
        "pode escrever `import orcamento, { VALOR_HORA } from './orcamento.js';`.",
    },
  ],
  checkQuestionIds: ['back.m01.q18', 'back.m01.q19'],
  exerciseIds: ['back.m01.e03'],
  debugExerciseIds: ['back.m01.d03'],
};

export const exercises: Exercise[] = [
  {
    id: 'back.m01.e03',
    lessonId: 'back.m01.l03',
    kind: 'implement',
    title: 'Cotação de frete com ESM',
    promptMarkdown:
      'A transportadora migrou o projeto para ESM. O arquivo `frete.js` (abaixo) já exporta ' +
      '`calcularFrete` como **default** e `TAXA_MINIMA` como export **nomeado**. Neste arquivo:\n\n' +
      '1. importe os dois de `./frete.js`;\n' +
      '2. crie e **exporte** (export nomeado) a função `cotacao(km)`, que devolve o frete calculado, mas ' +
      'nunca menos que a `TAXA_MINIMA` (cliente que mora do lado também paga a taxa mínima).\n\n' +
      '```js\n// frete.js\n' +
      FRETE_JS +
      '```',
    language: 'js',
    moduleSystem: 'esm',
    extraFiles: { 'frete.js': FRETE_JS },
    starterCode: `// importe de ./frete.js aqui

function cotacao(km) {
  // seu código aqui
}
`,
    solution: `import calcularFrete, { TAXA_MINIMA } from './frete.js';

export function cotacao(km) {
  const frete = calcularFrete(km);
  if (frete < TAXA_MINIMA) {
    return TAXA_MINIMA;
  }
  return frete;
}
`,
    tests: [
      {
        description: '30 km de frete custam 60',
        code: 'assert.strictEqual(cotacao(30), 60);',
      },
      {
        description: '5 km dariam 10, mas a taxa mínima é 25',
        code: 'assert.strictEqual(cotacao(5), 25);',
      },
      {
        description: 'a função cotacao é exportada',
        code: "assert.strictEqual(typeof exports.cotacao, 'function', 'Use export na frente da função cotacao.');",
      },
    ],
    hints: [
      "Default e nomeado na mesma linha: `import calcularFrete, { TAXA_MINIMA } from './frete.js';`.",
      'Calcule o frete e compare com a taxa mínima com `if` (ou use `Math.max`). Não esqueça do `export` antes de `function cotacao`.',
    ],
    followUpQuestionIds: ['back.m01.f09', 'back.m01.f10'],
    difficulty: 2,
  },
  {
    id: 'back.m01.d03',
    lessonId: 'back.m01.l03',
    kind: 'debug',
    title: 'O import trocado',
    promptMarkdown:
      'O recibo da transportadora parou de funcionar depois da migração para ESM: `formatarReal` chega ' +
      'como se não existisse. Olhe como `moeda.js` (abaixo) exporta a função e conserte o `import`.\n\n' +
      '```js\n// moeda.js\n' +
      MOEDA_JS +
      '```',
    language: 'js',
    moduleSystem: 'esm',
    extraFiles: { 'moeda.js': MOEDA_JS },
    starterCode: `import { formatarReal } from './moeda.js';

export function recibo(cliente, valor) {
  return cliente + ': ' + formatarReal(valor);
}
`,
    solution: `import formatarReal from './moeda.js';

export function recibo(cliente, valor) {
  return cliente + ': ' + formatarReal(valor);
}
`,
    tests: [
      {
        description: 'o recibo sai com o valor formatado',
        code: "assert.strictEqual(recibo('Mercadinho Bom Preço', 89.9), 'Mercadinho Bom Preço: R$ 89,90');",
      },
      {
        description: 'valores redondos ganham ,00',
        code: "assert.strictEqual(recibo('Seu Zé', 300), 'Seu Zé: R$ 300,00');",
      },
    ],
    hints: [
      'Com chaves, o `import` procura um export **nomeado**. Como `moeda.js` usa `export default`, o import vem sem chaves.',
    ],
    followUpQuestionIds: ['back.m01.f11', 'back.m01.f12'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'back.m01.q18',
    lessonIds: ['back.m01.l03'],
    kind: 'multiple-choice',
    prompt:
      'O arquivo `moeda.js` tem `export default function formatarReal(valor) { ... }`. Qual `import` funciona?',
    options: [
      "import formatarReal from './moeda.js';",
      "import { formatarReal } from './moeda.js';",
      "import default from './moeda.js';",
      "const formatarReal = import('./moeda');",
    ],
    answerIndex: 0,
    explanation: 'O export default é importado sem chaves. As chaves são só para exports nomeados.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q19',
    lessonIds: ['back.m01.l03'],
    kind: 'true-false',
    prompt: 'Num arquivo ESM, dá para continuar usando `require` e `module.exports` normalmente.',
    answer: false,
    explanation:
      'No ESM do Node, `require`, `module` e `__dirname` não existem. Lá se usa `import` e `export`.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q20',
    lessonIds: ['back.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Quantos `export default` um arquivo ESM pode ter?',
    options: ['No máximo um', 'Quantos quiser', 'Exatamente dois', 'Nenhum: default só existe no CommonJS'],
    answerIndex: 0,
    explanation: 'Um arquivo tem no máximo um export default, mas pode ter vários exports nomeados junto.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q21',
    lessonIds: ['back.m01.l03'],
    kind: 'fill-blank',
    prompt: "Complete para que `TAXA` possa ser importada com `import { TAXA } from './config.js';`.",
    code: `___ const TAXA = 15;`,
    acceptedAnswers: ['export'],
    explanation: '`export const TAXA = 15;` cria um export nomeado chamado `TAXA`.',
    difficulty: 1,
  },
  {
    id: 'back.m01.q22',
    lessonIds: ['back.m01.l03'],
    kind: 'multiple-choice',
    prompt:
      'Num projeto **sem** `"type": "module"` no `package.json`, como o Node trata `relatorio.mjs` e `relatorio.js`?',
    options: [
      '`.mjs` como ESM e `.js` como CommonJS',
      'Os dois como ESM',
      'Os dois como CommonJS',
      '`.mjs` como CommonJS e `.js` como ESM',
    ],
    answerIndex: 0,
    explanation:
      '`.mjs` é sempre ESM. Os `.js` seguem o `package.json`: sem `"type": "module"`, são CommonJS.',
    difficulty: 2,
  },
  {
    id: 'back.m01.q23',
    lessonIds: ['back.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Num arquivo ESM, o que acontece ao rodar `total = 10;` sem ter declarado `total` antes?',
    code: `export function fecharCaixa() {
  total = 10;
  return total;
}
fecharCaixa();`,
    options: [
      'Dá ReferenceError: total is not defined',
      'Cria uma variável global `total` sem reclamar',
      'A linha é ignorada e a função devolve undefined',
      'Dá erro só se `total` for usado em outro arquivo',
    ],
    answerIndex: 0,
    explanation:
      'Módulos ES rodam sempre em modo estrito, e o modo estrito proíbe criar variável sem `let`, `const` ou `var`.',
    difficulty: 2,
  },
  {
    id: 'back.m01.q24',
    lessonIds: ['back.m01.l03'],
    kind: 'true-false',
    prompt: "No ESM do Node, `import { frete } from './frete';` (sem `.js`) encontra o arquivo `frete.js`.",
    answer: false,
    explanation:
      'No ESM do Node a extensão é obrigatória nos arquivos do projeto: `./frete.js`. A extensão opcional é coisa do CommonJS.',
    difficulty: 2,
  },
  {
    id: 'back.m01.q25',
    lessonIds: ['back.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual destas linhas importa o export **nomeado** `TAXA_MINIMA` dando a ele o nome `minimo`?',
    options: [
      "import { TAXA_MINIMA as minimo } from './frete.js';",
      "import minimo from './frete.js';",
      "import { minimo = TAXA_MINIMA } from './frete.js';",
      "import TAXA_MINIMA as minimo from './frete.js';",
    ],
    answerIndex: 0,
    explanation:
      'Dentro das chaves, `as` troca o nome local de um export nomeado. Sem chaves você estaria pegando o default.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'back.m01.f09',
    lessonIds: ['back.m01.l03'],
    exerciseId: 'back.m01.e03',
    kind: 'multiple-choice',
    prompt: 'Com a sua `cotacao`, quanto custa um frete de 12 km?',
    options: ['25', '24', '49', '12'],
    answerIndex: 0,
    explanation: '12 km × 2 = 24, que é menor que a taxa mínima de 25. Então a cotação é 25.',
    difficulty: 2,
  },
  {
    id: 'back.m01.f10',
    lessonIds: ['back.m01.l03'],
    exerciseId: 'back.m01.e03',
    kind: 'multiple-choice',
    prompt:
      "No seu `import calcularFrete, { TAXA_MINIMA } from './frete.js';`, por que só `TAXA_MINIMA` está entre chaves?",
    options: [
      'Porque `TAXA_MINIMA` é um export nomeado e `calcularFrete` é o export default',
      'Porque constantes sempre vão entre chaves e funções não',
      'Porque `calcularFrete` é importado primeiro',
      'Tanto faz, as chaves são opcionais',
    ],
    answerIndex: 0,
    explanation:
      'O default vem sem chaves (e pode ter qualquer nome); os nomeados vêm entre chaves, com o nome exato.',
    difficulty: 1,
  },
  {
    id: 'back.m01.f11',
    lessonIds: ['back.m01.l03'],
    exerciseId: 'back.m01.d03',
    kind: 'fill-blank',
    prompt: 'Complete o import consertado.',
    code: `import ___ from './moeda.js';`,
    acceptedAnswers: ['formatarReal'],
    explanation: 'Sem chaves, porque `formatarReal` é o export default de `moeda.js`.',
    difficulty: 1,
  },
  {
    id: 'back.m01.f12',
    lessonIds: ['back.m01.l03'],
    exerciseId: 'back.m01.d03',
    kind: 'true-false',
    prompt:
      "Depois do conserto, se você escrevesse `import formatar from './moeda.js';` (outro nome) e usasse `formatar(valor)`, o recibo também funcionaria.",
    answer: true,
    explanation:
      'O nome do export default é escolhido por quem importa. Só os nomeados precisam do nome exato.',
    difficulty: 2,
  },
];
