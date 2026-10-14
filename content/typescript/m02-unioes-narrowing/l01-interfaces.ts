import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m02.l01',
  moduleId: 'typescript.m02',
  order: 1,
  title: 'Interfaces: o contrato que o cliente (quase) não muda',
  concepts: [
    'interface',
    'extends',
    'interface vs type',
    'interseção (&)',
    'implements',
    'tipagem estrutural',
    'declaration merging',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'No módulo anterior você deu nome ao formato de um objeto com `type`. A outra forma de fazer isso é a ' +
        '**interface**:\n\n' +
        '```ts\ntype ClienteT = { nome: string; bairro: string };\n\ninterface Cliente {\n  nome: string;\n  bairro: string;\n}\n```\n\n' +
        'Para descrever objetos, as duas fazem quase a mesma coisa. A vantagem da interface é a **herança** ' +
        'com `extends`: a interface nova ganha todos os campos da original e acrescenta os seus. É o jeito ' +
        'natural de dizer "um cliente empresa é um cliente, só que com CNPJ".',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `interface Cliente {
  nome: string;
  bairro: string;
}

interface ClienteEmpresa extends Cliente {
  cnpj: string;
}

const padaria: ClienteEmpresa = {
  nome: 'Padaria Pão de Ontem',
  bairro: 'Centro, Osasco',
  cnpj: '12.345.678/0001-90',
};

const bar: ClienteEmpresa = { nome: 'Bar do Zé', bairro: 'Km 18' };
// erro: Property 'cnpj' is missing in type '{ nome: string; bairro: string; }'`,
      explanation:
        '`ClienteEmpresa` exige `nome`, `bairro` (herdados) e `cnpj`. Esquecer qualquer um vira erro de compilação.',
    },
    {
      kind: 'text',
      markdown:
        'Com `type`, a combinação é feita com a **interseção** `&`: o valor precisa ter **tudo** dos dois ' +
        'lados.\n\n' +
        '```ts\ntype ClienteVip = ClienteEmpresa & { whatsapp: string };\n```\n\n' +
        'Então, qual usar?\n\n' +
        '| Recurso | `interface` | `type` |\n' +
        '| --- | --- | --- |\n' +
        '| Descrever objeto | sim | sim |\n' +
        '| Combinar tipos | `extends` | `&` |\n' +
        "| União (`'pix' \\| 'cartao'`), tupla, primitivo | não | sim |\n" +
        '| Declarar de novo para acrescentar campos | sim (as declarações se juntam) | não (nome repetido é erro) |\n\n' +
        'Regra de bolso: **interface** para formatos de objetos e contratos de classes; **type** para uniões, ' +
        'tuplas e combinações. Mais importante que a escolha é o projeto ser consistente (o cliente já muda ' +
        'de ideia o suficiente pelos dois).',
    },
    {
      kind: 'text',
      markdown:
        'Uma classe pode prometer seguir uma interface com `implements`. O TypeScript confere se a classe tem ' +
        'todos os campos e métodos, com os tipos certos.\n\n' +
        'Dois detalhes importantes:\n\n' +
        '- O TypeScript é **estrutural**: o que vale é o formato, não o nome. Qualquer objeto com os campos ' +
        'certos serve onde a interface é pedida, mesmo sem `implements` e sem ser instância de classe nenhuma.\n' +
        '- Interfaces e `type` **somem** na compilação. No JavaScript gerado não sobra nada delas, então não ' +
        'existe `x instanceof Cliente` para uma interface.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `interface Cobranca {
  descricao: string;
  total(): number;
}

class HoraTrabalhada implements Cobranca {
  descricao: string;
  horas: number;
  valorHora: number;

  constructor(descricao: string, horas: number, valorHora: number) {
    this.descricao = descricao;
    this.horas = horas;
    this.valorHora = valorHora;
  }

  total(): number {
    return this.horas * this.valorHora;
  }
}

// Um objeto literal também serve: o que importa é o formato.
const logo: Cobranca = { descricao: 'Logo da padaria', total: () => 150 };

const itens: Cobranca[] = [new HoraTrabalhada('Landing page', 4, 90), logo];`,
      explanation:
        'Se `HoraTrabalhada` esquecesse o método `total()`, o erro apareceria na linha do `implements`, ' +
        'antes de qualquer cliente reclamar.',
    },
  ],
  checkQuestionIds: ['typescript.m02.q01'],
  exerciseIds: ['typescript.m02.e01', 'typescript.m02.e02'],
  debugExerciseIds: ['typescript.m02.d01'],
};

export const exercises: Exercise[] = [
  {
    id: 'typescript.m02.e01',
    lessonId: 'typescript.m02.l01',
    kind: 'implement',
    title: 'Ficha do cliente VIP',
    promptMarkdown:
      'A agenda de clientes está toda tipada como `Cliente`, mas agora tem empresa com CNPJ e cliente VIP ' +
      'com WhatsApp (aquele que manda áudio de 4 minutos).\n\n' +
      '1. Crie `interface ClienteEmpresa` que **estende** `Cliente` com `cnpj: string`.\n' +
      '2. Crie `type ClienteVip` como a **interseção** de `ClienteEmpresa` com `{ whatsapp: string }`.\n' +
      '3. Mude `etiqueta` para receber um `ClienteVip` e devolver o texto no formato ' +
      "`'Pastelaria Pasteliz (Vila Yara) · CNPJ 11.222.333/0001-44 · WhatsApp 11 98888-7777'`.",
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `interface Cliente {
  nome: string;
  bairro: string;
}

// crie aqui a interface ClienteEmpresa e o type ClienteVip

function etiqueta(c: Cliente): string {
  return \`\${c.nome} (\${c.bairro})\`;
}
`,
    solution: `interface Cliente {
  nome: string;
  bairro: string;
}

interface ClienteEmpresa extends Cliente {
  cnpj: string;
}

type ClienteVip = ClienteEmpresa & { whatsapp: string };

function etiqueta(c: ClienteVip): string {
  return \`\${c.nome} (\${c.bairro}) · CNPJ \${c.cnpj} · WhatsApp \${c.whatsapp}\`;
}
`,
    tests: [
      {
        description: 'a etiqueta junta nome, bairro, CNPJ e WhatsApp',
        code: `const c: ClienteVip = {
  nome: 'Pastelaria Pasteliz',
  bairro: 'Vila Yara',
  cnpj: '11.222.333/0001-44',
  whatsapp: '11 98888-7777',
};
assert.strictEqual(etiqueta(c), 'Pastelaria Pasteliz (Vila Yara) · CNPJ 11.222.333/0001-44 · WhatsApp 11 98888-7777');`,
      },
      {
        description: 'um ClienteEmpresa sem CNPJ não compila',
        code: `const ok: ClienteEmpresa = { nome: 'Bar do Zé', bairro: 'Km 18', cnpj: '1' };
// @ts-expect-error
const semCnpj: ClienteEmpresa = { nome: 'Bar do Zé', bairro: 'Km 18' };
assert.ok(ok && semCnpj);`,
      },
      {
        description: 'um ClienteVip sem WhatsApp não compila',
        code: `const comZap: ClienteVip = { nome: 'Bar do Zé', bairro: 'Km 18', cnpj: '1', whatsapp: '11 9' };
// @ts-expect-error
const semZap: ClienteVip = { nome: 'Bar do Zé', bairro: 'Km 18', cnpj: '1' };
assert.ok(comZap && semZap);`,
      },
      {
        description: 'um ClienteVip também serve onde se pede um Cliente',
        code: `const vip: ClienteVip = { nome: 'Oficina Ronco Bom', bairro: 'Jardim D\\'Abril', cnpj: '2', whatsapp: '11 7' };
const c: Cliente = vip;
assert.strictEqual(c.nome, 'Oficina Ronco Bom');`,
      },
    ],
    hints: [
      '`interface B extends A { ... }` copia os campos de `A` e acrescenta os novos.',
      'Interseção: `type C = A & { campo: tipo }`.',
      'Troque o tipo do parâmetro de `etiqueta` para `ClienteVip`; com `Cliente`, o TypeScript não deixa ler `cnpj`.',
    ],
    followUpQuestionIds: ['typescript.m02.f01', 'typescript.m02.f02'],
    difficulty: 1,
  },
  {
    id: 'typescript.m02.e02',
    lessonId: 'typescript.m02.l01',
    kind: 'implement',
    title: 'Cobranças que seguem o contrato',
    promptMarkdown:
      'O sistema de cobrança aceita qualquer coisa que siga o contrato `Cobranca`. Implemente:\n\n' +
      '- `class HoraTrabalhada implements Cobranca`, com construtor `(descricao, horas, valorHora)` e ' +
      '`total()` = horas × valor da hora;\n' +
      '- `class PrecoFechado implements Cobranca`, com construtor `(descricao, valor)` e `total()` = valor;\n' +
      '- `somarCobrancas(itens: Cobranca[]): number`, que soma o `total()` de todos.\n\n' +
      'Não mude a interface: ela é o contrato combinado com o cliente (até ele mudar de ideia).',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `interface Cobranca {
  descricao: string;
  total(): number;
}

class HoraTrabalhada implements Cobranca {
  descricao: string;

  constructor(descricao: string) {
    this.descricao = descricao;
  }
}

// crie aqui a classe PrecoFechado

function somarCobrancas(itens: Cobranca[]): number {
  return 0;
}
`,
    solution: `interface Cobranca {
  descricao: string;
  total(): number;
}

class HoraTrabalhada implements Cobranca {
  descricao: string;
  horas: number;
  valorHora: number;

  constructor(descricao: string, horas: number, valorHora: number) {
    this.descricao = descricao;
    this.horas = horas;
    this.valorHora = valorHora;
  }

  total(): number {
    return this.horas * this.valorHora;
  }
}

class PrecoFechado implements Cobranca {
  descricao: string;
  valor: number;

  constructor(descricao: string, valor: number) {
    this.descricao = descricao;
    this.valor = valor;
  }

  total(): number {
    return this.valor;
  }
}

function somarCobrancas(itens: Cobranca[]): number {
  return itens.reduce((soma, item) => soma + item.total(), 0);
}
`,
    tests: [
      {
        description: 'HoraTrabalhada cobra horas × valor da hora',
        code: "assert.strictEqual(new HoraTrabalhada('Landing page', 4, 90).total(), 360);",
      },
      {
        description: 'PrecoFechado cobra o valor combinado',
        code: "assert.strictEqual(new PrecoFechado('Logo', 150).total(), 150);",
      },
      {
        description: 'somarCobrancas soma classes e objetos que seguem o contrato',
        code: `const ajuste: Cobranca = { descricao: 'Ajuste no rodapé', total: () => 40 };
const itens: Cobranca[] = [new HoraTrabalhada('Landing page', 4, 90), new PrecoFechado('Logo', 150), ajuste];
assert.strictEqual(somarCobrancas(itens), 550);
assert.strictEqual(somarCobrancas([]), 0);`,
      },
      {
        description: 'as duas classes cumprem o contrato Cobranca',
        code: `const a: Cobranca = new HoraTrabalhada('Manutenção', 1, 80);
const b: Cobranca = new PrecoFechado('Banner', 60);
assert.strictEqual(a.descricao + ' e ' + b.descricao, 'Manutenção e Banner');`,
      },
    ],
    hints: [
      'O erro "incorrectly implements interface" diz qual membro está faltando na classe.',
      'Declare os campos (`horas: number;`), receba no construtor e atribua com `this.horas = horas`.',
      'Para somar: `itens.reduce((soma, item) => soma + item.total(), 0)`.',
    ],
    followUpQuestionIds: ['typescript.m02.f03', 'typescript.m02.f04'],
    difficulty: 2,
  },
  {
    id: 'typescript.m02.d01',
    lessonId: 'typescript.m02.l01',
    kind: 'debug',
    title: 'Entrega pela metade',
    promptMarkdown:
      'O estagiário (você, ano passado) tipou a entrega como `Endereco | Prazo`. Compila, mas o resto do ' +
      'código não consegue ler `prazoDias` da entrega, e o tipo aceita entrega sem prazo nenhum, o que o ' +
      'cliente adoraria. Uma entrega precisa ter **os dois**: endereço **e** prazo. Conserte o tipo.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `interface Endereco {
  rua: string;
  numero: number;
  bairro: string;
}

interface Prazo {
  prazoDias: number;
}

type Entrega = Endereco | Prazo;

function criarEntrega(endereco: Endereco, prazo: Prazo): Entrega {
  return { ...endereco, ...prazo };
}
`,
    solution: `interface Endereco {
  rua: string;
  numero: number;
  bairro: string;
}

interface Prazo {
  prazoDias: number;
}

type Entrega = Endereco & Prazo;

function criarEntrega(endereco: Endereco, prazo: Prazo): Entrega {
  return { ...endereco, ...prazo };
}
`,
    tests: [
      {
        description: 'a entrega criada tem endereço e prazo acessíveis',
        code: `const e = criarEntrega({ rua: 'Av. dos Autonomistas', numero: 1500, bairro: 'Centro' }, { prazoDias: 3 });
assert.strictEqual(e.prazoDias, 3);
assert.strictEqual(e.bairro, 'Centro');`,
      },
      {
        description: 'uma entrega sem prazo não compila',
        code: `// @ts-expect-error
const semPrazo: Entrega = { rua: 'Rua da Estação', numero: 10, bairro: 'Km 18' };
assert.ok(semPrazo);`,
      },
    ],
    hints: [
      'Uma união (`|`) aceita **um ou outro**. Qual operador exige **os dois**?',
      'Troque `Endereco | Prazo` por `Endereco & Prazo`.',
    ],
    followUpQuestionIds: ['typescript.m02.f05', 'typescript.m02.f06'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  // ---- gerais ----
  {
    id: 'typescript.m02.q01',
    lessonIds: ['typescript.m02.l01'],
    kind: 'multiple-choice',
    prompt: 'Como criar uma interface que tem tudo de `Cliente` e mais um campo `cnpj`?',
    options: [
      '`interface ClienteEmpresa extends Cliente { cnpj: string }`',
      '`interface ClienteEmpresa = Cliente + { cnpj: string }`',
      '`interface ClienteEmpresa implements Cliente { cnpj: string }`',
      '`interface ClienteEmpresa | Cliente { cnpj: string }`',
    ],
    answerIndex: 0,
    explanation:
      'Interface herda de outra com `extends`. `implements` é para classes, e `+`/`|` não fazem sentido aqui.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q02',
    lessonIds: ['typescript.m02.l01'],
    kind: 'multiple-choice',
    prompt: 'Qual destes **só** dá para fazer com `type` (e não com `interface`)?',
    options: [
      "`type Status = 'aberto' | 'entregue'`",
      'Descrever um objeto com `nome` e `bairro`',
      'Reaproveitar os campos de outro tipo de objeto',
      'Servir de contrato para uma classe com `implements`',
    ],
    answerIndex: 0,
    explanation:
      'União de literais só existe com `type`. Descrever objeto e reaproveitar campos (`extends` ou `&`) dá com os dois.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q03',
    lessonIds: ['typescript.m02.l01'],
    kind: 'true-false',
    prompt: 'Este código compila.',
    code: `interface Freela {
  titulo: string;
}
interface Freela {
  valor: number;
}

const f: Freela = { titulo: 'Site da oficina' };`,
    answer: false,
    explanation:
      'Duas interfaces com o mesmo nome se **juntam** (declaration merging). `Freela` passa a exigir `titulo` e `valor`, e falta o `valor`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q04',
    lessonIds: ['typescript.m02.l01'],
    kind: 'multiple-choice',
    prompt: 'O que sobra da `interface Cliente` no JavaScript gerado pelo TypeScript?',
    options: [
      'Nada: interfaces só existem na checagem de tipos',
      'Uma classe vazia chamada `Cliente`',
      'Um objeto com os nomes dos campos',
      'Uma função que valida o objeto em tempo de execução',
    ],
    answerIndex: 0,
    explanation:
      'Tipos e interfaces são apagados na compilação. Por isso não dá para fazer `instanceof` com uma interface.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q05',
    lessonIds: ['typescript.m02.l01'],
    kind: 'predict-output',
    prompt: 'O que este código JavaScript imprime?',
    code: `class HoraTrabalhada {
  constructor(horas) {
    this.horas = horas;
  }
  total() {
    return this.horas * 80;
  }
}

const parecido = { horas: 2, total: () => 160 };
console.log(new HoraTrabalhada(2).total() === parecido.total());
console.log(parecido instanceof HoraTrabalhada);`,
    expectedOutput: 'true\nfalse',
    explanation:
      'Os dois têm o mesmo formato (e o TypeScript aceitaria `parecido` onde se pede `HoraTrabalhada`), mas `instanceof` ' +
      'olha como o objeto foi criado: o literal não veio de `new HoraTrabalhada`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q06',
    lessonIds: ['typescript.m02.l01'],
    kind: 'multiple-choice',
    prompt: 'Quais campos um objeto do tipo `C` precisa ter?',
    code: `type A = { nome: string; valor: number };
type B = { nome: string; prazo: number };
type C = A & B;`,
    options: [
      '`nome`, `valor` e `prazo`',
      'Só `nome`, que é o campo em comum',
      '`valor` ou `prazo`, um dos dois',
      'Nenhum: interseção de tipos diferentes vira `never`',
    ],
    answerIndex: 0,
    explanation: 'Interseção soma as exigências: o valor precisa satisfazer `A` **e** `B` ao mesmo tempo.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q07',
    lessonIds: ['typescript.m02.l01'],
    kind: 'true-false',
    prompt: 'Este código compila.',
    code: `interface Notificador {
  enviar(mensagem: string): boolean;
}

class NotificadorZap implements Notificador {
  enviar(mensagem: string): string {
    return 'enviado: ' + mensagem;
  }
}`,
    answer: false,
    explanation:
      'O contrato diz que `enviar` devolve `boolean`, mas a classe devolve `string`. O `implements` acusa a diferença.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m02.f01',
    lessonIds: ['typescript.m02.l01'],
    exerciseId: 'typescript.m02.e01',
    kind: 'multiple-choice',
    prompt: 'Na sua solução, por que `etiqueta` precisou receber `ClienteVip` em vez de `Cliente`?',
    options: [
      'Porque `Cliente` não tem `cnpj` nem `whatsapp`, e o TypeScript não deixa ler campos que o tipo não tem',
      'Porque interfaces não podem ser tipo de parâmetro',
      'Porque template string só aceita interseção',
      'Não precisava: com `Cliente` também compila',
    ],
    answerIndex: 0,
    explanation:
      'O TypeScript só libera o que o tipo declara. Para ler `c.cnpj`, o tipo de `c` precisa ter `cnpj`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f02',
    lessonIds: ['typescript.m02.l01'],
    exerciseId: 'typescript.m02.e01',
    kind: 'true-false',
    prompt: 'Um valor do seu `ClienteVip` pode ser passado para uma função que pede um `Cliente`.',
    answer: true,
    explanation:
      'Ele tem `nome` e `bairro` (e mais coisas). Ter campos a mais não atrapalha: o formato de `Cliente` está lá.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f03',
    lessonIds: ['typescript.m02.l01'],
    exerciseId: 'typescript.m02.e02',
    kind: 'multiple-choice',
    prompt:
      "O objeto `{ descricao: 'Ajuste no rodapé', total: () => 40 }` do teste não é instância de nenhuma das suas classes. Por que ele entra no array de `Cobranca`?",
    options: [
      'Porque o TypeScript é estrutural: basta ter o formato da interface',
      'Porque arrays aceitam qualquer coisa',
      'Porque `implements` é opcional só em testes',
      'Ele não entra: o teste usa `as any`',
    ],
    answerIndex: 0,
    explanation: 'Quem tem `descricao: string` e `total(): number` é uma `Cobranca`, com ou sem classe.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.f04',
    lessonIds: ['typescript.m02.l01'],
    exerciseId: 'typescript.m02.e02',
    kind: 'true-false',
    prompt:
      'Se você apagar o método `total()` de `PrecoFechado`, o código continua compilando, porque a classe ainda tem `descricao`.',
    answer: false,
    explanation:
      '`implements Cobranca` exige **todos** os membros da interface. Sem `total()`, a linha da classe dá erro.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f05',
    lessonIds: ['typescript.m02.l01'],
    exerciseId: 'typescript.m02.d01',
    kind: 'multiple-choice',
    prompt: 'Com `type Entrega = Endereco | Prazo`, por que `e.prazoDias` não compilava?',
    options: [
      'Porque a entrega poderia ser só um `Endereco`, que não tem `prazoDias`',
      'Porque `prazoDias` é `number`',
      'Porque spread (`...`) não funciona em TypeScript',
      'Porque interfaces não podem entrar numa união',
    ],
    answerIndex: 0,
    explanation: 'Numa união, só dá para usar o que todos os membros têm. `prazoDias` só existe em `Prazo`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.f06',
    lessonIds: ['typescript.m02.l01'],
    exerciseId: 'typescript.m02.d01',
    kind: 'fill-blank',
    prompt: 'Complete com o operador que você usou na correção.',
    code: 'type Entrega = Endereco ___ Prazo; // precisa dos dois',
    acceptedAnswers: ['&'],
    explanation: '`&` (interseção) exige os campos dos dois tipos.',
    difficulty: 1,
  },
];
