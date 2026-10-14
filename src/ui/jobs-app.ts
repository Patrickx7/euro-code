/** O app de freelas no celular ("Freelinha"): ofertas do dia, aceitar um job. */
import { jobPay } from '../gameplay/career';
import type { JobOffer } from '../gameplay/jobs';
import type { Seniority } from '../shared/profile';
import { SENIORITY_LABEL } from '../shared/profile';
import { brl, h } from './dom';

const PLACE_LABEL = {
  'client-office': 'no cliente',
  coworking: 'coworking',
  home: 'na casa do cliente',
} as const;

export interface JobsAppOptions {
  offers: JobOffer[];
  seniority: Seniority;
  activeJobId: string | null;
  onAccept(offer: JobOffer): void;
  onClose(): void;
}

export function renderJobsApp(root: HTMLElement, options: JobsAppOptions): void {
  const close = h(
    'button',
    { class: 'phone__close', type: 'button', onclick: () => options.onClose() },
    'Fechar',
  );
  const list = h('ol', { class: 'phone__list' });
  for (const offer of options.offers) {
    const { job } = offer;
    const pay = jobPay(job.pay, options.seniority);
    const active = options.activeJobId === job.id;
    list.append(
      h(
        'li',
        { class: `job-card${active ? ' is-active' : ''}`, 'data-job': job.id },
        h(
          'div',
          { class: 'job-card__top' },
          h('strong', {}, job.client.name),
          h('span', { class: 'job-card__pay' }, brl.format(pay)),
        ),
        h('p', { class: 'job-card__title' }, job.title),
        h(
          'p',
          { class: 'job-card__meta' },
          `${job.client.area} · ${PLACE_LABEL[job.client.place]} · SLA ${job.slaMinutes} min · ${job.taskExerciseIds.length} ${
            job.taskExerciseIds.length === 1 ? 'task' : 'tasks'
          } · ${SENIORITY_LABEL[job.seniority]}`,
        ),
        h(
          'button',
          {
            class: 'job-card__accept',
            type: 'button',
            disabled: options.activeJobId !== null,
            onclick: () => options.onAccept(offer),
          },
          active ? 'Em andamento' : 'Aceitar',
        ),
      ),
    );
  }
  root.replaceChildren(
    h(
      'div',
      { class: 'phone', role: 'dialog', 'aria-label': 'App de freelas' },
      h('header', { class: 'phone__header' }, h('span', { class: 'phone__brand' }, 'Freelinha'), close),
      h(
        'p',
        { class: 'phone__hint' },
        options.activeJobId ? 'Termine o job atual antes de pegar outro.' : 'Jobs de hoje perto de você:',
      ),
      options.offers.length > 0 ? list : h('p', { class: 'phone__empty' }, 'Nenhum job hoje. Volte amanhã!'),
    ),
  );
}
