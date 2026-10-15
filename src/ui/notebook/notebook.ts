/**
 * O notebook do dev no cliente: chat do cliente, kanban das tasks, enunciado e documentação (a lição),
 * editor, prévia da página (exercícios web) ou saída do console (JS/TS) e os testes.
 * Carregado sob demanda: o CodeMirror e o marked só vêm quando o jogador chega no primeiro cliente.
 */
import type { EditorView } from '@codemirror/view';
import { marked } from 'marked';
import type { Catalog } from '../../edu/catalog';
import type { ExerciseRunResult } from '../../edu/runner/run-exercise';
import { mountPage, runWebInIframe } from '../../edu/web/iframe-runner';
import type { WebRunResult } from '../../edu/web/types';
import { runCodeExercise } from '../../edu/worker/runner-client';
import { currentTask, readyToDeliver, type JobSession } from '../../gameplay/job-session';
import { BALANCE } from '../../shared/balance';
import {
  DEFAULT_WEB_VIEWPORT,
  type CodeExercise,
  type Exercise,
  type WebExercise,
  type WebFiles,
} from '../../shared/content';
import type { JobTwist } from '../../shared/jobs';
import { brl, h } from '../dom';
import { createEditor } from './editor';

export interface NotebookOptions {
  root: HTMLElement;
  session: JobSession;
  catalog: Catalog;
  /** Minutos de jogo agora. */
  now(): number;
  money(): number;
  /** Cobra uma dica. `false` se não há dinheiro. */
  payForHint(): boolean;
  /** Task resolvida: devolve os imprevistos que o cliente soltou. */
  onTaskSolved(exerciseId: string): JobTwist[];
  /** Entrega: devolve o resumo mostrado na tela final. */
  onDeliver(): NotebookSummary;
  /** Texto do botão de entrega (padrão: "Entregar job"). */
  deliverLabel?: string;
  /** Fecha o notebook (o job continua; dá para voltar). */
  onClose(): void;
}

export interface NotebookSummary {
  heading: string;
  lines: string[];
  /** Estrelas do cliente (jobs). */
  stars?: number;
}

export interface NotebookHandle {
  /** Atualiza relógio, SLA e dinheiro (chamado pelo loop do jogo). */
  tick(): void;
  close(): void;
}

type Draft = { kind: 'code'; code: string } | { kind: 'web'; files: WebFiles };

const FILE_LABEL: Record<keyof WebFiles, string> = { html: 'index.html', css: 'style.css', js: 'script.js' };

function markdown(text: string): HTMLElement {
  const div = h('div', { class: 'nb-md' });
  // Conteúdo do próprio jogo (content/), não do jogador.
  div.innerHTML = marked.parse(text, { async: false });
  return div;
}

function formatMinutes(minutes: number): string {
  return `${Math.max(0, Math.round(minutes))} min`;
}

export function openNotebook(options: NotebookOptions): NotebookHandle {
  const { root, session, catalog } = options;
  const drafts = new Map<string, Draft>();
  const hintsShown = new Map<string, number>();
  let selectedTask = currentTask(session) ?? session.tasks[0] ?? '';
  let tab: 'task' | 'docs' = 'task';
  let activeFile: keyof WebFiles = 'html';
  let editor: EditorView | null = null;
  let previewTimer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let delivered: NotebookSummary | null = null;

  const chat = h('ol', { class: 'nb-chat', 'aria-live': 'polite' });
  const say = (who: 'client' | 'me' | 'system', text: string) => {
    chat.append(
      h(
        'li',
        { class: `nb-chat__msg is-${who}` },
        who === 'client' ? h('strong', {}, `${session.job.client.contact}: `) : null,
        text,
      ),
    );
    chat.scrollTop = chat.scrollHeight;
  };
  for (const line of session.job.chat.arrival) say('client', line);

  const slaLabel = h('span', { class: 'nb-sla__label' });
  const slaBar = h('span', { class: 'nb-sla__bar' });
  const moneyLabel = h('span', { class: 'nb-money' });
  const kanban = h('ol', { class: 'nb-kanban' });
  const tabs = h('div', { class: 'nb-tabs', role: 'tablist' });
  const panel = h('div', { class: 'nb-panel' });
  const fileTabs = h('div', { class: 'nb-files' });
  const editorHost = h('div', { class: 'nb-editor' });
  const output = h('div', { class: 'nb-output' });
  const results = h('ol', { class: 'nb-results', 'aria-live': 'polite' });
  const runButton = h('button', { class: 'nb-run', type: 'button', 'data-action': 'run' }, 'Rodar testes');
  const resetButton = h('button', { class: 'nb-ghost', type: 'button' }, 'Código inicial');
  const deliverButton = h(
    'button',
    { class: 'nb-deliver', type: 'button', 'data-action': 'deliver' },
    options.deliverLabel ?? 'Entregar job',
  );
  const closeButton = h('button', { class: 'nb-ghost', type: 'button' }, 'Fechar notebook');

  const exerciseOf = (id: string): Exercise | undefined => catalog.exercise(id)?.exercise;

  function draftFor(exercise: Exercise): Draft {
    let draft = drafts.get(exercise.id);
    if (!draft) {
      draft =
        exercise.language === 'web'
          ? { kind: 'web', files: { ...exercise.starterFiles } }
          : { kind: 'code', code: exercise.starterCode };
      drafts.set(exercise.id, draft);
    }
    return draft;
  }

  function slaMinutes(): number {
    const twists = (session.job.twists ?? []).filter((_, i) => session.twistsApplied.includes(i));
    return session.job.slaMinutes + twists.reduce((sum, t) => sum + t.extraSlaMinutes, 0);
  }

  function tick(): void {
    const spent = options.now() - (session.arrivedAt ?? options.now());
    const sla = slaMinutes();
    slaLabel.textContent = `SLA ${formatMinutes(spent)} de ${formatMinutes(sla)}`;
    const ratio = spent / sla;
    slaBar.style.setProperty('--sla', String(Math.min(1, ratio)));
    slaBar.dataset.state = ratio > 1 ? 'late' : ratio > 0.75 ? 'tight' : 'ok';
    moneyLabel.textContent = brl.format(options.money());
  }

  function renderKanban(): void {
    const now = currentTask(session);
    kanban.replaceChildren(
      ...session.tasks.map((id, index) => {
        const exercise = exerciseOf(id);
        const done = session.done.includes(id);
        const state = done ? 'done' : id === now ? 'doing' : 'todo';
        const extra = index >= session.job.taskExerciseIds.length;
        return h(
          'li',
          { class: `nb-card is-${state}${id === selectedTask ? ' is-selected' : ''}` },
          h(
            'button',
            {
              type: 'button',
              onclick: () => {
                selectedTask = id;
                render();
              },
            },
            h(
              'span',
              { class: 'nb-card__state' },
              done ? 'Feito' : state === 'doing' ? 'Fazendo' : 'A fazer',
            ),
            h('span', { class: 'nb-card__title' }, exercise?.title ?? id),
            extra ? h('span', { class: 'nb-card__extra' }, 'pedido extra') : null,
          ),
        );
      }),
    );
    deliverButton.disabled = !readyToDeliver(session);
  }

  function renderTabs(): void {
    const make = (id: typeof tab, label: string) =>
      h(
        'button',
        {
          type: 'button',
          role: 'tab',
          'aria-selected': String(tab === id),
          onclick: () => {
            tab = id;
            render();
          },
        },
        label,
      );
    tabs.replaceChildren(make('task', 'Task'), make('docs', 'Documentação'));
  }

  function renderPanel(exercise: Exercise): void {
    if (tab === 'docs') {
      const lesson = catalog.lesson(exercise.lessonId);
      const parts: HTMLElement[] = [h('h2', {}, lesson?.title ?? 'Documentação')];
      for (const section of lesson?.sections ?? []) {
        if (section.kind === 'text') parts.push(markdown(section.markdown));
        else {
          parts.push(
            h('pre', { class: 'nb-code', 'data-lang': section.language }, h('code', {}, section.code)),
          );
          if (section.explanation) parts.push(markdown(section.explanation));
        }
      }
      panel.replaceChildren(...parts);
      return;
    }
    const shown = hintsShown.get(exercise.id) ?? 0;
    const hintButton = h(
      'button',
      {
        class: 'nb-ghost',
        type: 'button',
        disabled: shown >= exercise.hints.length,
        onclick: () => {
          if (!options.payForHint()) {
            say('system', `Sem dinheiro para dica (custa ${brl.format(BALANCE.economy.hintCost)}).`);
            return;
          }
          session.hintsUsed++;
          hintsShown.set(exercise.id, shown + 1);
          render();
        },
      },
      shown >= exercise.hints.length ? 'Sem mais dicas' : `Dica (${brl.format(BALANCE.economy.hintCost)})`,
    );
    panel.replaceChildren(
      h('h2', {}, exercise.title, exercise.kind === 'debug' ? h('span', { class: 'nb-badge' }, 'bug') : null),
      markdown(exercise.promptMarkdown),
      h(
        'ol',
        { class: 'nb-hints' },
        ...exercise.hints.slice(0, shown).map((hint) => h('li', {}, markdown(hint))),
      ),
      hintButton,
    );
  }

  function mountEditor(exercise: Exercise): void {
    editor?.destroy();
    editor = null;
    const draft = draftFor(exercise);
    if (draft.kind === 'code' && exercise.language !== 'web') {
      fileTabs.replaceChildren(h('span', { class: 'nb-file is-active' }, `main.${exercise.language}`));
      editor = createEditor(editorHost, {
        doc: draft.code,
        language: exercise.language,
        readOnly: false,
        onChange: (doc) => (draft.code = doc),
      });
      return;
    }
    if (draft.kind !== 'web' || exercise.language !== 'web') return;
    if (!exercise.editableFiles.includes(activeFile) && exercise.editableFiles[0])
      activeFile = exercise.editableFiles[0];
    fileTabs.replaceChildren(
      ...(Object.keys(FILE_LABEL) as (keyof WebFiles)[]).map((file) =>
        h(
          'button',
          {
            type: 'button',
            class: `nb-file${file === activeFile ? ' is-active' : ''}`,
            title: exercise.editableFiles.includes(file) ? 'Editável' : 'Somente leitura',
            onclick: () => {
              activeFile = file;
              mountEditor(exercise);
            },
          },
          FILE_LABEL[file],
          exercise.editableFiles.includes(file) ? null : h('span', { class: 'nb-file__lock' }, ' (leitura)'),
        ),
      ),
    );
    editor = createEditor(editorHost, {
      doc: draft.files[activeFile],
      language: activeFile,
      readOnly: !exercise.editableFiles.includes(activeFile),
      onChange: (doc) => {
        draft.files[activeFile] = doc;
        schedulePreview(exercise, draft.files);
      },
    });
  }

  /** Reduz a página (que roda no tamanho do exercício) para caber na coluna da direita. */
  function fitPreview(viewport: { width: number; height: number }): void {
    const scale = Math.min(1, (output.clientWidth || 320) / viewport.width);
    output.style.setProperty('--preview-scale', String(scale));
    output.style.height = `${Math.round(viewport.height * scale)}px`;
  }

  function showPreview(exercise: WebExercise, files: WebFiles): void {
    const viewport = exercise.viewport ?? DEFAULT_WEB_VIEWPORT;
    mountPage(output, files, viewport);
    fitPreview(viewport);
  }

  function schedulePreview(exercise: WebExercise, files: WebFiles): void {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => showPreview(exercise, files), 500);
  }

  function renderOutputArea(exercise: Exercise): void {
    const draft = draftFor(exercise);
    if (exercise.language === 'web' && draft.kind === 'web') {
      output.className = 'nb-output is-preview';
      showPreview(exercise, draft.files);
    } else {
      output.className = 'nb-output is-console';
      output.style.removeProperty('height');
      output.replaceChildren(
        h('pre', { class: 'nb-console' }, '$ node main — rode os testes para ver a saída'),
      );
    }
  }

  function showCodeResult(result: ExerciseRunResult): void {
    const items: HTMLElement[] = [];
    for (const d of result.compileErrors)
      items.push(h('li', { class: 'nb-result is-fail' }, `Erro de sintaxe (linha ${d.line}): ${d.message}`));
    for (const d of result.typeErrors)
      items.push(h('li', { class: 'nb-result is-fail' }, `Erro de tipo (linha ${d.line}): ${d.message}`));
    for (const t of result.tests) {
      items.push(
        h(
          'li',
          { class: `nb-result ${t.passed ? 'is-pass' : 'is-fail'}` },
          h('strong', {}, t.passed ? '✔ ' : '✘ '),
          t.description,
          t.message ? h('div', { class: 'nb-result__msg' }, t.message) : null,
        ),
      );
    }
    results.replaceChildren(...items);
    const lastOutput = result.tests.find((t) => !t.passed)?.stdout ?? result.tests.at(-1)?.stdout ?? [];
    output.replaceChildren(h('pre', { class: 'nb-console' }, ['$ node main', ...lastOutput].join('\n')));
  }

  function showWebResult(result: WebRunResult): void {
    results.replaceChildren(
      ...result.pageErrors.map((e) => h('li', { class: 'nb-result is-fail' }, `Erro na página: ${e}`)),
      ...result.tests.map((t) =>
        h(
          'li',
          { class: `nb-result ${t.passed ? 'is-pass' : 'is-fail'}` },
          h('strong', {}, t.passed ? '✔ ' : '✘ '),
          t.description,
          t.message ? h('div', { class: 'nb-result__msg' }, t.message) : null,
        ),
      ),
    );
  }

  async function runTests(): Promise<void> {
    const exercise = exerciseOf(selectedTask);
    if (!exercise || running) return;
    running = true;
    runButton.disabled = true;
    runButton.textContent = 'Rodando...';
    results.replaceChildren(h('li', { class: 'nb-result' }, 'Rodando os testes...'));
    let passed = false;
    try {
      const draft = draftFor(exercise);
      if (exercise.language === 'web' && draft.kind === 'web') {
        const viewport = exercise.viewport ?? DEFAULT_WEB_VIEWPORT;
        const pending = runWebInIframe(output, draft.files, exercise.tests, viewport);
        fitPreview(viewport);
        const result = await pending;
        showWebResult(result);
        passed = result.passed;
      } else if (draft.kind === 'code') {
        const result = await runCodeExercise(exercise as CodeExercise, draft.code);
        showCodeResult(result);
        passed = result.passed;
      }
    } catch (err) {
      results.replaceChildren(
        h('li', { class: 'nb-result is-fail' }, err instanceof Error ? err.message : String(err)),
      );
    } finally {
      running = false;
      runButton.disabled = false;
      runButton.textContent = 'Rodar testes';
    }
    if (passed && !session.done.includes(exercise.id)) {
      say('me', `Pronto: ${exercise.title}.`);
      for (const twist of options.onTaskSolved(exercise.id)) {
        say('client', twist.message);
        if (twist.extraPay > 0)
          say(
            'system',
            `Pedido extra: +${brl.format(twist.extraPay)} e +${twist.extraSlaMinutes} min de SLA.`,
          );
        else say('system', `Pedido extra sem pagar a mais (+${twist.extraSlaMinutes} min de SLA).`);
      }
      const next = currentTask(session);
      if (next) selectedTask = next;
      else say('system', 'Todas as tasks feitas. Hora de entregar!');
      render();
    }
  }

  function deliver(): void {
    if (!readyToDeliver(session)) return;
    delivered = options.onDeliver();
    for (const line of session.job.chat.delivery) say('client', line);
    renderSummary(delivered);
  }

  function renderSummary(summary: NotebookSummary): void {
    const stars =
      summary.stars === undefined
        ? null
        : h(
            'p',
            { class: 'nb-stars', 'aria-label': `${summary.stars} estrelas` },
            '★'.repeat(summary.stars) + '☆'.repeat(5 - summary.stars),
          );
    root.replaceChildren(
      h(
        'div',
        { class: 'notebook', role: 'dialog', 'aria-label': summary.heading },
        h(
          'div',
          { class: 'nb-summary' },
          h('h2', {}, summary.heading),
          h('p', { class: 'nb-summary__client' }, session.job.client.name),
          stars,
          ...summary.lines.map((line) => h('p', {}, line)),
          chat,
          h(
            'button',
            { class: 'nb-run', type: 'button', 'data-action': 'back', onclick: () => options.onClose() },
            'Voltar para a estrada',
          ),
        ),
      ),
    );
  }

  function render(): void {
    if (delivered) return;
    const exercise = exerciseOf(selectedTask);
    renderKanban();
    renderTabs();
    if (!exercise) {
      panel.replaceChildren(h('p', {}, `Exercício ${selectedTask} não encontrado.`));
      return;
    }
    renderPanel(exercise);
    mountEditor(exercise);
    renderOutputArea(exercise);
    results.replaceChildren();
    tick();
  }

  runButton.addEventListener('click', () => void runTests());
  deliverButton.addEventListener('click', deliver);
  closeButton.addEventListener('click', () => options.onClose());
  resetButton.addEventListener('click', () => {
    drafts.delete(selectedTask);
    render();
  });

  root.replaceChildren(
    h(
      'div',
      { class: 'notebook', id: 'notebook', role: 'dialog', 'aria-label': `Notebook: ${session.job.title}` },
      h(
        'header',
        { class: 'nb-top' },
        h(
          'div',
          { class: 'nb-job' },
          h('strong', {}, session.job.title),
          h('span', {}, ` · ${session.job.client.name}`),
        ),
        h('div', { class: 'nb-sla' }, slaLabel, slaBar),
        moneyLabel,
        closeButton,
      ),
      h(
        'div',
        { class: 'nb-body' },
        h(
          'aside',
          { class: 'nb-side' },
          h('h3', {}, 'Chat'),
          chat,
          h('h3', {}, 'Tasks'),
          kanban,
          deliverButton,
        ),
        h(
          'main',
          { class: 'nb-main' },
          tabs,
          panel,
          h(
            'div',
            { class: 'nb-editor-bar' },
            fileTabs,
            h('div', { class: 'nb-actions' }, resetButton, runButton),
          ),
          editorHost,
        ),
        h('section', { class: 'nb-right' }, h('h3', {}, 'Saída'), output, h('h3', {}, 'Testes'), results),
      ),
    ),
  );
  render();

  return {
    tick,
    close() {
      clearTimeout(previewTimer);
      editor?.destroy();
      root.replaceChildren();
    },
  };
}
