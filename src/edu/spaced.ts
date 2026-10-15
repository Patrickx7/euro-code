/**
 * Repetição espaçada simples (caixas de Leitner) para as perguntas de pedágio, blitz e hotel:
 * errou volta para a caixa 0 e aparece mais; acertou sobe de caixa e some por um tempo.
 */
import type { ContentModule, Question } from '../shared/content';
import type { QuestionStat, SaveData } from '../shared/save';

const MAX_BOX = 5;
/** Minutos de jogo até uma pergunta de cada caixa voltar a ser "devida". */
const BOX_INTERVAL_MINUTES = [0, 30, 120, 480, 1440, 4320];

/** Lições que o jogador já estudou: as dos exercícios que ele resolveu (e as marcadas como concluídas). */
export function studiedLessonIds(modules: ContentModule[], save: SaveData): Set<string> {
  const studied = new Set(save.education.completedLessonIds);
  const solved = new Set(save.education.completedExerciseIds);
  for (const module of modules) {
    for (const exercise of module.exercises) if (solved.has(exercise.id)) studied.add(exercise.lessonId);
  }
  return studied;
}

/** Perguntas que podem cair: todas as lições delas já estudadas (sem as de acompanhamento da blitz). */
export function eligibleQuestions(modules: ContentModule[], save: SaveData): Question[] {
  const studied = studiedLessonIds(modules, save);
  return modules.flatMap((m) =>
    m.questions.filter((q) => q.exerciseId === undefined && q.lessonIds.every((id) => studied.has(id))),
  );
}

/** Escolhe a próxima pergunta: as devidas (e as da caixa mais baixa) têm mais chance. */
export function pickQuestion(
  questions: Question[],
  stats: Record<string, QuestionStat>,
  gameMinutes: number,
  random: () => number,
  exclude: string[] = [],
): Question | null {
  const pool = questions.filter((q) => !exclude.includes(q.id));
  if (pool.length === 0) return null;
  const weights = pool.map((q) => {
    const stat = stats[q.id];
    if (!stat) return 3; // nunca vista
    const due = gameMinutes - stat.lastSeenGameMinute >= (BOX_INTERVAL_MINUTES[stat.box] ?? 0);
    return (due ? 4 : 0.5) / (1 + stat.box);
  });
  let roll = random() * weights.reduce((a, b) => a + b, 0);
  for (const [i, w] of weights.entries()) {
    roll -= w;
    if (roll <= 0) return pool[i] ?? null;
  }
  return pool.at(-1) ?? null;
}

export function recordAnswer(
  save: SaveData,
  questionId: string,
  correct: boolean,
  gameMinutes: number,
): void {
  const stat = save.education.questionStats[questionId] ?? {
    correct: 0,
    wrong: 0,
    box: 0,
    lastSeenGameMinute: 0,
  };
  if (correct) {
    stat.correct++;
    stat.box = Math.min(MAX_BOX, stat.box + 1);
  } else {
    stat.wrong++;
    stat.box = 0;
  }
  stat.lastSeenGameMinute = gameMinutes;
  save.education.questionStats[questionId] = stat;
}
