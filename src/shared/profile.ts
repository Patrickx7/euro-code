/** Contrato do perfil do dev: carreira (senioridade e trilha) e personalização. */

/** Degraus da carreira, do primeiro estágio ao full stack. */
export const SENIORITIES = ['estagiario', 'junior', 'pleno', 'senior', 'fullstack'] as const;
export type Seniority = (typeof SENIORITIES)[number];

export const SENIORITY_LABEL: Record<Seniority, string> = {
  estagiario: 'Estagiário',
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  fullstack: 'Full Stack',
};

/** Trilha escolhida na efetivação (null enquanto estagiário; "fullstack" a partir do topo). */
export type CareerPath = null | 'front' | 'back' | 'fullstack';

export function seniorityRank(seniority: Seniority): number {
  return SENIORITIES.indexOf(seniority);
}

export function atLeast(current: Seniority, required: Seniority): boolean {
  return seniorityRank(current) >= seniorityRank(required);
}

/** Aparência: o modelo base é o personagem do Kenney; a roupa e o rosto vêm da textura (skin). */
export interface CharacterAppearance {
  /** Nome do arquivo em public/models/personagem/skins, sem extensão. */
  skinId: string;
}

export interface CarCustomization {
  /** Cor da pintura em hexadecimal, sem "#". */
  paint: string;
  wheels: string;
  sticker: string | null;
  horn: string;
}

export interface NotebookSetup {
  theme: 'escuro' | 'claro';
  font: string;
  wallpaper: string;
  stickers: string[];
}

export interface Profile {
  name: string;
  nickname: string;
  bio: string;
  appearance: CharacterAppearance;
}

export interface Career {
  seniority: Seniority;
  path: CareerPath;
  /** Média das avaliações dos clientes (0 a 5 estrelas). */
  rating: number;
  jobsDone: number;
  /**
   * Desempenho de SLA dos jobs mais recentes: tempo gasto / tempo combinado (1 = no limite,
   * abaixo de 1 = adiantado). Base da chance de efetivação.
   */
  slaHistory: number[];
}

export function createProfile(): Profile {
  return {
    name: 'Dev Novato',
    nickname: 'commita na sexta',
    bio: 'Faço sites, centralizo divs e não cobro deslocamento (ainda).',
    appearance: { skinId: 'devMale' },
  };
}

export function createCareer(): Career {
  return { seniority: 'estagiario', path: null, rating: 0, jobsDone: 0, slaHistory: [] };
}

export function createNotebook(): NotebookSetup {
  return { theme: 'escuro', font: 'mono', wallpaper: 'padrao', stickers: [] };
}
