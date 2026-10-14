/**
 * Regras dos jobs: quais aparecem no app (senioridade, trilha, já feitos), as ofertas do dia e o
 * fechamento de um job (SLA, estrelas, pagamento). Funções puras sobre o save.
 */
import { BALANCE } from '../shared/balance';
import type { ContentModule, Track } from '../shared/content';
import type { JobTemplate } from '../shared/jobs';
import { atLeast, type Career } from '../shared/profile';
import type { SaveData } from '../shared/save';
import { jobPay, recordDelivery, slaRatio, starsForSla } from './career';
import { mulberry32 } from '../shared/random';

/** Trilhas que a carreira já liberou. Sênior libera a outra trilha (front ou back). */
export function unlockedTracks(career: Career): Track[] {
  const tracks: Track[] = ['core'];
  const senior = atLeast(career.seniority, 'senior');
  if (career.path === 'front' || career.path === 'fullstack' || senior) tracks.push('front');
  if (career.path === 'back' || career.path === 'fullstack' || senior) tracks.push('back');
  if (atLeast(career.seniority, 'pleno')) tracks.push('typescript');
  if (senior) tracks.push('fullstack');
  return tracks;
}

export interface JobOffer {
  job: JobTemplate;
  module: ContentModule;
}

/** Jobs que o jogador pode pegar agora. Quando já fez todos, os feitos voltam (clientes recorrentes). */
export function availableJobs(modules: ContentModule[], save: SaveData): JobOffer[] {
  const tracks = unlockedTracks(save.career);
  const all = modules
    .filter((module) => tracks.includes(module.track))
    .flatMap((module) => module.jobs.map((job) => ({ job, module })))
    .filter(({ job }) => atLeast(save.career.seniority, job.seniority))
    .filter(({ job }) => !job.path || job.path === save.career.path || save.career.path === 'fullstack');
  const fresh = all.filter(({ job }) => !save.completedJobIds.includes(job.id));
  return fresh.length > 0 ? fresh : all;
}

/**
 * Ofertas do dia: sorteio determinístico por dia, dando preferência aos jobs da senioridade atual
 * (os mais bem pagos) sem esconder os mais simples.
 */
export function dailyOffers(available: JobOffer[], day: number, career: Career): JobOffer[] {
  const random = mulberry32(1000 + day);
  const weighted = available
    .map((offer) => ({ offer, key: random() * (offer.job.seniority === career.seniority ? 2 : 1) }))
    .sort((a, b) => b.key - a.key);
  return weighted.slice(0, BALANCE.career.jobsPerDay).map((w) => w.offer);
}

/** Dia do jogo (0 = primeiro dia) a partir dos minutos de jogo. */
export function gameDay(gameMinutes: number): number {
  return Math.floor(gameMinutes / (24 * 60));
}

export interface DeliveryResult {
  slaRatio: number;
  stars: number;
  pay: number;
}

/**
 * Fecha o job: SLA conta da chegada até a entrega, com os minutos extras dos imprevistos. Paga
 * (com o multiplicador da senioridade), atualiza a carreira e o histórico de exercícios.
 */
export function deliverJob(
  save: SaveData,
  job: JobTemplate,
  timing: { arrivedAt: number; deliveredAt: number },
  twistsApplied: number[],
  solvedExerciseIds: string[],
): DeliveryResult {
  const twists = (job.twists ?? []).filter((_, i) => twistsApplied.includes(i));
  const sla = job.slaMinutes + twists.reduce((sum, t) => sum + t.extraSlaMinutes, 0);
  const ratio = slaRatio(timing.deliveredAt - timing.arrivedAt, sla);
  const stars = starsForSla(ratio);
  const pay = jobPay(job.pay + twists.reduce((sum, t) => sum + t.extraPay, 0), save.career.seniority);

  save.money += pay;
  save.career = recordDelivery(save.career, ratio, stars);
  if (!save.completedJobIds.includes(job.id)) save.completedJobIds.push(job.id);
  for (const id of solvedExerciseIds) {
    if (!save.education.completedExerciseIds.includes(id)) save.education.completedExerciseIds.push(id);
  }
  save.driver.recentExerciseIds = [...[...solvedExerciseIds].reverse(), ...save.driver.recentExerciseIds]
    .filter((id, i, list) => list.indexOf(id) === i)
    .slice(0, BALANCE.education.recentExercisesTracked);
  return { slaRatio: ratio, stars, pay };
}
