/**
 * Contrato do conteúdo didático (lições, exercícios e perguntas).
 *
 * Cada módulo do currículo fica em `content/<trilha>/<mNN-slug>/index.ts` e exporta por padrão um
 * `ContentModule`. Veja `content/README.md` para um exemplo completo.
 */

export type Track = 'node' | 'typescript';
export type Difficulty = 1 | 2 | 3;
export type CodeLanguage = 'js' | 'ts';

export interface ContentModule {
  /** Ex.: "node.m01". */
  id: string;
  track: Track;
  /** Ordem global no currículo (1 a 14). Também é o nível do jogador que libera o módulo. */
  order: number;
  title: string;
  summary: string;
  lessons: Lesson[];
  exercises: Exercise[];
  questions: Question[];
}

export type LessonSection =
  | { kind: 'text'; markdown: string }
  | { kind: 'example'; code: string; language: CodeLanguage; explanation?: string };

export interface Lesson {
  /** Ex.: "node.m01.l02". Sempre começa com o id do módulo. */
  id: string;
  moduleId: string;
  order: number;
  title: string;
  concepts: string[];
  sections: LessonSection[];
  /** Perguntas rápidas exibidas depois da aula e antes do exercício. */
  checkQuestionIds: string[];
  /** Exercícios cobrados nos postos. */
  exerciseIds: string[];
  /** Exercícios de depuração usados para consertar o caminhão. */
  debugExerciseIds: string[];
}

export interface ExerciseTest {
  description: string;
  /**
   * Código executado logo depois do código do jogador, no mesmo escopo. Tem acesso a:
   * `assert` (subconjunto de `node:assert/strict`), `__logs` (linhas escritas no stdout),
   * `__errors` (linhas do stderr), `require` e às declarações do jogador.
   * Pode usar `await`. Em exercícios TS, `// @ts-expect-error` exige um erro de tipo.
   */
  code: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  /** `debug`: o `starterCode` é um código com defeito que o jogador precisa corrigir. */
  kind: 'implement' | 'debug';
  title: string;
  promptMarkdown: string;
  language: CodeLanguage;
  moduleSystem: 'commonjs' | 'esm';
  starterCode: string;
  /** Solução de referência. A CI garante que passa em todos os testes. */
  solution: string;
  tests: ExerciseTest[];
  hints: string[];
  /** Perguntas sobre este exercício, feitas na blitz. Mínimo de 2. */
  followUpQuestionIds: string[];
  difficulty: Difficulty;
  /** Outros arquivos do "projeto", acessíveis com `require('./nome')` ou `import`. */
  extraFiles?: Record<string, string>;
  /** Arquivos que já existem no `fs` simulado quando o código roda. Caminhos relativos a /app. */
  fsSeed?: Record<string, string>;
  /** Argumentos extras em `process.argv` (depois de "node" e do script). */
  argv?: string[];
}

interface QuestionBase {
  id: string;
  /** A pergunta só aparece (pedágio, hotel, provas) depois que o jogador estudou estas lições. */
  lessonIds: string[];
  /** Preenchido nas perguntas de acompanhamento de um exercício (blitz). */
  exerciseId?: string;
  prompt: string;
  explanation: string;
  difficulty: Difficulty;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  kind: 'multiple-choice';
  code?: string;
  options: string[];
  answerIndex: number;
}

export interface TrueFalseQuestion extends QuestionBase {
  kind: 'true-false';
  code?: string;
  answer: boolean;
}

export interface PredictOutputQuestion extends QuestionBase {
  kind: 'predict-output';
  /** Código JS executado pela CI para conferir `expectedOutput`. */
  code: string;
  /** Saída exata no stdout, linhas separadas por "\n". */
  expectedOutput: string;
}

export interface FillBlankQuestion extends QuestionBase {
  kind: 'fill-blank';
  /** Código com exatamente uma lacuna marcada como `___`. */
  code: string;
  acceptedAnswers: string[];
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | PredictOutputQuestion | FillBlankQuestion;

export type QuestionKind = Question['kind'];

/** Módulos do Node disponíveis no simulador. Exercícios só podem usar estes. */
export const SIMULATED_NODE_MODULES = [
  'fs',
  'fs/promises',
  'path',
  'events',
  'assert',
  'assert/strict',
] as const;
