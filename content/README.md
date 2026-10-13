# Conteúdo didático

Cada módulo do currículo é uma pasta `content/<trilha>/<mNN-slug>/` com um `index.ts` que exporta por
padrão um `ContentModule` (contrato em `src/shared/content.ts`). O jogo e o validador descobrem as
pastas sozinhos; não há lista central para editar, então sessões diferentes podem escrever módulos
diferentes ao mesmo tempo sem conflito.

```
content/
  node/
    m01-primeiros-passos/
      index.ts        ← export default { id: 'node.m01', ... }
      l01-o-que-e-node.ts
      l02-...
  typescript/
    m09-por-que-typescript/
      index.ts
```

Divida o módulo em um arquivo por lição (cada um exportando a lição, seus exercícios e suas perguntas)
e junte tudo no `index.ts`.

## Regras (checadas por `npm run validate:content`)

| Item            | Regra                                                                                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ids             | Únicos no currículo inteiro. Módulo `node.m01`; lição `node.m01.l01`; exercícios, perguntas etc. começam com o id do módulo (`node.m01.e01`, `node.m01.q01`).                                        |
| Lição           | Pelo menos 1 seção `text`, 1 exercício, 1 exercício de depuração, 1 pergunta de checagem e 6 perguntas gerais (sem `exerciseId`).                                                                    |
| Exercício       | `solution` passa em todos os testes; `starterCode` falha em pelo menos um; pelo menos 1 teste, 1 dica e 2 perguntas de acompanhamento.                                                               |
| Depuração       | `kind: 'debug'`; o `starterCode` é o código com defeito, a `solution` é o código consertado.                                                                                                         |
| Acompanhamento  | Pergunta com `exerciseId`, listada em `followUpQuestionIds` do exercício. São feitas na blitz logo depois que o jogador resolve o exercício: pergunte sobre **o código que ele acabou de escrever**. |
| Perguntas       | `lessonIds` só pode citar lições do mesmo módulo ou de módulos anteriores.                                                                                                                           |
| "Qual a saída?" | `expectedOutput` é conferido no simulador **e no Node real**; os dois precisam bater.                                                                                                                |

Valide só o seu módulo enquanto escreve: `npm run validate:content -- node.m03`.

## Como os testes rodam

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
  id: 'node.m03.l01',
  moduleId: 'node.m03',
  order: 1,
  title: 'Funções: a calculadora do frete',
  concepts: ['declaração de função', 'parâmetros', 'return'],
  sections: [
    { kind: 'text', markdown: 'Uma **função** é um bloco de código com nome que você pode reutilizar...' },
    {
      kind: 'example',
      language: 'js',
      code: 'function frete(km) {\n  return km * 4.5;\n}\nconsole.log(frete(20));',
      explanation: 'O valor depois de `return` é o resultado da função.',
    },
  ],
  checkQuestionIds: ['node.m03.q01'],
  exerciseIds: ['node.m03.e01'],
  debugExerciseIds: ['node.m03.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'node.m03.e01',
    lessonId: 'node.m03.l01',
    kind: 'implement',
    title: 'Preço do frete',
    promptMarkdown: 'Crie a função `precoFrete(km)` que cobra R$ 4,50 por km.',
    language: 'js',
    moduleSystem: 'commonjs',
    starterCode: 'function precoFrete(km) {\n  // seu código aqui\n}\n',
    solution: 'function precoFrete(km) {\n  return km * 4.5;\n}\n',
    tests: [
      { description: '20 km custam R$ 90', code: 'assert.strictEqual(precoFrete(20), 90);' },
      { description: '0 km custa R$ 0', code: 'assert.strictEqual(precoFrete(0), 0);' },
    ],
    hints: ['Multiplique os km pelo preço por km e use `return`.'],
    followUpQuestionIds: ['node.m03.f01', 'node.m03.f02'],
    difficulty: 1,
  },
  // ...exercício de depuração node.m03.d01
];

export const questions: Question[] = [
  {
    id: 'node.m03.q01',
    lessonIds: ['node.m03.l01'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: 'function dobro(n) {\n  n * 2;\n}\nconsole.log(dobro(4));',
    expectedOutput: 'undefined',
    explanation: 'Sem `return`, a função devolve `undefined`.',
    difficulty: 1,
  },
  {
    id: 'node.m03.f01',
    lessonIds: ['node.m03.l01'],
    exerciseId: 'node.m03.e01',
    kind: 'multiple-choice',
    prompt: 'Na sua função `precoFrete`, quanto custa um frete de 10 km?',
    options: ['R$ 45', 'R$ 4,50', 'R$ 14,50'],
    answerIndex: 0,
    explanation: '10 × 4,5 = 45.',
    difficulty: 1,
  },
  // ...
];
```
