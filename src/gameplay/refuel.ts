/** Posto: qual exercício o frentista cobra e quanto custa encher o tanque. */
import { BALANCE } from '../shared/balance';
import type { ContentModule, Exercise } from '../shared/content';
import type { SaveData } from '../shared/save';
import { unlockedTracks } from './jobs';
import { TRACKS } from '../shared/content';

/**
 * O próximo exercício ainda não resolvido das trilhas liberadas (na ordem do currículo). Se já
 * resolveu tudo, um exercício resolvido para revisão.
 */
export function pickRefuelExercise(
  modules: ContentModule[],
  save: SaveData,
  random: () => number,
): Exercise | null {
  const tracks = unlockedTracks(save.career);
  const ordered = modules
    .filter((m) => tracks.includes(m.track))
    .sort((a, b) => TRACKS.indexOf(a.track) - TRACKS.indexOf(b.track) || a.order - b.order)
    .flatMap((m) => m.exercises.filter((e) => e.kind === 'implement'));
  const solved = new Set(save.education.completedExerciseIds);
  const next = ordered.find((e) => !solved.has(e.id));
  if (next) return next;
  return ordered[Math.floor(random() * ordered.length)] ?? null;
}

/** Litros e preço para encher, limitado pelo dinheiro do jogador. */
export function refuelQuote(
  tankLiters: number,
  fuelLiters: number,
  money: number,
): { liters: number; cost: number } {
  const price = BALANCE.economy.fuelPricePerLiter;
  const missing = Math.max(0, tankLiters - fuelLiters);
  const affordable = Math.max(0, money) / price;
  const liters = Math.floor(Math.min(missing, affordable) * 10) / 10;
  return { liters, cost: Math.round(liters * price) };
}
