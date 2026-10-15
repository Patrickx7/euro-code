/** Pergunta na tela (pedágio, blitz, hotel): os quatro tipos, com correção e explicação. */
import { isCorrect, type QuestionAnswer } from '../edu/questions';
import type { Question } from '../shared/content';
import { h } from './dom';

export interface QuestionDialogOptions {
  /** Ex.: "Pedágio do Circuito". */
  title: string;
  /** Linha abaixo do título (preço, consequência do erro...). */
  subtitle: string;
  question: Question;
  /** Chamado depois que o jogador lê o resultado e clica em continuar. */
  onDone(correct: boolean): void;
}

export function renderQuestionDialog(root: HTMLElement, options: QuestionDialogOptions): void {
  const { question } = options;
  let answer: () => QuestionAnswer | null;
  const body: (HTMLElement | null)[] = [h('p', { class: 'qd-prompt' }, question.prompt)];
  if ('code' in question && question.code) {
    body.push(h('pre', { class: 'qd-code' }, h('code', {}, question.code)));
  }
  const submit = h('button', { class: 'qd-submit', type: 'button', 'data-action': 'answer' }, 'Responder');

  switch (question.kind) {
    case 'multiple-choice': {
      let chosen: number | null = null;
      const list = h('div', { class: 'qd-options', role: 'radiogroup' });
      question.options.forEach((option, index) => {
        list.append(
          h(
            'button',
            {
              type: 'button',
              class: 'qd-option',
              role: 'radio',
              'aria-checked': 'false',
              'data-index': index,
              onclick: (event) => {
                chosen = index;
                for (const el of list.children)
                  el.setAttribute('aria-checked', String(el === event.currentTarget));
              },
            },
            option,
          ),
        );
      });
      body.push(list);
      answer = () => (chosen === null ? null : { kind: 'multiple-choice', optionIndex: chosen });
      break;
    }
    case 'true-false': {
      let chosen: boolean | null = null;
      const list = h('div', { class: 'qd-options', role: 'radiogroup' });
      for (const [label, value] of [
        ['Verdadeiro', true],
        ['Falso', false],
      ] as const) {
        list.append(
          h(
            'button',
            {
              type: 'button',
              class: 'qd-option',
              role: 'radio',
              'aria-checked': 'false',
              onclick: (event) => {
                chosen = value;
                for (const el of list.children)
                  el.setAttribute('aria-checked', String(el === event.currentTarget));
              },
            },
            label,
          ),
        );
      }
      body.push(list);
      answer = () => (chosen === null ? null : { kind: 'true-false', value: chosen });
      break;
    }
    case 'predict-output': {
      const area = h('textarea', { class: 'qd-text', rows: 4, 'aria-label': 'O que o código imprime?' });
      body.push(area);
      answer = () => ({ kind: 'predict-output', text: area.value });
      break;
    }
    case 'fill-blank': {
      const input = h('input', { class: 'qd-text', type: 'text', 'aria-label': 'O que vai na lacuna ___?' });
      body.push(h('label', { class: 'qd-label' }, 'O que vai na lacuna ', h('code', {}, '___'), '?'), input);
      answer = () => ({ kind: 'fill-blank', text: input.value });
      break;
    }
  }

  const feedback = h('div', { class: 'qd-feedback', 'aria-live': 'polite' });
  submit.addEventListener('click', () => {
    const given = answer();
    if (!given || (given.kind !== 'multiple-choice' && given.kind !== 'true-false' && !given.text.trim())) {
      feedback.replaceChildren(h('p', {}, 'Escolha ou escreva uma resposta.'));
      return;
    }
    const correct = isCorrect(question, given);
    submit.remove();
    for (const el of root.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement>(
      '.qd-option, .qd-text',
    ))
      el.disabled = true;
    const parts: (HTMLElement | null)[] = [
      h('p', { class: correct ? 'qd-ok' : 'qd-bad' }, correct ? 'Certa resposta!' : 'Errou.'),
      question.kind === 'predict-output' && !correct
        ? h('pre', { class: 'qd-code' }, h('code', {}, question.expectedOutput))
        : null,
      question.kind === 'fill-blank' && !correct
        ? h('p', {}, `Resposta: ${question.acceptedAnswers[0] ?? ''}`)
        : null,
      h('p', { class: 'qd-explanation' }, question.explanation),
      h(
        'button',
        {
          class: 'qd-submit',
          type: 'button',
          'data-action': 'continue',
          onclick: () => options.onDone(correct),
        },
        'Continuar',
      ),
    ];
    feedback.replaceChildren(...parts.filter((p): p is HTMLElement => p !== null));
  });

  root.replaceChildren(
    h(
      'div',
      { class: 'question-dialog', role: 'dialog', 'aria-label': options.title },
      h('header', {}, h('h2', {}, options.title), h('p', { class: 'qd-subtitle' }, options.subtitle)),
      ...body,
      submit,
      feedback,
    ),
  );
}
