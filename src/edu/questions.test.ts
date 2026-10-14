import { describe, expect, it } from 'vitest';
import type { Question } from '../shared/content';
import { isCorrect, normalizeCode } from './questions';

const base = {
  id: 'core.m01.q01',
  lessonIds: ['core.m01.l01'],
  prompt: '?',
  explanation: '.',
  difficulty: 1 as const,
};

describe('isCorrect', () => {
  it('múltipla escolha e verdadeiro/falso', () => {
    const mc: Question = { ...base, kind: 'multiple-choice', options: ['a', 'b'], answerIndex: 1 };
    expect(isCorrect(mc, { kind: 'multiple-choice', optionIndex: 1 })).toBe(true);
    expect(isCorrect(mc, { kind: 'multiple-choice', optionIndex: 0 })).toBe(false);
    const tf: Question = { ...base, kind: 'true-false', answer: false };
    expect(isCorrect(tf, { kind: 'true-false', value: false })).toBe(true);
    expect(isCorrect(tf, { kind: 'multiple-choice', optionIndex: 0 })).toBe(false);
  });

  it('lacuna ignora espaços, ponto e vírgula final e tipo de aspas', () => {
    const q: Question = {
      ...base,
      kind: 'fill-blank',
      code: 'const total = ___;',
      acceptedAnswers: ['km * 4.5'],
    };
    for (const text of ['km * 4.5', 'km*4.5', ' km *4.5; ']) {
      expect(isCorrect(q, { kind: 'fill-blank', text })).toBe(true);
    }
    expect(isCorrect(q, { kind: 'fill-blank', text: 'km * 45' })).toBe(false);
    expect(normalizeCode('"oi"')).toBe(normalizeCode("'oi'"));
  });

  it('"qual a saída?" compara linhas sem se importar com espaços no fim', () => {
    const q: Question = { ...base, kind: 'predict-output', code: 'x', expectedOutput: '1\n2' };
    expect(isCorrect(q, { kind: 'predict-output', text: '1  \r\n2\n\n' })).toBe(true);
    expect(isCorrect(q, { kind: 'predict-output', text: '1 2' })).toBe(false);
  });
});
