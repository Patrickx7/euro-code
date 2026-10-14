import { describe, expect, it } from 'vitest';
import type { JobTemplate } from '../shared/jobs';
import { arrive, completeTask, currentTask, readyToDeliver, startJob } from './job-session';

const job: JobTemplate = {
  id: 'core.m03.j01',
  moduleId: 'core.m03',
  title: 'Centralizar a div',
  briefMarkdown: '.',
  client: { name: 'Pousada', contact: 'Cida', place: 'client-office', area: 'Caucaia do Alto' },
  seniority: 'estagiario',
  pay: 30,
  slaMinutes: 40,
  taskExerciseIds: ['e1', 'e2'],
  twists: [
    { afterTask: 0, message: 'É rapidinho!', extraExerciseId: 'd1', extraPay: 0, extraSlaMinutes: 10 },
  ],
  chat: { arrival: ['Oi'], delivery: ['Valeu'] },
};

describe('JobSession', () => {
  it('segue a fila de tasks, com o imprevisto entrando depois da task certa', () => {
    const session = startJob(job, 100);
    expect(session.phase).toBe('driving');
    arrive(session, 130);
    expect(session.arrivedAt).toBe(130);
    expect(currentTask(session)).toBe('e1');

    const twists = completeTask(session, 'e1');
    expect(twists.map((t) => t.message)).toEqual(['É rapidinho!']);
    expect(session.tasks).toEqual(['e1', 'e2', 'd1']);
    expect(currentTask(session)).toBe('e2');

    expect(completeTask(session, 'e2')).toEqual([]);
    expect(readyToDeliver(session)).toBe(false);
    completeTask(session, 'd1');
    expect(readyToDeliver(session)).toBe(true);
    expect(session.twistsApplied).toEqual([0]);
  });

  it('ignora task repetida ou que não é do job', () => {
    const session = startJob(job, 0);
    arrive(session, 0);
    completeTask(session, 'e1');
    expect(completeTask(session, 'e1')).toEqual([]);
    expect(completeTask(session, 'outra')).toEqual([]);
    expect(session.tasks).toEqual(['e1', 'e2', 'd1']);
  });
});
