/** Correção das perguntas (pedágio, blitz, hotel, entrevista). */
import type { Question } from '../shared/content';

/** Resposta do jogador, conforme o tipo da pergunta. */
export type QuestionAnswer =
  | { kind: 'multiple-choice'; optionIndex: number }
  | { kind: 'true-false'; value: boolean }
  | { kind: 'predict-output' | 'fill-blank'; text: string };

/**
 * Normaliza código digitado: ignora espaços, `;` no fim e o tipo de aspas, para que
 * `km * 4.5`, `km*4.5` e `km * 4.5;` contem como a mesma resposta.
 */
export function normalizeCode(text: string): string {
  return text.trim().replace(/;+$/, '').replace(/["`]/g, "'").replace(/\s+/g, '');
}

/** Saída do programa: compara linha a linha, ignorando espaços no fim das linhas e linhas vazias no fim. */
export function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trimEnd();
}

export function isCorrect(question: Question, answer: QuestionAnswer): boolean {
  switch (question.kind) {
    case 'multiple-choice':
      return answer.kind === 'multiple-choice' && answer.optionIndex === question.answerIndex;
    case 'true-false':
      return answer.kind === 'true-false' && answer.value === question.answer;
    case 'predict-output':
      return (
        answer.kind === 'predict-output' &&
        normalizeOutput(answer.text) === normalizeOutput(question.expectedOutput)
      );
    case 'fill-blank': {
      if (answer.kind !== 'fill-blank') return false;
      const given = normalizeCode(answer.text);
      return question.acceptedAnswers.some((accepted) => normalizeCode(accepted) === given);
    }
  }
}
