import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { MINI_API } from './mini-api';

export const lesson: Lesson = {
  id: 'fullstack.m01.l02',
  moduleId: 'fullstack.m01',
  order: 2,
  title: 'Tipos compartilhados: um contrato.ts para os dois lados',
  concepts: [
    'arquivo de contrato compartilhado',
    'DTO (o formato que viaja)',
    'Omit e Partial para criar e atualizar',
    'type guard no back (body is T)',
    'o `as` não confere nada',
    'datas viram texto no JSON',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Na lição anterior o contrato estava num comentário. Comentário não reclama quando alguém o desobedece. Com TypeScript dá para fazer melhor: escreva o contrato **uma vez**, num arquivo \`contrato.ts\`, e faça o back **e** o front importarem os mesmos tipos.

\`\`\`
projeto/
  contrato.ts       ← tipos de pedido e resposta (os dois lados importam)
  servidor/rotas.ts ← import type { Pedido, NovoPedido } from '../contrato'
  site/pedidos.ts   ← import type { Pedido, NovoPedido } from '../contrato'
\`\`\`

Se o back renomear \`cliente\` para \`nomeCliente\` no contrato, o **compilador** aponta cada linha do front que precisa mudar, antes de o motoboy reclamar.

## DTOs: o formato que viaja

O que vai e volta pela rede tem nome chique: **DTO** (*Data Transfer Object*). Nem sempre é a entidade inteira:

- para **criar**, o front não manda \`id\` nem \`status\`: quem decide é o back → \`Omit<Pedido, 'id' | 'status'>\`;
- para **atualizar**, o front manda só o que mudou → \`Partial<Pick<Pedido, 'status' | 'itens'>>\`.

Os utilitários que você aprendeu na trilha TypeScript viram, aqui, as regras do contrato.`,
    },
    {
      kind: 'example',
      language: 'ts',
      code: `// contrato.ts
export type StatusPedido = 'aberto' | 'saiu para entrega' | 'entregue';

export interface Pedido {
  id: number;
  cliente: string;
  itens: string[];
  status: StatusPedido;
  criadoEm: string; // data em texto ISO: no JSON, Date vira string
}

// O que o front manda para criar: sem id, status e criadoEm (o back decide)
export type NovoPedido = Omit<Pedido, 'id' | 'status' | 'criadoEm'>;

// O que o front manda para atualizar: qualquer pedaço de status e itens
export type AtualizacaoPedido = Partial<Pick<Pedido, 'status' | 'itens'>>;

export interface RespostaErro {
  erros: { campo: string; mensagem: string }[];
}`,
      explanation:
        'Um arquivo só, sem lógica: só tipos. Os dois lados importam com `import type`, que some na compilação.',
    },
    {
      kind: 'text',
      markdown: `## Validar no back, confiar no tipo no front

Os tipos **somem** quando o código roda. O \`req.body\` chega da rede como \`unknown\`: pode ser qualquer coisa que alguém mandou. Por isso:

- **No back**, nunca escreva \`req.body as NovoPedido\` e siga a vida. O \`as\` é uma **promessa** para o compilador, não uma checagem: se a promessa for falsa, o TypeScript acredita e o bug passa. Valide com um **type guard**: uma função que confere campo a campo e devolve \`body is NovoPedido\`. Depois do \`if\`, o tipo é verdadeiro **e** conferido.
- **No front**, a resposta do **seu** back (que valida o que entra e monta o que sai seguindo o mesmo contrato) pode ser tratada como \`Pedido\`. O front ainda valida o formulário, mas para dar uma boa experiência ao usuário, não para proteger o servidor.

Cuidado com o \`as\` também na saída: \`linhaDoBanco as unknown as Pedido\` compila, e manda para o front campos com nomes errados. Monte o objeto do contrato campo a campo.`,
    },
    {
      kind: 'example',
      language: 'ts',
      code: `import type { NovoPedido } from './contrato';

function ehNovoPedido(body: unknown): body is NovoPedido {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>; // só para conseguir ler as chaves
  return (
    typeof b.cliente === 'string' &&
    b.cliente.trim() !== '' &&
    Array.isArray(b.itens) &&
    b.itens.every((item) => typeof item === 'string')
  );
}

app.post('/api/pedidos', (req) => {
  if (!ehNovoPedido(req.body)) return { status: 400, body: { erros: [{ campo: 'corpo', mensagem: 'Pedido inválido' }] } };
  // aqui dentro, req.body é NovoPedido de verdade (e conferido)
  const pedido: Pedido = { id: proximoId++, cliente: req.body.cliente, itens: req.body.itens, status: 'aberto', criadoEm: agora() };
  return { status: 201, body: pedido };
});`,
      explanation:
        'O guard faz a ponte entre o mundo `unknown` da rede e o mundo tipado do contrato. Repare que o pedido é montado campo a campo.',
    },
    {
      kind: 'example',
      language: 'js',
      code: `const pedido = { id: 1, criadoEm: new Date('2026-03-10T12:00:00.000Z') };
const chegouNoFront = JSON.parse(JSON.stringify(pedido));
console.log(typeof pedido.criadoEm);
console.log(typeof chegouNoFront.criadoEm);
console.log(chegouNoFront.criadoEm);`,
      explanation:
        'Um `Date` atravessa a rede como texto. Se o contrato disser `criadoEm: Date`, o tipo mente para o front. Use `string` (formato ISO) e converta com `new Date(...)` quando precisar.',
    },
  ],
  checkQuestionIds: ['fullstack.m01.q10', 'fullstack.m01.q11'],
  exerciseIds: ['fullstack.m01.e03', 'fullstack.m01.e04'],
  debugExerciseIds: ['fullstack.m01.d02'],
};

// ---------- e03: contrato da oficina ----------

const SERVICO_BASE = `// contrato.ts da oficina: o back e o front importam daqui.
export type StatusServico = 'na fila' | 'em andamento' | 'pronto';

export interface Servico {
  id: number;
  placa: string;
  descricao: string;
  valor: number;
  status: StatusServico;
  criadoEm: string;
}
`;

// ---------- e04: agendamentos da barbearia ----------

const CONTRATO_BARBEARIA = `// contrato.ts da barbearia (back e front importam daqui)
export type TipoServico = 'corte' | 'barba' | 'combo';

export interface Agendamento {
  id: number;
  cliente: string;
  servico: TipoServico;
  horario: string; // "HH:MM"
}

export type NovoAgendamento = Omit<Agendamento, 'id'>;

export interface RespostaErro {
  erros: string[];
}
`;

const BARBEARIA_TOPO = `import { criarApp } from './mini-api';
import type { Agendamento, NovoAgendamento } from './contrato';

const SERVICOS: string[] = ['corte', 'barba', 'combo'];
const agendamentos: Agendamento[] = [{ id: 1, cliente: 'Seu Jorge', servico: 'barba', horario: '09:00' }];
`;

// ---------- d02: orçamentos da oficina ----------

const CONTRATO_ORCAMENTO = `// contrato.ts da oficina (o front já usa estes nomes)
export interface Orcamento {
  id: number;
  cliente: string;
  valorReais: number;
  aprovado: boolean;
}
`;

const ORCAMENTO_TOPO = `import { criarApp } from './mini-api';
import type { Orcamento } from './contrato';

// Assim as linhas saem do banco de dados (nomes em snake_case, valor em centavos, 0/1 para sim/não)
interface LinhaDoBanco {
  id: number;
  nome_cliente: string;
  valor_centavos: number;
  aprovado: 0 | 1;
}

const banco: LinhaDoBanco[] = [
  { id: 1, nome_cliente: 'Dona Cida', valor_centavos: 45000, aprovado: 1 },
  { id: 2, nome_cliente: 'Seu Valdir', valor_centavos: 128050, aprovado: 0 },
];
`;

const ORCAMENTO_ROTA = `
const app = criarApp();

app.get('/api/orcamentos/:id', (req) => {
  const linha = banco.find((l) => l.id === Number(req.params.id));
  if (!linha) return { status: 404, body: { erro: 'Orçamento não encontrado' } };
  return { status: 200, body: paraContrato(linha) };
});
`;

export const exercises: Exercise[] = [
  {
    id: 'fullstack.m01.e03',
    lessonId: 'fullstack.m01.l02',
    kind: 'implement',
    title: 'O contrato da oficina',
    promptMarkdown: `O **Auto Center Rebimboca** (Vila Yara, Osasco) vai ter um painel web e uma API. Você está escrevendo o \`contrato.ts\` que os dois lados vão importar. A entidade \`Servico\` já está pronta. Complete:

1. \`NovoServico\`: o que o front manda para **criar** um serviço. Tudo do \`Servico\`, **menos** \`id\`, \`status\` e \`criadoEm\` (quem decide é o back). Use \`Omit\`.
2. \`AtualizacaoServico\`: o que o front manda para **atualizar**. Só \`status\` e \`valor\`, e **qualquer um deles pode faltar**. Use \`Partial\` e \`Pick\`.
3. A função \`criarServico(novo: NovoServico, id: number, agora: string): Servico\`, que o back usa para montar o serviço: todo serviço novo nasce com status \`'na fila'\`.

Os testes conferem os tipos de verdade: um \`NovoServico\` com \`id\` **não pode compilar**.`,
    language: 'ts',
    moduleSystem: 'esm',
    starterCode: `${SERVICO_BASE}
export type NovoServico = Servico; // conserte

export type AtualizacaoServico = Servico; // conserte

export function criarServico(novo: NovoServico, id: number, agora: string): Servico {
  // seu código aqui
  return { ...novo, id, criadoEm: agora };
}
`,
    solution: `${SERVICO_BASE}
export type NovoServico = Omit<Servico, 'id' | 'status' | 'criadoEm'>;

export type AtualizacaoServico = Partial<Pick<Servico, 'status' | 'valor'>>;

export function criarServico(novo: NovoServico, id: number, agora: string): Servico {
  return { ...novo, id, status: 'na fila', criadoEm: agora };
}
`,
    tests: [
      {
        description: 'o front cria um serviço só com placa, descrição e valor',
        code: `const novo: NovoServico = { placa: 'ABC1D23', descricao: 'Troca de óleo', valor: 180 };
assert.ok(novo);`,
      },
      {
        description: 'um NovoServico com id não compila (quem cria o id é o back)',
        code: `// @ts-expect-error: id não faz parte do NovoServico
const comId: NovoServico = { placa: 'ABC1D23', descricao: 'Freio', valor: 300, id: 9 };
assert.ok(comId);`,
      },
      {
        description: 'atualizar só o status, ou só o valor, compila',
        code: `const a: AtualizacaoServico = { status: 'pronto' };
const b: AtualizacaoServico = { valor: 250 };
const c: AtualizacaoServico = {};
assert.ok(a && b && c);`,
      },
      {
        description: 'a atualização não aceita mudar a placa nem um status inventado',
        code: `// @ts-expect-error: placa não se atualiza por aqui
const placa: AtualizacaoServico = { placa: 'XYZ9A87' };
// @ts-expect-error: 'lavando' não é um StatusServico
const status: AtualizacaoServico = { status: 'lavando' };
assert.ok(placa && status);`,
      },
      {
        description: 'criarServico monta o serviço completo, com status "na fila"',
        code: `const s = criarServico({ placa: 'FUS4C00', descricao: 'Alinhamento', valor: 90 }, 12, '2026-03-10T08:00:00.000Z');
assert.deepStrictEqual(s, {
  placa: 'FUS4C00',
  descricao: 'Alinhamento',
  valor: 90,
  id: 12,
  status: 'na fila',
  criadoEm: '2026-03-10T08:00:00.000Z',
});`,
      },
    ],
    hints: [
      "`Omit<Tipo, 'a' | 'b'>` cria um tipo com tudo de `Tipo`, menos as chaves listadas.",
      "`Pick<Servico, 'status' | 'valor'>` escolhe as chaves; `Partial<...>` deixa todas opcionais.",
      "No `criarServico`, acrescente `status: 'na fila'` ao objeto devolvido.",
    ],
    followUpQuestionIds: ['fullstack.m01.f07', 'fullstack.m01.f08'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.e04',
    lessonId: 'fullstack.m01.l02',
    kind: 'implement',
    title: 'Porteiro de tipos na barbearia',
    promptMarkdown: `A **Barbearia Navalha Cega** (Granja Viana) usa o \`contrato.ts\` (aberto ao lado) no site e na API. Faltam duas peças no back:

1. \`ehNovoAgendamento(body: unknown): body is NovoAgendamento\`, um **type guard** que só devolve \`true\` se:
   - \`body\` for um objeto (e não \`null\`);
   - \`cliente\` for texto não vazio (só espaços não vale);
   - \`servico\` for \`'corte'\`, \`'barba'\` ou \`'combo'\` (use a lista \`SERVICOS\`);
   - \`horario\` for texto no formato \`HH:MM\` (dica: \`/^\\d{2}:\\d{2}$/\`).
2. A rota \`POST /api/agendamentos\`:
   - corpo inválido → **400** e \`{ erros: ['Agendamento inválido'] }\`;
   - corpo válido → cria o agendamento com \`id\` = quantidade atual + 1, guarda em \`agendamentos\` e responde **201** com ele. Monte o objeto **campo a campo**: campo que não está no contrato (como um \`pago: true\` mandado pelo espertinho) não entra.`,
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: { 'mini-api.ts': MINI_API, 'contrato.ts': CONTRATO_BARBEARIA },
    starterCode: `${BARBEARIA_TOPO}
function ehNovoAgendamento(body: unknown): boolean {
  // seu código aqui
  return true;
}

const app = criarApp();

// crie a rota POST /api/agendamentos aqui
`,
    solution: `${BARBEARIA_TOPO}
function ehNovoAgendamento(body: unknown): body is NovoAgendamento {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.cliente === 'string' &&
    b.cliente.trim() !== '' &&
    typeof b.servico === 'string' &&
    SERVICOS.includes(b.servico) &&
    typeof b.horario === 'string' &&
    /^\\d{2}:\\d{2}$/.test(b.horario)
  );
}

const app = criarApp();

app.post('/api/agendamentos', (req) => {
  if (!ehNovoAgendamento(req.body)) return { status: 400, body: { erros: ['Agendamento inválido'] } };
  const novo: Agendamento = {
    id: agendamentos.length + 1,
    cliente: req.body.cliente,
    servico: req.body.servico,
    horario: req.body.horario,
  };
  agendamentos.push(novo);
  return { status: 201, body: novo };
});
`,
    tests: [
      {
        description: 'aceita um agendamento válido',
        code: `assert.strictEqual(ehNovoAgendamento({ cliente: 'Rita', servico: 'corte', horario: '14:30' }), true);`,
      },
      {
        description: 'recusa null, texto e campos faltando ou errados',
        code: `const ruins: unknown[] = [
  null,
  'corte às 14h',
  { servico: 'corte', horario: '14:30' },
  { cliente: '   ', servico: 'corte', horario: '14:30' },
  { cliente: 'Rita', servico: 'sobrancelha', horario: '14:30' },
  { cliente: 'Rita', servico: 'barba', horario: '2 da tarde' },
  { cliente: 'Rita', servico: 'barba', horario: 1430 },
];
for (const corpo of ruins) {
  assert.strictEqual(ehNovoAgendamento(corpo), false, 'Deveria recusar: ' + JSON.stringify(corpo));
}`,
      },
      {
        description: 'é um type guard: depois do if, o TypeScript sabe que é NovoAgendamento',
        code: `const corpo: unknown = { cliente: 'Rita', servico: 'combo', horario: '10:00' };
if (ehNovoAgendamento(corpo)) {
  const servico: 'corte' | 'barba' | 'combo' = corpo.servico;
  assert.strictEqual(servico, 'combo');
} else {
  assert.fail('O corpo era válido.');
}`,
      },
      {
        description: 'POST válido responde 201 com o agendamento criado',
        code: `const r = await app.handle({
  method: 'POST',
  path: '/api/agendamentos',
  body: { cliente: 'Rita', servico: 'corte', horario: '14:30' },
});
assert.strictEqual(r.status, 201);
assert.deepStrictEqual(r.body, { id: 2, cliente: 'Rita', servico: 'corte', horario: '14:30' });
assert.strictEqual(agendamentos.length, 2);`,
      },
      {
        description: 'campos fora do contrato não são salvos',
        code: `const r = await app.handle({
  method: 'POST',
  path: '/api/agendamentos',
  body: { cliente: 'Espertinho', servico: 'combo', horario: '18:00', pago: true },
});
assert.deepStrictEqual(r.body, { id: 2, cliente: 'Espertinho', servico: 'combo', horario: '18:00' });`,
      },
      {
        description: 'POST inválido responde 400 e não salva nada',
        code: `const r = await app.handle({ method: 'POST', path: '/api/agendamentos', body: { cliente: 'Rita' } });
assert.strictEqual(r.status, 400);
assert.deepStrictEqual(r.body, { erros: ['Agendamento inválido'] });
assert.strictEqual(agendamentos.length, 1);`,
      },
    ],
    hints: [
      'A assinatura do guard é `function ehNovoAgendamento(body: unknown): body is NovoAgendamento`.',
      'Depois de conferir que é objeto, use `const b = body as Record<string, unknown>;` só para ler as chaves e confira cada uma com `typeof`.',
      'Na rota, depois de `if (!ehNovoAgendamento(req.body)) return ...;`, o `req.body` já é `NovoAgendamento`: monte `{ id, cliente, servico, horario }`.',
    ],
    followUpQuestionIds: ['fullstack.m01.f09', 'fullstack.m01.f10'],
    difficulty: 3,
  },
  {
    id: 'fullstack.m01.d02',
    lessonId: 'fullstack.m01.l02',
    kind: 'debug',
    title: 'O `as` que mentiu',
    promptMarkdown: `No painel do **Auto Center Rebimboca**, o orçamento aparece como \`undefined - R$ NaN\`. O front segue o \`contrato.ts\` direitinho. O back compila sem nenhum erro... graças a um \`as unknown as Orcamento\` que alguém (você, semana passada) escreveu para "calar o TypeScript".

Conserte \`paraContrato\` para devolver um \`Orcamento\` de verdade, campo a campo: \`cliente\` vem de \`nome_cliente\`, \`valorReais\` é \`valor_centavos\` dividido por 100 e \`aprovado\` é \`true\` quando a linha tem \`1\`.`,
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: { 'mini-api.ts': MINI_API, 'contrato.ts': CONTRATO_ORCAMENTO },
    starterCode: `${ORCAMENTO_TOPO}
function paraContrato(linha: LinhaDoBanco): Orcamento {
  return linha as unknown as Orcamento; // "é a mesma coisa, confia"
}
${ORCAMENTO_ROTA}`,
    solution: `${ORCAMENTO_TOPO}
function paraContrato(linha: LinhaDoBanco): Orcamento {
  return {
    id: linha.id,
    cliente: linha.nome_cliente,
    valorReais: linha.valor_centavos / 100,
    aprovado: linha.aprovado === 1,
  };
}
${ORCAMENTO_ROTA}`,
    tests: [
      {
        description: 'o orçamento 1 sai no formato do contrato',
        code: `const r = await app.handle({ method: 'GET', path: '/api/orcamentos/1' });
assert.strictEqual(r.status, 200);
assert.deepStrictEqual(r.body, { id: 1, cliente: 'Dona Cida', valorReais: 450, aprovado: true });`,
      },
      {
        description: 'o orçamento 2 tem centavos e não está aprovado',
        code: `const r = await app.handle({ method: 'GET', path: '/api/orcamentos/2' });
assert.deepStrictEqual(r.body, { id: 2, cliente: 'Seu Valdir', valorReais: 1280.5, aprovado: false });`,
      },
      {
        description: 'nenhum nome do banco vaza para o front',
        code: `const r = await app.handle({ method: 'GET', path: '/api/orcamentos/1' });
const chaves = Object.keys(r.body as object).sort();
assert.deepStrictEqual(chaves, ['aprovado', 'cliente', 'id', 'valorReais']);`,
      },
    ],
    hints: [
      'Apague o `as unknown as Orcamento` e devolva um objeto literal com as quatro chaves do contrato.',
      '`aprovado: linha.aprovado === 1` transforma o 0/1 do banco em `boolean`.',
    ],
    followUpQuestionIds: ['fullstack.m01.f11', 'fullstack.m01.f12'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'fullstack.m01.q10',
    lessonIds: ['fullstack.m01.l02'],
    kind: 'multiple-choice',
    prompt:
      "Com `interface Pedido { id: number; cliente: string; itens: string[] }`, o que é `Omit<Pedido, 'id'>`?",
    options: [
      '`{ cliente: string; itens: string[] }`',
      '`{ id: number }`',
      '`{ id?: number; cliente: string; itens: string[] }`',
      'Um erro: `Omit` só funciona com `type`, não com `interface`',
    ],
    answerIndex: 0,
    explanation:
      '`Omit` tira as chaves listadas. É o formato típico do DTO de criação: o front não manda o `id`.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q11',
    lessonIds: ['fullstack.m01.l02'],
    kind: 'true-false',
    prompt:
      'Como o back e o front importam os mesmos tipos do `contrato.ts`, o TypeScript barra, em tempo de execução, um JSON errado que chega na API.',
    answer: false,
    explanation:
      'Os tipos somem quando o código roda. Quem barra JSON errado é a validação (um type guard, por exemplo). Os tipos compartilhados pegam erros **enquanto você programa**.',
    difficulty: 2,
  },
  // ---- gerais ----
  {
    id: 'fullstack.m01.q12',
    lessonIds: ['fullstack.m01.l02'],
    kind: 'multiple-choice',
    prompt: "Para que serve `Partial<Pick<Pedido, 'status' | 'itens'>>` num contrato?",
    options: [
      'Para o DTO de atualização: o front pode mandar só `status`, só `itens`, os dois ou nenhum',
      'Para obrigar o front a mandar `status` e `itens` sempre',
      'Para criar um pedido novo com todos os campos',
      'Para apagar `status` e `itens` do pedido',
    ],
    answerIndex: 0,
    explanation: '`Pick` escolhe as chaves que podem mudar; `Partial` deixa todas opcionais.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q13',
    lessonIds: ['fullstack.m01.l02'],
    kind: 'multiple-choice',
    prompt: 'No back, qual é o jeito seguro de transformar `req.body` (que é `unknown`) em `NovoPedido`?',
    options: [
      'Conferir os campos num type guard (`body is NovoPedido`) e usar dentro do `if`',
      'Escrever `req.body as NovoPedido`',
      'Escrever `req.body as unknown as NovoPedido`',
      'Declarar `req.body` como `any`',
    ],
    answerIndex: 0,
    explanation:
      'O `as` só promete; o guard confere. Depois do `if (ehNovoPedido(req.body))`, o tipo é verdadeiro de fato.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q14',
    lessonIds: ['fullstack.m01.l02'],
    kind: 'predict-output',
    prompt: 'O back manda um `Date` no JSON. O que o front recebe?',
    code: `const enviado = { prazo: new Date('2026-05-01T15:00:00.000Z') };
const recebido = JSON.parse(JSON.stringify(enviado));
console.log(typeof recebido.prazo);
console.log(recebido.prazo);`,
    expectedOutput: 'string\n2026-05-01T15:00:00.000Z',
    explanation:
      'O JSON não tem tipo data: o `Date` vira texto ISO. No contrato, declare `prazo: string` e converta com `new Date(...)` quando precisar.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q15',
    lessonIds: ['fullstack.m01.l02'],
    kind: 'fill-blank',
    prompt: 'Complete o DTO de criação: tudo do `Pedido`, menos `id` e `status`.',
    code: `export type NovoPedido = ___<Pedido, 'id' | 'status'>;`,
    acceptedAnswers: ['Omit'],
    explanation: '`Omit<Tipo, Chaves>` remove as chaves. Para escolher só algumas, seria `Pick`.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q16',
    lessonIds: ['fullstack.m01.l02'],
    kind: 'true-false',
    prompt: 'Se o back já valida tudo, o front não precisa validar nada no formulário.',
    answer: false,
    explanation:
      'A validação do back protege os dados. A do front é para o usuário: avisa na hora, sem esperar a rede. As duas existem por motivos diferentes.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q17',
    lessonIds: ['fullstack.m01.l02'],
    kind: 'multiple-choice',
    prompt:
      'Você renomeou `cliente` para `nomeCliente` no `contrato.ts`, que o back e o front importam. O que acontece?',
    options: [
      'O compilador aponta cada lugar, no back e no front, que ainda usa `cliente`',
      'Nada: o JSON continua com `cliente`',
      'Só o back para de compilar',
      'O navegador renomeia o campo sozinho',
    ],
    answerIndex: 0,
    explanation:
      'É a grande vantagem do contrato compartilhado: a mudança que quebra aparece antes de ir para produção.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'fullstack.m01.f07',
    lessonIds: ['fullstack.m01.l02'],
    exerciseId: 'fullstack.m01.e03',
    kind: 'multiple-choice',
    prompt: 'No seu contrato, por que `NovoServico` não tem `status`?',
    options: [
      'Porque quem decide o status inicial é o back (todo serviço nasce "na fila")',
      'Porque `Omit` sempre remove o status',
      'Porque o status é calculado no navegador',
      'Porque `string` não pode ser enviado em JSON',
    ],
    answerIndex: 0,
    explanation: 'Se o front mandasse o status, um espertinho poderia criar um serviço já "pronto".',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.f08',
    lessonIds: ['fullstack.m01.l02'],
    exerciseId: 'fullstack.m01.e03',
    kind: 'true-false',
    prompt: 'Com o seu `AtualizacaoServico`, o objeto vazio `{}` é uma atualização válida para o TypeScript.',
    answer: true,
    explanation:
      '`Partial` deixa todas as chaves opcionais, então `{}` compila (atualizar "nada" é permitido).',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.f09',
    lessonIds: ['fullstack.m01.l02'],
    exerciseId: 'fullstack.m01.e04',
    kind: 'multiple-choice',
    prompt:
      'No seu `ehNovoAgendamento`, o que muda ao trocar o retorno `boolean` por `body is NovoAgendamento`?',
    options: [
      'Dentro do `if (ehNovoAgendamento(x))`, o TypeScript passa a tratar `x` como `NovoAgendamento`',
      'A função passa a validar sozinha, sem o código dentro dela',
      'A função começa a devolver o objeto em vez de `true`',
      'Nada: é só um comentário',
    ],
    answerIndex: 0,
    explanation:
      'É o type guard: o retorno `true` ensina o compilador a estreitar o tipo de `unknown` para o tipo do contrato.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.f10',
    lessonIds: ['fullstack.m01.l02'],
    exerciseId: 'fullstack.m01.e04',
    kind: 'multiple-choice',
    prompt: 'Na sua rota, por que montar o agendamento campo a campo em vez de `{ id, ...req.body }`?',
    options: [
      'Porque o espalhamento copiaria campos fora do contrato, como `pago: true`',
      'Porque o espalhamento não funciona em TypeScript',
      'Porque `req.body` não pode ser lido duas vezes',
      'Porque o `id` sumiria',
    ],
    answerIndex: 0,
    explanation:
      'O guard confere os campos do contrato, mas não proíbe campos a mais. Montar o objeto à mão garante que só entra o combinado.',
    difficulty: 3,
  },
  {
    id: 'fullstack.m01.f11',
    lessonIds: ['fullstack.m01.l02'],
    exerciseId: 'fullstack.m01.d02',
    kind: 'multiple-choice',
    prompt: 'Por que o TypeScript não reclamou do `paraContrato` com defeito?',
    options: [
      'Porque `as unknown as Orcamento` manda o compilador acreditar, sem conferir nada',
      'Porque o TypeScript não checa funções',
      'Porque `LinhaDoBanco` e `Orcamento` têm os mesmos campos',
      'Porque o erro só aparece no navegador',
    ],
    answerIndex: 0,
    explanation:
      'O `as` é uma promessa. Com o `unknown` no meio, dá para "converter" qualquer coisa em qualquer tipo.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.f12',
    lessonIds: ['fullstack.m01.l02'],
    exerciseId: 'fullstack.m01.d02',
    kind: 'multiple-choice',
    prompt: 'No seu `paraContrato` consertado, o que `linha.aprovado === 1` produz?',
    options: ['Um `boolean`, como o contrato pede', 'O número 1', 'O texto "sim"', 'Um erro de tipo'],
    answerIndex: 0,
    explanation: 'A comparação devolve `true` ou `false`: o 0/1 do banco vira o `boolean` do contrato.',
    difficulty: 1,
  },
];
