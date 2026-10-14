import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m03.l02',
  moduleId: 'typescript.m03',
  order: 2,
  title: 'Genéricos em tipos e classes: Resultado<T>, Fila<T> e Cache<K, V>',
  concepts: [
    'type alias genérico',
    'interface genérica',
    'união discriminada genérica (Resultado<T>)',
    'classe genérica',
    'Array<T>, Promise<T> e Map<K, V>',
    'valor padrão de parâmetro de tipo',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Você já usa genéricos faz tempo, talvez sem perceber: `Array<string>` (o mesmo que `string[]`), ' +
        '`Promise<number>`, `Map<string, Cliente>`. São **tipos com parâmetro**: o "molde" é um só e você ' +
        'diz o que vai dentro.\n\n' +
        'Você também pode criar os seus. Um `type` ou uma `interface` ganha parâmetros de tipo do mesmo jeito ' +
        'que uma função:\n\n' +
        '```ts\ntype RespostaApi<T> = { status: number; dados: T };\n\ninterface Pagina<T> {\n  itens: T[];\n' +
        '  total: number;\n}\n\nconst r: RespostaApi<Cliente[]> = { status: 200, dados: [] };\n```\n\n' +
        'Repare: em **tipos**, o TypeScript não infere o `T`. Você escreve `RespostaApi<Cliente[]>`. (Em ' +
        'funções e no `new` de classes, ele infere dos argumentos.)',
    },
    {
      kind: 'text',
      markdown:
        '**O tipo `Resultado<T>`.** Juntando genérico com união discriminada (que você já viu), dá para ' +
        'representar "deu certo com um valor do tipo T, ou deu erro com uma mensagem" sem lançar exceção:\n\n' +
        '```ts\ntype Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };\n```\n\n' +
        'O `ok` é o discriminante. Antes de checar `if (r.ok)`, o TypeScript não deixa ler `r.valor` ' +
        '(pode ser o caso de erro). Depois, ele sabe que `r.valor` é um `T`. É o jeito de obrigar quem chama ' +
        'a tratar a falha: nada de esquecer o `try/catch`.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

function validarCep(cep: string): Resultado<string> {
  const limpo = cep.replace('-', '');
  if (!/^\\d{8}$/.test(limpo)) return { ok: false, erro: 'CEP inválido: ' + cep };
  return { ok: true, valor: limpo };
}

const r = validarCep('06010-000');
if (r.ok) {
  console.log('CEP limpo:', r.valor); // aqui r.valor é string
} else {
  console.log(r.erro);
}`,
      explanation: 'Fora do `if`, `r.valor` não compila. O tipo obriga a tratar os dois casos.',
    },
    {
      kind: 'text',
      markdown:
        '**Classes genéricas.** Uma classe também pode ter parâmetros de tipo, que valem para todos os ' +
        'campos e métodos:\n\n' +
        '```ts\nclass Cache<K, V> {\n  private dados = new Map<K, V>();\n\n  guardar(chave: K, valor: V): void {\n' +
        '    this.dados.set(chave, valor);\n  }\n\n  obter(chave: K): V | undefined {\n    return this.dados.get(chave);\n  }\n}\n\n' +
        "const ceps = new Cache<string, string>();\nceps.guardar('06010000', 'Centro, Osasco');\n" +
        "const bairro = ceps.obter('06010000'); // string | undefined\n```\n\n" +
        'Uma `Cache<string, string>` só aceita strings; uma `Cache<number, Pedido>` só aceita pedidos. A ' +
        'mesma classe, escrita uma vez, sem `any` e sem copiar e colar uma `CacheDePedido`, ' +
        '`CacheDeCliente`...\n\n' +
        '**Valor padrão.** Um parâmetro de tipo pode ter padrão: `type RespostaApi<T = unknown>`. Aí ' +
        '`RespostaApi` sozinho vale `RespostaApi<unknown>`.',
    },
  ],
  checkQuestionIds: ['typescript.m03.q09'],
  exerciseIds: ['typescript.m03.e03', 'typescript.m03.e04'],
  debugExerciseIds: ['typescript.m03.d02'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m03.e03',
    lessonId: 'typescript.m03.l02',
    kind: 'implement',
    title: 'Resultado<T> para a API da marmitaria',
    promptMarkdown:
      'A Marmitaria Panela de Pressão chama umas funções que às vezes lançam erro (CEP fora da área de ' +
      'entrega, cardápio vazio...). Em vez de espalhar `try/catch`, o time quer um tipo de resultado.\n\n' +
      '1. Declare o tipo genérico `Resultado<T>`: `{ ok: true; valor: T }` ou `{ ok: false; erro: string }`.\n' +
      '2. Crie a função genérica `tentar(fn)`, que chama `fn()` (uma função sem parâmetros que devolve um `T`):\n' +
      '   - se der certo, devolve `{ ok: true, valor }`;\n' +
      '   - se lançar um `Error`, devolve `{ ok: false, erro }` com a **mensagem** do erro (se lançar outra ' +
      'coisa, use `String(err)`).\n\n' +
      'O tipo do `valor` precisa acompanhar o que a `fn` devolve.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Resultado = { ok: boolean; valor?: unknown; erro?: string };

function tentar(fn: () => unknown): Resultado {
  try {
    return { ok: true, valor: fn() };
  } catch (err) {
    return { ok: false, erro: 'deu ruim' };
  }
}
`,
    solution: `type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

function tentar<T>(fn: () => T): Resultado<T> {
  try {
    return { ok: true, valor: fn() };
  } catch (err) {
    return { ok: false, erro: err instanceof Error ? err.message : String(err) };
  }
}
`,
    tests: [
      {
        description: 'quando dá certo, devolve ok: true com o valor',
        code: `assert.deepStrictEqual(tentar(() => 42), { ok: true, valor: 42 });`,
      },
      {
        description: 'quando lança, devolve ok: false com a mensagem do erro',
        code: `const r = tentar(() => {
  throw new Error('CEP fora da área de entrega');
});
assert.deepStrictEqual(r, { ok: false, erro: 'CEP fora da área de entrega' });`,
      },
      {
        description: 'depois do if (r.ok), o valor tem o tipo certo',
        code: `const r = tentar(() => 'Marmita de feijoada');
if (r.ok) {
  const prato: string = r.valor;
  assert.strictEqual(prato.toUpperCase(), 'MARMITA DE FEIJOADA');
} else {
  const mensagem: string = r.erro;
  assert.fail(mensagem);
}`,
      },
      {
        description: 'sem checar ok, não dá para ler o valor',
        code: `const r: Resultado<number> = tentar(() => 10);
const usarErrado = () => {
  // @ts-expect-error pode ser o caso de erro
  return r.valor;
};
// @ts-expect-error valor precisa ser number
const errado: Resultado<number> = { ok: true, valor: 'dez' };
assert.strictEqual(typeof usarErrado, 'function');`,
      },
    ],
    hints: [
      'O tipo é uma união discriminada com parâmetro: `type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };`.',
      'A função liga o T da `fn` ao do resultado: `function tentar<T>(fn: () => T): Resultado<T>`.',
      'No `catch`, `err` é `unknown`: use `err instanceof Error ? err.message : String(err)`.',
    ],
    followUpQuestionIds: ['typescript.m03.f07', 'typescript.m03.f08'],
    difficulty: 2,
  },
  {
    id: 'typescript.m03.e04',
    lessonId: 'typescript.m03.l02',
    kind: 'implement',
    title: 'Fila<T> de entregas',
    promptMarkdown:
      'O primo do dono fez uma `Fila` que só aceita `string` e, pior, entrega o **último** que entrou ' +
      '(o motoboy que chegou primeiro está esperando até agora). Transforme-a numa classe genérica `Fila<T>`:\n\n' +
      '- `entrar(item: T)`: coloca no fim da fila;\n' +
      '- `sair()`: tira e devolve o **primeiro** da fila (ou `undefined` se estiver vazia);\n' +
      '- `espiar()`: devolve o primeiro **sem tirar** (ou `undefined`);\n' +
      '- `tamanho`: um getter com a quantidade de itens.\n\n' +
      'Uma `Fila<number>` não pode aceitar `string`.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `class Fila {
  private itens: string[] = [];

  entrar(item: string): void {
    this.itens.push(item);
  }

  sair(): string | undefined {
    return this.itens.pop();
  }

  get tamanho(): number {
    return this.itens.length;
  }
}
`,
    solution: `class Fila<T> {
  private itens: T[] = [];

  entrar(item: T): void {
    this.itens.push(item);
  }

  sair(): T | undefined {
    return this.itens.shift();
  }

  espiar(): T | undefined {
    return this.itens[0];
  }

  get tamanho(): number {
    return this.itens.length;
  }
}
`,
    tests: [
      {
        description: 'quem entra primeiro sai primeiro',
        code: `const fila = new Fila<string>();
fila.entrar('Pedido 1');
fila.entrar('Pedido 2');
fila.entrar('Pedido 3');
assert.strictEqual(fila.sair(), 'Pedido 1');
assert.strictEqual(fila.sair(), 'Pedido 2');
assert.strictEqual(fila.tamanho, 1);`,
      },
      {
        description: 'funciona com objetos e mantém o tipo',
        code: `type Entrega = { id: number; bairro: string };
const fila = new Fila<Entrega>();
fila.entrar({ id: 1, bairro: 'Quitaúna' });
fila.entrar({ id: 2, bairro: 'Rochdale' });
const proxima = fila.sair();
assert.strictEqual(proxima?.bairro, 'Quitaúna');`,
      },
      {
        description: 'espiar não tira da fila; fila vazia devolve undefined',
        code: `const fila = new Fila<number>();
assert.strictEqual(fila.espiar(), undefined);
assert.strictEqual(fila.sair(), undefined);
fila.entrar(10);
assert.strictEqual(fila.espiar(), 10);
assert.strictEqual(fila.tamanho, 1);`,
      },
      {
        description: 'uma Fila<number> não aceita string',
        code: `const fila = new Fila<number>();
const usarErrado = () => {
  // @ts-expect-error a fila é de number
  fila.entrar('3');
};
assert.strictEqual(typeof usarErrado, 'function');`,
      },
    ],
    hints: [
      'Declare `class Fila<T>` e troque `string` por `T` nos itens, no `entrar` e nos retornos.',
      '`pop()` tira do fim; para tirar do começo, use `shift()`.',
      '`espiar()` só lê `this.itens[0]`.',
    ],
    followUpQuestionIds: ['typescript.m03.f09', 'typescript.m03.f10'],
    difficulty: 2,
  },
  {
    id: 'typescript.m03.d02',
    lessonId: 'typescript.m03.l02',
    kind: 'debug',
    title: 'A cache que devolve unknown',
    promptMarkdown:
      'A `Cache<K, V>` guarda consultas de CEP para não chamar a API toda hora. Mas quem usa reclama que ' +
      'o `obter` sempre devolve `unknown`, e o código ficou cheio de `as string` (o primo jura que é ' +
      '"tipagem avançada"). Conserte a classe para que `obter` devolva `V | undefined`.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `class Cache<K, V> {
  private dados = new Map<K, unknown>();

  guardar(chave: K, valor: V): void {
    this.dados.set(chave, valor);
  }

  obter(chave: K) {
    return this.dados.get(chave);
  }

  tem(chave: K): boolean {
    return this.dados.has(chave);
  }
}
`,
    solution: `class Cache<K, V> {
  private dados = new Map<K, V>();

  guardar(chave: K, valor: V): void {
    this.dados.set(chave, valor);
  }

  obter(chave: K): V | undefined {
    return this.dados.get(chave);
  }

  tem(chave: K): boolean {
    return this.dados.has(chave);
  }
}
`,
    tests: [
      {
        description: 'guarda e devolve valores',
        code: `const ceps = new Cache<string, string>();
ceps.guardar('06010000', 'Centro, Osasco');
assert.strictEqual(ceps.obter('06010000'), 'Centro, Osasco');
assert.strictEqual(ceps.obter('99999999'), undefined);
assert.strictEqual(ceps.tem('06010000'), true);`,
      },
      {
        description: 'obter devolve o tipo do valor (V | undefined)',
        code: `const ceps = new Cache<string, string>();
ceps.guardar('06700000', 'Centro, Cotia');
const bairro: string | undefined = ceps.obter('06700000');
assert.strictEqual(bairro?.toUpperCase(), 'CENTRO, COTIA');`,
      },
      {
        description: 'dá para fazer conta com o valor de uma Cache<string, number>',
        code: `const fretes = new Cache<string, number>();
fretes.guardar('Granja Viana', 18);
const dobro = (fretes.obter('Granja Viana') ?? 0) * 2;
assert.strictEqual(dobro, 36);`,
      },
    ],
    hints: [
      'O `Map` interno foi criado como `Map<K, unknown>`: tudo que sai dele vira `unknown`.',
      'Troque por `Map<K, V>` e deixe o retorno explícito: `obter(chave: K): V | undefined`.',
    ],
    followUpQuestionIds: ['typescript.m03.f11', 'typescript.m03.f12'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  {
    id: 'typescript.m03.q09',
    lessonIds: ['typescript.m03.l02'],
    kind: 'multiple-choice',
    prompt: 'Com o tipo abaixo, onde `r.valor` pode ser lido sem erro de compilação?',
    code: `type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };
declare const r: Resultado<number>;`,
    options: [
      'Só dentro de um `if (r.ok) { ... }`',
      'Em qualquer lugar: `valor` é sempre `number`',
      'Só dentro de um `try/catch`',
      'Em lugar nenhum: `valor` é privado',
    ],
    answerIndex: 0,
    explanation:
      'Antes de checar o discriminante, `r` pode ser o caso de erro, que não tem `valor`. O `if (r.ok)` estreita o tipo.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q10',
    lessonIds: ['typescript.m03.l02'],
    kind: 'true-false',
    prompt: '`string[]` e `Array<string>` são o mesmo tipo.',
    answer: true,
    explanation: '`T[]` é só um atalho para o tipo genérico `Array<T>`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q11',
    lessonIds: ['typescript.m03.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual o tipo de `x`?',
    code: `const precos = new Map<string, number>();
precos.set('marmita', 22);
const x = precos.get('marmita');`,
    options: ['number | undefined', 'number', 'string | number', 'unknown'],
    answerIndex: 0,
    explanation: 'O `get` de um `Map<K, V>` devolve `V | undefined`, porque a chave pode não existir.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q12',
    lessonIds: ['typescript.m03.l02'],
    kind: 'fill-blank',
    prompt: 'Complete a declaração da classe genérica com dois parâmetros de tipo: chave e valor.',
    code: 'class Cache___ {\n  private dados = new Map<K, V>();\n}',
    acceptedAnswers: ['<K, V>', '<K,V>'],
    explanation: 'Os parâmetros de tipo da classe vêm logo depois do nome: `class Cache<K, V>`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q13',
    lessonIds: ['typescript.m03.l02'],
    kind: 'multiple-choice',
    prompt: 'Este código compila?',
    code: `type RespostaApi<T> = { status: number; dados: T };
const r: RespostaApi = { status: 200, dados: [] };`,
    options: [
      'Não: `RespostaApi` exige o argumento de tipo, como `RespostaApi<string[]>`',
      'Sim: o TypeScript infere o T pelo valor',
      'Sim: o T vira `any`',
      'Não: `dados` não pode ser um array',
    ],
    answerIndex: 0,
    explanation:
      'Em anotações de tipo não há inferência do T. Sem um padrão (`<T = unknown>`), é obrigatório informar.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q14',
    lessonIds: ['typescript.m03.l02'],
    kind: 'predict-output',
    prompt: 'Este é o JavaScript que sobra de uma `Fila<T>` depois de compilada. O que ele imprime?',
    code: `class Fila {
  itens = [];
  entrar(item) {
    this.itens.push(item);
  }
  sair() {
    return this.itens.shift();
  }
}
const fila = new Fila();
fila.entrar('Josué');
fila.entrar(42);
console.log(fila.sair(), fila.sair());`,
    expectedOutput: 'Josué 42',
    explanation:
      'Em tempo de execução não existe `T`: a fila aceita qualquer coisa. Quem barra o `42` numa `Fila<string>` é o compilador, antes de rodar.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q15',
    lessonIds: ['typescript.m03.l02'],
    kind: 'true-false',
    prompt:
      'Em `const f = new Fila<string>()`, o `<string>` vira um parâmetro de verdade passado ao construtor em tempo de execução.',
    answer: false,
    explanation: 'Argumentos de tipo são apagados na compilação. O JavaScript gerado é só `new Fila()`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q16',
    lessonIds: ['typescript.m03.l02'],
    kind: 'multiple-choice',
    prompt:
      'Com `type RespostaApi<T = unknown> = { status: number; dados: T }`, o que é `RespostaApi`, sem argumento?',
    options: [
      '`{ status: number; dados: unknown }`',
      '`{ status: number; dados: any }`',
      'Um erro de compilação',
      '`{ status: number }`',
    ],
    answerIndex: 0,
    explanation: 'O `= unknown` é o valor padrão do parâmetro de tipo, usado quando ninguém informa o T.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m03.f07',
    lessonIds: ['typescript.m03.l02'],
    exerciseId: 'typescript.m03.e03',
    kind: 'multiple-choice',
    prompt: "Com a sua `tentar`, qual o tipo de `r` em `const r = tentar(() => 'feijoada')`?",
    options: ['Resultado<string>', 'Resultado<unknown>', 'string', 'Resultado<() => string>'],
    answerIndex: 0,
    explanation: 'O T é inferido do retorno da `fn`: `() => string` dá `T = string`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.f08',
    lessonIds: ['typescript.m03.l02'],
    exerciseId: 'typescript.m03.e03',
    kind: 'true-false',
    prompt:
      'No `catch` da sua `tentar`, o `err` tem tipo `unknown`, por isso foi preciso checar `err instanceof Error` antes de ler `err.message`.',
    answer: true,
    explanation:
      'No modo estrito, a variável do `catch` é `unknown`: qualquer coisa pode ser lançada, até uma string.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.f09',
    lessonIds: ['typescript.m03.l02'],
    exerciseId: 'typescript.m03.e04',
    kind: 'multiple-choice',
    prompt: 'Na sua `Fila<T>`, qual método de array tira o **primeiro** item?',
    options: ['shift()', 'pop()', 'slice(1)', 'unshift()'],
    answerIndex: 0,
    explanation: '`shift` tira do começo; `pop` tira do fim (o que deixava o primeiro motoboy esperando).',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f10',
    lessonIds: ['typescript.m03.l02'],
    exerciseId: 'typescript.m03.e04',
    kind: 'multiple-choice',
    prompt: 'Com a sua classe, qual o tipo de `e` em `const e = new Fila<Entrega>().sair()`?',
    options: ['Entrega | undefined', 'Entrega', 'T', 'unknown'],
    answerIndex: 0,
    explanation:
      'O T da instância é `Entrega` e `sair()` devolve `T | undefined`, porque a fila pode estar vazia.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f11',
    lessonIds: ['typescript.m03.l02'],
    exerciseId: 'typescript.m03.d02',
    kind: 'multiple-choice',
    prompt: 'Por que o `obter` da cache devolvia `unknown`?',
    options: [
      'O `Map` interno era `Map<K, unknown>`, e o retorno era inferido dele',
      'Porque classes genéricas sempre devolvem `unknown`',
      'Porque faltava `async` no `obter`',
      'Porque o `guardar` não tinha tipo de retorno',
    ],
    answerIndex: 0,
    explanation:
      'O tipo do campo decide o que sai dele. Com `Map<K, V>`, o `get` passa a devolver `V | undefined`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f12',
    lessonIds: ['typescript.m03.l02'],
    exerciseId: 'typescript.m03.d02',
    kind: 'true-false',
    prompt: 'Com a cache consertada, `new Cache<string, number>().obter("x")` tem tipo `number | undefined`.',
    answer: true,
    explanation: 'V é `number`, e a chave pode não existir.',
    difficulty: 1,
  },
];
