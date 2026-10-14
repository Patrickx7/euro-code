import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m03.l04',
  moduleId: 'typescript.m03',
  order: 4,
  title: 'Tipos utilitários: DTOs sem copiar e colar',
  concepts: [
    'Partial e Required',
    'Readonly',
    'Pick e Omit',
    'Record',
    'ReturnType e Parameters',
    'NonNullable e Awaited',
    'DTOs de criar e de atualizar',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Numa API de cadastro, o mesmo "produto" aparece com formatos diferentes:\n\n' +
        '- o **produto salvo** tem tudo: `id`, `nome`, `preco`, `estoque`, `criadoEm`;\n' +
        '- o **formulário de criação** não manda `id` nem `criadoEm` (quem gera é o servidor);\n' +
        '- a **atualização** pode mandar só um ou outro campo.\n\n' +
        'Esses formatos de entrada e saída se chamam **DTOs** (_data transfer objects_). O primo resolveria ' +
        'com três tipos copiados e colados, que desencontram na primeira mudança. O TypeScript traz ' +
        '**tipos utilitários**: genéricos prontos que transformam um tipo em outro.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type Produto = { id: number; nome: string; preco: number; estoque: number; criadoEm: string };

type NovoProduto = Omit<Produto, 'id' | 'criadoEm'>;
// { nome: string; preco: number; estoque: number }

type AtualizarProduto = Partial<NovoProduto>;
// { nome?: string; preco?: number; estoque?: number }

type ResumoProduto = Pick<Produto, 'id' | 'nome'>;
// { id: number; nome: string }

const mudanca: AtualizarProduto = { preco: 249 }; // ok: tudo é opcional
// const novo: NovoProduto = { nome: 'Serra', preco: 300 }; // erro: falta estoque`,
      explanation:
        'Se amanhã o `Produto` ganhar um campo `marca`, os três DTOs ganham junto. Uma fonte só de verdade.',
    },
    {
      kind: 'text',
      markdown:
        'Os mais usados:\n\n' +
        '| Utilitário | O que faz |\n| --- | --- |\n' +
        '| `Partial<T>` | todas as propriedades viram opcionais |\n' +
        '| `Required<T>` | todas viram obrigatórias (tira os `?`) |\n' +
        '| `Readonly<T>` | todas viram somente leitura |\n' +
        '| `Pick<T, K>` | fica só com as chaves `K` |\n' +
        '| `Omit<T, K>` | tira as chaves `K` |\n' +
        '| `Record<K, V>` | objeto com chaves `K` e valores `V` |\n' +
        '| `NonNullable<T>` | tira `null` e `undefined` da união |\n' +
        '| `ReturnType<F>` | o tipo que a função `F` devolve |\n' +
        '| `Parameters<F>` | os parâmetros de `F`, como tupla |\n' +
        '| `Awaited<T>` | o que sai de um `await` (desembrulha a `Promise`) |\n\n' +
        "**`Record`** brilha com uniões de literais: `Record<'aberto' | 'pago', number>` exige **as duas** " +
        'chaves. Esqueceu uma? Erro de compilação. Já `Record<string, number>` aceita qualquer chave, e ' +
        'aí `contagem.pgao` (com erro de digitação) passa batido.\n\n' +
        '**`ReturnType` e `Parameters`** recebem o **tipo** de uma função, então você usa `typeof`: ' +
        '`ReturnType<typeof calcularFrete>`. Ótimo para tipar o que sai de uma função de biblioteca que não ' +
        'exportou o tipo.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `async function buscarCliente(id: number) {
  return { id, nome: 'Açaí Congela Cérebro', bairro: 'Granja Viana' };
}

type Retorno = ReturnType<typeof buscarCliente>; // Promise<{ id: number; nome: string; bairro: string }>
type Cliente = Awaited<Retorno>; // { id: number; nome: string; bairro: string }
type Args = Parameters<typeof buscarCliente>; // [id: number]

type Status = 'aberto' | 'pago' | 'cancelado';
const contagem: Record<Status, number> = { aberto: 2, pago: 5, cancelado: 0 };

type Talvez = string | null | undefined;
type Certeza = NonNullable<Talvez>; // string`,
      explanation:
        '`Awaited` desembrulha a `Promise` que a função `async` devolve. Juntos, dão o tipo do cliente sem escrevê-lo de novo.',
    },
  ],
  checkQuestionIds: ['typescript.m03.q25'],
  exerciseIds: ['typescript.m03.e07', 'typescript.m03.e08'],
  debugExerciseIds: ['typescript.m03.d04'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m03.e07',
    lessonId: 'typescript.m03.l04',
    kind: 'implement',
    title: 'DTOs do cadastro de produtos',
    promptMarkdown:
      'O Pet Shop Late Mas Não Morde está montando a API de produtos. O tipo `Produto` já existe. Faça:\n\n' +
      '1. `NovoProduto`: o `Produto` **sem** `id` e `criadoEm` (use `Omit`);\n' +
      '2. `AtualizarProduto`: o `NovoProduto` com tudo opcional (use `Partial`);\n' +
      '3. `criarProduto(dados: NovoProduto, id: number, agora: string): Produto`: junta os dados com o id ' +
      'e a data;\n' +
      '4. `atualizarProduto(produto: Produto, mudancas: AtualizarProduto): Produto`: devolve uma **cópia** ' +
      'com as mudanças aplicadas, sem alterar o original.\n\n' +
      'O `id` e o `criadoEm` nunca podem vir do formulário.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Produto = { id: number; nome: string; preco: number; estoque: number; criadoEm: string };

type NovoProduto = Produto;
type AtualizarProduto = Produto;

function criarProduto(dados: NovoProduto, id: number, agora: string): Produto {
  return { ...dados, id, criadoEm: agora };
}

function atualizarProduto(produto: Produto, mudancas: AtualizarProduto): Produto {
  return Object.assign(produto, mudancas);
}
`,
    solution: `type Produto = { id: number; nome: string; preco: number; estoque: number; criadoEm: string };

type NovoProduto = Omit<Produto, 'id' | 'criadoEm'>;
type AtualizarProduto = Partial<NovoProduto>;

function criarProduto(dados: NovoProduto, id: number, agora: string): Produto {
  return { ...dados, id, criadoEm: agora };
}

function atualizarProduto(produto: Produto, mudancas: AtualizarProduto): Produto {
  return { ...produto, ...mudancas };
}
`,
    tests: [
      {
        description: 'criarProduto recebe só os dados do formulário',
        code: `const p = criarProduto({ nome: 'Ração 15 kg', preco: 189, estoque: 12 }, 1, '2026-10-14');
assert.deepStrictEqual(p, { nome: 'Ração 15 kg', preco: 189, estoque: 12, id: 1, criadoEm: '2026-10-14' });`,
      },
      {
        description: 'atualizarProduto aceita só alguns campos e não altera o original',
        code: `const p: Produto = { id: 1, nome: 'Ração 15 kg', preco: 189, estoque: 12, criadoEm: '2026-10-14' };
const novo = atualizarProduto(p, { preco: 169 });
assert.strictEqual(novo.preco, 169);
assert.strictEqual(novo.nome, 'Ração 15 kg');
assert.strictEqual(p.preco, 189, 'O produto original foi alterado.');`,
      },
      {
        description: 'id e criadoEm não podem vir do formulário',
        code: `// @ts-expect-error o id é gerado pelo servidor
const n: NovoProduto = { id: 9, nome: 'Coleira', preco: 35, estoque: 3 };
const p: Produto = { id: 1, nome: 'Ração 15 kg', preco: 189, estoque: 12, criadoEm: '2026-10-14' };
const usarErrado = () => {
  // @ts-expect-error não dá para mudar o id numa atualização
  atualizarProduto(p, { id: 99 });
};
assert.strictEqual(typeof usarErrado, 'function');
assert.ok(n);`,
      },
      {
        description: 'para criar, os campos do formulário são obrigatórios',
        code: `// @ts-expect-error falta o estoque
const faltando: NovoProduto = { nome: 'Coleira', preco: 35 };
const ok: AtualizarProduto = {};
assert.ok(faltando);
assert.deepStrictEqual(ok, {});`,
      },
    ],
    hints: [
      "`type NovoProduto = Omit<Produto, 'id' | 'criadoEm'>;` e `type AtualizarProduto = Partial<NovoProduto>;`.",
      '`Object.assign(produto, ...)` altera o primeiro argumento. Para copiar, use spread: `{ ...produto, ...mudancas }`.',
    ],
    followUpQuestionIds: ['typescript.m03.f19', 'typescript.m03.f20'],
    difficulty: 2,
  },
  {
    id: 'typescript.m03.e08',
    lessonId: 'typescript.m03.l04',
    kind: 'implement',
    title: 'Contagem de pedidos com Record',
    promptMarkdown:
      'O painel do pet shop mostra quantos pedidos há em cada status. Crie `contarPorStatus(pedidos)`, que ' +
      'devolve um `Record<Status, number>`: um objeto com **todas** as chaves de `Status`, inclusive as que ' +
      'têm zero.\n\n' +
      'Exemplo: dois pedidos `pago` e um `aberto` dão `{ aberto: 1, pago: 2, cancelado: 0 }`.\n\n' +
      'Com o `Record<string, number>` do código inicial, o status sem pedido some do painel e ' +
      '`contagem.pgao` (erro de digitação) compila. Não deixe.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Status = 'aberto' | 'pago' | 'cancelado';
type Pedido = { id: number; status: Status };

function contarPorStatus(pedidos: Pedido[]): Record<string, number> {
  const contagem: Record<string, number> = {};
  for (const p of pedidos) {
    contagem[p.status] = (contagem[p.status] ?? 0) + 1;
  }
  return contagem;
}
`,
    solution: `type Status = 'aberto' | 'pago' | 'cancelado';
type Pedido = { id: number; status: Status };

function contarPorStatus(pedidos: Pedido[]): Record<Status, number> {
  const contagem: Record<Status, number> = { aberto: 0, pago: 0, cancelado: 0 };
  for (const p of pedidos) {
    contagem[p.status]++;
  }
  return contagem;
}
`,
    tests: [
      {
        description: 'conta os pedidos de cada status, incluindo os zerados',
        code: `const r = contarPorStatus([
  { id: 1, status: 'pago' },
  { id: 2, status: 'aberto' },
  { id: 3, status: 'pago' },
]);
assert.deepStrictEqual(r, { aberto: 1, pago: 2, cancelado: 0 });`,
      },
      {
        description: 'sem pedidos, tudo zerado',
        code: `assert.deepStrictEqual(contarPorStatus([]), { aberto: 0, pago: 0, cancelado: 0 });`,
      },
      {
        description: 'o retorno só tem as chaves de Status',
        code: `const r = contarPorStatus([{ id: 1, status: 'cancelado' }]);
const cancelados: number = r.cancelado;
assert.strictEqual(cancelados, 1);
const usarErrado = () => {
  // @ts-expect-error erro de digitação no status
  return r.pgao;
};
assert.strictEqual(typeof usarErrado, 'function');`,
      },
    ],
    hints: [
      'Troque o tipo de retorno para `Record<Status, number>`.',
      'Comece com todas as chaves zeradas: `{ aberto: 0, pago: 0, cancelado: 0 }`. O próprio `Record<Status, number>` reclama se faltar alguma.',
    ],
    followUpQuestionIds: ['typescript.m03.f21', 'typescript.m03.f22'],
    difficulty: 2,
  },
  {
    id: 'typescript.m03.d04',
    lessonId: 'typescript.m03.l04',
    kind: 'debug',
    title: 'O usuário público que só tinha a senha',
    promptMarkdown:
      'A rota `GET /usuarios/:id` deveria devolver o usuário **sem** o `senhaHash`. O primo declarou o tipo ' +
      '`UsuarioPublico` com o utilitário errado e o código nem compila. Conserte o tipo (a função já está ' +
      'certa).',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Usuario = { id: string; nome: string; email: string; senhaHash: string };

// Dados públicos: tudo menos a senha
type UsuarioPublico = Pick<Usuario, 'senhaHash'>;

function paraPublico(usuario: Usuario): UsuarioPublico {
  const { senhaHash, ...resto } = usuario;
  return resto;
}
`,
    solution: `type Usuario = { id: string; nome: string; email: string; senhaHash: string };

// Dados públicos: tudo menos a senha
type UsuarioPublico = Omit<Usuario, 'senhaHash'>;

function paraPublico(usuario: Usuario): UsuarioPublico {
  const { senhaHash, ...resto } = usuario;
  return resto;
}
`,
    tests: [
      {
        description: 'devolve o usuário sem a senha',
        code: `const u = { id: 'u1', nome: 'Dona Cida', email: 'cida@petlate.test', senhaHash: 'x9f8' };
assert.deepStrictEqual(paraPublico(u), { id: 'u1', nome: 'Dona Cida', email: 'cida@petlate.test' });`,
      },
      {
        description: 'o tipo público tem nome e email, mas não senhaHash',
        code: `const u = { id: 'u1', nome: 'Dona Cida', email: 'cida@petlate.test', senhaHash: 'x9f8' };
const publico = paraPublico(u);
const nome: string = publico.nome;
assert.strictEqual(nome, 'Dona Cida');
const usarErrado = () => {
  // @ts-expect-error a senha não faz parte do tipo público
  return publico.senhaHash;
};
assert.strictEqual(typeof usarErrado, 'function');`,
      },
    ],
    hints: [
      '`Pick` **fica** só com as chaves listadas. Aqui a ideia é **tirar** uma chave.',
      "Use `Omit<Usuario, 'senhaHash'>`.",
    ],
    followUpQuestionIds: ['typescript.m03.f23', 'typescript.m03.f24'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'typescript.m03.q25',
    lessonIds: ['typescript.m03.l04'],
    kind: 'multiple-choice',
    prompt:
      'Qual utilitário transforma `{ nome: string; preco: number }` em `{ nome?: string; preco?: number }`?',
    options: ['Partial', 'Required', 'Readonly', 'Pick'],
    answerIndex: 0,
    explanation: '`Partial<T>` deixa todas as propriedades opcionais: perfeito para um "atualizar".',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q26',
    lessonIds: ['typescript.m03.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para que o tipo tenha tudo do `Cliente` menos o `id`.',
    code: "type NovoCliente = ___<Cliente, 'id'>;",
    acceptedAnswers: ['Omit'],
    explanation: '`Omit<T, K>` tira as chaves `K`. O contrário, `Pick`, fica só com elas.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q27',
    lessonIds: ['typescript.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'Este código compila?',
    code: `type Status = 'aberto' | 'pago' | 'cancelado';
const cores: Record<Status, string> = { aberto: 'amarelo', pago: 'verde' };`,
    options: [
      'Não: falta a chave `cancelado`',
      'Sim: `Record` deixa as chaves opcionais',
      'Sim: chaves que faltam viram `undefined`',
      'Não: `Record` só aceita chaves `string`',
    ],
    answerIndex: 0,
    explanation:
      'Com uma união de literais, `Record<Status, string>` exige **todas** as chaves. Para deixar opcional, seria `Partial<Record<Status, string>>`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q28',
    lessonIds: ['typescript.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual o tipo `T`?',
    code: `function calcularFrete(km: number, urgente: boolean) {
  return { valor: km * 2.5, urgente };
}
type T = ReturnType<typeof calcularFrete>;`,
    options: [
      '{ valor: number; urgente: boolean }',
      '[km: number, urgente: boolean]',
      'number',
      'typeof calcularFrete',
    ],
    answerIndex: 0,
    explanation:
      '`ReturnType` pega o tipo do retorno. A tupla dos parâmetros seria `Parameters<typeof calcularFrete>`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q29',
    lessonIds: ['typescript.m03.l04'],
    kind: 'true-false',
    prompt:
      '`ReturnType<calcularFrete>` (sem `typeof`) compila, se `calcularFrete` for uma função declarada no código.',
    answer: false,
    explanation:
      '`calcularFrete` é um **valor**. Os utilitários recebem **tipos**, então o certo é `ReturnType<typeof calcularFrete>`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q30',
    lessonIds: ['typescript.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual o tipo `C`?',
    code: 'type C = Awaited<Promise<string[]>>;',
    options: ['string[]', 'Promise<string[]>', 'string', 'unknown'],
    answerIndex: 0,
    explanation: '`Awaited` dá o que sai de um `await`: desembrulha a `Promise`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q31',
    lessonIds: ['typescript.m03.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual o tipo `N`?',
    code: 'type N = NonNullable<string | number | null | undefined>;',
    options: ['string | number', 'string', 'never', 'string | number | null'],
    answerIndex: 0,
    explanation: '`NonNullable` tira `null` e `undefined` da união e deixa o resto.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q32',
    lessonIds: ['typescript.m03.l04'],
    kind: 'predict-output',
    prompt:
      'Um `Readonly<Produto>` só existe para o compilador. Este é o JavaScript que sobra depois de compilado. O que ele imprime?',
    code: `const produto = { nome: 'Coleira', preco: 35 };
produto.preco = 29;
console.log(produto.preco);`,
    expectedOutput: '29',
    explanation:
      'Em TypeScript, com `Readonly<Produto>`, a linha `produto.preco = 29` não compilaria. Mas os tipos somem no JavaScript: nada impede a mudança em tempo de execução.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m03.f19',
    lessonIds: ['typescript.m03.l04'],
    exerciseId: 'typescript.m03.e07',
    kind: 'multiple-choice',
    prompt: 'No seu `AtualizarProduto = Partial<NovoProduto>`, qual destes valores é válido?',
    options: ['{ estoque: 0 }', '{ id: 3 }', "{ criadoEm: '2026-10-14' }", "{ preco: '169' }"],
    answerIndex: 0,
    explanation:
      'Tudo do `NovoProduto` é opcional, então só `estoque` basta. `id` e `criadoEm` foram tirados pelo `Omit`, e `preco` precisa ser `number`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.f20',
    lessonIds: ['typescript.m03.l04'],
    exerciseId: 'typescript.m03.e07',
    kind: 'true-false',
    prompt:
      'Se o `Produto` ganhar um campo `marca: string`, o seu `NovoProduto` passa a exigir `marca` sem você mexer nele.',
    answer: true,
    explanation: 'O `Omit` é calculado a partir do `Produto`: muda um, muda o outro.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f21',
    lessonIds: ['typescript.m03.l04'],
    exerciseId: 'typescript.m03.e08',
    kind: 'multiple-choice',
    prompt: 'Por que a sua `contarPorStatus` começa com `{ aberto: 0, pago: 0, cancelado: 0 }`?',
    options: [
      'Porque `Record<Status, number>` exige todas as chaves, e o painel precisa mostrar os zerados',
      'Porque objetos vazios não podem receber propriedades',
      'Porque `++` não funciona em objetos',
      'Para o código rodar mais rápido',
    ],
    answerIndex: 0,
    explanation: 'Um `{}` não é um `Record<Status, number>` válido: faltariam as chaves.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f22',
    lessonIds: ['typescript.m03.l04'],
    exerciseId: 'typescript.m03.e08',
    kind: 'true-false',
    prompt: 'Com o retorno `Record<string, number>` do código inicial, `contarPorStatus([]).pgao` compilava.',
    answer: true,
    explanation:
      'Com chave `string`, qualquer nome é aceito. Com `Record<Status, number>`, só os três status.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f23',
    lessonIds: ['typescript.m03.l04'],
    exerciseId: 'typescript.m03.d04',
    kind: 'multiple-choice',
    prompt: "No código original, o que era `Pick<Usuario, 'senhaHash'>`?",
    options: [
      '`{ senhaHash: string }`: só a senha, o contrário do que se queria',
      '`{ id: string; nome: string; email: string }`',
      'O usuário inteiro',
      'Um erro: `Pick` não aceita uma chave só',
    ],
    answerIndex: 0,
    explanation: '`Pick` fica só com as chaves listadas. Por isso o `resto` (sem a senha) não cabia no tipo.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f24',
    lessonIds: ['typescript.m03.l04'],
    exerciseId: 'typescript.m03.d04',
    kind: 'fill-blank',
    prompt: 'Complete o tipo consertado.',
    code: "type UsuarioPublico = ___<Usuario, 'senhaHash'>;",
    acceptedAnswers: ['Omit'],
    explanation: '`Omit` tira a chave da senha e mantém o resto.',
    difficulty: 1,
  },
];
