import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m03.l05',
  moduleId: 'typescript.m03',
  order: 5,
  title: 'Eventos tipados e satisfies: juntando tudo',
  concepts: [
    'mapa de eventos',
    'on<K extends keyof Eventos>',
    'payload com Eventos[K]',
    'EventBus genérico',
    'satisfies',
    'anotação de tipo vs satisfies',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        "Lembra do `EventEmitter` do Node? `emitter.on('pedido', fn)` aceita **qualquer** nome de evento e " +
        "qualquer payload. Um erro de digitação (`'pedio'`) e o ouvinte nunca é chamado, sem erro nenhum.\n\n" +
        'Com o que você aprendeu neste módulo dá para fazer um barramento de eventos em que o TypeScript ' +
        'confere tudo. A ideia é um **mapa de eventos**: um tipo cujas chaves são os nomes dos eventos e ' +
        'cujos valores são os payloads.\n\n' +
        "```ts\ntype Eventos = {\n  'pedido:novo': { id: number; total: number };\n  'pedido:pronto': { id: number; entregador: string };\n  'loja:fechou': { hora: string };\n};\n```\n\n" +
        'Daí, `on` e `emit` usam a dupla `K extends keyof Eventos` + `Eventos[K]`, igualzinho ao `pegar` da ' +
        'lição 3:\n\n' +
        '```ts\non<K extends keyof Eventos>(nome: K, fn: (payload: Eventos[K]) => void): void\n' +
        'emit<K extends keyof Eventos>(nome: K, payload: Eventos[K]): void\n```\n\n' +
        "Agora `emit('pedido:novo', { id: 1 })` não compila (falta `total`), `on('pedio', ...)` não compila, e " +
        "dentro de `on('pedido:pronto', (p) => ...)` o `p` já vem tipado, com `p.entregador` no autocompletar.",
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type Handler<T> = (payload: T) => void;

/** Barramento de eventos tipado (é parecido com o que o próprio jogo usa por dentro). */
class EventBus<Events extends object> {
  private readonly handlers = new Map<keyof Events, Set<Handler<never>>>();

  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    const set = this.handlers.get(event) ?? new Set<Handler<never>>();
    this.handlers.set(event, set);
    set.add(handler);
    return () => {
      set.delete(handler);
    };
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    for (const handler of this.handlers.get(event) ?? []) {
      (handler as Handler<Events[K]>)(payload);
    }
  }
}

type Eventos = { 'pedido:novo': { id: number; total: number }; 'loja:fechou': { hora: string } };
const bus = new EventBus<Eventos>();
const parar = bus.on('pedido:novo', (p) => console.log('Novo pedido de R$', p.total));
bus.emit('pedido:novo', { id: 7, total: 59.9 });
parar();`,
      explanation:
        'A classe é genérica no mapa de eventos, então serve para qualquer projeto. Por dentro, o `Map` guarda funções de vários tipos misturados; o cast no `emit` é o único ponto "na confiança", escondido do lado de fora.',
    },
    {
      kind: 'text',
      markdown:
        '**`satisfies`: conferir sem perder detalhe.** Quando você anota o tipo de uma constante, o ' +
        'TypeScript passa a enxergar **só** o tipo anotado:\n\n' +
        "```ts\ntype Rota = { metodo: 'GET' | 'POST'; caminho: string };\n\n" +
        "const ROTAS: Record<string, Rota> = {\n  listar: { metodo: 'GET', caminho: '/pedidos' },\n};\n" +
        'ROTAS.listra; // compila! Record<string, ...> aceita qualquer chave\n```\n\n' +
        'Com `satisfies`, o valor é **conferido** contra o tipo (erros de digitação em `metodo` são pegos), ' +
        'mas a constante mantém o tipo exato que foi escrito: as chaves `listar`, `criar`... e os literais ' +
        "`'GET'`, `'POST'`:\n\n" +
        "```ts\nconst ROTAS = {\n  listar: { metodo: 'GET', caminho: '/pedidos' },\n  criar: { metodo: 'POST', caminho: '/pedidos' },\n" +
        '} satisfies Record<string, Rota>;\n\n' +
        "type NomeRota = keyof typeof ROTAS; // 'listar' | 'criar'\nROTAS.listra; // erro: não existe\n```\n\n" +
        'Regra de bolso: **anotação** quando você quer que o tipo seja exatamente aquele (e mais nada); ' +
        '**`satisfies`** quando quer validar um objeto de configuração e continuar usando os detalhes dele.',
    },
  ],
  checkQuestionIds: ['typescript.m03.q33'],
  exerciseIds: ['typescript.m03.e09'],
  debugExerciseIds: ['typescript.m03.d05'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m03.e09',
    lessonId: 'typescript.m03.l05',
    kind: 'implement',
    title: 'Barramento de pedidos tipado',
    promptMarkdown:
      'O painel do Açaí Congela Cérebro usa um `Barramento` que aceita qualquer nome e qualquer payload. ' +
      "Ontem alguém emitiu `'pedido:nvo'` e ninguém foi avisado do pedido de 12 açaís.\n\n" +
      'O mapa `Eventos` já existe. Altere a classe:\n\n' +
      '1. `on(nome, fn)` só aceita nomes que existem em `Eventos`, e o `fn` recebe o payload **daquele** ' +
      'evento;\n' +
      '2. `emit(nome, payload)` só aceita o payload certo para aquele evento;\n' +
      '3. `on` devolve uma função que, quando chamada, **cancela a inscrição** daquele ouvinte.\n\n' +
      'O `Map` interno pode continuar como está: o tipo `Ouvinte` e o cast dentro do `emit` são o ' +
      'detalhe "na confiança" que fica escondido lá dentro.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Eventos = {
  'pedido:novo': { id: number; total: number };
  'pedido:pronto': { id: number; entregador: string };
  'loja:fechou': { hora: string };
};

type Ouvinte = (payload: never) => void;

class Barramento {
  private ouvintes = new Map<string, Ouvinte[]>();

  on(nome: string, fn: (payload: any) => void): void {
    const lista = this.ouvintes.get(nome) ?? [];
    lista.push(fn);
    this.ouvintes.set(nome, lista);
  }

  emit(nome: string, payload: unknown): void {
    for (const fn of this.ouvintes.get(nome) ?? []) {
      (fn as (payload: unknown) => void)(payload);
    }
  }
}
`,
    solution: `type Eventos = {
  'pedido:novo': { id: number; total: number };
  'pedido:pronto': { id: number; entregador: string };
  'loja:fechou': { hora: string };
};

type Ouvinte = (payload: never) => void;

class Barramento {
  private ouvintes = new Map<string, Ouvinte[]>();

  on<K extends keyof Eventos>(nome: K, fn: (payload: Eventos[K]) => void): () => void {
    const lista = this.ouvintes.get(nome) ?? [];
    lista.push(fn);
    this.ouvintes.set(nome, lista);
    return () => {
      const atual = this.ouvintes.get(nome) ?? [];
      this.ouvintes.set(
        nome,
        atual.filter((f) => f !== fn),
      );
    };
  }

  emit<K extends keyof Eventos>(nome: K, payload: Eventos[K]): void {
    for (const fn of this.ouvintes.get(nome) ?? []) {
      (fn as (payload: Eventos[K]) => void)(payload);
    }
  }
}
`,
    tests: [
      {
        description: 'emit chama os ouvintes daquele evento, com o payload',
        code: `const bus = new Barramento();
const recebidos: number[] = [];
bus.on('pedido:novo', (p) => {
  recebidos.push(p.total);
});
bus.on('pedido:novo', (p) => {
  recebidos.push(p.id);
});
bus.on('loja:fechou', () => {
  recebidos.push(-1);
});
bus.emit('pedido:novo', { id: 7, total: 59.9 });
assert.deepStrictEqual(recebidos, [59.9, 7]);`,
      },
      {
        description: 'on devolve uma função que cancela a inscrição',
        code: `const bus = new Barramento();
let apitos = 0;
let outros = 0;
const parar = bus.on('pedido:pronto', () => {
  apitos++;
});
bus.on('pedido:pronto', () => {
  outros++;
});
bus.emit('pedido:pronto', { id: 1, entregador: 'Josué' });
parar();
bus.emit('pedido:pronto', { id: 2, entregador: 'Josué' });
assert.strictEqual(apitos, 1, 'O ouvinte cancelado continuou recebendo.');
assert.strictEqual(outros, 2, 'Cancelar um ouvinte não pode afetar os outros.');`,
      },
      {
        description: 'nome de evento que não existe não compila',
        code: `const bus = new Barramento();
const usarErrado = () => {
  // @ts-expect-error erro de digitação no nome do evento
  bus.emit('pedido:nvo', { id: 1, total: 10 });
  // @ts-expect-error esse evento não existe
  bus.on('pedido:cancelado', () => {});
};
assert.strictEqual(typeof usarErrado, 'function');`,
      },
      {
        description: 'payload errado não compila, e o ouvinte recebe o payload tipado',
        code: `const bus = new Barramento();
const usarErrado = () => {
  // @ts-expect-error total precisa ser number
  bus.emit('pedido:novo', { id: 1, total: '59,90' });
  // @ts-expect-error pedido:pronto não tem total
  bus.on('pedido:pronto', (p) => console.log(p.total));
};
assert.strictEqual(typeof usarErrado, 'function');`,
      },
    ],
    hints: [
      'Copie a ideia do `pegar`: `on<K extends keyof Eventos>(nome: K, fn: (payload: Eventos[K]) => void)`. O `emit` segue o mesmo padrão.',
      'Para cancelar, devolva uma arrow function que regrava a lista sem aquele `fn`: `lista.filter((f) => f !== fn)`.',
      'No `emit`, o cast passa a ser `(fn as (payload: Eventos[K]) => void)(payload)`.',
    ],
    followUpQuestionIds: ['typescript.m03.f25', 'typescript.m03.f26'],
    difficulty: 3,
  },
  {
    id: 'typescript.m03.d05',
    lessonId: 'typescript.m03.l05',
    kind: 'debug',
    title: 'As rotas que aceitavam qualquer nome',
    promptMarkdown:
      "A tabela `ROTAS` da API do açaí foi anotada como `Record<string, Rota>`. Resultado: `caminhoDe('listarPedido')` " +
      "(sem o \"s\") compila, e o tipo de `metodo` virou `'GET' | 'POST'` em todas as rotas.\n\n" +
      'Conserte para que `NomeRota` seja a união dos nomes que existem na tabela e cada rota mantenha o seu ' +
      'método exato, **sem deixar de conferir** que cada item é uma `Rota` válida.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `type Rota = { metodo: 'GET' | 'POST'; caminho: string };

const ROTAS: Record<string, Rota> = {
  listarPedidos: { metodo: 'GET', caminho: '/pedidos' },
  criarPedido: { metodo: 'POST', caminho: '/pedidos' },
  cardapio: { metodo: 'GET', caminho: '/cardapio' },
};

type NomeRota = keyof typeof ROTAS;

function caminhoDe(nome: NomeRota): string {
  return ROTAS[nome].caminho;
}
`,
    solution: `type Rota = { metodo: 'GET' | 'POST'; caminho: string };

const ROTAS = {
  listarPedidos: { metodo: 'GET', caminho: '/pedidos' },
  criarPedido: { metodo: 'POST', caminho: '/pedidos' },
  cardapio: { metodo: 'GET', caminho: '/cardapio' },
} satisfies Record<string, Rota>;

type NomeRota = keyof typeof ROTAS;

function caminhoDe(nome: NomeRota): string {
  return ROTAS[nome].caminho;
}
`,
    tests: [
      {
        description: 'caminhoDe devolve o caminho da rota',
        code: `assert.strictEqual(caminhoDe('cardapio'), '/cardapio');
assert.strictEqual(caminhoDe('criarPedido'), '/pedidos');`,
      },
      {
        description: 'nome de rota que não existe não compila',
        code: `const usarErrado = () => {
  // @ts-expect-error falta o "s" de listarPedidos
  caminhoDe('listarPedido');
};
assert.strictEqual(typeof usarErrado, 'function');`,
      },
      {
        description: 'cada rota mantém o método exato',
        code: `const metodo: 'POST' = ROTAS.criarPedido.metodo;
assert.strictEqual(metodo, 'POST');`,
      },
    ],
    hints: [
      'A anotação `: Record<string, Rota>` faz o TypeScript esquecer as chaves e os literais do objeto.',
      'Tire a anotação e coloque `satisfies Record<string, Rota>` depois do `}`.',
    ],
    followUpQuestionIds: ['typescript.m03.f27', 'typescript.m03.f28'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'typescript.m03.q33',
    lessonIds: ['typescript.m03.l05'],
    kind: 'multiple-choice',
    prompt: 'Com `emit<K extends keyof Eventos>(nome: K, payload: Eventos[K])`, qual chamada compila?',
    code: `type Eventos = {
  'pedido:novo': { id: number; total: number };
  'loja:fechou': { hora: string };
};`,
    options: [
      "emit('loja:fechou', { hora: '23:00' })",
      "emit('loja:fechou', { id: 1, total: 10 })",
      "emit('loja:fechada', { hora: '23:00' })",
      "emit('pedido:novo', { id: 1 })",
    ],
    answerIndex: 0,
    explanation:
      'O nome precisa ser uma chave de `Eventos`, e o payload precisa ser `Eventos[K]` daquele nome. Na última, falta `total`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q34',
    lessonIds: ['typescript.m03.l05'],
    kind: 'true-false',
    prompt:
      "Com `on<K extends keyof Eventos>(nome: K, fn: (p: Eventos[K]) => void)`, dentro de `on('pedido:novo', (p) => ...)` o TypeScript já sabe que `p` tem `id` e `total`, sem você anotar o tipo de `p`.",
    answer: true,
    explanation:
      "O K é inferido como `'pedido:novo'`, e o tipo do parâmetro do callback vem de `Eventos['pedido:novo']`.",
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q35',
    lessonIds: ['typescript.m03.l05'],
    kind: 'fill-blank',
    prompt: 'Complete para conferir o objeto contra o tipo **sem** perder as chaves e os literais dele.',
    code: "const ROTAS = {\n  listar: { metodo: 'GET', caminho: '/pedidos' },\n} ___ Record<string, Rota>;",
    acceptedAnswers: ['satisfies'],
    explanation:
      '`satisfies` valida o valor contra o tipo, mas o tipo da constante continua sendo o do valor escrito.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.q36',
    lessonIds: ['typescript.m03.l05'],
    kind: 'multiple-choice',
    prompt: 'Qual o tipo `N`?',
    code: `const ROTAS: Record<string, { caminho: string }> = {
  listar: { caminho: '/pedidos' },
  criar: { caminho: '/pedidos' },
};
type N = keyof typeof ROTAS;`,
    options: ['string', "'listar' | 'criar'", 'never', '{ caminho: string }'],
    answerIndex: 0,
    explanation:
      "A anotação manda: a constante é um `Record<string, ...>`, então suas chaves são `string`. Com `satisfies` no lugar, seria `'listar' | 'criar'`.",
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q37',
    lessonIds: ['typescript.m03.l05'],
    kind: 'multiple-choice',
    prompt: 'Este código compila?',
    code: `type Rota = { metodo: 'GET' | 'POST'; caminho: string };
const ROTAS = {
  listar: { metodo: 'GTE', caminho: '/pedidos' },
} satisfies Record<string, Rota>;`,
    options: [
      "Não: `'GTE'` não é `'GET' | 'POST'`, e o `satisfies` confere isso",
      'Sim: `satisfies` só confere as chaves',
      'Sim: `satisfies` só vale em tempo de execução',
      'Não: `satisfies` não pode ser usado com `Record`',
    ],
    answerIndex: 0,
    explanation:
      '`satisfies` faz a mesma checagem de uma anotação; a diferença é só no tipo que a constante fica tendo depois.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q38',
    lessonIds: ['typescript.m03.l05'],
    kind: 'predict-output',
    prompt:
      'Depois de compilado, um barramento tipado vira JavaScript comum. Este é o código que sobra. O que ele imprime?',
    code: `const ouvintes = new Map();
function on(nome, fn) {
  const lista = ouvintes.get(nome) ?? [];
  lista.push(fn);
  ouvintes.set(nome, lista);
  return () => ouvintes.set(nome, ouvintes.get(nome).filter((f) => f !== fn));
}
function emit(nome, payload) {
  for (const fn of ouvintes.get(nome) ?? []) fn(payload);
}
const parar = on('pedido:novo', (p) => console.log('A', p.total));
on('pedido:novo', (p) => console.log('B', p.id));
emit('pedido:novo', { id: 3, total: 25 });
parar();
emit('pedido:novo', { id: 4, total: 40 });`,
    expectedOutput: 'A 25\nB 3\nB 4',
    explanation:
      'Os dois ouvintes rodam no primeiro `emit`, na ordem de inscrição. Depois do `parar()`, só o B continua.',
    difficulty: 2,
  },
  {
    id: 'typescript.m03.q39',
    lessonIds: ['typescript.m03.l05'],
    kind: 'true-false',
    prompt:
      'O `EventEmitter` do Node, sem nenhuma tipagem extra, avisa na compilação quando você escreve o nome de um evento errado.',
    answer: false,
    explanation:
      'O `on` dele aceita qualquer `string`. O ouvinte com nome errado simplesmente nunca é chamado. O mapa de eventos com `keyof` é o que traz essa checagem.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m03.f25',
    lessonIds: ['typescript.m03.l05'],
    exerciseId: 'typescript.m03.e09',
    kind: 'multiple-choice',
    prompt: "No seu `Barramento`, qual o tipo do `p` em `bus.on('loja:fechou', (p) => ...)`?",
    options: ['{ hora: string }', 'any', "Eventos['pedido:novo']", 'Eventos'],
    answerIndex: 0,
    explanation: "K vira `'loja:fechou'`, e o callback recebe `Eventos['loja:fechou']`.",
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f26',
    lessonIds: ['typescript.m03.l05'],
    exerciseId: 'typescript.m03.e09',
    kind: 'true-false',
    prompt:
      'No código inicial do `Barramento`, com `fn: (payload: any) => void`, o callback podia ler `p.total` num evento `loja:fechou` sem erro de compilação.',
    answer: true,
    explanation: 'O `any` desliga a checagem dentro do callback. Com `Eventos[K]`, o TypeScript barra.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f27',
    lessonIds: ['typescript.m03.l05'],
    exerciseId: 'typescript.m03.d05',
    kind: 'multiple-choice',
    prompt: 'Depois do conserto, qual é o tipo `NomeRota`?',
    options: ["'listarPedidos' | 'criarPedido' | 'cardapio'", 'string', 'Rota', "'GET' | 'POST'"],
    answerIndex: 0,
    explanation: 'Com `satisfies`, `typeof ROTAS` mantém as chaves escritas, e `keyof` pega os nomes.',
    difficulty: 1,
  },
  {
    id: 'typescript.m03.f28',
    lessonIds: ['typescript.m03.l05'],
    exerciseId: 'typescript.m03.d05',
    kind: 'true-false',
    prompt:
      "Com o `satisfies`, se alguém escrever `metodo: 'DELETE'` numa rota nova, o TypeScript continua acusando o erro.",
    answer: true,
    explanation: "O `satisfies` confere cada item contra `Rota`, que só aceita `'GET' | 'POST'`.",
    difficulty: 1,
  },
];
