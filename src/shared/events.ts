/** Eventos trocados entre os sistemas do jogo pelo `EventBus`. */
import type { PoiKind } from './map';
import type { Penalty } from './player';
import type { ComponentId, FaultKind } from './vehicle';

export type QuestionContext =
  'lesson-check' | 'toll' | 'police' | 'hotel' | 'level-exam' | 'dealer' | 'review';

export interface GameEvents {
  'clock:tick': { gameMinutes: number };
  'fuel:low': { liters: number };
  'poi:enter': { poiId: string; kind: PoiKind };
  'poi:leave': { poiId: string; kind: PoiKind };
  'toll:enter': { tollId: string };
  'exercise:passed': { exerciseId: string; hintsUsed: number; attempts: number };
  'question:answered': { questionId: string; correct: boolean; context: QuestionContext };
  'penalty:applied': Penalty;
  'vehicle:fault': { kind: FaultKind; component: ComponentId };
  'vehicle:tire-puncture': { axle: number };
  'driver:fatigue': { level: 'warn' | 'effects' | 'exhausted' };
  'police:checkpoint': { poiId: string };
  'level:up': { level: number };
  'save:written': { savedAt: string };
}
