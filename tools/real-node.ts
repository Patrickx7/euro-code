/** Roda um trecho de JS no Node de verdade, para comparar com o simulador do jogo. */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const workDir = mkdtempSync(join(tmpdir(), 'euro-code-node-'));

/**
 * Devolve o stdout (sem a quebra de linha final) ou `null` quando o código usa módulos/arquivos,
 * caso em que o Node real e o simulador não são comparáveis.
 */
export function runInRealNode(code: string, timeoutMs = 5_000): Promise<string | null> {
  if (/\brequire\s*\(|^\s*import\s|\bprocess\.argv\b/m.test(code)) return Promise.resolve(null);
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--input-type=commonjs', '-'], {
      cwd: workDir,
      env: {},
      timeout: timeoutMs,
    });
    let stdout = '';
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => (stdout += chunk));
    child.on('close', () => resolve(stdout.replace(/\n$/, '')));
    child.on('error', () => resolve(null));
    child.stdin.end(code);
  });
}
