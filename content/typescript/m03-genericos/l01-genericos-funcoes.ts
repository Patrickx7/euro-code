import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m03.l01',
  moduleId: 'typescript.m03',
  order: 1,
  title: 'Genéricos em funções: um código, vários tipos',
  concepts: [
    'parâmetro de tipo <T>',
    'inferência do T',
    'T explícito na chamada',
    'vários parâmetros de tipo',
    'restrição com extends',
    'genérico vs any vs unknown',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Você abre a "biblioteca interna" que o primo do cliente escreveu e encontra `primeiroCliente`, ' +
        '`primeiroProduto`, `primeiroPedido`... a mesma função copiada três vezes, só mudando o tipo. A ' +
        'outra saída que ele achou foi pior: `function primeiro(lista: any[]): any`. Funciona, mas o ' +
        '`any` **desliga** o TypeScript: tudo que sai dali pode ser usado de qualquer jeito, e o erro só ' +
        'aparece em produção.\n\n' +
        'O **genérico** resolve os dois problemas. Você declara um **parâmetro de tipo** entre `<` e `>`, ' +
        'como se fosse um parâmetro comum, só que de tipo:\n\n' +
        '```ts\nfunction primeiro<T>(lista: T[]): T | undefined {\n  return lista[0];\n}\n```\n\n' +
        'Leia assim: "para qualquer tipo `T`, recebo uma lista de `T` e devolvo um `T` (ou `undefined`, se ' +
        'a lista estiver vazia)". O `T` liga a entrada à saída: o que entra é o que sai.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `function primeiro<T>(lista: T[]): T | undefined {
  return lista[0];
}

const bairro = primeiro(['Vila Yara', 'Km 18']); // string | undefined
const nota = primeiro([9.5, 7]); // number | undefined
const vazio = primeiro<string>([]); // T explícito: string | undefined

bairro?.toUpperCase(); // ok: é string
// nota?.toUpperCase(); // erro: number não tem toUpperCase`,
      explanation:
        'Quase sempre o TypeScript **infere** o `T` olhando os argumentos. Só escreva `primeiro<string>(...)` quando não há de onde inferir (como numa lista vazia).',
    },
    {
      kind: 'text',
      markdown:
        '**Vários parâmetros de tipo.** Uma função pode ter quantos precisar: `function par<A, B>(a: A, b: B): [A, B]`. ' +
        'Os nomes `T`, `U`, `K`, `V` são só convenção; `TItem` ou `Pedido` também valem.\n\n' +
        '**Restrições com `extends`.** Às vezes a função precisa de _alguma coisa_ do tipo. Para buscar por ' +
        'id, o item precisa ter `id`. Sem restrição, `item.id` não compila, porque `T` pode ser qualquer ' +
        'coisa (até `number`). A solução é restringir:\n\n' +
        '```ts\nfunction buscarPorId<T extends { id: string }>(lista: T[], id: string): T | undefined {\n' +
        '  return lista.find((item) => item.id === id);\n}\n```\n\n' +
        '`T extends { id: string }` quer dizer "`T` é qualquer tipo **que tenha pelo menos** `id: string`". ' +
        'E o melhor: o resultado continua sendo o `T` inteiro (`Cliente`, `Pedido`...), com todos os campos.\n\n' +
        '**Armadilha:** escrever `function buscarPorId(lista: { id: string }[], ...): { id: string }` parece ' +
        'igual, mas **perde** o tipo: o que volta só tem `id`, e `achado.nome` vira erro. A restrição vai no ' +
        '`T`, não no lugar do `T`.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type Cliente = { id: string; nome: string; bairro: string };

function buscarPorId<T extends { id: string }>(lista: T[], id: string): T | undefined {
  return lista.find((item) => item.id === id);
}

const clientes: Cliente[] = [
  { id: 'c1', nome: 'Pastelaria do Tio', bairro: 'Centro' },
  { id: 'c2', nome: 'Oficina Graxa Fina', bairro: 'Km 18' },
];

const achado = buscarPorId(clientes, 'c2'); // Cliente | undefined
console.log(achado?.nome); // ok: o T é Cliente, com nome e bairro

// buscarPorId([1, 2, 3], 'c1'); // erro: number não tem id`,
      explanation:
        'A restrição diz o mínimo que o tipo precisa ter; o genérico guarda todo o resto. É isso que separa um genérico de um parâmetro tipado "no grosso".',
    },
    {
      kind: 'text',
      markdown:
        '**Genérico, `any` ou `unknown`?**\n\n' +
        '- `any`: aceita tudo e libera tudo. O TypeScript para de ajudar.\n' +
        '- `unknown`: aceita tudo, mas não deixa usar nada sem checar antes (narrowing).\n' +
        '- genérico `T`: aceita tudo **e lembra** o que entrou, para devolver o mesmo tipo.\n\n' +
        'Regra de bolso: se o tipo da saída depende do tipo da entrada, é caso de genérico.',
    },
  ],
  checkQuestionIds: ['typescript.m03.q01'],
  exerciseIds: ['typescript.m03.e01', 'typescript.m03.e02'],
  debugExerciseIds: ['typescript.m03.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m03.e01',
    lessonId: 'typescript.m03.l01',
    kind: 'implement',
    title: 'Aposentando o any da biblioteca do primo',
    promptMarkdown:
      'A Distribuidora Parafuso Solto usa uma "biblioteca interna" que o primo do dono escreveu. As funções ' +
      '`primeiro` e `ultimo` recebem e devolvem `any`, e o sistema vive dando `undefined is not a function`.\n\n' +
      'Reescreva as duas como **genéricas**:\n\n' +
      '- `primeiro(lista)` devolve o primeiro item da lista;\n' +
      '- `ultimo(lista)` devolve o último item;\n' +
      '- as duas devolvem `undefined` se a lista estiver vazia, e o tipo de retorno precisa dizer isso: ' +
      'para uma lista de `string`, o resultado é `string | undefined`.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `// Biblioteca interna escrita pelo primo do dono. "Funciona na minha máquina."
function primeiro(lista: any[]): any {
  return lista[0];
}

function ultimo(lista: any[]): any {
  return lista[lista.length - 1];
}
`,
    solution: `function primeiro<T>(lista: T[]): T | undefined {
  return lista[0];
}

function ultimo<T>(lista: T[]): T | undefined {
  return lista[lista.length - 1];
}
`,
    tests: [
      {
        description: 'primeiro devolve o primeiro item (ou undefined)',
        code: `assert.strictEqual(primeiro([10, 20, 30]), 10);
assert.strictEqual(primeiro(['Centro', 'Vila Yara']), 'Centro');
assert.strictEqual(primeiro([]), undefined);`,
      },
      {
        description: 'ultimo devolve o último item (ou undefined)',
        code: `assert.strictEqual(ultimo(['Vila Yara', 'Km 18', 'Quitaúna']), 'Quitaúna');
assert.strictEqual(ultimo([]), undefined);`,
      },
      {
        description: 'o tipo do item é preservado (nada de any)',
        code: `const bairro: string | undefined = primeiro(['Centro', 'Jardim Bussocaba']);
const nota: number | undefined = ultimo([7, 9.5]);
assert.strictEqual(bairro, 'Centro');
assert.strictEqual(nota, 9.5);
// @ts-expect-error uma lista de string não devolve number
const errado: number | undefined = primeiro(['Centro']);
// @ts-expect-error uma lista de number não devolve string
const errado2: string | undefined = ultimo([1, 2]);`,
      },
      {
        description: 'o retorno avisa que pode ser undefined',
        code: `// @ts-expect-error a lista pode estar vazia, então o resultado pode ser undefined
const certeza: string = primeiro(['Centro']);`,
      },
    ],
    hints: [
      'Declare o parâmetro de tipo logo depois do nome: `function primeiro<T>(lista: T[])`.',
      'O retorno é `T | undefined`: o mesmo tipo dos itens, ou `undefined` para lista vazia.',
    ],
    followUpQuestionIds: ['typescript.m03.f01', 'typescript.m03.f02'],
    difficulty: 1,
  },
  {
    id: 'typescript.m03.e02',
    lessonId: 'typescript.m03.l01',
    kind: 'implement',
    title: 'O produto mais caro, de qualquer catálogo',
    promptMarkdown:
      'A Distribuidora tem catálogos diferentes (parafusos, ferramentas, tintas), cada um com seu tipo, mas ' +
      'todos com um campo `preco: number`.\n\n' +
      'Crie a função genérica `maisCaro(itens)` que devolve o item de **maior preço** (ou `undefined` se a ' +
      'lista estiver vazia). Regras de tipo:\n\n' +
      '- só pode receber listas de itens que tenham `preco: number` (use uma **restrição** com `extends`);\n' +
      '- o retorno é o **tipo completo** do item: se entrou uma lista de `Ferramenta`, sai uma ' +
      '`Ferramenta | undefined`, com `nome`, `voltagem` e tudo mais.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `function maisCaro<T>(itens: T[]): T | undefined {
  // seu código aqui
  return undefined;
}
`,
    solution: `function maisCaro<T extends { preco: number }>(itens: T[]): T | undefined {
  let melhor: T | undefined = undefined;
  for (const item of itens) {
    if (melhor === undefined || item.preco > melhor.preco) melhor = item;
  }
  return melhor;
}
`,
    tests: [
      {
        description: 'devolve o item de maior preço',
        code: `const parafusos = [
  { nome: 'Sextavado', preco: 0.5 },
  { nome: 'Francês', preco: 1.2 },
  { nome: 'Philips', preco: 0.8 },
];
assert.strictEqual(maisCaro(parafusos)?.nome, 'Francês');`,
      },
      {
        description: 'lista vazia devolve undefined',
        code: `assert.strictEqual(maisCaro([]), undefined);`,
      },
      {
        description: 'o resultado mantém todos os campos do item',
        code: `type Ferramenta = { nome: string; preco: number; voltagem: 127 | 220 };
const ferramentas: Ferramenta[] = [
  { nome: 'Furadeira', preco: 289, voltagem: 220 },
  { nome: 'Lixadeira', preco: 199, voltagem: 127 },
];
const top = maisCaro(ferramentas);
const voltagem: 127 | 220 | undefined = top?.voltagem;
assert.strictEqual(voltagem, 220);`,
      },
      {
        description: 'itens sem preço numérico não compilam',
        code: `const usarErrado = () => {
  // @ts-expect-error não tem preco
  maisCaro([{ nome: 'Brinde' }]);
  // @ts-expect-error preco precisa ser number
  maisCaro([{ nome: 'Tinta', preco: 'R$ 80' }]);
};
assert.strictEqual(typeof usarErrado, 'function');`,
      },
    ],
    hints: [
      'Restrinja o T: `function maisCaro<T extends { preco: number }>(itens: T[]): T | undefined`.',
      'Guarde o melhor até agora numa variável `let melhor: T | undefined` e percorra a lista comparando `item.preco`.',
    ],
    followUpQuestionIds: ['typescript.m03.f03', 'typescript.m03.f04'],
    difficulty: 2,
  },
  {
    id: 'typescript.m03.d01',
    lessonId: 'typescript.m03.l01',
    kind: 'debug',
    title: 'O pedido que perdeu o total',
    promptMarkdown:
      'A função `removerPorId` tira um item da lista pelo `id`. Ela "funciona", mas quem usa reclama: ' +
      'depois de chamar, o pedido parece ter perdido o `total` e o `cliente`, e o TypeScript não deixa ' +
      'acessar mais nada além do `id`. Conserte o tipo para que o resultado seja uma lista do **mesmo tipo** ' +
      'que entrou, continuando a exigir que os itens tenham `id: string`.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type ComId = { id: string };

function removerPorId(lista: ComId[], id: string): ComId[] {
  return lista.filter((item) => item.id !== id);
}
`,
    solution: `type ComId = { id: string };

function removerPorId<T extends ComId>(lista: T[], id: string): T[] {
  return lista.filter((item) => item.id !== id);
}
`,
    tests: [
      {
        description: 'remove o item com o id informado',
        code: `const ids = removerPorId([{ id: 'a' }, { id: 'b' }, { id: 'c' }], 'b').map((p) => p.id);
assert.deepStrictEqual(ids, ['a', 'c']);`,
      },
      {
        description: 'o resultado continua sendo uma lista de pedidos completos',
        code: `const pedidos = [
  { id: 'p1', cliente: 'Marmitaria Panela de Pressão', total: 120 },
  { id: 'p2', cliente: 'Oficina Graxa Fina', total: 80 },
];
const restantes = removerPorId(pedidos, 'p1');
assert.strictEqual(restantes[0].total, 80);
assert.strictEqual(restantes[0].cliente, 'Oficina Graxa Fina');`,
      },
      {
        description: 'itens sem id continuam proibidos',
        code: `const usarErrado = () => {
  // @ts-expect-error item sem id
  removerPorId([{ nome: 'Sem id' }], 'x');
};
assert.strictEqual(typeof usarErrado, 'function');`,
      },
    ],
    hints: [
      'O tipo `ComId[]` no parâmetro "achata" tudo para `{ id: string }`. Quem guarda o tipo completo é um parâmetro de tipo.',
      'Use `<T extends ComId>(lista: T[], id: string): T[]`.',
    ],
    followUpQuestionIds: ['typescript.m03.f05', 'typescript.m03.f06'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'typescript.m03.q01',
    lessonIds: ['typescript.m03.l01'],
    kind: 'multiple-choice',
    prompt: 'Com `function primeiro<T>(lista: T[]): T | undefined`, qual o tipo de `x`?',
    code: "const x = primeiro(['Osasco', 'Cotia']);",
    options: ['string | undefined', 'string', 'any', 'T'],
    answerIndex: 0,
    explanation:
      'O TypeScript infere `T = string` pela lista e troca no retorno: `string | undefined`. O `T` só existe dentro da declaração.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q02',
    lessonIds: ['typescript.m03.l01'],
    kind: 'true-false',
    prompt:
      'Trocar `function f(x: any): any` por `function f<T>(x: T): T` mantém a função aceitando qualquer tipo, mas agora o TypeScript sabe que o retorno é do mesmo tipo da entrada.',
    answer: true,
    explanation:
      'É a grande vantagem do genérico: aceita qualquer coisa, como o `any`, mas **lembra** o tipo que entrou.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q03',
    lessonIds: ['typescript.m03.l01'],
    kind: 'multiple-choice',
    prompt: 'Este código compila?',
    code: `function nomeDe<T>(item: T): string {
  return item.nome;
}`,
    options: [
      'Não: T pode ser qualquer tipo, então não dá para garantir que tem `nome`',
      'Sim: o TypeScript descobre o `nome` na hora da chamada',
      'Sim, mas só se `item` for um objeto',
      'Não: funções genéricas não podem devolver `string`',
    ],
    answerIndex: 0,
    explanation:
      'Sem restrição, `T` pode ser `number`, `boolean`... Para acessar `nome`, restrinja: `<T extends { nome: string }>`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q04',
    lessonIds: ['typescript.m03.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para que `T` seja obrigado a ter um campo `id` do tipo `string`.',
    code: 'function buscar<T ___ { id: string }>(lista: T[], id: string): T | undefined {',
    acceptedAnswers: ['extends'],
    explanation:
      '`T extends { id: string }` restringe o T: qualquer tipo serve, desde que tenha `id: string`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q05',
    lessonIds: ['typescript.m03.l01'],
    kind: 'multiple-choice',
    prompt: 'Com `function par<A, B>(a: A, b: B): [A, B]`, qual o tipo de `p`?',
    code: "const p = par('Km 18', 42);",
    options: ['[string, number]', '[A, B]', '(string | number)[]', '[any, any]'],
    answerIndex: 0,
    explanation: 'Cada parâmetro de tipo é inferido do seu argumento: `A = string`, `B = number`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q06',
    lessonIds: ['typescript.m03.l01'],
    kind: 'predict-output',
    prompt:
      'Os tipos são apagados na compilação. Este é o JavaScript que sobra de uma função genérica. O que ele imprime?',
    code: `function primeiro(lista) {
  return lista[0];
}
console.log(primeiro(['Cotia', 'Osasco']));
console.log(primeiro([]));`,
    expectedOutput: 'Cotia\nundefined',
    explanation:
      'O `<T>` some no JavaScript: genérico é só checagem em tempo de compilação. Para lista vazia, `lista[0]` é `undefined` (por isso o `T | undefined`).',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q07',
    lessonIds: ['typescript.m03.l01'],
    kind: 'multiple-choice',
    prompt:
      'Qual assinatura devolve o **tipo completo** do cliente achado (com `nome`, `bairro`...), e não só `{ id: string }`?',
    options: [
      'function achar<T extends { id: string }>(l: T[], id: string): T | undefined',
      'function achar(l: { id: string }[], id: string): { id: string } | undefined',
      'function achar(l: any[], id: string): any',
      'function achar(l: unknown[], id: string): unknown',
    ],
    answerIndex: 0,
    explanation:
      'Só o genérico guarda o tipo que entrou. A segunda opção exige `id`, mas devolve só `{ id: string }`; `any` desliga a checagem; `unknown` obriga a checar tudo de novo.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q08',
    lessonIds: ['typescript.m03.l01'],
    kind: 'true-false',
    prompt: 'Em `const v = primeiro<number>([])`, o `<number>` é obrigatório para o código compilar.',
    answer: false,
    explanation:
      'Compila sem ele, mas aí o T é inferido de uma lista vazia (vira `never`) e `v` fica `undefined`. Passar o T explicitamente só é útil quando não há de onde inferir.',
    difficulty: 3,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m03.f01',
    lessonIds: ['typescript.m03.l01'],
    exerciseId: 'typescript.m03.e01',
    kind: 'multiple-choice',
    prompt: 'Com a sua versão genérica, qual o tipo de `x` em `const x = ultimo([3, 5, 8])`?',
    options: ['number | undefined', 'number', 'any', 'number[]'],
    answerIndex: 0,
    explanation: 'O T vira `number` e o retorno é `T | undefined`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f02',
    lessonIds: ['typescript.m03.l01'],
    exerciseId: 'typescript.m03.e01',
    kind: 'true-false',
    prompt:
      'Na versão antiga, com `any`, o código `primeiro([1, 2]).toUpperCase()` compilava, apesar de quebrar ao rodar.',
    answer: true,
    explanation:
      'O `any` libera tudo, então o erro só aparecia em produção. Com o genérico, o TypeScript sabe que é `number | undefined` e barra na hora.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f03',
    lessonIds: ['typescript.m03.l01'],
    exerciseId: 'typescript.m03.e02',
    kind: 'multiple-choice',
    prompt: 'Por que a sua `maisCaro` precisou de `T extends { preco: number }`?',
    options: [
      'Para poder ler `item.preco` e comparar: sem a restrição, T pode ser qualquer coisa',
      'Para o resultado virar `{ preco: number }`',
      'Porque genéricos só funcionam com objetos',
      'Para a lista não poder ser vazia',
    ],
    answerIndex: 0,
    explanation:
      'A restrição garante o mínimo (`preco: number`) e o T continua guardando o tipo completo do item.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.f04',
    lessonIds: ['typescript.m03.l01'],
    exerciseId: 'typescript.m03.e02',
    kind: 'true-false',
    prompt:
      'Chamar a sua `maisCaro` com uma lista de `Ferramenta` devolve `Ferramenta | undefined`, com todos os campos.',
    answer: true,
    explanation: 'O T é inferido como `Ferramenta`, e a função devolve `T | undefined`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f05',
    lessonIds: ['typescript.m03.l01'],
    exerciseId: 'typescript.m03.d01',
    kind: 'multiple-choice',
    prompt: 'Qual era o defeito da `removerPorId` original?',
    options: [
      'O tipo `ComId[]` no lugar de um genérico fazia o resultado perder os outros campos',
      'O `filter` removia os itens errados',
      'Faltava `async` na função',
      'O `id` deveria ser `number`',
    ],
    answerIndex: 0,
    explanation:
      'Com `lista: ComId[]` e retorno `ComId[]`, o TypeScript esquece que eram pedidos. Com `<T extends ComId>`, o tipo completo volta.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.f06',
    lessonIds: ['typescript.m03.l01'],
    exerciseId: 'typescript.m03.d01',
    kind: 'fill-blank',
    prompt: 'Complete a assinatura consertada da `removerPorId`.',
    code: 'function removerPorId<T extends ComId>(lista: T[], id: string): ___ {',
    acceptedAnswers: ['T[]', 'Array<T>'],
    explanation: 'Devolve uma lista do mesmo tipo que entrou.',
    difficulty: 1,
  },
];
