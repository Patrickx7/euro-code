/**
 * Regras de qualidade do conteúdo didático e dos jobs (PLANO.md).
 * Rodadas pela CI com `npm run validate:content`.
 */
import {
  DEFAULT_WEB_VIEWPORT,
  TRACK_PREREQUISITES,
  type ContentModule,
  type Exercise,
  type Lesson,
  type Question,
} from '../shared/content';
import type { JobTemplate } from '../shared/jobs';
import { SENIORITIES, seniorityRank } from '../shared/profile';
import type { LibReader } from './runner/compile';
import { runExercise, runScript } from './runner/run-exercise';
import type { WebRunner } from './web/types';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  /** Id do item com problema. */
  where: string;
  message: string;
}

export interface ValidationOptions {
  readLib: LibReader;
  /** Pula a execução de exercícios, exemplos e perguntas (só checa estrutura). */
  structureOnly?: boolean;
  /**
   * Roda um código JS no Node de verdade e devolve o stdout. Usado para conferir se o simulador e as
   * respostas das perguntas "qual a saída?" batem com o Node real. `null` = não dá para comparar.
   */
  runInRealNode?: (code: string) => Promise<string | null>;
  /** Quais módulos executar (a estrutura é sempre checada em todos). Padrão: todos. */
  shouldExecute?: (module: ContentModule) => boolean;
  /** Avisado a cada item executado (para mostrar progresso). */
  onProgress?: (id: string) => void;
  /** Roda exercícios web num navegador de verdade. Sem ele, os exercícios web só têm a estrutura checada. */
  runWeb?: WebRunner;
}

export const MIN_GENERAL_QUESTIONS_PER_LESSON = 6;
export const MIN_FOLLOW_UPS_PER_EXERCISE = 2;

const MODULE_ID = /^(core|front|back|typescript|fullstack)\.m\d{2}$/;

/**
 * O que é ensinado em `target` pode ser cobrado em `from`? Só se a trilha de `target` é pré-requisito
 * da trilha de `from` e, na mesma trilha, se `target` não vem depois.
 */
export function canReference(from: ContentModule, target: ContentModule): boolean {
  if (!TRACK_PREREQUISITES[from.track].includes(target.track)) return false;
  return target.track !== from.track || target.order <= from.order;
}

function notStudiedYet(id: string, owner: ContentModule): string {
  return `${id} é de ${owner.id}, que o jogador ainda não estudou neste ponto.`;
}

export async function validateContent(
  modules: ContentModule[],
  options: ValidationOptions,
): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const error = (where: string, message: string) => issues.push({ severity: 'error', where, message });
  const warn = (where: string, message: string) => issues.push({ severity: 'warning', where, message });

  // ---- índices globais ----
  const lessons = new Map<string, { lesson: Lesson; module: ContentModule }>();
  const exercises = new Map<string, { exercise: Exercise; module: ContentModule }>();
  const questions = new Map<string, { question: Question; module: ContentModule }>();
  const jobs = new Map<string, { job: JobTemplate; module: ContentModule }>();
  const seenIds = new Set<string>();
  /** "trilha:ordem" → id do módulo. */
  const seenOrders = new Map<string, string>();
  const claimId = (id: string) => {
    if (seenIds.has(id))
      error(id, 'Id repetido. Todo id (módulo, lição, exercício, pergunta) deve ser único.');
    seenIds.add(id);
  };

  for (const module of modules) {
    claimId(module.id);
    if (!MODULE_ID.test(module.id))
      error(module.id, 'Id de módulo deve seguir o formato "core.m01", "front.m02", "typescript.m01"...');
    if (!module.id.startsWith(`${module.track}.`))
      error(module.id, `O id não combina com a trilha "${module.track}".`);
    if (!(SENIORITIES as readonly string[]).includes(module.seniority))
      error(module.id, `Senioridade desconhecida: "${module.seniority}".`);
    const orderKey = `${module.track}:${module.order}`;
    const otherWithOrder = seenOrders.get(orderKey);
    if (otherWithOrder)
      error(module.id, `A ordem ${module.order} da trilha ${module.track} já é usada por ${otherWithOrder}.`);
    seenOrders.set(orderKey, module.id);

    for (const lesson of module.lessons) {
      claimId(lesson.id);
      lessons.set(lesson.id, { lesson, module });
    }
    for (const exercise of module.exercises) {
      claimId(exercise.id);
      exercises.set(exercise.id, { exercise, module });
    }
    for (const question of module.questions) {
      claimId(question.id);
      questions.set(question.id, { question, module });
    }
    for (const job of module.jobs) {
      claimId(job.id);
      jobs.set(job.id, { job, module });
    }
  }

  // ---- lições ----
  for (const { lesson, module } of lessons.values()) {
    const where = lesson.id;
    if (!lesson.id.startsWith(`${module.id}.l`))
      error(where, `O id da lição deve começar com "${module.id}.l".`);
    if (lesson.moduleId !== module.id) error(where, `moduleId deveria ser "${module.id}".`);
    if (!lesson.sections.some((s) => s.kind === 'text'))
      error(where, 'A lição precisa explicar o conceito (seção "text").');
    if (lesson.exerciseIds.length === 0) error(where, 'A lição precisa de pelo menos 1 exercício.');
    if (lesson.debugExerciseIds.length === 0)
      error(where, 'A lição precisa de pelo menos 1 exercício de depuração.');
    if (lesson.checkQuestionIds.length === 0)
      error(where, 'A lição precisa de pelo menos 1 pergunta de checagem.');

    for (const id of lesson.checkQuestionIds) {
      const q = questions.get(id)?.question;
      if (!q) error(where, `Pergunta de checagem inexistente: ${id}.`);
      else if (!q.lessonIds.includes(lesson.id))
        error(where, `A pergunta de checagem ${id} não lista esta lição em lessonIds.`);
    }
    for (const [list, kind] of [
      [lesson.exerciseIds, 'implement'],
      [lesson.debugExerciseIds, 'debug'],
    ] as const) {
      for (const id of list) {
        const ex = exercises.get(id)?.exercise;
        if (!ex) error(where, `Exercício inexistente: ${id}.`);
        else if (ex.kind !== kind)
          error(where, `O exercício ${id} é do tipo "${ex.kind}", mas está na lista de "${kind}".`);
        else if (ex.lessonId !== lesson.id)
          error(where, `O exercício ${id} aponta para outra lição (${ex.lessonId}).`);
      }
    }

    const general = [...questions.values()].filter(
      ({ question }) => question.lessonIds.includes(lesson.id) && question.exerciseId === undefined,
    );
    if (general.length < MIN_GENERAL_QUESTIONS_PER_LESSON) {
      error(
        where,
        `A lição tem ${general.length} perguntas gerais; o mínimo é ${MIN_GENERAL_QUESTIONS_PER_LESSON}.`,
      );
    }
  }

  // ---- exercícios ----
  for (const { exercise, module } of exercises.values()) {
    const where = exercise.id;
    if (!exercise.id.startsWith(`${module.id}.`))
      error(where, `O id do exercício deve começar com "${module.id}.".`);
    const owner = lessons.get(exercise.lessonId)?.lesson;
    if (!owner) error(where, `Lição inexistente: ${exercise.lessonId}.`);
    else {
      const list = exercise.kind === 'debug' ? owner.debugExerciseIds : owner.exerciseIds;
      if (!list.includes(exercise.id)) error(where, `A lição ${owner.id} não lista este exercício.`);
    }
    if (exercise.language === 'web') {
      if (exercise.editableFiles.length === 0)
        error(where, 'O exercício web precisa de pelo menos 1 arquivo editável em editableFiles.');
      const { width, height } = exercise.viewport ?? DEFAULT_WEB_VIEWPORT;
      if (!(width > 0 && height > 0)) error(where, 'O viewport precisa ter largura e altura positivas.');
    }
    if (exercise.tests.length === 0) error(where, 'O exercício precisa de pelo menos 1 teste.');
    if (exercise.hints.length === 0) error(where, 'O exercício precisa de pelo menos 1 dica.');
    if (exercise.followUpQuestionIds.length < MIN_FOLLOW_UPS_PER_EXERCISE) {
      error(
        where,
        `O exercício precisa de pelo menos ${MIN_FOLLOW_UPS_PER_EXERCISE} perguntas de acompanhamento.`,
      );
    }
    for (const id of exercise.followUpQuestionIds) {
      const q = questions.get(id)?.question;
      if (!q) error(where, `Pergunta de acompanhamento inexistente: ${id}.`);
      else if (q.exerciseId !== exercise.id)
        error(where, `A pergunta ${id} deveria ter exerciseId "${exercise.id}".`);
    }
  }

  // ---- perguntas ----
  for (const { question, module } of questions.values()) {
    const where = question.id;
    if (!question.id.startsWith(`${module.id}.`))
      error(where, `O id da pergunta deve começar com "${module.id}.".`);
    if (question.lessonIds.length === 0)
      error(where, 'A pergunta precisa listar pelo menos 1 lição em lessonIds.');
    for (const id of question.lessonIds) {
      const owner = lessons.get(id);
      if (!owner) error(where, `Lição inexistente: ${id}.`);
      else if (!canReference(module, owner.module))
        error(where, `A lição ${notStudiedYet(id, owner.module)}`);
    }
    if (question.exerciseId !== undefined) {
      const ex = exercises.get(question.exerciseId)?.exercise;
      if (!ex) error(where, `Exercício inexistente: ${question.exerciseId}.`);
      else if (!ex.followUpQuestionIds.includes(question.id)) {
        error(where, `O exercício ${ex.id} não lista esta pergunta em followUpQuestionIds.`);
      }
    }
    switch (question.kind) {
      case 'multiple-choice':
        if (question.options.length < 2) error(where, 'Múltipla escolha precisa de pelo menos 2 opções.');
        if (new Set(question.options).size !== question.options.length) error(where, 'Há opções repetidas.');
        if (
          !Number.isInteger(question.answerIndex) ||
          question.answerIndex < 0 ||
          question.answerIndex >= question.options.length
        ) {
          error(where, `answerIndex ${question.answerIndex} está fora das opções.`);
        }
        break;
      case 'fill-blank':
        if (question.code.split('___').length !== 2)
          error(where, 'O código deve ter exatamente uma lacuna "___".');
        if (question.acceptedAnswers.length === 0) error(where, 'Informe pelo menos uma resposta aceita.');
        break;
      case 'predict-output':
      case 'true-false':
        break;
    }
  }

  // ---- jobs ----
  for (const { job, module } of jobs.values()) {
    const where = job.id;
    if (!job.id.startsWith(`${module.id}.j`)) error(where, `O id do job deve começar com "${module.id}.j".`);
    if (job.moduleId !== module.id) error(where, `moduleId deveria ser "${module.id}".`);
    if (!job.title.trim() || !job.briefMarkdown.trim()) error(where, 'O job precisa de título e briefing.');
    if (!job.client.name.trim() || !job.client.contact.trim())
      error(where, 'O cliente precisa de nome e de uma pessoa de contato.');
    if (!(SENIORITIES as readonly string[]).includes(job.seniority))
      error(where, `Senioridade desconhecida: "${job.seniority}".`);
    else if (seniorityRank(job.seniority) < seniorityRank(module.seniority)) {
      error(
        where,
        `O job aparece para "${job.seniority}", mas o módulo ${module.id} só é estudado em "${module.seniority}".`,
      );
    }
    if (
      (module.track === 'front' || module.track === 'back') &&
      job.path !== undefined &&
      job.path !== module.track
    )
      error(where, `Um job da trilha ${module.track} não pode ser exclusivo de "${job.path}".`);
    if (!(job.pay > 0)) error(where, 'O pagamento precisa ser maior que zero.');
    if (!(job.slaMinutes > 0)) error(where, 'O SLA precisa ser maior que zero.');
    if (job.taskExerciseIds.length === 0) error(where, 'O job precisa de pelo menos 1 task.');
    if (job.chat.arrival.length === 0 || job.chat.delivery.length === 0)
      error(where, 'O chat do cliente precisa de falas na chegada e na entrega.');

    const checkExercise = (id: string, label: string) => {
      const target = exercises.get(id);
      if (!target) error(where, `${label} inexistente: ${id}.`);
      else if (!canReference(module, target.module))
        error(where, `O exercício ${notStudiedYet(id, target.module)}`);
    };
    for (const id of job.taskExerciseIds) checkExercise(id, 'Task');
    for (const [index, twist] of (job.twists ?? []).entries()) {
      if (
        !Number.isInteger(twist.afterTask) ||
        twist.afterTask < 0 ||
        twist.afterTask >= job.taskExerciseIds.length
      )
        error(
          where,
          `O imprevisto ${index + 1} acontece depois de uma task que não existe (${twist.afterTask}).`,
        );
      if (!twist.message.trim())
        error(where, `O imprevisto ${index + 1} precisa de uma mensagem do cliente.`);
      if (twist.extraPay < 0 || twist.extraSlaMinutes < 0)
        error(where, `O imprevisto ${index + 1} não pode ter pagamento ou SLA extra negativos.`);
      checkExercise(twist.extraExerciseId, `Task extra do imprevisto ${index + 1}`);
    }
  }

  if (options.structureOnly) return issues;
  const execute = (module: ContentModule) => options.shouldExecute?.(module) ?? true;

  // ---- execução ----
  let warnedNoWebRunner = false;
  for (const { exercise, module } of exercises.values()) {
    if (!execute(module)) continue;
    if (exercise.language === 'web') {
      if (!options.runWeb) {
        if (!warnedNoWebRunner)
          warn(exercise.id, 'Exercícios web não foram executados (o validador não recebeu um navegador).');
        warnedNoWebRunner = true;
        continue;
      }
      options.onProgress?.(exercise.id);
      const viewport = exercise.viewport ?? DEFAULT_WEB_VIEWPORT;
      const solution = await options.runWeb(exercise.solutionFiles, exercise.tests, viewport);
      if (!solution.passed) {
        const problems = [
          ...solution.pageErrors.map((e) => `erro na página: ${e}`),
          ...solution.tests.filter((t) => !t.passed).map((t) => `teste "${t.description}": ${t.message}`),
        ];
        error(exercise.id, `A solução não passa:\n    - ${problems.join('\n    - ')}`);
      }
      const starter = await options.runWeb(exercise.starterFiles, exercise.tests, viewport);
      if (starter.passed)
        error(exercise.id, 'O código inicial já passa em todos os testes; o exercício não ensina nada.');
      continue;
    }
    options.onProgress?.(exercise.id);
    const run = (code: string) => runExercise(exercise, code, { readLib: options.readLib });
    const solution = await run(exercise.solution);
    if (!solution.passed) {
      const problems = [
        ...solution.compileErrors.map((d) => `sintaxe (linha ${d.line}): ${d.message}`),
        ...solution.typeErrors.map((d) => `tipo (${d.file}:${d.line}): ${d.message}`),
        ...solution.tests.filter((t) => !t.passed).map((t) => `teste "${t.description}": ${t.message}`),
      ];
      error(exercise.id, `A solução não passa:\n    - ${problems.join('\n    - ')}`);
    }
    const starter = await run(exercise.starterCode);
    if (starter.passed)
      error(exercise.id, 'O código inicial já passa em todos os testes; o exercício não ensina nada.');
  }

  for (const { lesson, module } of lessons.values()) {
    if (!execute(module)) continue;
    for (const [index, section] of lesson.sections.entries()) {
      if (section.kind !== 'example' || section.language !== 'js') continue;
      options.onProgress?.(`${lesson.id} exemplo ${index + 1}`);
      const outcome = await runScript(section.code, 'js');
      if (outcome.error) {
        warn(
          lesson.id,
          `O exemplo ${index + 1} termina com erro (${outcome.error}). Se for proposital, ignore.`,
        );
      }
    }
  }

  for (const { question, module } of questions.values()) {
    if (question.kind !== 'predict-output' || !execute(module)) continue;
    options.onProgress?.(question.id);
    const outcome = await runScript(question.code, 'js');
    const simulated = outcome.stdout.join('\n');
    if (outcome.error) error(question.id, `O código da pergunta termina com erro: ${outcome.error}`);
    else if (simulated !== question.expectedOutput) {
      error(question.id, `expectedOutput não bate com a saída real:\n${indent(simulated)}`);
    }
    const real = await options.runInRealNode?.(question.code);
    if (real !== undefined && real !== null && real !== simulated) {
      error(
        question.id,
        `O simulador do jogo e o Node real imprimem coisas diferentes. Reescreva a pergunta para evitar o caso.\n` +
          `  Node real:\n${indent(real)}\n  Simulador:\n${indent(simulated)}`,
      );
    }
  }

  return issues;
}

function indent(text: string): string {
  return text
    .split('\n')
    .map((line) => `    | ${line}`)
    .join('\n');
}
