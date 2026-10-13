/** Contrato do jogo salvo. Toda mudança de formato exige subir `SAVE_VERSION` e escrever a migração. */
import { BALANCE } from './balance';
import { createDriverState, type DriverState } from './player';
import { createNewCondition, type OwnedTruck } from './vehicle';

export const SAVE_VERSION = 1;

/** Estatística de repetição espaçada (caixas de Leitner: 0 = errou recentemente, 5 = domina). */
export interface QuestionStat {
  correct: number;
  wrong: number;
  box: number;
  lastSeenGameMinute: number;
}

export interface EducationProgress {
  completedLessonIds: string[];
  completedExerciseIds: string[];
  questionStats: Record<string, QuestionStat>;
  /** Lições marcadas para revisão prioritária (erros na blitz, por exemplo). */
  reviewLessonIds: string[];
}

export interface SaveData {
  version: typeof SAVE_VERSION;
  savedAt: string;
  /** Minutos de jogo desde o início. */
  gameMinutes: number;
  money: number;
  xp: number;
  level: number;
  driver: DriverState;
  trucks: OwnedTruck[];
  activeTruckIndex: number;
  education: EducationProgress;
  settings: {
    /** Alivia as punições (menos blitz, falhas e sono). */
    instructorMode: boolean;
  };
}

export const STARTER_TRUCK_MODEL_ID = 'leve-1';

export function createNewSave(now: Date = new Date()): SaveData {
  return {
    version: SAVE_VERSION,
    savedAt: now.toISOString(),
    gameMinutes: BALANCE.clock.startHour * 60,
    money: BALANCE.economy.startingMoney,
    xp: 0,
    level: 1,
    driver: createDriverState(),
    trucks: [{ modelId: STARTER_TRUCK_MODEL_ID, fuelLiters: 150, condition: createNewCondition(2) }],
    activeTruckIndex: 0,
    education: {
      completedLessonIds: [],
      completedExerciseIds: [],
      questionStats: {},
      reviewLessonIds: [],
    },
    settings: { instructorMode: false },
  };
}
