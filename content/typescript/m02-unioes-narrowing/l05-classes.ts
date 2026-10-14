import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'typescript.m02.l05',
  moduleId: 'typescript.m02',
  order: 5,
  title: 'Classes em TypeScript: private, readonly e o molde abstrato',
  concepts: [
    'public, private e protected',
    'readonly',
    'parâmetros de propriedade no construtor',
    'getter',
    'classe abstract',
    'private vs #campo',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Classes de JavaScript você já conhece. O TypeScript acrescenta **modificadores** que controlam quem ' +
        'pode mexer em quê:\n\n' +
        '| Modificador | Quem acessa |\n' +
        '| --- | --- |\n' +
        '| `public` (o padrão) | qualquer um |\n' +
        '| `private` | só a própria classe |\n' +
        '| `protected` | a classe e as subclasses |\n' +
        '| `readonly` | todo mundo lê; ninguém reatribui depois do construtor |\n\n' +
        'A checagem é **em tempo de compilação**: `private` some no JavaScript gerado e vira um campo comum. ' +
        'Para privacidade também em tempo de execução, existe o `#campo` do JavaScript moderno.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `class ContaFreela {
  readonly titular: string;
  private saldo: number;

  constructor(titular: string) {
    this.titular = titular;
    this.saldo = 0;
  }

  receber(valor: number): void {
    this.saldo += valor;
  }

  get saldoAtual(): number {
    return this.saldo;
  }
}

const conta = new ContaFreela('Você');
conta.receber(350);
console.log(conta.saldoAtual); // 350
conta.saldo = 1_000_000; // erro: Property 'saldo' is private
conta.titular = 'Outro'; // erro: Cannot assign to 'titular' because it is a read-only property`,
      explanation:
        'De fora, o saldo só muda pelos métodos da classe, e o getter `saldoAtual` deixa ler sem deixar escrever.',
    },
    {
      kind: 'text',
      markdown:
        '**Parâmetros de propriedade**: declarar o campo, receber o parâmetro e escrever `this.x = x` é ' +
        'repetitivo. Coloque o modificador direto no parâmetro do construtor e o TypeScript cria e preenche o ' +
        'campo sozinho:\n\n' +
        '```ts\nclass Cliente {\n  constructor(\n    public readonly nome: string,\n    private limiteFiado: number,\n' +
        '  ) {}\n}\n```\n\n' +
        'É o mesmo que declarar `nome` e `limiteFiado` e atribuir os dois no construtor.\n\n' +
        'Uma classe **`abstract`** não pode ser instanciada: é um molde. Ela pode ter métodos prontos e métodos ' +
        '`abstract`, sem corpo, que cada subclasse é **obrigada** a implementar. Use quando as subclasses ' +
        'compartilham código; quando só o formato importa, uma interface basta.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `abstract class Servico {
  constructor(readonly descricao: string) {}

  abstract preco(): number;

  resumo(): string {
    return \`\${this.descricao}: R$ \${this.preco().toFixed(2)}\`;
  }
}

class ServicoPorHora extends Servico {
  constructor(
    descricao: string,
    private horas: number,
    private valorHora: number,
  ) {
    super(descricao);
  }

  preco(): number {
    return this.horas * this.valorHora;
  }
}

console.log(new ServicoPorHora('Landing page', 4, 90).resumo()); // Landing page: R$ 360.00
new Servico('Genérico'); // erro: Cannot create an instance of an abstract class`,
      explanation:
        '`resumo()` é escrito uma vez só, no molde, e funciona para toda subclasse que souber o `preco()`.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `class Conta {
  #saldo = 100;
  titular = 'Você';
}
const c = new Conta();
console.log(Object.keys(c));
console.log(c.saldo);`,
      explanation:
        'O `#saldo` não aparece nem por acesso direto: é privado de verdade. Um `private saldo` do TypeScript apareceria nos dois.',
    },
  ],
  checkQuestionIds: ['typescript.m02.q32'],
  exerciseIds: ['typescript.m02.e09', 'typescript.m02.e10'],
  debugExerciseIds: ['typescript.m02.d05'],
};

const ORCAMENTO_ITEM = `interface Item {
  descricao: string;
  valor: number;
}
`;

export const exercises: Exercise[] = [
  {
    id: 'typescript.m02.e09',
    lessonId: 'typescript.m02.l05',
    kind: 'implement',
    title: 'A conta do freela',
    promptMarkdown:
      'Crie a classe `ContaFreela` para controlar o que entra e sai (mais sai do que entra, mas enfim):\n\n' +
      '- construtor `(titular: string, limiteSaque: number)` usando **parâmetros de propriedade**: ' +
      '`titular` público e `readonly`, `limiteSaque` `private`;\n' +
      '- campo `private saldo`, começando em 0;\n' +
      "- `receber(valor)`: soma ao saldo; valor menor ou igual a 0 lança `Error('Valor inválido')`;\n" +
      "- `sacar(valor)`: acima do `limiteSaque` lança `Error('Acima do limite')`; acima do saldo lança " +
      "`Error('Saldo insuficiente')`; senão, desconta;\n" +
      '- getter `saldoAtual`, que devolve o saldo.\n\n' +
      'Os testes conferem que ninguém de fora mexe no saldo nem troca o titular.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `class ContaFreela {
  titular: string;
  saldo = 0;

  constructor(titular: string) {
    this.titular = titular;
  }

  receber(valor: number): void {
    this.saldo += valor;
  }
}
`,
    solution: `class ContaFreela {
  private saldo = 0;

  constructor(
    readonly titular: string,
    private limiteSaque: number,
  ) {}

  receber(valor: number): void {
    if (valor <= 0) throw new Error('Valor inválido');
    this.saldo += valor;
  }

  sacar(valor: number): void {
    if (valor > this.limiteSaque) throw new Error('Acima do limite');
    if (valor > this.saldo) throw new Error('Saldo insuficiente');
    this.saldo -= valor;
  }

  get saldoAtual(): number {
    return this.saldo;
  }
}
`,
    tests: [
      {
        description: 'recebe e saca',
        code: `const c = new ContaFreela('Você', 500);
c.receber(800);
c.sacar(300);
assert.strictEqual(c.saldoAtual, 500);`,
      },
      {
        description: 'saque acima do limite ou do saldo lança erro',
        code: `const c = new ContaFreela('Você', 500);
c.receber(1000);
assert.throws(() => c.sacar(600), /Acima do limite/);
const d = new ContaFreela('Você', 500);
d.receber(100);
assert.throws(() => d.sacar(200), /Saldo insuficiente/);
assert.strictEqual(d.saldoAtual, 100);`,
      },
      {
        description: 'valor inválido no receber lança erro',
        code: `const c = new ContaFreela('Você', 500);
assert.throws(() => c.receber(0), /Valor inválido/);
assert.throws(() => c.receber(-50), /Valor inválido/);`,
      },
      {
        description: 'ninguém de fora mexe no saldo, no limite nem no titular',
        code: `const c = new ContaFreela('Você', 500);
// @ts-expect-error
c.saldo = 1000000;
// @ts-expect-error
c.titular = 'Sobrinho do cliente';
// @ts-expect-error
c.limiteSaque = 999999;
assert.ok(c);`,
      },
      {
        description: 'o titular continua visível para leitura',
        code: `const nome: string = new ContaFreela('Você', 500).titular;
assert.strictEqual(nome, 'Você');`,
      },
    ],
    hints: [
      'Parâmetro de propriedade: `constructor(readonly titular: string, private limiteSaque: number) {}`.',
      'O saldo pode ser um campo com valor inicial: `private saldo = 0;`.',
      'Getter: `get saldoAtual(): number { return this.saldo; }`. Use sem parênteses: `c.saldoAtual`.',
    ],
    followUpQuestionIds: ['typescript.m02.f25', 'typescript.m02.f26'],
    difficulty: 2,
  },
  {
    id: 'typescript.m02.e10',
    lessonId: 'typescript.m02.l05',
    kind: 'implement',
    title: 'Serviços com molde abstrato',
    promptMarkdown:
      'Use a classe abstrata `Servico` (já pronta) para criar dois serviços:\n\n' +
      '- `ServicoPorHora(descricao, horas, valorHora)`: preço = horas × valor da hora;\n' +
      '- `ServicoFechado(descricao, valor)`: preço = valor.\n\n' +
      'As duas estendem `Servico` e implementam `preco()`. Depois, faça `orcamentoTotal(servicos)` somar o ' +
      'preço de todos.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `abstract class Servico {
  constructor(readonly descricao: string) {}

  abstract preco(): number;

  resumo(): string {
    return \`\${this.descricao}: R$ \${this.preco().toFixed(2)}\`;
  }
}

// crie aqui ServicoPorHora e ServicoFechado

function orcamentoTotal(servicos: Servico[]): number {
  return 0;
}
`,
    solution: `abstract class Servico {
  constructor(readonly descricao: string) {}

  abstract preco(): number;

  resumo(): string {
    return \`\${this.descricao}: R$ \${this.preco().toFixed(2)}\`;
  }
}

class ServicoPorHora extends Servico {
  constructor(
    descricao: string,
    private horas: number,
    private valorHora: number,
  ) {
    super(descricao);
  }

  preco(): number {
    return this.horas * this.valorHora;
  }
}

class ServicoFechado extends Servico {
  constructor(
    descricao: string,
    private valor: number,
  ) {
    super(descricao);
  }

  preco(): number {
    return this.valor;
  }
}

function orcamentoTotal(servicos: Servico[]): number {
  return servicos.reduce((soma, s) => soma + s.preco(), 0);
}
`,
    tests: [
      {
        description: 'preço por hora e preço fechado',
        code: `assert.strictEqual(new ServicoPorHora('Landing page', 4, 90).preco(), 360);
assert.strictEqual(new ServicoFechado('Logo', 150).preco(), 150);`,
      },
      {
        description: 'o resumo é herdado da classe abstrata',
        code: "assert.strictEqual(new ServicoFechado('Logo', 150).resumo(), 'Logo: R$ 150.00');",
      },
      {
        description: 'o orçamento soma todos os serviços',
        code: `const servicos: Servico[] = [new ServicoPorHora('Landing page', 4, 90), new ServicoFechado('Logo', 150)];
assert.strictEqual(orcamentoTotal(servicos), 510);
assert.strictEqual(orcamentoTotal([]), 0);`,
      },
      {
        description: 'Servico continua abstrata e exige preco()',
        code: `// @ts-expect-error
const generico = new Servico('Genérico');
// @ts-expect-error
class Incompleto extends Servico {}
assert.ok(generico && Incompleto);`,
      },
    ],
    hints: [
      '`class ServicoFechado extends Servico { ... }` e, no construtor, chame `super(descricao)` primeiro.',
      'Os campos extras podem ser parâmetros de propriedade: `private valor: number`.',
      'Some com `servicos.reduce((soma, s) => soma + s.preco(), 0)`.',
    ],
    followUpQuestionIds: ['typescript.m02.f27', 'typescript.m02.f28'],
    difficulty: 2,
  },
  {
    id: 'typescript.m02.d05',
    lessonId: 'typescript.m02.l05',
    kind: 'debug',
    title: 'Encapsulamento furado',
    promptMarkdown:
      'O `private itens` deveria proteger o orçamento, mas o getter `lista` entrega o próprio array: o ' +
      "sobrinho do cliente fez `orcamento.lista.push({ descricao: 'Desconto camarada', valor: -500 })` e o " +
      'total zerou.\n\n' +
      'Conserte o getter `lista` para:\n\n' +
      '1. ter tipo de retorno `readonly Item[]`, para o `push` de fora nem compilar;\n' +
      '2. devolver uma **cópia** do array, para ninguém mexer no original nem forçando com `as`.',
    language: 'ts',
    moduleSystem: 'commonjs',
    starterCode: `${ORCAMENTO_ITEM}
class Orcamento {
  private itens: Item[] = [];

  constructor(readonly cliente: string) {}

  adicionar(descricao: string, valor: number): void {
    if (valor <= 0) throw new Error('Valor inválido');
    this.itens.push({ descricao, valor });
  }

  get lista(): Item[] {
    return this.itens;
  }

  total(): number {
    return this.itens.reduce((soma, item) => soma + item.valor, 0);
  }
}
`,
    solution: `${ORCAMENTO_ITEM}
class Orcamento {
  private itens: Item[] = [];

  constructor(readonly cliente: string) {}

  adicionar(descricao: string, valor: number): void {
    if (valor <= 0) throw new Error('Valor inválido');
    this.itens.push({ descricao, valor });
  }

  get lista(): readonly Item[] {
    return [...this.itens];
  }

  total(): number {
    return this.itens.reduce((soma, item) => soma + item.valor, 0);
  }
}
`,
    tests: [
      {
        description: 'push de fora na lista não compila',
        code: `const o = new Orcamento('Padaria Pão de Ontem');
o.adicionar('Site', 500);
// @ts-expect-error
o.lista.push({ descricao: 'Desconto camarada', valor: -500 });
assert.ok(o);`,
      },
      {
        description: 'mexer na lista não muda o total',
        code: `const o = new Orcamento('Padaria Pão de Ontem');
o.adicionar('Site', 500);
const copia = o.lista as Item[];
copia.push({ descricao: 'Desconto camarada', valor: -500 });
assert.strictEqual(o.total(), 500);`,
      },
      {
        description: 'a lista continua mostrando os itens',
        code: `const o = new Orcamento('Padaria Pão de Ontem');
o.adicionar('Site', 500);
o.adicionar('Logo', 150);
assert.deepStrictEqual(o.lista, [
  { descricao: 'Site', valor: 500 },
  { descricao: 'Logo', valor: 150 },
]);`,
      },
    ],
    hints: [
      'Troque o tipo de retorno do getter para `readonly Item[]`.',
      '`readonly` some no JavaScript. Para proteger de verdade, devolva uma cópia: `[...this.itens]`.',
    ],
    followUpQuestionIds: ['typescript.m02.f29', 'typescript.m02.f30'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- gerais ----
  {
    id: 'typescript.m02.q32',
    lessonIds: ['typescript.m02.l05'],
    kind: 'multiple-choice',
    prompt: 'Um campo `private saldo` numa classe TypeScript pode ser acessado...',
    options: [
      'só dentro da própria classe',
      'por qualquer código, mas só para leitura',
      'pela classe e pelas subclasses',
      'só dentro do construtor',
    ],
    answerIndex: 0,
    explanation: 'Leitura para todos é `readonly`; classe e subclasses é `protected`.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q33',
    lessonIds: ['typescript.m02.l05'],
    kind: 'true-false',
    prompt: 'Este código compila.',
    code: `class Job {
  constructor(readonly id: string) {}
}

const j = new Job('J1');
j.id = 'J2';`,
    answer: false,
    explanation: '`readonly id` só pode receber valor na criação. Reatribuir depois é erro.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q34',
    lessonIds: ['typescript.m02.l05'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `class Conta {
  #saldo = 100;
  titular = 'Você';
  ver() {
    return this.#saldo;
  }
}
const c = new Conta();
console.log(Object.keys(c).join(', '));
console.log(c.ver());`,
    expectedOutput: 'titular\n100',
    explanation:
      '`#saldo` é privado de verdade: não aparece em `Object.keys`, mas os métodos da própria classe enxergam.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q35',
    lessonIds: ['typescript.m02.l05'],
    kind: 'multiple-choice',
    prompt: 'Qual a diferença entre `private saldo` (TypeScript) e `#saldo` (JavaScript)?',
    options: [
      '`private` só é checado na compilação; `#saldo` é privado também em tempo de execução',
      'Nenhuma: são sinônimos',
      '`#saldo` só funciona em TypeScript',
      '`private` impede o campo de existir no JavaScript gerado',
    ],
    answerIndex: 0,
    explanation: 'O `private` some na compilação e o campo vira comum. O `#` é do próprio JavaScript.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q36',
    lessonIds: ['typescript.m02.l05'],
    kind: 'true-false',
    prompt: 'Uma classe `abstract` pode ter métodos com implementação, que as subclasses herdam.',
    answer: true,
    explanation:
      'Esse é o ponto dela: código compartilhado no molde e métodos `abstract` para cada subclasse completar.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q37',
    lessonIds: ['typescript.m02.l05'],
    kind: 'multiple-choice',
    prompt: 'Com a classe abaixo, qual linha compila?',
    code: `abstract class Veiculo {
  abstract consumoKmPorLitro(): number;
}`,
    options: [
      '`class Utilitario extends Veiculo { consumoKmPorLitro() { return 11; } }`',
      '`const v = new Veiculo();`',
      '`class Moto extends Veiculo {}`',
      '`class Carro implements Veiculo {}`',
    ],
    answerIndex: 0,
    explanation:
      'Classe abstrata não pode ser instanciada, e quem estende ou implementa precisa ter `consumoKmPorLitro()`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q38',
    lessonIds: ['typescript.m02.l05'],
    kind: 'multiple-choice',
    prompt: 'Quando faz mais sentido uma classe `abstract` em vez de uma `interface`?',
    options: [
      'Quando as subclasses compartilham código pronto, além do formato',
      'Quando você quer que o tipo suma do JavaScript gerado',
      'Quando o objeto vem de um JSON',
      'Nunca: interface sempre substitui',
    ],
    answerIndex: 0,
    explanation: 'Interface só descreve formato e some na compilação. Classe abstrata carrega implementação.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.q39',
    lessonIds: ['typescript.m02.l05'],
    kind: 'fill-blank',
    prompt: 'Complete o modificador para que só a própria classe enxergue `limiteFiado`.',
    code: `class Cliente {
  constructor(
    public readonly nome: string,
    ___ limiteFiado: number,
  ) {}
}`,
    acceptedAnswers: ['private'],
    explanation: '`private` no parâmetro cria um campo privado e já atribui o argumento a ele.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.q40',
    lessonIds: ['typescript.m02.l05'],
    kind: 'true-false',
    prompt:
      '`protected` deixa o campo visível na própria classe e nas subclasses, mas não para quem usa o objeto de fora.',
    answer: true,
    explanation: 'É o meio-termo entre `private` (só a classe) e `public` (todo mundo).',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'typescript.m02.f25',
    lessonIds: ['typescript.m02.l05'],
    exerciseId: 'typescript.m02.e09',
    kind: 'multiple-choice',
    prompt:
      'Na sua classe, o que `constructor(readonly titular: string, private limiteSaque: number) {}` faz?',
    options: [
      'Declara os campos `titular` e `limiteSaque` e já atribui os argumentos a eles',
      'Só declara os parâmetros; os campos precisam ser criados à parte',
      'Cria variáveis locais que somem no fim do construtor',
      'Torna os dois campos estáticos',
    ],
    answerIndex: 0,
    explanation: 'O modificador no parâmetro é o atalho para "declarar o campo + `this.x = x`".',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f26',
    lessonIds: ['typescript.m02.l05'],
    exerciseId: 'typescript.m02.e09',
    kind: 'true-false',
    prompt:
      'No JavaScript gerado da sua `ContaFreela`, `saldo` vira um campo comum: o `private` só é checado pelo TypeScript.',
    answer: true,
    explanation: 'Os testes com `@ts-expect-error` existem justamente porque a proteção é do compilador.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.f27',
    lessonIds: ['typescript.m02.l05'],
    exerciseId: 'typescript.m02.e10',
    kind: 'multiple-choice',
    prompt: 'Por que o seu `ServicoFechado` precisou implementar `preco()`?',
    options: [
      'Porque `preco()` é `abstract` em `Servico`: toda subclasse concreta é obrigada a implementar',
      'Porque `resumo()` não roda sem ele em JavaScript',
      'Porque toda classe precisa de um método chamado `preco`',
      'Não precisava: o método é herdado de `Servico`',
    ],
    answerIndex: 0,
    explanation:
      'Método `abstract` não tem corpo para herdar; o teste `class Incompleto extends Servico {}` mostra o erro.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f28',
    lessonIds: ['typescript.m02.l05'],
    exerciseId: 'typescript.m02.e10',
    kind: 'true-false',
    prompt:
      'No construtor do seu `ServicoPorHora`, `super(descricao)` precisa vir antes de qualquer uso de `this`.',
    answer: true,
    explanation: 'Numa subclasse, o objeto só existe depois que o construtor da classe-mãe roda.',
    difficulty: 1,
  },
  {
    id: 'typescript.m02.f29',
    lessonIds: ['typescript.m02.l05'],
    exerciseId: 'typescript.m02.d05',
    kind: 'multiple-choice',
    prompt: 'Por que só trocar o tipo de retorno para `readonly Item[]` não bastava?',
    options: [
      'Porque `readonly` some no JavaScript: com um `as Item[]` ainda daria para mexer no array original',
      'Porque `readonly` não funciona em getters',
      'Porque arrays `readonly` não podem ser lidos',
      'Bastava; a cópia é só enfeite',
    ],
    answerIndex: 0,
    explanation: 'O tipo protege quem joga limpo. A cópia protege de quem força a barra com `as`.',
    difficulty: 2,
  },
  {
    id: 'typescript.m02.f30',
    lessonIds: ['typescript.m02.l05'],
    exerciseId: 'typescript.m02.d05',
    kind: 'true-false',
    prompt:
      'Com `get lista(): readonly Item[]`, `o.lista.push(...)` vira erro de compilação, mas `o.lista[0].valor` continua podendo ser lido.',
    answer: true,
    explanation:
      '`readonly` em array tira os métodos que alteram (`push`, `splice`...), mas a leitura continua liberada.',
    difficulty: 1,
  },
];
