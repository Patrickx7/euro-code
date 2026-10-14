/**
 * Contrato do conteúdo didático (lições, exercícios, perguntas e jobs).
 *
 * Cada módulo do currículo fica em `content/<trilha>/<mNN-slug>/index.ts` e exporta por padrão um
 * `ContentModule`. Veja `content/README.md` para um exemplo completo.
 */
import type { JobTemplate } from './jobs';
import type { Seniority } from './profile';

/**
 * Trilhas do currículo:
 * - core: HTML, CSS e JavaScript (estagiário, todo mundo faz);
 * - front / back: escolhida na efetivação para Júnior (DOM e web / Node.js);
 * - typescript: Pleno;
 * - fullstack: Sênior em diante (libera a outra trilha e junta as duas).
 */
export const TRACKS = ['core', 'front', 'back', 'typescript', 'fullstack'] as const;
export type Track = (typeof TRACKS)[number];

/**
 * Quais trilhas uma pergunta/job de `from` pode cobrar. Front e back são ramos alternativos: quem
 * está em uma pode não ter feito a outra, então só o full stack cobra as duas.
 */
export const TRACK_PREREQUISITES: Record<Track, readonly Track[]> = {
  core: ['core'],
  front: ['core', 'front'],
  back: ['core', 'back'],
  typescript: ['core', 'typescript'],
  fullstack: ['core', 'front', 'back', 'typescript', 'fullstack'],
};

export type Difficulty = 1 | 2 | 3;
export type CodeLanguage = 'js' | 'ts';

export interface ContentModule {
  /** Ex.: "core.m01". */
  id: string;
  track: Track;
  /** Ordem dentro da trilha (1, 2, 3...). */
  order: number;
  /** Senioridade em que o módulo é estudado. */
  seniority: Seniority;
  title: string;
  summary: string;
  lessons: Lesson[];
  exercises: Exercise[];
  questions: Question[];
  /** Jobs de clientes que usam o que o módulo ensina. */
  jobs: JobTemplate[];
}

export type LessonSection =
  | { kind: 'text'; markdown: string }
  | { kind: 'example'; code: string; language: CodeLanguage | 'html' | 'css'; explanation?: string };

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
  /** Exercícios de depuração usados para consertar o carro. */
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

interface ExerciseBase {
  id: string;
  lessonId: string;
  /** `debug`: o código inicial tem um defeito que o jogador precisa corrigir. */
  kind: 'implement' | 'debug';
  title: string;
  promptMarkdown: string;
  tests: ExerciseTest[];
  hints: string[];
  /** Perguntas sobre este exercício, feitas na blitz. Mínimo de 2. */
  followUpQuestionIds: string[];
  difficulty: Difficulty;
}

/** Exercício de JavaScript/TypeScript, rodado no simulador de Node (`src/edu/runner`). */
export interface CodeExercise extends ExerciseBase {
  language: CodeLanguage;
  moduleSystem: 'commonjs' | 'esm';
  starterCode: string;
  /** Solução de referência. A CI garante que passa em todos os testes. */
  solution: string;
  /** Outros arquivos do "projeto", acessíveis com `require('./nome')` ou `import`. */
  extraFiles?: Record<string, string>;
  /** Arquivos que já existem no `fs` simulado quando o código roda. Caminhos relativos a /app. */
  fsSeed?: Record<string, string>;
  /** Argumentos extras em `process.argv` (depois de "node" e do script). */
  argv?: string[];
}

export interface WebFiles {
  html: string;
  css: string;
  js: string;
}

/**
 * Exercício de página web (HTML, CSS e JS no navegador), como "centralize a div".
 * Os testes rodam dentro da página (`src/edu/web/page-runtime.ts`) e têm acesso a `assert`,
 * `document`, `window` e aos atalhos `box(seletor)` (retângulo na tela), `style(seletor)` (estilo
 * computado), `click(seletor)` e `wait(ms)`.
 */
export interface WebExercise extends ExerciseBase {
  language: 'web';
  starterFiles: WebFiles;
  solutionFiles: WebFiles;
  /** Abas que o jogador pode editar (as outras aparecem só para leitura). */
  editableFiles: (keyof WebFiles)[];
  /** Tamanho da "tela" onde a página roda. Padrão: 800 x 600. */
  viewport?: { width: number; height: number };
}

export type Exercise = CodeExercise | WebExercise;

export const DEFAULT_WEB_VIEWPORT = { width: 800, height: 600 } as const;

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
  /** Código JS (simulador de Node) executado pela CI para conferir `expectedOutput`. */
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
