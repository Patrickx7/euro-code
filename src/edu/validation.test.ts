import { describe, expect, it } from 'vitest';
import { readNodeLib } from '../../tools/node-lib-reader';
import { runInRealNode } from '../../tools/real-node';
import type { CodeExercise, ContentModule, Question, WebExercise } from '../shared/content';
import type { WebRunner } from './web/types';
import { validateContent, type ValidationOptions } from './validation';

function generalQuestion(n: number): Question {
  return {
    id: `core.m01.q${n}`,
    lessonIds: ['core.m01.l01'],
    kind: 'true-false',
    prompt: `Pergunta ${n}`,
    answer: true,
    explanation: 'Porque sim.',
    difficulty: 1,
  };
}

function followUp(id: string, exerciseId: string): Question {
  return {
    id,
    lessonIds: ['core.m01.l01'],
    exerciseId,
    kind: 'multiple-choice',
    prompt: 'O que a função retorna para (2, 3)?',
    options: ['5', '6', '23'],
    answerIndex: 0,
    explanation: '2 + 3 = 5.',
    difficulty: 1,
  };
}

function validModule(): ContentModule & { exercises: CodeExercise[] } {
  return {
    id: 'core.m01',
    track: 'core',
    order: 1,
    seniority: 'estagiario',
    title: 'Primeiros passos',
    summary: 'Teste',
    lessons: [
      {
        id: 'core.m01.l01',
        moduleId: 'core.m01',
        order: 1,
        title: 'Somando',
        concepts: ['funções'],
        sections: [
          { kind: 'text', markdown: 'Funções recebem valores e devolvem resultados.' },
          { kind: 'example', language: 'js', code: "console.log('oi')" },
        ],
        checkQuestionIds: ['core.m01.q1'],
        exerciseIds: ['core.m01.e1'],
        debugExerciseIds: ['core.m01.d1'],
      },
    ],
    exercises: [
      {
        id: 'core.m01.e1',
        lessonId: 'core.m01.l01',
        kind: 'implement',
        title: 'Soma',
        promptMarkdown: 'Crie `soma(a, b)`.',
        language: 'js',
        moduleSystem: 'commonjs',
        starterCode: 'function soma(a, b) {\n  // seu código\n}',
        solution: 'function soma(a, b) {\n  return a + b;\n}',
        tests: [{ description: 'soma', code: 'assert.strictEqual(soma(2, 3), 5);' }],
        hints: ['Use return.'],
        followUpQuestionIds: ['core.m01.f1', 'core.m01.f2'],
        difficulty: 1,
      },
      {
        id: 'core.m01.d1',
        lessonId: 'core.m01.l01',
        kind: 'debug',
        title: 'Conserte a soma',
        promptMarkdown: 'A função subtrai em vez de somar.',
        language: 'js',
        moduleSystem: 'commonjs',
        starterCode: 'function soma(a, b) {\n  return a - b;\n}',
        solution: 'function soma(a, b) {\n  return a + b;\n}',
        tests: [{ description: 'soma', code: 'assert.strictEqual(soma(2, 3), 5);' }],
        hints: ['Olhe o operador.'],
        followUpQuestionIds: ['core.m01.f3', 'core.m01.f4'],
        difficulty: 1,
      },
    ],
    questions: [
      ...[1, 2, 3, 4, 5].map(generalQuestion),
      {
        id: 'core.m01.q6',
        lessonIds: ['core.m01.l01'],
        kind: 'predict-output',
        prompt: 'Qual a saída?',
        code: "console.log([1, 2], { a: 'x' });\nsetTimeout(() => console.log('fim'), 0);",
        expectedOutput: "[ 1, 2 ] { a: 'x' }\nfim",
        explanation: 'O timer roda depois.',
        difficulty: 2,
      },
      followUp('core.m01.f1', 'core.m01.e1'),
      followUp('core.m01.f2', 'core.m01.e1'),
      followUp('core.m01.f3', 'core.m01.d1'),
      followUp('core.m01.f4', 'core.m01.d1'),
    ],
    jobs: [
      {
        id: 'core.m01.j01',
        moduleId: 'core.m01',
        title: 'Calculadora da padaria',
        briefMarkdown: 'O caixa da padaria precisa somar dois valores.',
        client: {
          name: 'Padaria Pão de Ontem',
          contact: 'Seu Zé',
          place: 'client-office',
          area: 'Centro de Osasco',
        },
        seniority: 'estagiario',
        pay: 80,
        slaMinutes: 60,
        taskExerciseIds: ['core.m01.e1'],
        twists: [
          {
            afterTask: 0,
            message: 'Ih, a soma tá dando errado no outro caixa. É rapidinho!',
            extraExerciseId: 'core.m01.d1',
            extraPay: 0,
            extraSlaMinutes: 10,
          },
        ],
        chat: { arrival: ['Bom dia! Senta aí.'], delivery: ['Valeu, toma um pão.'] },
      },
    ],
  };
}

/** Um módulo de outra trilha, só com o mínimo para servir de alvo de referências. */
function emptyModule(id: string, track: ContentModule['track'], order: number): ContentModule {
  return {
    id,
    track,
    order,
    seniority: 'junior',
    title: id,
    summary: id,
    lessons: [],
    exercises: [],
    questions: [],
    jobs: [],
  };
}

const options: ValidationOptions = { readLib: readNodeLib, runInRealNode };

async function errorsOf(module: ContentModule, opts = options) {
  const issues = await validateContent([module], opts);
  return issues.filter((i) => i.severity === 'error').map((i) => `${i.where}: ${i.message}`);
}

function centerDivExercise(): WebExercise {
  return {
    id: 'core.m01.e2',
    lessonId: 'core.m01.l01',
    kind: 'implement',
    title: 'Centralize a div',
    promptMarkdown: 'O cliente quer a caixa no meio da tela.',
    language: 'web',
    starterFiles: { html: '<div class="caixa"></div>', css: '.caixa { width: 100px; }', js: '' },
    solutionFiles: {
      html: '<div class="caixa"></div>',
      css: 'body { display: flex; justify-content: center; }\n.caixa { width: 100px; }',
      js: '',
    },
    editableFiles: ['css'],
    tests: [{ description: 'centro', code: "assert.near(box('.caixa').centerX, viewport.width / 2);" }],
    hints: ['Flexbox.'],
    followUpQuestionIds: ['core.m01.f1', 'core.m01.f2'],
    difficulty: 1,
  };
}

/** Navegador de mentira: "passa" quando o CSS usa flexbox. */
const fakeBrowser: WebRunner = (files, tests) => {
  const passed = files.css.includes('flex');
  return Promise.resolve({
    passed,
    tests: tests.map((t) => ({
      description: t.description,
      passed,
      message: passed ? undefined : 'Esperava cerca de 400.',
    })),
    pageErrors: [],
  });
};

/** Módulo válido com um exercício web a mais (as perguntas de acompanhamento são reaproveitadas). */
function moduleWithWebExercise(exercise: WebExercise): ContentModule {
  const module: ContentModule = validModule();
  module.exercises.push(exercise);
  module.lessons[0]!.exerciseIds.push(exercise.id);
  for (const id of exercise.followUpQuestionIds) {
    module.questions.push({ ...followUp(`${id}w`, exercise.id) });
  }
  exercise.followUpQuestionIds = exercise.followUpQuestionIds.map((id) => `${id}w`);
  return module;
}

describe('validateContent', () => {
  it('aceita um módulo completo', async () => {
    expect(await errorsOf(validModule())).toEqual([]);
  });

  it('acusa referências quebradas e mínimos', async () => {
    const module = validModule();
    module.lessons[0]!.checkQuestionIds = ['core.m01.nao-existe'];
    module.questions = module.questions.filter((q) => q.id !== 'core.m01.q5' && q.id !== 'core.m01.f2');
    const errors = await errorsOf(module, { ...options, structureOnly: true });
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Pergunta de checagem inexistente'),
        expect.stringContaining('5 perguntas gerais'),
        expect.stringContaining('Pergunta de acompanhamento inexistente: core.m01.f2'),
      ]),
    );
  });

  it('acusa ids repetidos e resposta fora das opções', async () => {
    const module = validModule();
    module.questions.push(generalQuestion(1));
    const mc = module.questions.find((q) => q.id === 'core.m01.f1');
    if (mc?.kind === 'multiple-choice') mc.answerIndex = 7;
    const errors = await errorsOf(module, { ...options, structureOnly: true });
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Id repetido'),
        expect.stringContaining('answerIndex 7'),
      ]),
    );
  });

  it('acusa solução errada e código inicial que já passa', async () => {
    const module = validModule();
    module.exercises[0]!.solution = 'function soma(a, b) { return a * b; }';
    module.exercises[1]!.starterCode = module.exercises[1]!.solution;
    const errors = await errorsOf(module);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/core\.m01\.e1: A solução não passa:[\s\S]*Esperava 5, mas recebeu 6/),
        expect.stringContaining('core.m01.d1: O código inicial já passa'),
      ]),
    );
  });

  it('confere a resposta das perguntas "qual a saída?"', async () => {
    const module = validModule();
    const q = module.questions.find((x) => x.kind === 'predict-output');
    if (q?.kind === 'predict-output') q.expectedOutput = 'fim';
    expect(await errorsOf(module)).toEqual([expect.stringContaining('expectedOutput não bate')]);
  });

  it('confere os jobs: ids, valores, tasks e imprevistos', async () => {
    const module = validModule();
    const job = module.jobs[0]!;
    job.id = 'core.m01.x1';
    job.pay = 0;
    job.taskExerciseIds = ['core.m01.nao-existe'];
    job.twists![0]!.afterTask = 3;
    job.chat.delivery = [];
    const errors = await errorsOf(module, { ...options, structureOnly: true });
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('deve começar com "core.m01.j"'),
        expect.stringContaining('pagamento precisa ser maior que zero'),
        expect.stringContaining('Task inexistente: core.m01.nao-existe'),
        expect.stringContaining('task que não existe (3)'),
        expect.stringContaining('falas na chegada e na entrega'),
      ]),
    );
  });

  it('não deixa cobrar o que o jogador ainda não estudou', async () => {
    const core = validModule();
    const back = emptyModule('back.m01', 'back', 1);
    const front = emptyModule('front.m01', 'front', 1);
    // Pergunta e job da trilha front que cobram a lição do núcleo (ok) e da trilha back (não).
    front.questions.push({
      ...generalQuestion(1),
      id: 'front.m01.q1',
      lessonIds: ['core.m01.l01', 'back.m01.l01'],
    });
    back.lessons.push({ ...core.lessons[0]!, id: 'back.m01.l01', moduleId: 'back.m01' });
    // Um job do núcleo não pode pedir exercício do front, nem aparecer antes do módulo ser estudado.
    core.jobs[0]!.taskExerciseIds = ['front.m01.e1'];
    front.exercises.push({ ...core.exercises[0]!, id: 'front.m01.e1', lessonId: 'front.m01.l01' });
    front.jobs.push({
      ...core.jobs[0]!,
      id: 'front.m01.j01',
      moduleId: 'front.m01',
      seniority: 'estagiario',
      twists: [],
    });
    const issues = await validateContent([core, back, front], { ...options, structureOnly: true });
    const errors = issues.map((i) => `${i.where}: ${i.message}`);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'front.m01.q1: A lição back.m01.l01 é de back.m01, que o jogador ainda não estudou',
        ),
        expect.stringContaining('core.m01.j01: O exercício front.m01.e1 é de front.m01'),
        expect.stringContaining('front.m01.j01: O job aparece para "estagiario"'),
      ]),
    );
    expect(errors.some((e) => e.startsWith('front.m01.q1: A lição core.m01.l01'))).toBe(false);
  });

  it('aceita a mesma ordem em trilhas diferentes, mas não na mesma', async () => {
    const issues = await validateContent(
      [
        emptyModule('front.m01', 'front', 1),
        emptyModule('back.m01', 'back', 1),
        emptyModule('back.m02', 'back', 1),
      ],
      { ...options, structureOnly: true },
    );
    expect(issues.map((i) => i.message)).toEqual(['A ordem 1 da trilha back já é usada por back.m01.']);
  });

  it('roda os exercícios web no navegador recebido', async () => {
    expect(
      await errorsOf(moduleWithWebExercise(centerDivExercise()), { ...options, runWeb: fakeBrowser }),
    ).toEqual([]);

    const broken = centerDivExercise();
    broken.solutionFiles.css = '.caixa { width: 100px; }';
    broken.starterFiles.css = 'body { display: flex; }';
    broken.editableFiles = [];
    const errors = await errorsOf(moduleWithWebExercise(broken), { ...options, runWeb: fakeBrowser });
    expect(errors).toEqual([
      'core.m01.e2: O exercício web precisa de pelo menos 1 arquivo editável em editableFiles.',
      'core.m01.e2: A solução não passa:\n    - teste "centro": Esperava cerca de 400.',
      'core.m01.e2: O código inicial já passa em todos os testes; o exercício não ensina nada.',
    ]);
  });

  it('avisa quando não há navegador para os exercícios web', async () => {
    const issues = await validateContent([moduleWithWebExercise(centerDivExercise())], options);
    expect(issues.map((i) => i.severity)).toEqual(['warning']);
    expect(issues[0]?.message).toContain('não foram executados');
  });

  it('pula a execução dos módulos fora do filtro', async () => {
    const module = validModule();
    module.exercises[0]!.solution = 'function soma() { return 0; }';
    expect(await errorsOf(module, { ...options, shouldExecute: () => false })).toEqual([]);
  });
});
