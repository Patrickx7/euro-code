/** Eventos trocados entre os sistemas do jogo pelo `EventBus`. */
import type { PoiKind } from './map';
import type { Penalty } from './player';
import type { CareerPath, Seniority } from './profile';
import type { ComponentId, FaultKind } from './vehicle';

export type QuestionContext =
  'lesson-check' | 'toll' | 'police' | 'hotel' | 'interview' | 'car-dealer' | 'review';

export interface GameEvents {
  'clock:tick': { gameMinutes: number };
  'fuel:low': { liters: number };
  'poi:enter': { poiId: string; kind: PoiKind };
  'poi:leave': { poiId: string; kind: PoiKind };
  'toll:enter': { tollId: string };
  'job:accepted': { jobId: string };
  'job:arrived': { jobId: string; gameMinutes: number };
  'job:task-done': { jobId: string; exerciseId: string };
  'job:scope-change': { jobId: string; extraExerciseId: string };
  'job:delivered': { jobId: string; slaRatio: number; stars: number; pay: number };
  'exercise:passed': { exerciseId: string; hintsUsed: number; attempts: number };
  'question:answered': { questionId: string; correct: boolean; context: QuestionContext };
  'penalty:applied': Penalty;
  'vehicle:fault': { kind: FaultKind; component: ComponentId };
  'vehicle:tire-puncture': { axle: number };
  'driver:fatigue': { level: 'warn' | 'effects' | 'exhausted' };
  'police:checkpoint': { poiId: string };
  'promotion:interview': { to: Seniority };
  'promotion:result': { to: Seniority; path: CareerPath; passed: boolean };
  'save:written': { savedAt: string };
}
