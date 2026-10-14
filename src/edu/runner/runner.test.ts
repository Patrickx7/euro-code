import { format } from 'node:util';
import { describe, expect, it } from 'vitest';
import { readNodeLib } from '../../../tools/node-lib-reader';
import { AssertionError, createAssert } from './assert';
import { typecheck } from './compile';
import { formatLogArgs } from './inspect';
import { runExercise, runScript, type ExerciseSpec } from './run-exercise';

class Caminhao {
  placa = 'ABC1D23';
  eixos = 3;
}

describe('formatLogArgs imita o console.log do Node', () => {
  const samples: unknown[][] = [
    ['olá', 'mundo'],
    [42, -0, 1.5, NaN, Infinity],
    [10n, true, null, undefined],
    [[1, 2, 3], []],
    [{ a: 1, 'b-c': 'texto', d: [1, { e: 2 }] }],
    [{}],
    [{ aspas: "it's" }],
    [{ nivel1: { nivel2: { nivel3: { nivel4: 1 } } } }],
    [new Caminhao()],
    [new Map([['a', 1]]), new Set([1, 2])],
    [function frete() {}, () => 1, class Carga {}],
    ['%s tem %d eixos', 'o caminhão', 3],
    ['%o', { a: 1 }],
    ['100%', 'certo'],
    [[undefined, null]],
    [Symbol('x')],
    [new Date(0)],
    [/ab+c/gi],
    [Object.create(null)],
    [{ total: 1500, cidade: 'Osasco', ok: true }],
  ];

  for (const args of samples) {
    it(format('%o', args).slice(0, 60), () => {
      expect(formatLogArgs(args)).toBe(format(...(args as [unknown, ...unknown[]])));
    });
  }

  it('referência circular', () => {
    const obj: Record<string, unknown> = { nome: 'loop' };
    obj.self = obj;
    expect(formatLogArgs([obj])).toBe(format(obj));
  });
});

describe('assert', () => {
  const assert = createAssert(true);

  it('compara objetos em profundidade', () => {
    expect(() => assert.deepStrictEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).not.toThrow();
    expect(() => assert.deepStrictEqual({ a: 1 }, { a: '1' })).toThrow(AssertionError);
    expect(() => assert.deepStrictEqual(new Map([[1, 'a']]), new Map([[1, 'a']]))).not.toThrow();
    expect(() => assert.deepStrictEqual([1, 2], { 0: 1, 1: 2 })).toThrow(AssertionError);
  });

  it('mensagens em português', () => {
    expect(() => assert.strictEqual(1, 2)).toThrow('Esperava 2, mas recebeu 1.');
  });

  it('throws aceita classe, regex, objeto e validador', () => {
    const boom = () => {
      throw new TypeError('placa inválida');
    };
    assert.throws(boom, TypeError);
    assert.throws(boom, /placa/);
    assert.throws(boom, { name: 'TypeError', message: 'placa inválida' });
    assert.throws(boom, (err) => err instanceof Error);
    expect(() => assert.throws(boom, RangeError)).toThrow(AssertionError);
    expect(() => assert.throws(() => 1)).toThrow('não lançou');
  });

  it('modo legado usa ==', () => {
    expect(() => createAssert(false).equal(1, '1')).not.toThrow();
    expect(() => assert.equal(1, '1')).toThrow(AssertionError);
  });
});

describe('runScript', () => {
  it('captura a saída e a ordem dos timers', async () => {
    const outcome = await runScript(
      `console.log('1');
       setTimeout(() => console.log('3'), 0);
       Promise.resolve().then(() => console.log('2'));`,
      'js',
    );
    expect(outcome.error).toBeNull();
    expect(outcome.stdout).toEqual(['1', '2', '3']);
  });

  it('process.argv, stdout.write e console.error', async () => {
    const outcome = await runScript(
      `process.stdout.write('a'); process.stdout.write('b\\n'); console.log(process.argv.slice(2)); console.error('ops');`,
      'js',
      { argv: ['--carga', 'soja'] },
    );
    expect(outcome.stdout).toEqual(['ab', "[ '--carga', 'soja' ]"]);
    expect(outcome.stderr).toEqual(['ops']);
  });

  it('fs em memória com sementes, callbacks e promises', async () => {
    const outcome = await runScript(
      `const fs = require('fs');
       const { readFile } = require('node:fs/promises');
       console.log(fs.readFileSync('dados/frete.txt', 'utf8'));
       fs.writeFileSync('saida.txt', 'ok');
       fs.readFile('saida.txt', 'utf8', (err, txt) => console.log('callback', txt));
       readFile('nao-existe.txt').catch((err) => console.log(err.code));`,
      'js',
      { fsSeed: { 'dados/frete.txt': 'Osasco -> Cotia' } },
    );
    expect(outcome.error).toBeNull();
    expect(outcome.stdout).toEqual(['Osasco -> Cotia', 'callback ok', 'ENOENT']);
    expect(outcome.files['/app/saida.txt']).toBe('ok');
  });

  it('path e events', async () => {
    const outcome = await runScript(
      `const path = require('path');
       const EventEmitter = require('events');
       console.log(path.resolve('a', '../b.txt'), path.extname('x.json'));
       const radio = new EventEmitter();
       radio.once('chamada', (msg) => console.log('recebido', msg));
       console.log(radio.emit('chamada', 'pare'), radio.emit('chamada', 'de novo'));`,
      'js',
    );
    expect(outcome.stdout).toEqual(['/app/b.txt .json', 'recebido pare', 'true false']);
  });

  it('erro não tratado dentro de um timer', async () => {
    const outcome = await runScript(`setTimeout(() => { throw new RangeError('pneu furado'); }, 0);`, 'js');
    expect(outcome.error).toBe('RangeError: pneu furado');
    expect(outcome.exitCode).toBe(1);
  });

  it('process.exit interrompe o programa', async () => {
    const outcome = await runScript(`console.log('antes'); process.exit(3); console.log('depois');`, 'js');
    expect(outcome.error).toBeNull();
    expect(outcome.exitCode).toBe(3);
    expect(outcome.stdout).toEqual(['antes']);
  });

  it('process.exit pego por um catch continua encerrando o programa', async () => {
    const outcome = await runScript(
      `try { process.exit(2); } catch { console.log('escapei'); }\nconsole.log('depois');`,
      'js',
    );
    expect(outcome.exitCode).toBe(2);
    expect(outcome.stdout).toEqual([]);
  });

  it('espera as Promises pendentes, mesmo com timers um depois do outro', async () => {
    const code = [
      'const esperar = (ms) => new Promise((r) => setTimeout(r, ms));',
      "async function main() { await esperar(5); console.log('a'); await esperar(5); console.log('b'); }",
      'main();',
      'async function f(n) { if (n === 0) return; await null; return f(n - 1); }',
      "f(30).then(() => console.log('acabou'));",
    ].join('\n');
    const outcome = await runScript(code, 'js');
    expect(outcome.stdout).toEqual(['acabou', 'a', 'b']);
  });

  it('process.env guarda tudo como texto', async () => {
    const outcome = await runScript(`process.env.PRECO = 90; console.log(typeof process.env.PRECO);`, 'js');
    expect(outcome.stdout).toEqual(['string']);
  });

  it('avisa quando falta o "./" num arquivo do projeto', async () => {
    const outcome = await runScript(`require('formatar');`, 'js', {
      extraFiles: { 'formatar.js': 'module.exports = 1;' },
    });
    expect(outcome.error).toMatch(/require\('\.\/formatar'\)/);
  });

  it('setInterval esquecido estoura o tempo', async () => {
    const outcome = await runScript(`setInterval(() => {}, 10);`, 'js', { timeoutMs: 200 });
    expect(outcome.timedOut).toBe(true);
    expect(outcome.error).toMatch(/clearInterval/);
  });

  it('módulo inexistente', async () => {
    const outcome = await runScript(`require('http');`, 'js');
    expect(outcome.error).toMatch(/Cannot find module 'http'/);
  });

  it('erro de sintaxe com número da linha', async () => {
    const outcome = await runScript(`const a = 1;\nconst = 2;`, 'js');
    expect(outcome.error).toMatch(/linha 2/);
  });
});

describe('runExercise', () => {
  const somaFrete: ExerciseSpec = {
    language: 'js',
    tests: [
      { description: 'soma dois fretes', code: 'assert.strictEqual(somaFrete(100, 50), 150);' },
      {
        description: 'mostra o total',
        code: "somaFrete(1, 2); assert.deepStrictEqual(__logs, ['Total: 3']);",
      },
    ],
  };

  it('aprova uma solução correta', async () => {
    const result = await runExercise(
      somaFrete,
      'function somaFrete(a, b) { const total = a + b; console.log(`Total: ${total}`); return total; }',
    );
    expect(result.passed).toBe(true);
    expect(result.tests.every((t) => t.passed)).toBe(true);
  });

  it('reprova e explica o motivo', async () => {
    const result = await runExercise(somaFrete, 'function somaFrete(a, b) { return a - b; }');
    expect(result.passed).toBe(false);
    expect(result.tests[0]?.message).toBe('Esperava 150, mas recebeu 50.');
  });

  it('process.exit no meio não deixa o teste passar sem rodar', async () => {
    const result = await runExercise(somaFrete, 'function somaFrete(a, b) { process.exit(0); }');
    expect(result.passed).toBe(false);
    expect(result.tests[0]?.message).toMatch(/process\.exit\(0\) antes de o teste acabar/);
  });

  it('erro de sintaxe no código do jogador', async () => {
    const result = await runExercise(somaFrete, 'function somaFrete(a, b) {');
    expect(result.passed).toBe(false);
    expect(result.compileErrors[0]?.line).toBe(1);
  });

  it('módulos CommonJS e ESM entre arquivos', async () => {
    const spec: ExerciseSpec = {
      language: 'js',
      extraFiles: {
        'tarifas.js': 'module.exports = { pedagio: 12.5 };',
        'cidades.js': "export const origem = 'Osasco'; export default 'Cotia';",
      },
      tests: [{ description: 'importa', code: "assert.strictEqual(resumo(), 'Osasco -> Cotia: 12.5');" }],
    };
    const result = await runExercise(
      spec,
      `import destino, { origem } from './cidades';
       const { pedagio } = require('./tarifas');
       export function resumo() { return \`\${origem} -> \${destino}: \${pedagio}\`; }`,
    );
    expect(result.tests[0]?.message).toBeUndefined();
    expect(result.passed).toBe(true);
  });

  it('testes assíncronos', async () => {
    const spec: ExerciseSpec = {
      language: 'js',
      tests: [{ description: 'espera a entrega', code: "assert.strictEqual(await entregar(), 'entregue');" }],
    };
    const result = await runExercise(
      spec,
      "function entregar() { return new Promise((r) => setTimeout(() => r('entregue'), 10)); }",
    );
    expect(result.passed).toBe(true);
  });

  describe('TypeScript', () => {
    const spec: ExerciseSpec = {
      language: 'ts',
      tests: [
        { description: 'calcula', code: 'assert.strictEqual(consumo(100, 35), 35);' },
        {
          description: 'rejeita texto',
          code: "// @ts-expect-error km precisa ser número\nconsumo('100', 35);",
        },
      ],
    };
    const options = { readLib: readNodeLib };

    it('aprova código bem tipado', async () => {
      const result = await runExercise(
        spec,
        'function consumo(km: number, litrosPor100: number): number { return (km * litrosPor100) / 100; }',
        options,
      );
      expect(result.typeErrors).toEqual([]);
      expect(result.passed).toBe(true);
    });

    it('reprova tipos permissivos demais', async () => {
      const result = await runExercise(
        spec,
        'function consumo(km: any, litrosPor100: number): number { return (km * litrosPor100) / 100; }',
        options,
      );
      expect(result.passed).toBe(false);
      expect(result.tests[1]?.message).toMatch(/permissivos demais/);
    });

    it('aponta erros de tipo no código do jogador', async () => {
      const result = await runExercise(
        spec,
        "function consumo(km: number, litrosPor100: number): number { return 'muito'; }",
        options,
      );
      expect(result.passed).toBe(false);
      expect(result.typeErrors[0]).toMatchObject({ file: '/app/main.ts', line: 1, code: 2322 });
    });

    it('tipos de fs, path, events e assert estão disponíveis', async () => {
      const result = await runExercise(
        {
          language: 'ts',
          fsSeed: { 'a.txt': 'x' },
          tests: [
            { description: 'roda', code: "assert.deepStrictEqual(await ler('a.txt'), ['x', 'a.txt']);" },
          ],
        },
        `import { readFile } from 'fs/promises';
         import fs from 'fs';
         import path from 'node:path';
         import { EventEmitter } from 'events';
         import strictAssert from 'assert/strict';
         class Painel extends EventEmitter {}
         export async function ler(nome: string): Promise<string[]> {
           new Painel().emit('x');
           strictAssert.ok(fs.existsSync(nome));
           return [await readFile(nome, 'utf8'), path.basename(nome)];
         }`,
        options,
      );
      expect(result.typeErrors).toEqual([]);
      expect(result.passed).toBe(true);
    });
  });

  it('as declarações do ambiente simulado não têm erros', () => {
    expect(typecheck({}, readNodeLib, true)).toEqual([]);
  });
});
