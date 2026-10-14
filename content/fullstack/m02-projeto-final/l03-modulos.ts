import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { DOMINIO, REGRAS, REPOSITORIO } from './projeto';

const SERVICO_ENTREGA = `import type { Job } from './dominio';
import type { RepositorioJobs } from './repositorio';
import { estrelasPorSla, razaoSla } from './regras';

export function aceitarJob(repo: RepositorioJobs, id: string, agora: number): Job {
  const job = repo.buscar(id);
  if (!job) throw new Error(\`Job \${id} não encontrado\`);
  if (job.status.tipo !== 'disponivel') throw new Error(\`Job \${id} não está disponível\`);
  const aceito: Job = { ...job, status: { tipo: 'aceito', aceitoEm: agora } };
  repo.salvar(aceito);
  return aceito;
}
`;

/** Dois jobs já gravados no "disco" do exercício de depuração. */
const JOBS_JSON = JSON.stringify(
  [
    {
      id: 'j1',
      titulo: 'Arrumar o carrinho da loja de bolos',
      cliente: { nome: 'Doceria Açúcar Mascavo', bairro: 'Granja Viana, Cotia' },
      senioridade: 'senior',
      pagamentoBase: 300,
      slaMinutos: 180,
      tasks: [{ id: 't1', titulo: 'Carrinho que esquece o bolo' }],
      status: { tipo: 'disponivel' },
    },
    {
      id: 'j2',
      titulo: 'Painel da autoescola',
      cliente: { nome: 'Autoescola Baliza Perfeita', bairro: 'Centro, Carapicuíba' },
      senioridade: 'pleno',
      pagamentoBase: 220,
      slaMinutos: 150,
      tasks: [{ id: 't1', titulo: 'Agenda de aulas' }],
      status: { tipo: 'disponivel' },
    },
  ],
  null,
  2,
);

export const lesson: Lesson = {
  id: 'fullstack.m02.l03',
  moduleId: 'fullstack.m02',
  order: 3,
  title: 'Módulos, repositório e injeção de dependência',
  concepts: [
    'separar o projeto em módulos (ESM)',
    'import type',
    'repositório como interface',
    'injeção de dependência por parâmetro',
    'repositório falso nos testes',
  ],
  sections: [
    {
      kind: 'text',
      markdown:
        'Com tipos e regras prontos, falta organizar a casa. Um arquivo de 2 mil linhas chamado `tudo.ts` ' +
        'funciona... até o dia em que você precisa mexer nele. Separe por **responsabilidade**:\n\n' +
        '```\n' +
        'dominio.ts      tipos: Job, StatusJob, Senioridade\n' +
        'regras.ts       funções puras: SLA, estrelas, pagamento\n' +
        'repositorio.ts  onde os jobs moram (memória, arquivo JSON, banco...)\n' +
        'servico.ts      casos de uso: aceitar e entregar um job\n' +
        '```\n\n' +
        'A regra de ouro é a **direção das dependências**: o domínio e as regras não importam ninguém de ' +
        'fora (nada de `fs` ali); o serviço importa domínio, regras e o **contrato** do repositório. Assim as ' +
        'regras continuam puras e testáveis.\n\n' +
        'Com ESM, cada arquivo exporta o que oferece (`export function`, `export interface`) e importa o que ' +
        "usa. Para tipos, prefira `import type { Job } from './dominio'`: deixa claro que é só tipo, e o " +
        'import some do JavaScript gerado.',
    },
    {
      kind: 'text',
      markdown:
        '**Repositório como interface.** O serviço não precisa saber **onde** os jobs ficam; só precisa de ' +
        'alguém que saiba `buscar`, `salvar` e `listar`. Isso vira uma `interface`, e cada forma de guardar ' +
        'vira uma implementação: em memória (para testes e protótipos), em arquivo JSON com `fs`, em banco ' +
        'de dados...\n\n' +
        '**Injeção de dependência** soa chique, mas aqui é só isto: **passar o repositório como parâmetro** em ' +
        'vez de criar (ou importar) um fixo lá dentro. Em produção, o serviço recebe o repositório de ' +
        'verdade; no teste, recebe um em memória ou um **falso** que só anota o que foi salvo. O jogo faz o ' +
        'mesmo: o `SaveManager` recebe o armazenamento em vez de usar o `localStorage` direto.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `// repositorio.ts
import type { Job } from './dominio';

export interface RepositorioJobs {
  buscar(id: string): Job | undefined;
  salvar(job: Job): void;
  listar(): Job[];
}

export function criarRepositorioMemoria(iniciais: Job[] = []): RepositorioJobs {
  const jobs = new Map<string, Job>(iniciais.map((job) => [job.id, job]));
  return {
    buscar: (id) => jobs.get(id),
    salvar: (job) => {
      jobs.set(job.id, job);
    },
    listar: () => [...jobs.values()],
  };
}`,
      explanation:
        'O `Map` guarda um job por id: salvar um job que já existe **substitui** o antigo. A função devolve um ' +
        'objeto que cumpre a interface; o TypeScript confere se não faltou método.',
    },
    {
      kind: 'example',
      language: 'ts',
      code: `// servico.ts
import type { Job } from './dominio';
import type { RepositorioJobs } from './repositorio';

export function aceitarJob(repo: RepositorioJobs, id: string, agora: number): Job {
  const job = repo.buscar(id);
  if (!job) throw new Error(\`Job \${id} não encontrado\`);
  if (job.status.tipo !== 'disponivel') throw new Error(\`Job \${id} não está disponível\`);
  const aceito: Job = { ...job, status: { tipo: 'aceito', aceitoEm: agora } };
  repo.salvar(aceito);
  return aceito;
}

// no teste: um repositório falso, feito na hora
const salvos: Job[] = [];
const falso: RepositorioJobs = {
  buscar: () => novoJob('j1'),
  salvar: (job) => {
    salvos.push(job);
  },
  listar: () => salvos,
};
aceitarJob(falso, 'j1', 30);
// salvos[0].status → { tipo: 'aceito', aceitoEm: 30 }`,
      explanation:
        'O serviço cria um objeto **novo** com `{ ...job, status }` em vez de alterar o que veio do repositório, ' +
        'e quem decide gravar é o repositório. O teste nem encosta em arquivo.',
    },
  ],
  checkQuestionIds: ['fullstack.m02.q17'],
  exerciseIds: ['fullstack.m02.e05'],
  debugExerciseIds: ['fullstack.m02.d03'],
};

export const exercises: Exercise[] = [
  {
    id: 'fullstack.m02.e05',
    lessonId: 'fullstack.m02.l03',
    kind: 'implement',
    title: 'Entregar o job pelo serviço',
    promptMarkdown:
      'O projeto já tem `dominio.ts`, `regras.ts` (com `razaoSla` e `estrelasPorSla`) e `repositorio.ts` (com ' +
      'a interface `RepositorioJobs`). O `aceitarJob` está pronto: use-o de modelo e implemente ' +
      '`entregarJob(repo, id, agora)`:\n\n' +
      "1. busque o job no `repo`; se não existir, lance `Error` com `'Job <id> não encontrado'`;\n" +
      "2. se o status não for `'aceito'`, lance `Error` com `'Job <id> não foi aceito'` (e não salve nada);\n" +
      '3. calcule as estrelas: `estrelasPorSla(razaoSla(agora - aceitoEm, job.slaMinutos))`;\n' +
      "4. crie um job **novo** com status `{ tipo: 'entregue', aceitoEm, entregueEm: agora, estrelas }`, " +
      'salve no `repo` e devolva.\n\n' +
      'Não altere o objeto que veio do repositório.',
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: { 'dominio.ts': DOMINIO, 'regras.ts': REGRAS, 'repositorio.ts': REPOSITORIO },
    starterCode: `${SERVICO_ENTREGA}
export function entregarJob(repo: RepositorioJobs, id: string, agora: number): Job {
  // 1. busque o job (não achou? lance erro)
  // 2. só job aceito pode ser entregue
  // 3. calcule as estrelas com razaoSla e estrelasPorSla
  // 4. salve um job novo com status entregue e devolva
  throw new Error('entregarJob ainda não foi feito');
}
`,
    solution: `${SERVICO_ENTREGA}
export function entregarJob(repo: RepositorioJobs, id: string, agora: number): Job {
  const job = repo.buscar(id);
  if (!job) throw new Error(\`Job \${id} não encontrado\`);
  if (job.status.tipo !== 'aceito') throw new Error(\`Job \${id} não foi aceito\`);
  const { aceitoEm } = job.status;
  const estrelas = estrelasPorSla(razaoSla(agora - aceitoEm, job.slaMinutos));
  const entregue: Job = { ...job, status: { tipo: 'entregue', aceitoEm, entregueEm: agora, estrelas } };
  repo.salvar(entregue);
  return entregue;
}
`,
    tests: [
      {
        description: 'aceita e entrega usando o repositório em memória',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
const { criarRepositorioMemoria } = require('./repositorio') as typeof import('./repositorio');
const repo = criarRepositorioMemoria([novoJob('j1', { slaMinutos: 120 })]);
aceitarJob(repo, 'j1', 10);
const entregue = entregarJob(repo, 'j1', 130);
assert.deepStrictEqual(entregue.status, { tipo: 'entregue', aceitoEm: 10, entregueEm: 130, estrelas: 4 });
assert.deepStrictEqual(repo.buscar('j1')?.status, entregue.status);`,
      },
      {
        description: 'job inexistente lança "não encontrado"',
        code: `const { criarRepositorioMemoria } = require('./repositorio') as typeof import('./repositorio');
assert.throws(() => entregarJob(criarRepositorioMemoria(), 'j404', 10), /Job j404 não encontrado/);`,
      },
      {
        description: 'job que não foi aceito lança erro e não é salvo',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
const { criarRepositorioMemoria } = require('./repositorio') as typeof import('./repositorio');
const repo = criarRepositorioMemoria([novoJob('j1')]);
assert.throws(() => entregarJob(repo, 'j1', 50), /Job j1 não foi aceito/);
assert.strictEqual(repo.buscar('j1')?.status.tipo, 'disponivel');`,
      },
      {
        description: 'funciona com um repositório falso (injeção de dependência)',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
type Repo = import('./repositorio').RepositorioJobs;
const salvos: Job[] = [];
const falso: Repo = {
  buscar: (id) => novoJob(id, { slaMinutos: 100, status: { tipo: 'aceito', aceitoEm: 0 } }),
  salvar: (job) => {
    salvos.push(job);
  },
  listar: () => salvos,
};
entregarJob(falso, 'j9', 200);
assert.strictEqual(salvos.length, 1);
const salvo = salvos[0];
assert.ok(salvo);
assert.deepStrictEqual(salvo.status, { tipo: 'entregue', aceitoEm: 0, entregueEm: 200, estrelas: 1 });`,
      },
      {
        description: 'o objeto que veio do repositório não é alterado',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
const { criarRepositorioMemoria } = require('./repositorio') as typeof import('./repositorio');
const original = novoJob('j2', { status: { tipo: 'aceito', aceitoEm: 0 } });
const repo = criarRepositorioMemoria([original]);
entregarJob(repo, 'j2', 60);
assert.strictEqual(original.status.tipo, 'aceito');`,
      },
    ],
    hints: [
      'Copie o começo do `aceitarJob`: `const job = repo.buscar(id); if (!job) throw new Error(...)`.',
      "Depois de `if (job.status.tipo !== 'aceito') throw ...`, o TypeScript sabe que `job.status.aceitoEm` existe.",
      "Monte o novo job com `{ ...job, status: { tipo: 'entregue', aceitoEm, entregueEm: agora, estrelas } }` e chame `repo.salvar`.",
    ],
    followUpQuestionIds: ['fullstack.m02.f13', 'fullstack.m02.f14'],
    difficulty: 3,
  },
  {
    id: 'fullstack.m02.d03',
    lessonId: 'fullstack.m02.l03',
    kind: 'debug',
    title: 'O repositório que duplica jobs',
    promptMarkdown:
      'O repositório em arquivo JSON (`jobs.json`) foi trocado no lugar do de memória, sem mexer no serviço: ' +
      'injeção de dependência funcionando. Só que agora, depois de aceitar um job, ele aparece **duas vezes** ' +
      'no painel, e o `buscar` continua devolvendo o status antigo.\n\n' +
      'Conserte o `salvar`: se já existe um job com o mesmo `id`, ele deve ser **substituído**; se não, ' +
      'acrescentado no fim. O arquivo precisa ficar atualizado no disco.',
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: { 'dominio.ts': DOMINIO, 'repositorio.ts': REPOSITORIO },
    fsSeed: { 'jobs.json': JOBS_JSON },
    starterCode: `import { existsSync, readFileSync, writeFileSync } from 'fs';
import type { Job } from './dominio';
import type { RepositorioJobs } from './repositorio';

export function criarRepositorioArquivo(caminho: string): RepositorioJobs {
  function ler(): Job[] {
    if (!existsSync(caminho)) return [];
    return JSON.parse(readFileSync(caminho, 'utf8')) as Job[];
  }

  function gravar(jobs: Job[]): void {
    writeFileSync(caminho, JSON.stringify(jobs, null, 2));
  }

  return {
    buscar: (id) => ler().find((job) => job.id === id),
    salvar: (job) => {
      const jobs = ler();
      jobs.push(job);
      gravar(jobs);
    },
    listar: () => ler(),
  };
}
`,
    solution: `import { existsSync, readFileSync, writeFileSync } from 'fs';
import type { Job } from './dominio';
import type { RepositorioJobs } from './repositorio';

export function criarRepositorioArquivo(caminho: string): RepositorioJobs {
  function ler(): Job[] {
    if (!existsSync(caminho)) return [];
    return JSON.parse(readFileSync(caminho, 'utf8')) as Job[];
  }

  function gravar(jobs: Job[]): void {
    writeFileSync(caminho, JSON.stringify(jobs, null, 2));
  }

  return {
    buscar: (id) => ler().find((job) => job.id === id),
    salvar: (job) => {
      const jobs = ler();
      const indice = jobs.findIndex((j) => j.id === job.id);
      if (indice === -1) jobs.push(job);
      else jobs[indice] = job;
      gravar(jobs);
    },
    listar: () => ler(),
  };
}
`,
    tests: [
      {
        description: 'salvar um job que já existe substitui o antigo',
        code: `const repo = criarRepositorioArquivo('jobs.json');
const j1 = repo.buscar('j1');
assert.ok(j1);
repo.salvar({ ...j1, status: { tipo: 'aceito', aceitoEm: 15 } });
assert.strictEqual(repo.listar().length, 2);
assert.deepStrictEqual(repo.buscar('j1')?.status, { tipo: 'aceito', aceitoEm: 15 });`,
      },
      {
        description: 'o arquivo no disco fica com a versão nova, sem duplicar',
        code: `const fs = require('fs');
const repo = criarRepositorioArquivo('jobs.json');
const j2 = repo.buscar('j2');
assert.ok(j2);
repo.salvar({ ...j2, status: { tipo: 'cancelado', motivo: 'instrutor de férias' } });
const noDisco = JSON.parse(fs.readFileSync('jobs.json', 'utf8'));
assert.deepStrictEqual(noDisco.map((j: { id: string }) => j.id), ['j1', 'j2']);
assert.deepStrictEqual(noDisco[1].status, { tipo: 'cancelado', motivo: 'instrutor de férias' });`,
      },
      {
        description: 'salvar um job novo acrescenta no fim',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
const repo = criarRepositorioArquivo('jobs.json');
repo.salvar(novoJob('j3'));
assert.deepStrictEqual(repo.listar().map((j) => j.id), ['j1', 'j2', 'j3']);`,
      },
      {
        description: 'arquivo inexistente começa vazio e é criado no primeiro salvar',
        code: `const { novoJob } = require('./dominio') as typeof import('./dominio');
const repo = criarRepositorioArquivo('novos.json');
assert.deepStrictEqual(repo.listar(), []);
repo.salvar(novoJob('j1'));
assert.strictEqual(repo.listar().length, 1);`,
      },
    ],
    hints: [
      'O `push` sempre acrescenta, mesmo quando o job já está na lista.',
      'Procure a posição com `jobs.findIndex((j) => j.id === job.id)`: `-1` quer dizer que não existe.',
      'Se existir, troque no lugar: `jobs[indice] = job`. Se não, `push`. Depois grave.',
    ],
    followUpQuestionIds: ['fullstack.m02.f15', 'fullstack.m02.f16'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  {
    id: 'fullstack.m02.q17',
    lessonIds: ['fullstack.m02.l03'],
    kind: 'multiple-choice',
    prompt:
      'O serviço recebe o repositório como parâmetro em vez de importar um fixo. Qual a maior vantagem?',
    options: [
      'No teste dá para passar um repositório em memória ou falso, sem arquivo nem banco',
      'O código fica mais curto',
      'O TypeScript deixa de checar os tipos do repositório',
      'O repositório passa a ser global',
    ],
    answerIndex: 0,
    explanation:
      'Isso é injeção de dependência: quem chama escolhe a implementação. Em produção, a de verdade; no ' +
      'teste, uma controlada.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q18',
    lessonIds: ['fullstack.m02.l03'],
    kind: 'true-false',
    prompt: "Um `import type { Job } from './dominio'` desaparece do JavaScript gerado.",
    answer: true,
    explanation:
      'Tipos não existem em tempo de execução. `import type` garante que o import é só para o compilador e ' +
      'é apagado na transpilação.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q19',
    lessonIds: ['fullstack.m02.l03'],
    kind: 'multiple-choice',
    prompt: 'Em qual arquivo do projeto deve morar a função `estrelasPorSla`?',
    options: ['`regras.ts`', '`repositorio.ts`', '`painel.ts` (a tela)', 'Em todos, copiada'],
    answerIndex: 0,
    explanation:
      'É regra de negócio pura: fica em `regras.ts`, sem depender de arquivo, tela ou banco. Os outros ' +
      'módulos importam de lá.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q20',
    lessonIds: ['fullstack.m02.l03'],
    kind: 'fill-blank',
    prompt: 'Complete a assinatura para o serviço receber **qualquer** repositório que cumpra o contrato.',
    code: 'export function aceitarJob(repo: ___, id: string, agora: number): Job {',
    acceptedAnswers: ['RepositorioJobs'],
    explanation:
      'Tipando com a interface `RepositorioJobs`, o serviço aceita o de memória, o de arquivo ou um falso.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q21',
    lessonIds: ['fullstack.m02.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const job = { id: 'j1', status: { tipo: 'aceito' } };
const copia = { ...job };
copia.id = 'j2';
copia.status.tipo = 'entregue';
console.log(job.id, job.status.tipo);`,
    expectedOutput: 'j1 entregue',
    explanation:
      'O spread copia só o primeiro nível. `id` é independente, mas `status` é o **mesmo objeto** nas duas ' +
      "variáveis. Por isso o serviço cria um status novo: `{ ...job, status: { tipo: 'entregue', ... } }`.",
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q22',
    lessonIds: ['fullstack.m02.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual destas dependências **quebra** a organização do projeto?',
    options: [
      '`regras.ts` importando `fs` para ler a tabela de multiplicadores',
      '`servico.ts` importando `regras.ts`',
      '`repositorio.ts` importando o tipo `Job` de `dominio.ts`',
      '`servico.ts` importando o tipo `RepositorioJobs`',
    ],
    answerIndex: 0,
    explanation:
      'As regras devem ser puras. Ler arquivo lá dentro as prende ao disco e complica os testes. Quem fala ' +
      'com o `fs` é o repositório.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.q23',
    lessonIds: ['fullstack.m02.l03'],
    kind: 'true-false',
    prompt:
      'Para trocar o repositório em memória por um em arquivo JSON, o serviço `aceitarJob` precisa ser ' +
      'reescrito.',
    answer: false,
    explanation:
      'As duas implementações cumprem a mesma interface `RepositorioJobs`. O serviço não muda; só muda o que ' +
      'é passado para ele.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m02.q24',
    lessonIds: ['fullstack.m02.l03'],
    kind: 'multiple-choice',
    prompt: "Qual é o equivalente em CommonJS de `import { razaoSla } from './regras';`?",
    options: [
      "`const { razaoSla } = require('./regras');`",
      "`const razaoSla = import('./regras');`",
      "`module.exports = { razaoSla } from './regras';`",
      "`require { razaoSla } from './regras';`",
    ],
    answerIndex: 0,
    explanation:
      'Em CommonJS, `require` devolve o objeto exportado, e a desestruturação pega a função pelo nome.',
    difficulty: 1,
  },

  // ---- acompanhamento: e05 ----
  {
    id: 'fullstack.m02.f13',
    lessonIds: ['fullstack.m02.l03'],
    exerciseId: 'fullstack.m02.e05',
    kind: 'multiple-choice',
    prompt:
      "No seu `entregarJob`, por que o TypeScript deixa ler `job.status.aceitoEm` depois de `if (job.status.tipo !== 'aceito') throw ...`?",
    options: [
      'Depois do `throw`, só sobra o membro "aceito" da união, que tem `aceitoEm`',
      'Porque `aceitoEm` existe em todos os status',
      'Porque `throw` desliga a checagem de tipos',
      'Porque `repo.buscar` sempre devolve um job aceito',
    ],
    answerIndex: 0,
    explanation:
      'O `throw` encerra os outros caminhos. Abaixo dele, o TypeScript estreita `job.status` para ' +
      "`{ tipo: 'aceito'; aceitoEm: number }`.",
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.f14',
    lessonIds: ['fullstack.m02.l03'],
    exerciseId: 'fullstack.m02.e05',
    kind: 'true-false',
    prompt:
      'O teste com o repositório falso conseguiu conferir o que o seu `entregarJob` salvou sem criar nenhum ' +
      'arquivo nem `Map`.',
    answer: true,
    explanation:
      'O falso só guardava os jobs salvos num array. Como o serviço depende da interface, qualquer objeto ' +
      'com `buscar`, `salvar` e `listar` serve.',
    difficulty: 1,
  },

  // ---- acompanhamento: d03 ----
  {
    id: 'fullstack.m02.f15',
    lessonIds: ['fullstack.m02.l03'],
    exerciseId: 'fullstack.m02.d03',
    kind: 'multiple-choice',
    prompt: 'Antes do conserto, por que o `buscar` devolvia o status antigo do job aceito?',
    options: [
      'O `find` devolve o primeiro job com aquele id, e a versão antiga continuava antes da nova',
      'O arquivo não era gravado',
      'O `JSON.parse` ignora o campo `status`',
      'O `buscar` lia um arquivo diferente do `salvar`',
    ],
    answerIndex: 0,
    explanation: 'Com `push`, o arquivo ficava com as duas versões; o `find` parava na primeira, a antiga.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m02.f16',
    lessonIds: ['fullstack.m02.l03'],
    exerciseId: 'fullstack.m02.d03',
    kind: 'fill-blank',
    prompt: 'Complete a linha do seu `salvar` que descobre se o job já existe.',
    code: 'const indice = jobs.___((j) => j.id === job.id);',
    acceptedAnswers: ['findIndex'],
    explanation:
      '`findIndex` devolve a posição do primeiro item que passa no teste, ou `-1` se nenhum passar.',
    difficulty: 1,
  },
];
