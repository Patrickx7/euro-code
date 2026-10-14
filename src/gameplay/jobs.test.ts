import { describe, expect, it } from 'vitest';
import type { ContentModule } from '../shared/content';
import type { JobTemplate } from '../shared/jobs';
import { createNewSave } from '../shared/save';
import { availableJobs, dailyOffers, deliverJob, unlockedTracks } from './jobs';

function job(id: string, extra: Partial<JobTemplate> = {}): JobTemplate {
  return {
    id,
    moduleId: id.split('.j')[0] ?? id,
    title: id,
    briefMarkdown: '.',
    client: { name: 'Padaria', contact: 'Zé', place: 'client-office', area: 'Osasco' },
    seniority: 'estagiario',
    pay: 100,
    slaMinutes: 60,
    taskExerciseIds: [`${id}.e1`],
    chat: { arrival: ['oi'], delivery: ['tchau'] },
    ...extra,
  };
}

function module(id: string, track: ContentModule['track'], jobs: JobTemplate[]): ContentModule {
  return {
    id,
    track,
    order: 1,
    seniority: 'estagiario',
    title: id,
    summary: '',
    lessons: [],
    exercises: [],
    questions: [],
    jobs,
  };
}

const modules = [
  module('core.m01', 'core', [job('core.m01.j01'), job('core.m01.j02')]),
  module('front.m01', 'front', [job('front.m01.j01', { seniority: 'junior', path: 'front' })]),
  module('back.m01', 'back', [job('back.m01.j01', { seniority: 'junior', path: 'back' })]),
  module('typescript.m01', 'typescript', [job('typescript.m01.j01', { seniority: 'pleno' })]),
];

describe('jobs disponíveis', () => {
  it('estagiário só vê jobs do núcleo', () => {
    const save = createNewSave();
    expect(availableJobs(modules, save).map((o) => o.job.id)).toEqual(['core.m01.j01', 'core.m01.j02']);
  });

  it('júnior de back vê o núcleo e o back, mas não o front', () => {
    const save = createNewSave();
    save.career.seniority = 'junior';
    save.career.path = 'back';
    expect(availableJobs(modules, save).map((o) => o.job.id)).toEqual([
      'core.m01.j01',
      'core.m01.j02',
      'back.m01.j01',
    ]);
  });

  it('sênior libera a outra trilha e o pleno libera TypeScript', () => {
    expect(unlockedTracks({ ...createNewSave().career, seniority: 'pleno', path: 'front' })).toEqual([
      'core',
      'front',
      'typescript',
    ]);
    expect(unlockedTracks({ ...createNewSave().career, seniority: 'senior', path: 'front' })).toEqual([
      'core',
      'front',
      'back',
      'typescript',
      'fullstack',
    ]);
  });

  it('jobs feitos somem até acabarem as opções', () => {
    const save = createNewSave();
    save.completedJobIds = ['core.m01.j01'];
    expect(availableJobs(modules, save).map((o) => o.job.id)).toEqual(['core.m01.j02']);
    save.completedJobIds.push('core.m01.j02');
    expect(availableJobs(modules, save)).toHaveLength(2);
  });

  it('as ofertas do dia são sempre as mesmas para o mesmo dia', () => {
    const save = createNewSave();
    const offers = availableJobs(modules, save);
    expect(dailyOffers(offers, 3, save.career)).toEqual(dailyOffers(offers, 3, save.career));
  });
});

describe('deliverJob', () => {
  it('paga, avalia pelo SLA (com o extra dos imprevistos) e registra o histórico', () => {
    const save = createNewSave();
    const template = job('core.m01.j01', {
      twists: [
        { afterTask: 0, message: 'é rapidinho', extraExerciseId: 'x', extraPay: 20, extraSlaMinutes: 20 },
      ],
    });
    const result = deliverJob(save, template, { arrivedAt: 100, deliveredAt: 160 }, [0], ['a', 'b']);
    // 60 min gastos de 80 de SLA = 0,75 → 5 estrelas.
    expect(result).toEqual({ slaRatio: 0.75, stars: 5, pay: 120 });
    expect(save.money).toBe(300 + 120);
    expect(save.career.jobsDone).toBe(1);
    expect(save.career.rating).toBe(5);
    expect(save.completedJobIds).toEqual(['core.m01.j01']);
    expect(save.driver.recentExerciseIds).toEqual(['b', 'a']);
  });

  it('estourar muito o SLA dá 1 estrela', () => {
    const save = createNewSave();
    const result = deliverJob(save, job('core.m01.j01'), { arrivedAt: 0, deliveredAt: 200 }, [], []);
    expect(result.stars).toBe(1);
  });
});
