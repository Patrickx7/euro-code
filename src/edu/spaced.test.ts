import { describe, expect, it } from 'vitest';
import type { ContentModule, Question } from '../shared/content';
import { createNewSave } from '../shared/save';
import { mulberry32 } from '../shared/random';
import { eligibleQuestions, pickQuestion, recordAnswer } from './spaced';

const q = (id: string, lessonIds: string[], exerciseId?: string): Question => ({
  id,
  lessonIds,
  exerciseId,
  kind: 'true-false',
  prompt: '?',
  answer: true,
  explanation: '.',
  difficulty: 1,
});

const module: ContentModule = {
  id: 'core.m01',
  track: 'core',
  order: 1,
  seniority: 'estagiario',
  title: '',
  summary: '',
  lessons: [],
  exercises: [
    {
      id: 'core.m01.e01',
      lessonId: 'core.m01.l01',
      kind: 'implement',
      title: '',
      promptMarkdown: '',
      tests: [],
      hints: [],
      followUpQuestionIds: [],
      difficulty: 1,
      language: 'js',
      moduleSystem: 'commonjs',
      starterCode: '',
      solution: '',
    },
  ],
  questions: [q('a', ['core.m01.l01']), q('b', ['core.m01.l02']), q('f', ['core.m01.l01'], 'core.m01.e01')],
  jobs: [],
};

describe('repetição espaçada', () => {
  it('só cobra lições estudadas (de exercícios resolvidos) e deixa as de acompanhamento para a blitz', () => {
    const save = createNewSave();
    expect(eligibleQuestions([module], save)).toEqual([]);
    save.education.completedExerciseIds.push('core.m01.e01');
    expect(eligibleQuestions([module], save).map((x) => x.id)).toEqual(['a']);
  });

  it('pergunta errada volta mais vezes que a acertada', () => {
    const save = createNewSave();
    const questions = [q('certa', []), q('errada', [])];
    recordAnswer(save, 'certa', true, 0);
    recordAnswer(save, 'certa', true, 0);
    recordAnswer(save, 'errada', false, 0);
    expect(save.education.questionStats.errada?.box).toBe(0);
    expect(save.education.questionStats.certa?.box).toBe(2);
    const random = mulberry32(1);
    let wrongPicks = 0;
    for (let i = 0; i < 200; i++) {
      if (pickQuestion(questions, save.education.questionStats, 10, random)?.id === 'errada') wrongPicks++;
    }
    expect(wrongPicks).toBeGreaterThan(150);
  });

  it('respeita a lista de excluídas e devolve null sem opções', () => {
    expect(pickQuestion([q('a', [])], {}, 0, Math.random, ['a'])).toBeNull();
  });
});
