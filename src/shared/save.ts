/** Contrato do jogo salvo. Toda mudança de formato exige subir `SAVE_VERSION` e escrever a migração. */
import { BALANCE } from './balance';
import { createDriverState, type DriverState } from './player';
import {
  createCareer,
  createNotebook,
  createProfile,
  type Career,
  type NotebookSetup,
  type Profile,
} from './profile';
import { createNewCondition, findCarModel, STARTER_CAR_MODEL_ID, type OwnedCar } from './vehicle';

/** 2: Freela na Estrada (dev freelancer). Saves da versão 1 (caminhoneiro) não são migrados. */
export const SAVE_VERSION = 2;

/** Qualidade gráfica: `low` para máquinas fracas (sem sombras nem pós-processamento). */
export type GraphicsQuality = 'low' | 'medium' | 'high';

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
  profile: Profile;
  career: Career;
  driver: DriverState;
  cars: OwnedCar[];
  activeCarIndex: number;
  notebook: NotebookSetup;
  /** Jobs já entregues (ids), para não repetir no app. */
  completedJobIds: string[];
  education: EducationProgress;
  settings: {
    /** Alivia as punições (menos blitz, falhas e sono). */
    instructorMode: boolean;
    graphics: GraphicsQuality;
  };
}

export function createNewSave(now: Date = new Date()): SaveData {
  const starter = findCarModel(STARTER_CAR_MODEL_ID);
  const health = starter?.initialCondition ?? 1;
  return {
    version: SAVE_VERSION,
    savedAt: now.toISOString(),
    gameMinutes: BALANCE.clock.startHour * 60,
    money: BALANCE.economy.startingMoney,
    profile: createProfile(),
    career: createCareer(),
    driver: createDriverState(),
    cars: [
      {
        modelId: STARTER_CAR_MODEL_ID,
        fuelLiters: (starter?.tankLiters ?? 40) * 0.25,
        condition: createNewCondition(2, health),
        customization: { paint: '8fb0c4', wheels: 'aco', sticker: 'dev-em-formacao', horn: 'fon-fon' },
      },
    ],
    activeCarIndex: 0,
    notebook: createNotebook(),
    completedJobIds: [],
    education: {
      completedLessonIds: [],
      completedExerciseIds: [],
      questionStats: {},
      reviewLessonIds: [],
    },
    settings: { instructorMode: false, graphics: 'high' },
  };
}
