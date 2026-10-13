/** Transpilação (JS/TS → JavaScript executável) e checagem de tipos com o compilador do TypeScript. */
import ts from 'typescript';
import { AMBIENT_TYPES } from './ambient-types';

export interface CodeDiagnostic {
  file: string;
  /** Código do erro no TypeScript (ex.: 2322). */
  code: number;
  /** Linha e coluna começando em 1. */
  line: number;
  column: number;
  message: string;
}

export interface TranspileResult {
  /** Corpo CommonJS pronto para executar, sem a diretiva "use strict". */
  code: string;
  /** Módulos ES (com import/export) rodam em modo estrito, como no Node. */
  strict: boolean;
  errors: CodeDiagnostic[];
}

/** Lê um arquivo de `typescript/lib` (ex.: "lib.es2022.d.ts"). No navegador vem do bundle. */
export type LibReader = (fileName: string) => string | undefined;

const LIB_DIR = '/__lib__';
const AMBIENT_FILE = '/__types__/ambient.d.ts';

function toDiagnostic(d: ts.Diagnostic): CodeDiagnostic {
  const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
  if (!d.file || d.start === undefined) return { file: '', code: d.code, line: 0, column: 0, message };
  const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
  return { file: d.file.fileName, code: d.code, line: line + 1, column: character + 1, message };
}

export function transpile(source: string, fileName: string): TranspileResult {
  const result = ts.transpileModule(source, {
    fileName,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      allowJs: true,
      removeComments: false,
    },
  });
  const directive = /^"use strict";\r?\n/;
  const strict = directive.test(result.outputText);
  return {
    code: result.outputText.replace(directive, ''),
    strict,
    errors: (result.diagnostics ?? []).map(toDiagnostic),
  };
}

const COMPILER_OPTIONS: ts.CompilerOptions = {
  strict: true,
  noEmit: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ['lib.es2022.d.ts'],
  types: [],
  esModuleInterop: true,
  allowJs: true,
  checkJs: false,
  skipLibCheck: true,
  allowImportingTsExtensions: true,
};

const libCache = new Map<string, ts.SourceFile>();

/**
 * Checa os tipos de um conjunto de arquivos (caminhos absolutos, ex.: "/app/main.ts").
 * Devolve só os erros dos arquivos do exercício, nunca os das bibliotecas.
 */
export function typecheck(
  files: Record<string, string>,
  readLib: LibReader,
  /** Também reporta erros nas declarações do ambiente simulado (usado nos testes do projeto). */
  checkAmbient = false,
): CodeDiagnostic[] {
  const all = new Map<string, string>(Object.entries(files));
  all.set(AMBIENT_FILE, AMBIENT_TYPES);

  const libText = (fileName: string): string | undefined =>
    fileName.startsWith(`${LIB_DIR}/`) ? readLib(fileName.slice(LIB_DIR.length + 1)) : undefined;

  const host: ts.CompilerHost = {
    getSourceFile(fileName, languageVersion) {
      const cached = libCache.get(fileName);
      if (cached) return cached;
      const lib = libText(fileName);
      if (lib !== undefined) {
        const sourceFile = ts.createSourceFile(fileName, lib, languageVersion, false);
        libCache.set(fileName, sourceFile);
        return sourceFile;
      }
      const text = all.get(fileName);
      return text === undefined ? undefined : ts.createSourceFile(fileName, text, languageVersion, true);
    },
    getDefaultLibFileName: () => `${LIB_DIR}/lib.es2022.d.ts`,
    getDefaultLibLocation: () => LIB_DIR,
    writeFile: () => undefined,
    getCurrentDirectory: () => '/app',
    getDirectories: () => [],
    fileExists: (fileName) => all.has(fileName) || libText(fileName) !== undefined,
    readFile: (fileName) => all.get(fileName) ?? libText(fileName),
    getCanonicalFileName: (fileName) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };

  const rootNames = [...all.keys()].filter((name) => /\.(ts|d\.ts)$/.test(name));
  const options = checkAmbient ? { ...COMPILER_OPTIONS, skipLibCheck: false } : COMPILER_OPTIONS;
  const program = ts.createProgram({ rootNames, options, host });
  return ts
    .getPreEmitDiagnostics(program)
    .filter((d) => d.file === undefined || all.has(d.file.fileName))
    .filter((d) => checkAmbient || d.file?.fileName !== AMBIENT_FILE)
    .map(toDiagnostic);
}
