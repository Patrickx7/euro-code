import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m01.l04',
  moduleId: 'typescript.m01',
  order: 4,
  title: 'Objetos com type: o formato do pedido',
  concepts: [
    'tipo de objeto',
    'alias com type',
    'propriedades opcionais (?)',
    'readonly',
    'checagem de propriedades a mais',
    'Record<string, number>',
    'arrays de objetos',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Objetos têm um tipo que lista cada propriedade e o tipo dela: `{ nome: string; valor: number }`. ' +
        'Para não repetir isso em todo lugar, dê um **nome** ao tipo com `type`:\n\n' +
        '```ts\ntype Pedido = {\n  id: number;\n  cliente: string;\n  valor: number;\n  observacao?: string;\n};\n```\n\n' +
        '- **`?`** marca uma propriedade **opcional**: o objeto pode não ter `observacao`, e o tipo dela vira ' +
        '`string | undefined`.\n' +
        '- Faltar uma propriedade obrigatória é erro.\n' +
        '- Num objeto literal, uma propriedade **que não existe no tipo** também é erro. Isso pega erro de ' +
        'digitação, como `valr: 30`.\n\n' +
        'O `type` só existe para o compilador: no JavaScript que roda, ele desaparece.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type Pedido = {
  id: number;
  cliente: string;
  valor: number;
  observacao?: string;
};

const p1: Pedido = { id: 1, cliente: 'Dona Cida', valor: 45 }; // ok, observacao é opcional
const p2: Pedido = { id: 2, cliente: 'Seu Jorge' };
// ❌ Property 'valor' is missing in type ...
const p3: Pedido = { id: 3, cliente: 'Bia', valr: 30 };
// ❌ Object literal may only specify known properties, and 'valr' does not exist in type 'Pedido'.

function totalDosPedidos(pedidos: Pedido[]): number {
  let total = 0;
  for (const p of pedidos) total += p.valor; // autocompletar mostra id, cliente, valor, observacao
  return total;
}`,
      explanation: '`Pedido[]` é um array de pedidos, do mesmo jeito que `number[]` é um array de números.',
    },
    {
      kind: 'text',
      markdown:
        '**`readonly`** marca uma propriedade que não pode ser reatribuída depois de criada, como o CNPJ de um ' +
        'cliente. Não confunda com `const`: `const` trava a **variável**; `readonly` trava a **propriedade**. E, ' +
        'como todo tipo, só vale na compilação: o objeto não é congelado ao rodar. Para "mudar" um objeto ' +
        'com `readonly`, crie um novo com spread: `{ ...cliente, nome: novoNome }`.\n\n' +
        'Quando as **chaves não são conhecidas** de antemão (um total por bairro, um estoque por produto), use ' +
        'um tipo de índice: `Record<string, number>` é "um objeto com chaves de texto e valores numéricos". É ' +
        'o mesmo que `{ [chave: string]: number }`.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type Cliente = {
  readonly cnpj: string;
  nome: string;
};

const cliente: Cliente = { cnpj: '12.345.678/0001-90', nome: 'Gráfica Tinta Fresca' };
cliente.nome = 'Gráfica Tinta Seca'; // ok
cliente.cnpj = '00.000.000/0001-00';
// ❌ Cannot assign to 'cnpj' because it is a read-only property.

const corridasPorBairro: Record<string, number> = {};
corridasPorBairro['Vila Yara'] = 3;
corridasPorBairro['Km 18'] = 1;
corridasPorBairro['Centro'] = 'duas';
// ❌ Type 'string' is not assignable to type 'number'.`,
      explanation: 'No `Record`, qualquer chave de texto vale, mas o valor tem que ser número.',
    },
  ],
  checkQuestionIds: ['typescript.m01.q25'],
  exerciseIds: ['typescript.m01.e06', 'typescript.m01.e07'],
  debugExerciseIds: ['typescript.m01.d04'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m01.e06',
    lessonId: 'typescript.m01.l04',
    kind: 'implement',
    title: 'Total de entregas por bairro',
    promptMarkdown:
      'A transportadora quer saber quanto faturou em cada bairro. Faça duas coisas:\n\n' +
      '1. Complete o `type Entrega`: `id` (número), `bairro` (texto), `valor` (número) e `observacao` ' +
      '(texto, **opcional**).\n' +
      '2. Implemente `totalPorBairro(entregas)`, que devolve um `Record<string, number>` com a soma dos ' +
      'valores de cada bairro.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Entrega = {
  id: number;
  // complete: bairro, valor e observacao (opcional)
};

function totalPorBairro(entregas: Entrega[]): Record<string, number> {
  const totais: Record<string, number> = {};
  // some o valor de cada entrega no bairro dela
  return totais;
}
`,
    solution: `type Entrega = {
  id: number;
  bairro: string;
  valor: number;
  observacao?: string;
};

function totalPorBairro(entregas: Entrega[]): Record<string, number> {
  const totais: Record<string, number> = {};
  for (const entrega of entregas) {
    totais[entrega.bairro] = (totais[entrega.bairro] || 0) + entrega.valor;
  }
  return totais;
}
`,
    tests: [
      {
        description: 'soma por bairro',
        code: `const entregas: Entrega[] = [
  { id: 1, bairro: 'Centro', valor: 20 },
  { id: 2, bairro: 'Vila Yara', valor: 40, observacao: 'interfone quebrado' },
  { id: 3, bairro: 'Centro', valor: 15 },
];
assert.deepStrictEqual(totalPorBairro(entregas), { Centro: 35, 'Vila Yara': 40 });`,
      },
      {
        description: 'sem entregas: objeto vazio',
        code: 'assert.deepStrictEqual(totalPorBairro([]), {});',
      },
      {
        description: 'observacao é opcional',
        code: `const semObs: Entrega = { id: 4, bairro: 'Km 18', valor: 10 };
const comObs: Entrega = { id: 5, bairro: 'Km 18', valor: 12, observacao: 'deixar na portaria' };
assert.deepStrictEqual(totalPorBairro([semObs, comObs]), { 'Km 18': 22 });`,
      },
      {
        description: 'entrega sem valor não compila',
        code: `const usoErrado = () => {
  // @ts-expect-error
  const semValor: Entrega = { id: 6, bairro: 'Centro' };
};`,
      },
      {
        description: 'valor em texto não compila',
        code: `const usoErrado = () => {
  // @ts-expect-error
  totalPorBairro([{ id: 7, bairro: 'Centro', valor: '20' }]);
};`,
      },
    ],
    hints: [
      'No `type`, cada linha é `nome: tipo;`. A opcional leva `?`: `observacao?: string;`.',
      'Para somar: `totais[entrega.bairro] = (totais[entrega.bairro] || 0) + entrega.valor;`.',
    ],
    followUpQuestionIds: ['typescript.m01.f17', 'typescript.m01.f18'],
    difficulty: 2,
  },
  {
    id: 'typescript.m01.e07',
    lessonId: 'typescript.m01.l04',
    kind: 'implement',
    title: 'O CNPJ que mudou sozinho',
    promptMarkdown:
      'Em produção, uma tela de "editar nome" alterou o objeto original do cliente e, de quebra, o CNPJ. ' +
      'Ninguém sabe como. Blinde o código:\n\n' +
      '1. Marque `cnpj` como `readonly` no `type Cliente`.\n' +
      '2. Faça `atualizarNome(cliente, nome)` devolver um **novo** objeto com o nome trocado, sem mexer ' +
      'no original.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Cliente = {
  cnpj: string;
  nome: string;
  telefone?: string;
};

function atualizarNome(cliente: Cliente, nome: string): Cliente {
  cliente.nome = nome;
  return cliente;
}
`,
    solution: `type Cliente = {
  readonly cnpj: string;
  nome: string;
  telefone?: string;
};

function atualizarNome(cliente: Cliente, nome: string): Cliente {
  return { ...cliente, nome };
}
`,
    tests: [
      {
        description: 'devolve o cliente com o nome novo e o mesmo CNPJ',
        code: `const antigo: Cliente = { cnpj: '12.345.678/0001-90', nome: 'Gráfica Tinta Fresca', telefone: '11 4000-0000' };
const novo = atualizarNome(antigo, 'Gráfica Tinta Seca');
assert.deepStrictEqual(novo, { cnpj: '12.345.678/0001-90', nome: 'Gráfica Tinta Seca', telefone: '11 4000-0000' });`,
      },
      {
        description: 'não altera o objeto original',
        code: `const antigo: Cliente = { cnpj: '98.765.432/0001-10', nome: 'Pet Shop Au Au Miau' };
const novo = atualizarNome(antigo, 'Pet Shop Miau Au Au');
assert.notStrictEqual(novo, antigo, 'Devolva um objeto novo, não o mesmo.');
assert.strictEqual(antigo.nome, 'Pet Shop Au Au Miau');`,
      },
      {
        description: 'cnpj não pode ser reatribuído',
        code: `const usoErrado = (c: Cliente) => {
  // @ts-expect-error
  c.cnpj = '00.000.000/0001-00';
};`,
      },
      {
        description: 'nome continua editável',
        code: `const editar = (c: Cliente) => {
  c.nome = 'Outro nome';
};
const c: Cliente = { cnpj: '1', nome: 'X' };
editar(c);
assert.strictEqual(c.nome, 'Outro nome');`,
      },
    ],
    hints: [
      '`readonly` vem antes do nome da propriedade: `readonly cnpj: string;`.',
      'Um objeto novo com tudo do antigo e o nome trocado: `return { ...cliente, nome };`.',
    ],
    followUpQuestionIds: ['typescript.m01.f19', 'typescript.m01.f20'],
    difficulty: 2,
  },
  {
    id: 'typescript.m01.d04',
    lessonId: 'typescript.m01.l04',
    kind: 'debug',
    title: 'O pastel que sumiu do cardápio',
    promptMarkdown:
      'O pastel de queijo tem 12 no estoque, mas não aparece no cardápio do app. O `type Produto` até ' +
      'existe, mas o código usa `any[]` e o TypeScript não consegue ajudar.\n\n' +
      'Use `Produto` no lugar dos `any`, deixe o TS apontar o problema e conserte. `disponiveis(cardapio)` ' +
      "deve devolver `['Coxinha', 'Pastel de queijo']`.",
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Produto = {
  nome: string;
  preco: number;
  estoque: number;
};

const cardapio: any[] = [
  { nome: 'Coxinha', preco: 7, estoque: 30 },
  { nome: 'Pastel de queijo', preco: 9, estoqe: 12 },
  { nome: 'Kibe', preco: 6, estoque: 0 },
];

function disponiveis(produtos: any[]): string[] {
  return produtos.filter((p) => p.estoque > 0).map((p) => p.nome);
}
`,
    solution: `type Produto = {
  nome: string;
  preco: number;
  estoque: number;
};

const cardapio: Produto[] = [
  { nome: 'Coxinha', preco: 7, estoque: 30 },
  { nome: 'Pastel de queijo', preco: 9, estoque: 12 },
  { nome: 'Kibe', preco: 6, estoque: 0 },
];

function disponiveis(produtos: Produto[]): string[] {
  return produtos.filter((p) => p.estoque > 0).map((p) => p.nome);
}
`,
    tests: [
      {
        description: 'coxinha e pastel estão disponíveis',
        code: "assert.deepStrictEqual(disponiveis(cardapio), ['Coxinha', 'Pastel de queijo']);",
      },
      {
        description: 'disponiveis só aceita produtos completos',
        code: `const usoErrado = () => {
  // @ts-expect-error
  disponiveis([{ nome: 'Esfiha', preco: 5 }]);
};`,
      },
      {
        description: 'o cardápio é uma lista de Produto',
        code: `const usoErrado = () => {
  // @ts-expect-error
  return cardapio[0].sabor;
};`,
      },
    ],
    hints: [
      'Troque `any[]` por `Produto[]` na variável e no parâmetro.',
      'O TS vai sublinhar uma propriedade que não existe em `Produto`. Leia com calma o nome dela.',
    ],
    followUpQuestionIds: ['typescript.m01.f21', 'typescript.m01.f22'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'typescript.m01.q25',
    lessonIds: ['typescript.m01.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual destes objetos pode ser guardado numa variável do tipo `Pedido`?',
    code: `type Pedido = {
  id: number;
  valor: number;
  observacao?: string;
};`,
    options: [
      '{ id: 1, valor: 30 }',
      '{ id: 1 }',
      "{ id: 1, valor: '30' }",
      "{ id: 1, valor: 30, obs: 'sem cebola' }",
    ],
    answerIndex: 0,
    explanation:
      '`observacao` é opcional, então pode faltar. `valor` é obrigatório e numérico, e `obs` não existe no tipo.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q26',
    lessonIds: ['typescript.m01.l04'],
    kind: 'true-false',
    prompt:
      '`readonly` impede reatribuir a propriedade na compilação, mas não congela o objeto quando o código roda.',
    answer: true,
    explanation: 'Como todo tipo, `readonly` some no JavaScript. Quem garante é o compilador.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.q27',
    lessonIds: ['typescript.m01.l04'],
    kind: 'multiple-choice',
    prompt: '`Record<string, number>` descreve o mesmo que:',
    options: [
      '{ [chave: string]: number }',
      '[string, number]',
      'string | number',
      '{ chave: string; valor: number }',
    ],
    answerIndex: 0,
    explanation: 'Os dois são objetos com qualquer chave de texto e valores numéricos.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.q28',
    lessonIds: ['typescript.m01.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para que `telefone` seja opcional.',
    code: `type Cliente = {
  nome: string;
  telefone___: string;
};`,
    acceptedAnswers: ['?'],
    explanation: 'O `?` depois do nome torna a propriedade opcional: `telefone?: string`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q29',
    lessonIds: ['typescript.m01.l04'],
    kind: 'multiple-choice',
    prompt: 'Este código compila?',
    code: `type Produto = { nome: string; preco: number };
const p: Produto = { nome: 'Coxinha', preco: 7, sabor: 'frango' };`,
    options: [
      'Não: `sabor` não existe no tipo `Produto`',
      'Sim: propriedade a mais nunca é problema',
      'Não: falta `readonly`',
      'Sim, mas `sabor` vira `any`',
    ],
    answerIndex: 0,
    explanation:
      'Em objetos literais, o TS barra propriedades que o tipo não conhece. É isso que pega erro de digitação.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q30',
    lessonIds: ['typescript.m01.l04'],
    kind: 'predict-output',
    prompt: 'O spread cria um objeto novo. O que este código imprime?',
    code: `const original = { nome: 'Dona Cida', bairro: 'Centro' };
const atualizado = { ...original, bairro: 'Vila Yara' };
console.log(original.bairro);
console.log(atualizado.bairro);
console.log(original === atualizado);`,
    expectedOutput: 'Centro\nVila Yara\nfalse',
    explanation:
      'O original fica intacto; o novo objeto copia tudo e sobrescreve `bairro`. É assim que se "edita" algo `readonly`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.q31',
    lessonIds: ['typescript.m01.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual a diferença entre `const` e `readonly`?',
    options: [
      '`const` impede reatribuir a variável; `readonly` impede reatribuir uma propriedade do objeto',
      'Nenhuma, são sinônimos',
      '`readonly` congela o objeto ao rodar; `const` não',
      '`const` só vale para números',
    ],
    answerIndex: 0,
    explanation:
      'Com `const pedido = {...}`, `pedido.valor = 10` ainda é permitido. Só `readonly valor` barra essa linha.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.q32',
    lessonIds: ['typescript.m01.l04'],
    kind: 'true-false',
    prompt: 'Um `type Pedido = { ... }` não gera nenhum código no JavaScript que roda.',
    answer: true,
    explanation: 'Tipos só existem para o compilador. Depois da compilação, sobra só o JavaScript.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m01.f17',
    lessonIds: ['typescript.m01.l04'],
    exerciseId: 'typescript.m01.e06',
    kind: 'multiple-choice',
    prompt: 'No seu `type Entrega`, o que o `?` em `observacao` permite?',
    options: [
      'Criar entregas sem a propriedade `observacao`',
      'Que `observacao` seja um número',
      'Que a entrega não tenha `bairro`',
      'Nada, é só decoração',
    ],
    answerIndex: 0,
    explanation: 'A propriedade opcional pode faltar; quando existe, tem que ser `string`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f18',
    lessonIds: ['typescript.m01.l04'],
    exerciseId: 'typescript.m01.e06',
    kind: 'multiple-choice',
    prompt: 'Com duas entregas no Centro, de R$ 20 e R$ 15, o que a sua `totalPorBairro` devolve?',
    options: ['{ Centro: 35 }', '{ Centro: 20 }', '{ Centro: [20, 15] }', '35'],
    answerIndex: 0,
    explanation: 'Cada bairro vira uma chave do `Record`, com a soma dos valores: 20 + 15 = 35.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f19',
    lessonIds: ['typescript.m01.l04'],
    exerciseId: 'typescript.m01.e07',
    kind: 'true-false',
    prompt: 'Com o seu `readonly cnpj`, a linha `return { ...cliente, nome };` continua compilando.',
    answer: true,
    explanation:
      '`readonly` impede **reatribuir** a propriedade. Criar um objeto novo, copiando o CNPJ, é permitido.',
    difficulty: 2,
  },
  {
    id: 'typescript.m01.f20',
    lessonIds: ['typescript.m01.l04'],
    exerciseId: 'typescript.m01.e07',
    kind: 'multiple-choice',
    prompt: "Depois de `const novo = atualizarNome(antigo, 'Novo Nome')`, quanto vale `antigo.nome`?",
    options: [
      'O nome antigo: a função não mexe no original',
      "'Novo Nome'",
      'undefined',
      'Dá erro, `antigo` foi apagado',
    ],
    answerIndex: 0,
    explanation: 'O spread cria outro objeto. O original fica como estava, e o bug da tela de edição some.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f21',
    lessonIds: ['typescript.m01.l04'],
    exerciseId: 'typescript.m01.d04',
    kind: 'multiple-choice',
    prompt: 'Que problema o TypeScript apontou quando você trocou `any[]` por `Produto[]`?',
    options: [
      '`estoqe` não existe no tipo `Produto` (e faltava `estoque`)',
      '`preco` deveria ser texto',
      'O Kibe tem estoque 0',
      '`filter` não existe em arrays',
    ],
    answerIndex: 0,
    explanation:
      'Um erro de digitação: o pastel tinha `estoqe`. Ao rodar, `p.estoque` era `undefined`, e `undefined > 0` é `false`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m01.f22',
    lessonIds: ['typescript.m01.l04'],
    exerciseId: 'typescript.m01.d04',
    kind: 'true-false',
    prompt: 'Com `cardapio: any[]`, o TypeScript teria achado o `estoqe` sozinho.',
    answer: false,
    explanation: 'Com `any`, o TS aceita qualquer propriedade. Foi o tipo `Produto` que revelou o erro.',
    difficulty: 1,
  },
];
