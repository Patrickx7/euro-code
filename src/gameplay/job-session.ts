/**
 * Um job em andamento: fila de tasks (o cliente pode aumentar o escopo no meio), tasks feitas,
 * dicas usadas e tempos. Sem DOM: a interface do notebook lê e muda isto.
 */
import type { JobTemplate, JobTwist } from '../shared/jobs';

export type JobPhase = 'driving' | 'working' | 'delivered';

export interface JobSession {
  job: JobTemplate;
  phase: JobPhase;
  acceptedAt: number;
  arrivedAt: number | null;
  /** Ids dos exercícios a fazer, em ordem (inclui os extras dos imprevistos). */
  tasks: string[];
  done: string[];
  /** Índices de `job.twists` que já aconteceram. */
  twistsApplied: number[];
  hintsUsed: number;
}

export function startJob(job: JobTemplate, gameMinutes: number): JobSession {
  return {
    job,
    phase: 'driving',
    acceptedAt: gameMinutes,
    arrivedAt: null,
    tasks: [...job.taskExerciseIds],
    done: [],
    twistsApplied: [],
    hintsUsed: 0,
  };
}

export function arrive(session: JobSession, gameMinutes: number): void {
  if (session.phase !== 'driving') return;
  session.phase = 'working';
  session.arrivedAt = gameMinutes;
}

/** Task atual (a primeira ainda não feita), ou `null` se acabou. */
export function currentTask(session: JobSession): string | null {
  return session.tasks.find((id) => !session.done.includes(id)) ?? null;
}

/**
 * Marca uma task como feita. Se um imprevisto do cliente estava esperando essa task, ele acontece
 * agora: a task extra entra na fila e a mensagem do cliente é devolvida para o chat.
 */
export function completeTask(session: JobSession, exerciseId: string): JobTwist[] {
  if (!session.tasks.includes(exerciseId) || session.done.includes(exerciseId)) return [];
  session.done.push(exerciseId);
  const originalIndex = session.job.taskExerciseIds.indexOf(exerciseId);
  const triggered: JobTwist[] = [];
  (session.job.twists ?? []).forEach((twist, index) => {
    if (twist.afterTask !== originalIndex || session.twistsApplied.includes(index)) return;
    session.twistsApplied.push(index);
    if (!session.tasks.includes(twist.extraExerciseId)) session.tasks.push(twist.extraExerciseId);
    triggered.push(twist);
  });
  return triggered;
}

export function readyToDeliver(session: JobSession): boolean {
  return session.phase === 'working' && currentTask(session) === null;
}
