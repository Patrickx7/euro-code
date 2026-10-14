# Conteúdo didático

Cada módulo do currículo é uma pasta `content/<trilha>/<mNN-slug>/` com um `index.ts` que exporta por
padrão um `ContentModule` (contrato em `src/shared/content.ts`). O jogo e o validador descobrem as
pastas sozinhos; não há lista central para editar, então sessões diferentes podem escrever módulos
diferentes ao mesmo tempo sem conflito.

```
content/
  core/                 ← estagiário: HTML, CSS e JS (todo mundo faz)
    m01-html-basico/
      index.ts          ← export default { id: 'core.m01', track: 'core', order: 1, seniority: 'estagiario', ... }
      l01-tags.ts
      l02-...
  front/                ← júnior que escolheu front-end
  back/                 ← júnior que escolheu back-end (Node.js)
  typescript/           ← pleno
  fullstack/            ← sênior em diante
```

A `order` é contada **dentro da trilha** (`front.m01` e `back.m01` têm os dois `order: 1`).

Divida o módulo em um arquivo por lição (cada um exportando a lição, seus exercícios e suas perguntas)
e junte tudo no `index.ts`.

## Regras (checadas por `npm run validate:content`)

| Item            | Regra                                                                                                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ids             | Únicos no currículo inteiro. Módulo `core.m01`; lição `core.m01.l01`; job `core.m01.j01`; exercícios e perguntas começam com o id do módulo (`core.m01.e01`, `core.m01.q01`).                            |
| Lição           | Pelo menos 1 seção `text`, 1 exercício, 1 exercício de depuração, 1 pergunta de checagem e 6 perguntas gerais (sem `exerciseId`).                                                                        |
| Exercício       | `solution` passa em todos os testes; `starterCode` falha em pelo menos um; pelo menos 1 teste, 1 dica e 2 perguntas de acompanhamento.                                                                   |
| Depuração       | `kind: 'debug'`; o `starterCode` é o código com defeito, a `solution` é o código consertado.                                                                                                             |
| Acompanhamento  | Pergunta com `exerciseId`, listada em `followUpQuestionIds` do exercício. São feitas na blitz logo depois que o jogador resolve o exercício: pergunte sobre **o código que ele acabou de escrever**.     |
| Perguntas       | `lessonIds` só cita o que o jogador já estudou: mesma trilha com ordem menor ou igual, ou trilha pré-requisito (`TRACK_PREREQUISITES`). Front e back não citam um ao outro; só o fullstack cita os dois. |
| Jobs            | Pagamento e SLA positivos, pelo menos 1 task (`taskExerciseIds`), falas de chegada e de entrega no chat, senioridade igual ou acima da do módulo. Tasks e imprevistos seguem a mesma regra de trilha.    |
| Exercício web   | `solutionFiles` passa e `starterFiles` falha **no Chromium de verdade**; pelo menos 1 arquivo em `editableFiles`.                                                                                        |
| "Qual a saída?" | `expectedOutput` é conferido no simulador **e no Node real**; os dois precisam bater.                                                                                                                    |

Valide só o seu módulo enquanto escreve: `npm run validate:content -- core.m03`.

## Jobs

Cada módulo tem jobs (`jobs: JobTemplate[]`, contrato em `src/shared/jobs.ts`): um cliente fictício
pede tasks que são exercícios do próprio módulo (ou de módulos já estudados). O tom é de freela real:
cliente apressado, escopo que cresce, pagamento baixo no começo da carreira.

```ts
{
  id: 'core.m03.j01',
  moduleId: 'core.m03',
  title: 'Centralizar o banner da padaria',
  briefMarkdown: 'O banner de promoção está grudado no canto. O Seu Zé quer "bem no meio".',
  client: { name: 'Padaria Pão de Ontem', contact: 'Seu Zé', place: 'client-office', area: 'Centro, Osasco' },
  seniority: 'estagiario',
  pay: 35,
  slaMinutes: 45,                       // minutos de jogo, da chegada até a entrega
  taskExerciseIds: ['core.m03.e01'],
  twists: [
    {
      afterTask: 0,                     // depois da 1ª task
      message: 'Ficou ótimo! Só muda a cor do botão pra combinar com o pão? É rapidinho.',
      extraExerciseId: 'core.m02.e03',
      extraPay: 0,
      extraSlaMinutes: 10,
    },
  ],
  chat: {
    arrival: ['Bom dia! Senta aí, o wi-fi é "paodeontem123".'],
    delivery: ['Valeu, filho! Leva um sonho pra viagem.'],
  },
}
```

## Exercícios web (HTML, CSS e DOM)

Use `language: 'web'` para tudo que precisa de navegador. Em vez de `starterCode`/`solution`, o
exercício tem `starterFiles` e `solutionFiles` (`{ html, css, js }`; o `html` é o conteúdo do
`<body>`), `editableFiles` (as abas que o jogador pode mexer) e, se precisar, `viewport` (padrão
800 × 600). O validador abre a página no Chromium e roda cada teste **dentro dela**, com:

- `assert` (o mesmo do simulador) e `assert.near(atual, esperado, tolerância = 2)` para medidas;
- `document`, `window` e `viewport` (`{ width, height }`);
- `box(seletor)`: retângulo do elemento na tela (`left`, `top`, `width`, `height`, `centerX`, `centerY`...);
- `style(seletor)`: estilo computado (`style('.btn').backgroundColor`);
- `click(seletor)` e `wait(ms)`; o teste pode usar `await`.

Se o JavaScript da página der erro, todos os testes falham com a mensagem do erro.

```ts
{
  id: 'core.m03.e01',
  lessonId: 'core.m03.l01',
  kind: 'implement',
  title: 'Centralize a div',
  promptMarkdown: 'Deixe a `.caixa` no centro da tela, na horizontal e na vertical.',
  language: 'web',
  starterFiles: { html: '<div class="caixa">Promoção!</div>', css: '.caixa { width: 200px; }', js: '' },
  solutionFiles: {
    html: '<div class="caixa">Promoção!</div>',
    css: 'body { margin: 0; height: 100vh; display: flex; align-items: center; justify-content: center; }\n.caixa { width: 200px; }',
    js: '',
  },
  editableFiles: ['css'],
  tests: [
    {
      description: 'a caixa está no centro da tela',
      code: "const b = box('.caixa');\nassert.near(b.centerX, viewport.width / 2);\nassert.near(b.centerY, viewport.height / 2);",
    },
  ],
  hints: ['Transforme o `body` num contêiner flex com a altura da tela.'],
  followUpQuestionIds: ['core.m03.f01', 'core.m03.f02'],
  difficulty: 1,
}
```

## Como os testes de JS/TS rodam

O código do jogador e o `code` de cada teste rodam juntos, no mesmo escopo, num ambiente que imita o
Node (`src/edu/runner/`). No teste estão disponíveis:

- `assert`: subconjunto de `node:assert/strict` (`strictEqual`, `deepStrictEqual`, `ok`, `throws`,
  `rejects`, `match`...), com mensagens em português;
- `__logs` e `__errors`: linhas que o código escreveu no stdout e no stderr;
- `require`, `process`, timers e as funções/variáveis do jogador;
- `await`, para testar código assíncrono. Se o código do jogador usa `setTimeout`, espere no teste:
  `await new Promise((r) => setTimeout(r, 50));`.

Módulos disponíveis no simulador: `fs` (em memória; use `fsSeed` para criar arquivos), `fs/promises`,
`path`, `events`, `assert` e `assert/strict`, também com o prefixo `node:`. Arquivos extras do
"projeto" vão em `extraFiles` e são carregados com `require('./nome')` ou `import`.

Em exercícios TypeScript, os tipos são checados de verdade (modo `strict`). Para exigir que um uso
errado **não compile**, use `// @ts-expect-error` no teste.

## Limitações do simulador (evite em perguntas "qual a saída?")

- `console.log` de objetos grandes, que o Node quebraria em várias linhas ou colunas;
- `console.log` de um `Error` (o Node imprime a pilha de chamadas);
- ordem entre `process.nextTick` e Promises, e entre `setImmediate` e `setTimeout(..., 0)`;
- estado de uma `Promise` impressa com `console.log` (sempre aparece `<pending>`);
- `readFileSync` sem encoding devolve texto, não `Buffer`.

O validador compara com o Node real e acusa quando a saída diverge.

## Exemplo mínimo de uma lição

```ts
import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'core.m05.l01',
  moduleId: 'core.m05',
  order: 1,
  title: 'Funções: a calculadora do orçamento',
  concepts: ['declaração de função', 'parâmetros', 'return'],
  sections: [
    { kind: 'text', markdown: 'Uma **função** é um bloco de código com nome que você pode reutilizar...' },
    {
      kind: 'example',
      language: 'js',
      code: 'function orcamento(horas) {\n  return horas * 45;\n}\nconsole.log(orcamento(2));',
      explanation: 'O valor depois de `return` é o resultado da função.',
    },
  ],
  checkQuestionIds: ['core.m05.q01'],
  exerciseIds: ['core.m05.e01'],
  debugExerciseIds: ['core.m05.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'core.m05.e01',
    lessonId: 'core.m05.l01',
    kind: 'implement',
    title: 'Preço do deslocamento',
    promptMarkdown: 'Crie a função `precoDeslocamento(km)` que cobra R$ 4,50 por km rodado até o cliente.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: 'function precoDeslocamento(km) {\n  // seu código aqui\n}\n',
    solution: 'function precoDeslocamento(km) {\n  return km * 4.5;\n}\n',
    tests: [
      { description: '20 km custam R$ 90', code: 'assert.strictEqual(precoDeslocamento(20), 90);' },
      { description: '0 km custa R$ 0', code: 'assert.strictEqual(precoDeslocamento(0), 0);' },
    ],
    hints: ['Multiplique os km pelo preço por km e use `return`.'],
    followUpQuestionIds: ['core.m05.f01', 'core.m05.f02'],
    difficulty: 1,
  },
  // ...exercício de depuração core.m05.d01
];

export const questions: Question[] = [
  {
    id: 'core.m05.q01',
    lessonIds: ['core.m05.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: 'function dobro(n) {\n  n * 2;\n}\nconsole.log(dobro(4));',
    expectedOutput: 'undefined',
    explanation: 'Sem `return`, a função devolve `undefined`.',
    difficulty: 1,
  },
  {
    id: 'core.m05.f01',
    lessonIds: ['core.m05.l01'],
    exerciseId: 'core.m05.e01',
    kind: 'multiple-choice',
    prompt: 'Na sua função `precoDeslocamento`, quanto custa um deslocamento de 10 km?',
    options: ['R$ 45', 'R$ 4,50', 'R$ 14,50'],
    answerIndex: 0,
    explanation: '10 × 4,5 = 45.',
    difficulty: 1,
  },
  // ...
];
```
