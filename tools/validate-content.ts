/**
 * Valida todo o conteúdo didático em `content/<trilha>/<módulo>/index.ts`.
 *
 *   npm run validate:content              # tudo
 *   npm run validate:content -- core.m03  # só os módulos cujo id começa com "core.m03"
 *   npm run validate:content -- --structure-only
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateContent } from '../src/edu/validation';
import { TRACKS, type ContentModule } from '../src/shared/content';
import { readNodeLib } from './node-lib-reader';
import { runInRealNode } from './real-node';
import { closeWebRunner, runWebInChromium } from './web-runner';

const root = join(import.meta.dirname, '..');
const contentDir = join(root, 'content');

async function loadModules(): Promise<ContentModule[]> {
  const modules: ContentModule[] = [];
  for (const track of readdirSync(contentDir, { withFileTypes: true })) {
    if (!track.isDirectory()) continue;
    for (const dir of readdirSync(join(contentDir, track.name), { withFileTypes: true })) {
      const file = join(contentDir, track.name, dir.name, 'index.ts');
      if (!dir.isDirectory() || !existsSync(file)) continue;
      const loaded = (await import(pathToFileURL(file).href)) as { default?: ContentModule };
      if (!loaded.default) throw new Error(`${relative(root, file)} não tem export default.`);
      modules.push(loaded.default);
    }
  }
  return modules.sort((a, b) => TRACKS.indexOf(a.track) - TRACKS.indexOf(b.track) || a.order - b.order);
}

async function main() {
  const args = process.argv.slice(2);
  const structureOnly = args.includes('--structure-only');
  const filters = args.filter((a) => !a.startsWith('--'));

  const all = await loadModules();
  if (all.length === 0) {
    console.log('Nenhum módulo de conteúdo encontrado em content/. Nada a validar.');
    return;
  }

  const selected = (m: ContentModule) => filters.length === 0 || filters.some((f) => m.id.startsWith(f));
  let count = 0;
  const issues = await validateContent(all, {
    readLib: readNodeLib,
    runInRealNode,
    runWeb: runWebInChromium,
    structureOnly,
    shouldExecute: selected,
    onProgress: () => {
      count++;
      if (count % 25 === 0) console.log(`  ${count} itens executados...`);
    },
  });
  if (!structureOnly)
    console.log(
      `Módulos executados: ${all
        .filter(selected)
        .map((m) => m.id)
        .join(', ')}`,
    );

  const lessons = all.reduce((n, m) => n + m.lessons.length, 0);
  const exercises = all.reduce((n, m) => n + m.exercises.length, 0);
  const questions = all.reduce((n, m) => n + m.questions.length, 0);
  const jobs = all.reduce((n, m) => n + m.jobs.length, 0);
  console.log(
    `Conteúdo: ${all.length} módulos, ${lessons} lições, ${exercises} exercícios, ${questions} perguntas, ${jobs} jobs.`,
  );

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  for (const issue of [...errors, ...warnings]) {
    console.log(`${issue.severity === 'error' ? '✖ ERRO ' : '⚠ AVISO'} [${issue.where}] ${issue.message}`);
  }
  console.log(`\n${errors.length} erro(s), ${warnings.length} aviso(s).`);
  if (errors.length > 0) process.exitCode = 1;
}

try {
  await main();
} finally {
  await closeWebRunner();
}
