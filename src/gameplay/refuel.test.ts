import { describe, expect, it } from 'vitest';
import type { ContentModule, Exercise } from '../shared/content';
import { createNewSave } from '../shared/save';
import { pickRefuelExercise, refuelQuote } from './refuel';

const ex = (id: string, kind: Exercise['kind'] = 'implement'): Exercise => ({
  id,
  lessonId: 'l',
  kind,
  title: id,
  promptMarkdown: '',
  tests: [],
  hints: [],
  followUpQuestionIds: [],
  difficulty: 1,
  language: 'js',
  moduleSystem: 'commonjs',
  starterCode: '',
  solution: '',
});
const mod = (
  id: string,
  track: ContentModule['track'],
  order: number,
  exercises: Exercise[],
): ContentModule => ({
  id,
  track,
  order,
  seniority: 'estagiario',
  title: '',
  summary: '',
  lessons: [],
  exercises,
  questions: [],
  jobs: [],
});

describe('posto', () => {
  const modules = [
    mod('core.m02', 'core', 2, [ex('c2')]),
    mod('core.m01', 'core', 1, [ex('c1d', 'debug'), ex('c1')]),
    mod('back.m01', 'back', 1, [ex('b1')]),
  ];

  it('cobra o próximo exercício ainda não resolvido, na ordem do currículo', () => {
    const save = createNewSave();
    expect(pickRefuelExercise(modules, save, () => 0)?.id).toBe('c1');
    save.education.completedExerciseIds.push('c1');
    expect(pickRefuelExercise(modules, save, () => 0)?.id).toBe('c2');
    save.education.completedExerciseIds.push('c2');
    // Estagiário não tem back liberado: revisão de um já resolvido.
    expect(['c1', 'c2']).toContain(pickRefuelExercise(modules, save, () => 0.99)?.id);
  });

  it('enche o que falta, até onde o dinheiro dá', () => {
    expect(refuelQuote(42, 10, 1000)).toEqual({ liters: 32, cost: 192 });
    expect(refuelQuote(42, 10, 60)).toEqual({ liters: 10, cost: 60 });
    expect(refuelQuote(42, 42, 60)).toEqual({ liters: 0, cost: 0 });
  });
});
