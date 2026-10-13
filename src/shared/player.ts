/** Contrato do estado do motorista e das penalidades. */

export interface DriverState {
  /** Cansaço de 0 (descansado) a 1 (precisa dormir). */
  fatigue: number;
  /** Pontos na CNH. Ao atingir `BALANCE.license.suspensionPoints`, a CNH é suspensa. */
  licensePoints: number;
  licenseSuspended: boolean;
  /** Exercícios resolvidos mais recentemente (mais novo primeiro). Base das perguntas da blitz. */
  recentExerciseIds: string[];
}

export type Penalty =
  | { kind: 'fine'; amount: number; reason: string }
  | { kind: 'license-points'; points: number; reason: string }
  | { kind: 'review'; lessonId: string };

export function createDriverState(): DriverState {
  return { fatigue: 0, licensePoints: 0, licenseSuspended: false, recentExerciseIds: [] };
}
