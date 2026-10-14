/**
 * Arquivos do "projeto" que o jogador constrói ao longo do módulo: uma versão simplificada do sistema
 * de jobs do próprio jogo (veja `src/shared/jobs.ts` e `src/gameplay/career.ts`). Cada exercício usa
 * os arquivos já prontos em `extraFiles` e pede um pedaço novo no arquivo principal.
 */

/** Tipos do domínio: senioridade, cliente, task, status (união discriminada) e o job. */
export const DOMINIO = `export const SENIORIDADES = ['estagiario', 'junior', 'pleno', 'senior', 'fullstack'] as const;
export type Senioridade = (typeof SENIORIDADES)[number];

export interface Cliente {
  nome: string;
  bairro: string;
}

export interface Task {
  id: string;
  titulo: string;
}

export type StatusJob =
  | { tipo: 'disponivel' }
  | { tipo: 'aceito'; aceitoEm: number }
  | { tipo: 'entregue'; aceitoEm: number; entregueEm: number; estrelas: number }
  | { tipo: 'cancelado'; motivo: string };

export interface Job {
  id: string;
  titulo: string;
  cliente: Cliente;
  senioridade: Senioridade;
  pagamentoBase: number;
  slaMinutos: number;
  tasks: Task[];
  status: StatusJob;
}

/** Atalho para os testes: um job disponível com valores padrão. */
export function novoJob(id: string, dados: Partial<Omit<Job, 'id'>> = {}): Job {
  return {
    id,
    titulo: 'Centralizar uma div',
    cliente: { nome: 'Brechó da Tia Nena', bairro: 'Vila Yara, Osasco' },
    senioridade: 'senior',
    pagamentoBase: 100,
    slaMinutos: 120,
    tasks: [{ id: 't1', titulo: 'Centralizar a div do banner' }],
    status: { tipo: 'disponivel' },
    ...dados,
  };
}
`;

/** Regras de negócio puras: SLA, estrelas e pagamento. */
export const REGRAS = `import type { Senioridade } from './dominio';

export const MULTIPLICADOR: Record<Senioridade, number> = {
  estagiario: 1,
  junior: 1.8,
  pleno: 3,
  senior: 5,
  fullstack: 8,
};

const FAIXAS = [
  { ate: 0.75, estrelas: 5 },
  { ate: 1, estrelas: 4 },
  { ate: 1.25, estrelas: 3 },
  { ate: 1.6, estrelas: 2 },
] as const;

export function razaoSla(minutosGastos: number, slaMinutos: number): number {
  if (!(slaMinutos > 0)) throw new RangeError('O SLA precisa ser maior que zero.');
  return Math.max(0, minutosGastos) / slaMinutos;
}

export function estrelasPorSla(razao: number): number {
  return FAIXAS.find((faixa) => razao <= faixa.ate)?.estrelas ?? 1;
}

export function pagamento(base: number, senioridade: Senioridade): number {
  return Math.round(base * MULTIPLICADOR[senioridade]);
}
`;

/** O contrato do repositório e uma implementação em memória. */
export const REPOSITORIO = `import type { Job } from './dominio';

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
}
`;

/** Barramento de eventos tipado (a solução do exercício fullstack.m02.e06). */
export const EVENTOS = `export type EventosJob = {
  'job:aceito': { jobId: string; minuto: number };
  'job:entregue': { jobId: string; estrelas: number; valor: number };
};

type Ouvinte<T> = (dados: T) => void;

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
`;

/** Serviço de jobs: usa o repositório e as regras e avisa o barramento. */
export const SERVICO = `import type { Job } from './dominio';
import type { EventBus, EventosJob } from './eventos';
import type { RepositorioJobs } from './repositorio';
import { estrelasPorSla, pagamento, razaoSla } from './regras';

export function criarServico(repo: RepositorioJobs, bus: EventBus<EventosJob>) {
  function buscar(id: string): Job {
    const job = repo.buscar(id);
    if (!job) throw new Error(\`Job \${id} não encontrado\`);
    return job;
  }

  return {
    aceitar(id: string, agora: number): Job {
      const job = buscar(id);
      if (job.status.tipo !== 'disponivel') throw new Error(\`Job \${id} não está disponível\`);
      const aceito: Job = { ...job, status: { tipo: 'aceito', aceitoEm: agora } };
      repo.salvar(aceito);
      bus.emit('job:aceito', { jobId: id, minuto: agora });
      return aceito;
    },
    entregar(id: string, agora: number): Job {
      const job = buscar(id);
      if (job.status.tipo !== 'aceito') throw new Error(\`Job \${id} não foi aceito\`);
      const { aceitoEm } = job.status;
      const estrelas = estrelasPorSla(razaoSla(agora - aceitoEm, job.slaMinutos));
      const entregue: Job = { ...job, status: { tipo: 'entregue', aceitoEm, entregueEm: agora, estrelas } };
      repo.salvar(entregue);
      bus.emit('job:entregue', { jobId: id, estrelas, valor: pagamento(job.pagamentoBase, job.senioridade) });
      return entregue;
    },
  };
}
`;
