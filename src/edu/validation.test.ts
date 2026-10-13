import { describe, expect, it } from 'vitest';
import { readNodeLib } from '../../tools/node-lib-reader';
import { runInRealNode } from '../../tools/real-node';
import type { ContentModule, Question } from '../shared/content';
import { validateContent, type ValidationOptions } from './validation';

function generalQuestion(n: number): Question {
  return {
    id: `node.m01.q${n}`,
    lessonIds: ['node.m01.l01'],
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
    lessonIds: ['node.m01.l01'],
    exerciseId,
    kind: 'multiple-choice',
    prompt: 'O que a função retorna para (2, 3)?',
    options: ['5', '6', '23'],
    answerIndex: 0,
    explanation: '2 + 3 = 5.',
    difficulty: 1,
  };
}

function validModule(): ContentModule {
  return {
    id: 'node.m01',
    track: 'node',
    order: 1,
    title: 'Primeiros passos',
    summary: 'Teste',
    lessons: [
      {
        id: 'node.m01.l01',
        moduleId: 'node.m01',
        order: 1,
        title: 'Somando',
        concepts: ['funções'],
        sections: [
          { kind: 'text', markdown: 'Funções recebem valores e devolvem resultados.' },
          { kind: 'example', language: 'js', code: "console.log('oi')" },
        ],
        checkQuestionIds: ['node.m01.q1'],
        exerciseIds: ['node.m01.e1'],
        debugExerciseIds: ['node.m01.d1'],
      },
    ],
    exercises: [
      {
        id: 'node.m01.e1',
        lessonId: 'node.m01.l01',
        kind: 'implement',
        title: 'Soma',
        promptMarkdown: 'Crie `soma(a, b)`.',
        language: 'js',
        moduleSystem: 'commonjs',
        starterCode: 'function soma(a, b) {\n  // seu código\n}',
        solution: 'function soma(a, b) {\n  return a + b;\n}',
        tests: [{ description: 'soma', code: 'assert.strictEqual(soma(2, 3), 5);' }],
        hints: ['Use return.'],
        followUpQuestionIds: ['node.m01.f1', 'node.m01.f2'],
        difficulty: 1,
      },
      {
        id: 'node.m01.d1',
        lessonId: 'node.m01.l01',
        kind: 'debug',
        title: 'Conserte a soma',
        promptMarkdown: 'A função subtrai em vez de somar.',
        language: 'js',
        moduleSystem: 'commonjs',
        starterCode: 'function soma(a, b) {\n  return a - b;\n}',
        solution: 'function soma(a, b) {\n  return a + b;\n}',
        tests: [{ description: 'soma', code: 'assert.strictEqual(soma(2, 3), 5);' }],
        hints: ['Olhe o operador.'],
        followUpQuestionIds: ['node.m01.f3', 'node.m01.f4'],
        difficulty: 1,
      },
    ],
    questions: [
      ...[1, 2, 3, 4, 5].map(generalQuestion),
      {
        id: 'node.m01.q6',
        lessonIds: ['node.m01.l01'],
        kind: 'predict-output',
        prompt: 'Qual a saída?',
        code: "console.log([1, 2], { a: 'x' });\nsetTimeout(() => console.log('fim'), 0);",
        expectedOutput: "[ 1, 2 ] { a: 'x' }\nfim",
        explanation: 'O timer roda depois.',
        difficulty: 2,
      },
      followUp('node.m01.f1', 'node.m01.e1'),
      followUp('node.m01.f2', 'node.m01.e1'),
      followUp('node.m01.f3', 'node.m01.d1'),
      followUp('node.m01.f4', 'node.m01.d1'),
    ],
  };
}

const options: ValidationOptions = { readLib: readNodeLib, runInRealNode };

async function errorsOf(module: ContentModule, opts = options) {
  const issues = await validateContent([module], opts);
  return issues.filter((i) => i.severity === 'error').map((i) => `${i.where}: ${i.message}`);
}

describe('validateContent', () => {
  it('aceita um módulo completo', async () => {
    expect(await errorsOf(validModule())).toEqual([]);
  });

  it('acusa referências quebradas e mínimos', async () => {
    const module = validModule();
    module.lessons[0]!.checkQuestionIds = ['node.m01.nao-existe'];
    module.questions = module.questions.filter((q) => q.id !== 'node.m01.q5' && q.id !== 'node.m01.f2');
    const errors = await errorsOf(module, { ...options, structureOnly: true });
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Pergunta de checagem inexistente'),
        expect.stringContaining('5 perguntas gerais'),
        expect.stringContaining('Pergunta de acompanhamento inexistente: node.m01.f2'),
      ]),
    );
  });

  it('acusa ids repetidos e resposta fora das opções', async () => {
    const module = validModule();
    module.questions.push(generalQuestion(1));
    const mc = module.questions.find((q) => q.id === 'node.m01.f1');
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
        expect.stringMatching(/node\.m01\.e1: A solução não passa:[\s\S]*Esperava 5, mas recebeu 6/),
        expect.stringContaining('node.m01.d1: O código inicial já passa'),
      ]),
    );
  });

  it('confere a resposta das perguntas "qual a saída?"', async () => {
    const module = validModule();
    const q = module.questions.find((x) => x.kind === 'predict-output');
    if (q?.kind === 'predict-output') q.expectedOutput = 'fim';
    expect(await errorsOf(module)).toEqual([expect.stringContaining('expectedOutput não bate')]);
  });

  it('pula a execução dos módulos fora do filtro', async () => {
    const module = validModule();
    module.exercises[0]!.solution = 'function soma() { return 0; }';
    expect(await errorsOf(module, { ...options, shouldExecute: () => false })).toEqual([]);
  });
});
