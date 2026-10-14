import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { DOMINIO, EVENTOS, REGRAS, REPOSITORIO, SERVICO } from './projeto';

const PROJETO_COMPLETO = {
  'dominio.ts': DOMINIO,
  'regras.ts': REGRAS,
  'repositorio.ts': REPOSITORIO,
  'eventos.ts': EVENTOS,
  'servico.ts': SERVICO,
};

/** Começo dos testes que montam o projeto inteiro. */
const MONTAR = `const { novoJob } = require('./dominio') as typeof import('./dominio');
const { criarRepositorioMemoria } = require('./repositorio') as typeof import('./repositorio');
const { EventBus } = require('./eventos') as typeof import('./eventos');
const { criarServico } = require('./servico') as typeof import('./servico');
const bus = new EventBus<import('./eventos').EventosJob>();`;

export const lesson: Lesson = {
  id: 'fullstack.m02.l04',
  moduleId: 'fullstack.m02',
  order: 4,
  title: 'Eventos: o serviço avisa, as notificações escutam',
  concepts: [
    'barramento de eventos',
    'mapa de eventos como tipo',
    'genéricos com keyof e E[K]',
    'cancelar inscrição (off)',
    'this em callbacks',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Quando um job é entregue, muita coisa precisa acontecer: notificação no celular, badge do painel, ' +
        'conquista de "100 divs centralizadas", som de Pix... Se o serviço chamar cada uma, ele vira um polvo ' +
        'que importa meio projeto.\n\n' +
        'A saída é um **barramento de eventos** (event bus): o serviço só **anuncia** `job:entregue` com os ' +
        'dados, e quem se interessa **escuta**. O serviço não sabe quem está ouvindo; dá para acrescentar uma ' +
        'notificação nova sem tocar nele. É o mesmo padrão do `EventEmitter` do Node que você usou no back-end, ' +
        'e o jogo tem o seu em `src/core/event-bus.ts`: caminhão, HUD e jobs conversam por lá.',
    },
    {
      kind: 'text',
      markdown:
        'O problema do `EventEmitter` comum é que tudo é texto e `any`: errou o nome do evento (`job:entrgue`) ' +
        'ou esqueceu um campo, ninguém avisa. Em TypeScript, descreva os eventos num **tipo-mapa** (nome do ' +
        'evento → formato dos dados) e use genéricos:\n\n' +
        '- `K extends keyof E`: o nome precisa ser uma das chaves do mapa;\n' +
        '- `E[K]`: o tipo dos dados **daquele** evento (tipo de acesso indexado);\n' +
        '- os ouvintes ficam num objeto `{ [K in keyof E]?: Ouvinte<E[K]>[] }`: uma lista por evento, cada uma ' +
        'com o tipo certo.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `type EventosJob = {
  'job:aceito': { jobId: string; minuto: number };
  'job:entregue': { jobId: string; estrelas: number; valor: number };
};

type Ouvinte<T> = (dados: T) => void;

class EventBus<E> {
  private ouvintes: { [K in keyof E]?: Ouvinte<E[K]>[] } = {};

  on<K extends keyof E>(nome: K, fn: Ouvinte<E[K]>): () => void {
    (this.ouvintes[nome] ??= []).push(fn);
    return () => this.off(nome, fn);
  }

  off<K extends keyof E>(nome: K, fn: Ouvinte<E[K]>): void {
    this.ouvintes[nome] = (this.ouvintes[nome] ?? []).filter((f) => f !== fn);
  }

  emit<K extends keyof E>(nome: K, dados: E[K]): void {
    for (const fn of [...(this.ouvintes[nome] ?? [])]) fn(dados);
  }
}

const bus = new EventBus<EventosJob>();
bus.on('job:entregue', (d) => console.log(d.estrelas)); // d já é tipado
bus.emit('job:aceito', { jobId: 'j1' }); // erro: falta minuto
bus.on('job:entrgue', () => {}); // erro: evento não existe`,
      explanation:
        'O `on` devolve uma função que cancela a inscrição: guarde-a para "desligar" quem escuta. O `emit` ' +
        'percorre uma **cópia** da lista, para um ouvinte que se desinscreve no meio não atrapalhar os outros.',
    },
    {
      kind: 'text',
      markdown:
        '**Duas armadilhas clássicas ao escutar eventos:**\n\n' +
        "1. **`off` compara a função pela referência.** `bus.off('job:aceito', (d) => ...)` com uma arrow " +
        'nova não remove nada: é outra função, mesmo com o mesmo código. Guarde a função (ou a de cancelar ' +
        'que o `on` devolve).\n' +
        "2. **Método de classe solto perde o `this`.** `bus.on('job:aceito', this.contar)` passa só a função; " +
        'quando o bus chamar, `this` é `undefined`. Declare o método como arrow (`contar = () => { ... }`), ' +
        'que guarda o `this` da instância. Cuidado com `.bind(this)` dentro do `on`: cada `bind` cria uma ' +
        'função nova, e aí o `off` cai na armadilha 1.',
    },
  ],
  checkQuestionIds: ['fullstack.m02.q25'],
  exerciseIds: ['fullstack.m02.e06', 'fullstack.m02.e07'],
  debugExerciseIds: ['fullstack.m02.d04'],
};

export const exercises: Exercise[] = [
  {
    id: 'fullstack.m02.e06',
    lessonId: 'fullstack.m02.l04',
    kind: 'implement',
    title: 'Tipar o barramento de eventos',
    promptMarkdown:
      'O `EventBus` abaixo funciona, mas é todo `string` e `unknown`: os ouvintes recebem `unknown` e dá para ' +
      'emitir qualquer coisa com qualquer nome. Torne-o **genérico** no mapa de eventos `E`, **sem mudar o ' +
      'comportamento**:\n\n' +
      '- `on`, `off` e `emit` só aceitam nomes que são chaves de `E` (`K extends keyof E`);\n' +
      '- os dados de cada evento têm o tipo `E[K]`, tanto no `emit` quanto no ouvinte;\n' +
      '- `on` continua devolvendo a função que cancela a inscrição.\n\n' +
      'Dica: o objeto `ouvintes` também precisa mudar de tipo.',
    language: 'ts',
    moduleSystem: 'esm',
    starterCode: `export class EventBus<E> {
  private ouvintes: Record<string, Array<(dados: unknown) => void>> = {};

  on(nome: string, fn: (dados: unknown) => void): () => void {
    (this.ouvintes[nome] ??= []).push(fn);
    return () => this.off(nome, fn);
  }

  off(nome: string, fn: (dados: unknown) => void): void {
    this.ouvintes[nome] = (this.ouvintes[nome] ?? []).filter((f) => f !== fn);
  }

  emit(nome: string, dados: unknown): void {
    for (const fn of [...(this.ouvintes[nome] ?? [])]) fn(dados);
  }
}
`,
    solution: `type Ouvinte<T> = (dados: T) => void;

export class EventBus<E> {
  private ouvintes: { [K in keyof E]?: Ouvinte<E[K]>[] } = {};

  on<K extends keyof E>(nome: K, fn: Ouvinte<E[K]>): () => void {
    (this.ouvintes[nome] ??= []).push(fn);
    return () => this.off(nome, fn);
  }

  off<K extends keyof E>(nome: K, fn: Ouvinte<E[K]>): void {
    this.ouvintes[nome] = (this.ouvintes[nome] ?? []).filter((f) => f !== fn);
  }

  emit<K extends keyof E>(nome: K, dados: E[K]): void {
    for (const fn of [...(this.ouvintes[nome] ?? [])]) fn(dados);
  }
}
`,
    tests: [
      {
        description: 'o ouvinte recebe os dados já tipados',
        code: `type Ev = { 'job:aceito': { jobId: string; minuto: number }; 'job:entregue': { jobId: string; estrelas: number } };
const bus = new EventBus<Ev>();
const recebidos: string[] = [];
bus.on('job:aceito', (d) => {
  recebidos.push(d.jobId + '@' + d.minuto);
});
bus.emit('job:aceito', { jobId: 'j1', minuto: 10 });
assert.deepStrictEqual(recebidos, ['j1@10']);`,
      },
      {
        description: 'vários ouvintes, na ordem, e só do evento emitido',
        code: `type Ev = { 'job:aceito': { jobId: string; minuto: number }; 'job:entregue': { jobId: string; estrelas: number } };
const bus = new EventBus<Ev>();
const log: string[] = [];
bus.on('job:entregue', (d) => {
  log.push('notificação ' + d.estrelas);
});
bus.on('job:entregue', (d) => {
  log.push('badge ' + d.jobId);
});
bus.on('job:aceito', () => {
  log.push('não era pra mim');
});
bus.emit('job:entregue', { jobId: 'j7', estrelas: 5 });
assert.deepStrictEqual(log, ['notificação 5', 'badge j7']);`,
      },
      {
        description: 'a função devolvida pelo on cancela a inscrição',
        code: `type Ev = { 'job:aceito': { jobId: string; minuto: number }; 'job:entregue': { jobId: string; estrelas: number } };
const bus = new EventBus<Ev>();
let vezes = 0;
const cancelar = bus.on('job:aceito', () => {
  vezes++;
});
bus.emit('job:aceito', { jobId: 'j1', minuto: 1 });
cancelar();
bus.emit('job:aceito', { jobId: 'j2', minuto: 2 });
assert.strictEqual(vezes, 1);`,
      },
      {
        description: 'emitir com dados no formato errado não compila',
        code: `type Ev = { 'job:aceito': { jobId: string; minuto: number }; 'job:entregue': { jobId: string; estrelas: number } };
const bus = new EventBus<Ev>();
// @ts-expect-error falta o minuto
bus.emit('job:aceito', { jobId: 'j1' });`,
      },
      {
        description: 'escutar um evento que não existe não compila',
        code: `type Ev = { 'job:aceito': { jobId: string; minuto: number }; 'job:entregue': { jobId: string; estrelas: number } };
const bus = new EventBus<Ev>();
// @ts-expect-error job:entrgue (com erro de digitação) não existe
bus.on('job:entrgue', () => {});`,
      },
    ],
    hints: [
      'Comece pelas assinaturas: `on<K extends keyof E>(nome: K, fn: (dados: E[K]) => void): () => void`. Faça o mesmo em `off` e `emit`.',
      'O `Record<string, ...>` não serve mais: use um tipo mapeado, `{ [K in keyof E]?: Array<(dados: E[K]) => void> }`.',
      'Um alias ajuda a ler: `type Ouvinte<T> = (dados: T) => void;`. O corpo dos métodos não precisa mudar.',
    ],
    followUpQuestionIds: ['fullstack.m02.f17', 'fullstack.m02.f18'],
    difficulty: 3,
  },
  {
    id: 'fullstack.m02.e07',
    lessonId: 'fullstack.m02.l04',
    kind: 'implement',
    title: 'Notificações no celular do dev',
    promptMarkdown:
      'O projeto está montado: `servico.ts` emite `job:aceito` e `job:entregue` no `EventBus` de `eventos.ts`. ' +
      'Implemente `ligarNotificacoes(bus, notificar)`, que escuta os dois eventos e chama `notificar(texto)`:\n\n' +
      "- `job:aceito` → `'Job j1 aceito no minuto 30. Partiu!'`\n" +
      "- `job:entregue` → `'Job j1 entregue: 4 estrelas, R$ 500.'`\n\n" +
      'A função deve devolver outra função que **desliga** as duas notificações.',
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: PROJETO_COMPLETO,
    starterCode: `import type { EventBus, EventosJob } from './eventos';

export function ligarNotificacoes(
  bus: EventBus<EventosJob>,
  notificar: (texto: string) => void,
): () => void {
  // escute job:aceito e job:entregue e chame notificar(...)
  return () => {
    // desligue as duas
  };
}
`,
    solution: `import type { EventBus, EventosJob } from './eventos';

export function ligarNotificacoes(
  bus: EventBus<EventosJob>,
  notificar: (texto: string) => void,
): () => void {
  const desligarAceito = bus.on('job:aceito', (d) => {
    notificar(\`Job \${d.jobId} aceito no minuto \${d.minuto}. Partiu!\`);
  });
  const desligarEntregue = bus.on('job:entregue', (d) => {
    notificar(\`Job \${d.jobId} entregue: \${d.estrelas} estrelas, R$ \${d.valor}.\`);
  });
  return () => {
    desligarAceito();
    desligarEntregue();
  };
}
`,
    tests: [
      {
        description: 'aceitar e entregar pelo serviço gera as duas notificações',
        code: `${MONTAR}
const msgs: string[] = [];
ligarNotificacoes(bus, (t) => msgs.push(t));
const servico = criarServico(criarRepositorioMemoria([novoJob('j1', { pagamentoBase: 100, slaMinutos: 120 })]), bus);
servico.aceitar('j1', 30);
servico.entregar('j1', 150);
assert.deepStrictEqual(msgs, ['Job j1 aceito no minuto 30. Partiu!', 'Job j1 entregue: 4 estrelas, R$ 500.']);`,
      },
      {
        description: 'notifica eventos emitidos direto no barramento',
        code: `${MONTAR}
const msgs: string[] = [];
ligarNotificacoes(bus, (t) => msgs.push(t));
bus.emit('job:entregue', { jobId: 'j8', estrelas: 2, valor: 1600 });
assert.deepStrictEqual(msgs, ['Job j8 entregue: 2 estrelas, R$ 1600.']);`,
      },
      {
        description: 'a função devolvida desliga as duas notificações',
        code: `${MONTAR}
const msgs: string[] = [];
const desligar = ligarNotificacoes(bus, (t) => msgs.push(t));
desligar();
bus.emit('job:aceito', { jobId: 'j1', minuto: 5 });
bus.emit('job:entregue', { jobId: 'j1', estrelas: 5, valor: 500 });
assert.deepStrictEqual(msgs, []);`,
      },
    ],
    hints: [
      'Use `bus.on(...)` duas vezes. O ouvinte já recebe `d` tipado (`d.jobId`, `d.minuto`...).',
      'Guarde o que cada `on` devolve: `const desligarAceito = bus.on(...)`.',
      'A função devolvida chama as duas: `return () => { desligarAceito(); desligarEntregue(); };`.',
    ],
    followUpQuestionIds: ['fullstack.m02.f19', 'fullstack.m02.f20'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.d04',
    lessonId: 'fullstack.m02.l04',
    kind: 'debug',
    title: 'O badge que derruba o app',
    promptMarkdown:
      'O painel tem um **badge** com quantos jobs você aceitou e entregou. Desde que ele entrou, aceitar um job ' +
      'com o painel aberto estoura `TypeError` lá de dentro do barramento.\n\n' +
      'Conserte a classe `BadgeDeJobs`: os contadores devem subir com os eventos depois de `ligar()` e ' +
      'parar de subir depois de `desligar()`.',
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: PROJETO_COMPLETO,
    starterCode: `import type { EventBus, EventosJob } from './eventos';

export class BadgeDeJobs {
  aceitos = 0;
  entregues = 0;

  constructor(private bus: EventBus<EventosJob>) {}

  ligar(): void {
    this.bus.on('job:aceito', this.contarAceito);
    this.bus.on('job:entregue', this.contarEntregue);
  }

  desligar(): void {
    this.bus.off('job:aceito', this.contarAceito);
    this.bus.off('job:entregue', this.contarEntregue);
  }

  private contarAceito(): void {
    this.aceitos++;
  }

  private contarEntregue(): void {
    this.entregues++;
  }
}
`,
    solution: `import type { EventBus, EventosJob } from './eventos';

export class BadgeDeJobs {
  aceitos = 0;
  entregues = 0;

  constructor(private bus: EventBus<EventosJob>) {}

  ligar(): void {
    this.bus.on('job:aceito', this.contarAceito);
    this.bus.on('job:entregue', this.contarEntregue);
  }

  desligar(): void {
    this.bus.off('job:aceito', this.contarAceito);
    this.bus.off('job:entregue', this.contarEntregue);
  }

  private contarAceito = (): void => {
    this.aceitos++;
  };

  private contarEntregue = (): void => {
    this.entregues++;
  };
}
`,
    tests: [
      {
        description: 'conta os jobs aceitos e entregues pelo serviço',
        code: `${MONTAR}
const badge = new BadgeDeJobs(bus);
badge.ligar();
const servico = criarServico(criarRepositorioMemoria([novoJob('j1'), novoJob('j2')]), bus);
servico.aceitar('j1', 0);
servico.aceitar('j2', 10);
servico.entregar('j1', 60);
assert.strictEqual(badge.aceitos, 2);
assert.strictEqual(badge.entregues, 1);`,
      },
      {
        description: 'depois de desligar, para de contar',
        code: `${MONTAR}
const badge = new BadgeDeJobs(bus);
badge.ligar();
bus.emit('job:aceito', { jobId: 'j1', minuto: 0 });
badge.desligar();
bus.emit('job:aceito', { jobId: 'j2', minuto: 5 });
bus.emit('job:entregue', { jobId: 'j1', estrelas: 5, valor: 500 });
assert.strictEqual(badge.aceitos, 1);
assert.strictEqual(badge.entregues, 0);`,
      },
      {
        description: 'dá para ligar de novo depois de desligar',
        code: `${MONTAR}
const badge = new BadgeDeJobs(bus);
badge.ligar();
badge.desligar();
badge.ligar();
bus.emit('job:entregue', { jobId: 'j1', estrelas: 4, valor: 500 });
assert.strictEqual(badge.entregues, 1);`,
      },
    ],
    hints: [
      'Quando o bus chama `this.contarAceito`, ele chama a função solta, sem a instância: `this` fica `undefined`.',
      'Transforme os métodos em propriedades arrow: `private contarAceito = (): void => { this.aceitos++; };`.',
      'Evite `.bind(this)` dentro do `ligar`: o `desligar` receberia outra função e o `off` não removeria nada.',
    ],
    followUpQuestionIds: ['fullstack.m02.f21', 'fullstack.m02.f22'],
    difficulty: 3,
  },
];

export const questions: Question[] = [
  {
    id: 'fullstack.m02.q25',
    lessonIds: ['fullstack.m02.l04'],
    kind: 'multiple-choice',
    prompt:
      'O que um barramento de eventos **tipado** (com o mapa `EventosJob`) evita, comparado a um `EventEmitter` comum?',
    options: [
      'Emitir com nome de evento errado ou com dados no formato errado: os dois viram erro de compilação',
      'Que os ouvintes rodem em ordem',
      'Que o serviço precise de testes',
      'Que o evento seja emitido mais de uma vez',
    ],
    answerIndex: 0,
    explanation:
      'O nome precisa ser `keyof EventosJob` e os dados precisam ser `EventosJob[K]`. Erro de digitação deixa de ' +
      'ser bug silencioso.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q26',
    lessonIds: ['fullstack.m02.l04'],
    kind: 'true-false',
    prompt:
      'Com um barramento de eventos, para acrescentar uma notificação nova o serviço de jobs precisa importar ' +
      'o módulo dessa notificação.',
    answer: false,
    explanation:
      'O serviço só emite o evento. A notificação nova se inscreve no barramento sozinha; o serviço nem fica ' +
      'sabendo.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q27',
    lessonIds: ['fullstack.m02.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const ouvintes = {};
const on = (nome, fn) => (ouvintes[nome] ??= []).push(fn);
const emit = (nome, dados) => (ouvintes[nome] ?? []).forEach((fn) => fn(dados));

on('job:aceito', (d) => console.log('notifica', d.jobId));
on('job:aceito', (d) => console.log('badge', d.jobId));
emit('job:entregue', { jobId: 'j1' });
emit('job:aceito', { jobId: 'j2' });`,
    expectedOutput: 'notifica j2\nbadge j2',
    explanation:
      'Ninguém escuta `job:entregue`, então o primeiro `emit` não imprime nada. O segundo chama os dois ' +
      'ouvintes de `job:aceito`, na ordem em que foram inscritos.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q28',
    lessonIds: ['fullstack.m02.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para o nome do evento ser obrigatoriamente uma das chaves do mapa `E`.',
    code: 'on<K extends ___ E>(nome: K, fn: (dados: E[K]) => void): () => void {',
    acceptedAnswers: ['keyof'],
    explanation: "`keyof E` é a união das chaves de `E`, como `'job:aceito' | 'job:entregue'`.",
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q29',
    lessonIds: ['fullstack.m02.l04'],
    kind: 'multiple-choice',
    prompt:
      "Por que `bus.off('job:aceito', (d) => notificar(d.jobId))` não remove o ouvinte que foi inscrito com o mesmo código?",
    options: [
      'O `off` compara funções pela referência, e aquela arrow é uma função nova',
      'Porque o `off` só funciona depois de um `emit`',
      'Porque arrow functions não podem ser ouvintes',
      'Porque falta o `await`',
    ],
    answerIndex: 0,
    explanation:
      'Duas funções com o mesmo código são objetos diferentes. Guarde a referência da função (ou a de cancelar ' +
      'que o `on` devolve).',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q30',
    lessonIds: ['fullstack.m02.l04'],
    kind: 'multiple-choice',
    prompt:
      "Com `type EventosJob = { 'job:aceito': { jobId: string; minuto: number } }`, o que é `EventosJob['job:aceito']`?",
    options: [
      'O tipo `{ jobId: string; minuto: number }`',
      "O texto `'job:aceito'`",
      'Uma função ouvinte',
      'Um erro: não dá para indexar tipos',
    ],
    answerIndex: 0,
    explanation:
      'É um tipo de acesso indexado: pega o tipo da propriedade. No bus, `E[K]` faz isso para o evento `K`.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q31',
    lessonIds: ['fullstack.m02.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `class Contador {
  total = 0;
  somar() {
    return this === undefined ? 'perdi o this' : ++this.total;
  }
}
const c = new Contador();
const solto = c.somar;
console.log(c.somar());
console.log(solto());`,
    expectedOutput: '1\nperdi o this',
    explanation:
      'Chamado como `c.somar()`, o `this` é `c`. A função solta não tem dono: dentro de classe (modo ' +
      'estrito), `this` vira `undefined`. É exatamente o que acontece ao passar `this.metodo` para um `on`.',
    difficulty: 3,
  },
  {
    id: 'fullstack.m02.q32',
    lessonIds: ['fullstack.m02.l04'],
    kind: 'true-false',
    prompt:
      'No `emit`, percorrer uma cópia da lista (`[...lista]`) evita que um ouvinte que se desinscreve durante o ' +
      'evento faça outro ouvinte ser pulado.',
    answer: true,
    explanation:
      'Se a lista original mudar no meio do `for`, os índices andam e alguém pode ser pulado. Com a cópia, ' +
      'o `emit` chama exatamente quem estava inscrito no começo.',
    difficulty: 3,
  },

  // ---- acompanhamento: e06 ----
  {
    id: 'fullstack.m02.f17',
    lessonIds: ['fullstack.m02.l04'],
    exerciseId: 'fullstack.m02.e06',
    kind: 'multiple-choice',
    prompt:
      'No seu `EventBus` tipado, por que o `Record<string, Array<(dados: unknown) => void>>` teve de mudar?',
    options: [
      'Um ouvinte de `(dados: E[K]) => void` não cabe numa lista de `(dados: unknown) => void`; o tipo mapeado dá uma lista com o tipo certo por evento',
      'Porque `Record` não existe em classes',
      'Porque objetos não podem guardar arrays',
      'Porque `unknown` deixa o código mais lento',
    ],
    answerIndex: 0,
    explanation:
      'Uma função que só sabe lidar com `{ jobId, minuto }` não pode ser chamada com qualquer `unknown`. O tipo ' +
      '`{ [K in keyof E]?: Ouvinte<E[K]>[] }` guarda cada lista com o tipo do seu evento.',
    difficulty: 3,
  },
  {
    id: 'fullstack.m02.f18',
    lessonIds: ['fullstack.m02.l04'],
    exerciseId: 'fullstack.m02.e06',
    kind: 'true-false',
    prompt:
      'Depois de tipar o `EventBus`, o JavaScript gerado ficou praticamente igual ao do código inicial: o ' +
      'comportamento não mudou.',
    answer: true,
    explanation:
      'Genéricos e tipos mapeados somem na transpilação. A tarefa foi só dar ao compilador informação para ' +
      'pegar erros.',
    difficulty: 2,
  },

  // ---- acompanhamento: e07 ----
  {
    id: 'fullstack.m02.f19',
    lessonIds: ['fullstack.m02.l04'],
    exerciseId: 'fullstack.m02.e07',
    kind: 'multiple-choice',
    prompt: 'Na sua `ligarNotificacoes`, o que a função devolvida faz?',
    options: [
      'Chama as duas funções de cancelar que os `on` devolveram',
      'Emite um evento `job:desligado`',
      'Apaga todos os ouvintes do barramento, de todo mundo',
      'Nada: só existe para o TypeScript não reclamar',
    ],
    answerIndex: 0,
    explanation:
      'Ela desliga só as inscrições feitas ali. Apagar todos os ouvintes derrubaria o badge, a conquista e o ' +
      'que mais estivesse escutando.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.f20',
    lessonIds: ['fullstack.m02.l04'],
    exerciseId: 'fullstack.m02.e07',
    kind: 'true-false',
    prompt: 'Para as suas notificações funcionarem, foi preciso alterar o `servico.ts`.',
    answer: false,
    explanation:
      'O serviço já emitia os eventos. As notificações só se inscreveram no barramento: é o desacoplamento ' +
      'em ação.',
    difficulty: 1,
  },

  // ---- acompanhamento: d04 ----
  {
    id: 'fullstack.m02.f21',
    lessonIds: ['fullstack.m02.l04'],
    exerciseId: 'fullstack.m02.d04',
    kind: 'multiple-choice',
    prompt: 'Por que o `BadgeDeJobs` original estourava `TypeError`?',
    options: [
      '`this.contarAceito` foi passado solto para o `on`; quando o bus chamou, `this` era `undefined`',
      'O `aceitos` começava como `undefined`',
      'O barramento não aceita classes como ouvintes',
      'O evento `job:aceito` não existia',
    ],
    answerIndex: 0,
    explanation:
      'Métodos comuns dependem de como são chamados. Como propriedade arrow, a função guarda o `this` da ' +
      'instância.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.f22',
    lessonIds: ['fullstack.m02.l04'],
    exerciseId: 'fullstack.m02.d04',
    kind: 'true-false',
    prompt:
      "Consertar com `this.bus.on('job:aceito', this.contarAceito.bind(this))` no `ligar` e o mesmo `bind` no " +
      '`desligar` também passaria em todos os testes.',
    answer: false,
    explanation:
      'Cada `bind` cria uma função nova. O `off` do `desligar` receberia outra referência e não removeria nada: ' +
      'o teste "depois de desligar, para de contar" falharia.',
    difficulty: 3,
  },
];
