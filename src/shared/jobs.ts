/**
 * Contrato dos jobs (freelas): o cliente, o que ele pede (tasks = exercícios), quanto paga e o SLA.
 * Os jobs ficam no conteúdo, junto das lições que ensinam o que eles pedem (`ContentModule.jobs`).
 */
import type { PoiKind } from './map';
import type { CareerPath, Seniority } from './profile';

export interface JobClient {
  /** Nome fictício do negócio. */
  name: string;
  /** Pessoa que fala no chat. */
  contact: string;
  /** Tipo de local onde o dev atende. */
  place: Extract<PoiKind, 'client-office' | 'coworking' | 'home'>;
  /** Bairro/cidade (Osasco ou Cotia), só para o texto. */
  area: string;
}

/** Imprevisto no meio do job: o cliente pede mais uma coisa. */
export interface JobTwist {
  /** Depois de qual task (índice em `taskExerciseIds`) o pedido chega. */
  afterTask: number;
  message: string;
  extraExerciseId: string;
  /** Pagamento extra (pode ser 0: o famoso "é rapidinho"). */
  extraPay: number;
  /** Minutos a mais de SLA concedidos (pode ser 0). */
  extraSlaMinutes: number;
}

export interface JobTemplate {
  /** Ex.: "core.m02.j01". Sempre começa com o id do módulo. */
  id: string;
  moduleId: string;
  title: string;
  briefMarkdown: string;
  client: JobClient;
  /** Senioridade mínima para o job aparecer no app. */
  seniority: Seniority;
  /** Restringe a uma trilha (ex.: só quem escolheu back-end); omitido = qualquer trilha. */
  path?: Exclude<CareerPath, null>;
  pay: number;
  /**
   * SLA: minutos de jogo, contados da chegada no cliente até a entrega, para fazer todas as tasks.
   * Entregar muito acima do SLA derruba a avaliação e a chance de efetivação.
   */
  slaMinutes: number;
  /** Exercícios que o cliente pede, em ordem. */
  taskExerciseIds: string[];
  twists?: JobTwist[];
  chat: {
    arrival: string[];
    delivery: string[];
  };
}
