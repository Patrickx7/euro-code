/** Corrige um exercício: checa tipos (TS), roda cada teste num sandbox novo e junta o resultado. */
import type { CodeExercise, CodeLanguage } from '../../shared/content';
import { typecheck, transpile, type CodeDiagnostic, type LibReader } from './compile';
import { runInSandbox, type ScriptOutcome } from './sandbox';

export interface TestResult {
  description: string;
  passed: boolean;
  /** Motivo da falha, em português. */
  message?: string;
  stdout: string[];
}

export interface ExerciseRunResult {
  passed: boolean;
  /** Erros de sintaxe no código do jogador (linhas relativas ao código dele). */
  compileErrors: CodeDiagnostic[];
  /** Erros de tipo no código do jogador ou nos arquivos extras (só exercícios TS). */
  typeErrors: CodeDiagnostic[];
  tests: TestResult[];
}

export type ExerciseSpec = Pick<CodeExercise, 'language' | 'tests' | 'extraFiles' | 'fsSeed' | 'argv'>;

export interface RunExerciseOptions {
  /** Necessário para exercícios TypeScript. */
  readLib?: LibReader;
  timeoutMs?: number;
}

const UNUSED_TS_EXPECT_ERROR = 2578;

export function mainFileFor(language: CodeLanguage): string {
  return `/app/main.${language}`;
}

function lineCount(text: string): number {
  return text.split('\n').length;
}

function extraFilePaths(extraFiles: Record<string, string> | undefined): Record<string, string> {
  return Object.fromEntries(
    Object.entries(extraFiles ?? {}).map(([name, code]) => [`/app/${name.replace(/^\.?\//, '')}`, code]),
  );
}

/** Traduz os erros de tipo mais comuns dos testes para algo que o jogador entenda. */
function describeTestTypeError(diagnostic: CodeDiagnostic): string {
  if (diagnostic.code === UNUSED_TS_EXPECT_ERROR) {
    return 'Esperava um erro de tipo neste teste, mas o TypeScript aceitou o código. Seus tipos estão permissivos demais.';
  }
  return `Erro de tipo no teste: ${diagnostic.message}`;
}

function typecheckExercise(
  spec: ExerciseSpec,
  code: string,
  readLib: LibReader,
): { codeErrors: CodeDiagnostic[]; testErrors: Map<number, CodeDiagnostic[]> } {
  const mainFile = mainFileFor('ts');
  const parts = [code];
  const testStartLines: number[] = [];
  let line = lineCount(code) + 1;
  for (const test of spec.tests) {
    testStartLines.push(line);
    const block = `{\n${test.code}\n}`;
    parts.push(block);
    line += lineCount(block);
  }
  parts.push('export {};');
  const userLines = lineCount(code);

  const diagnostics = typecheck(
    { ...extraFilePaths(spec.extraFiles), [mainFile]: parts.join('\n') },
    readLib,
  );
  const codeErrors: CodeDiagnostic[] = [];
  const testErrors = new Map<number, CodeDiagnostic[]>();
  for (const d of diagnostics) {
    if (d.file !== mainFile || d.line <= userLines) {
      codeErrors.push(d);
      continue;
    }
    let index = testStartLines.length - 1;
    while (index > 0 && (testStartLines[index] ?? 0) > d.line) index--;
    const list = testErrors.get(index) ?? [];
    list.push(d);
    testErrors.set(index, list);
  }
  return { codeErrors, testErrors };
}

export async function runExercise(
  spec: ExerciseSpec,
  code: string,
  options: RunExerciseOptions = {},
): Promise<ExerciseRunResult> {
  const mainFile = mainFileFor(spec.language);

  const compileErrors = transpile(code, mainFile).errors;
  if (compileErrors.length > 0) {
    return {
      passed: false,
      compileErrors,
      typeErrors: [],
      tests: spec.tests.map((t) => ({
        description: t.description,
        passed: false,
        message: 'Corrija os erros de sintaxe primeiro.',
        stdout: [],
      })),
    };
  }

  let typeErrors: CodeDiagnostic[] = [];
  let testTypeErrors = new Map<number, CodeDiagnostic[]>();
  if (spec.language === 'ts') {
    if (!options.readLib) throw new Error('Exercícios TypeScript precisam de readLib para checar os tipos.');
    const checked = typecheckExercise(spec, code, options.readLib);
    typeErrors = checked.codeErrors;
    testTypeErrors = checked.testErrors;
  }

  const tests: TestResult[] = [];
  for (const [index, test] of spec.tests.entries()) {
    const outcome: ScriptOutcome = await runInSandbox(`${code}\n;\n{\n${test.code}\n}\n`, {
      mainFile,
      extraFiles: spec.extraFiles,
      fsSeed: spec.fsSeed,
      argv: spec.argv,
      timeoutMs: options.timeoutMs,
    });
    const typeError = testTypeErrors.get(index)?.[0];
    tests.push({
      description: test.description,
      passed: outcome.error === null && typeError === undefined,
      message: outcome.error ?? (typeError ? describeTestTypeError(typeError) : undefined),
      stdout: outcome.stdout,
    });
  }

  return {
    passed: typeErrors.length === 0 && tests.every((t) => t.passed),
    compileErrors: [],
    typeErrors,
    tests,
  };
}

/** Roda um script avulso (exemplos das aulas e perguntas "qual a saída?"). */
export function runScript(
  code: string,
  language: CodeLanguage,
  options: Partial<Pick<CodeExercise, 'extraFiles' | 'fsSeed' | 'argv'>> & { timeoutMs?: number } = {},
): Promise<ScriptOutcome> {
  return runInSandbox(code, { mainFile: mainFileFor(language), ...options });
}
