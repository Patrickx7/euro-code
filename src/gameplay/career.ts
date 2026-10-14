/**
 * Regras da carreira: SLA, estrelas, reputação e chance de efetivação/promoção.
 * Funções puras; os números ficam em `BALANCE.career`.
 */
import { BALANCE } from '../shared/balance';
import { SENIORITIES, type Career, type CareerPath, type Seniority } from '../shared/profile';

/** Tempo gasto / tempo combinado. 1 = entregou no limite; abaixo de 1 = adiantado. */
export function slaRatio(minutesSpent: number, slaMinutes: number): number {
  if (!(slaMinutes > 0)) throw new RangeError('O SLA precisa ser maior que zero.');
  return Math.max(0, minutesSpent) / slaMinutes;
}

/** Estrelas que o cliente dá conforme o SLA (5 = adiantado, 1 = muito atrasado). */
export function starsForSla(ratio: number): number {
  return BALANCE.career.slaStars.find((band) => ratio <= band.upTo)?.stars ?? 1;
}

/** Pagamento de um job para a senioridade atual. */
export function jobPay(basePay: number, seniority: Seniority): number {
  return Math.round(basePay * BALANCE.career.payMultiplier[seniority]);
}

/** Registra um job entregue: conta o job, guarda o SLA (só os mais recentes) e atualiza a média de estrelas. */
export function recordDelivery(career: Career, ratio: number, stars: number): Career {
  const jobsDone = career.jobsDone + 1;
  return {
    ...career,
    jobsDone,
    rating: (career.rating * career.jobsDone + stars) / jobsDone,
    slaHistory: [...career.slaHistory, ratio].slice(-BALANCE.career.slaWindow),
  };
}

/** Média do SLA dos jobs recentes (1 quando ainda não há histórico). */
export function averageSla(career: Career): number {
  const recent = career.slaHistory.slice(-BALANCE.career.slaWindow);
  if (recent.length === 0) return 1;
  return recent.reduce((sum, r) => sum + r, 0) / recent.length;
}

export function nextSeniority(seniority: Seniority): Seniority | null {
  return SENIORITIES[SENIORITIES.indexOf(seniority) + 1] ?? null;
}

/**
 * Chance de ser chamado para a entrevista do próximo degrau (0 a 1). Zero enquanto não fez jobs
 * suficientes. Depois disso, quanto mais atrasado o SLA médio, menor a chance.
 */
export function promotionChance(career: Career): number {
  if (nextSeniority(career.seniority) === null) return 0;
  if (career.jobsDone < BALANCE.career.jobsForPromotion[career.seniority]) return 0;
  const { basePromotionChance, promotionChancePer10Percent } = BALANCE.career;
  const chance = basePromotionChance + ((1 - averageSla(career)) / 0.1) * promotionChancePer10Percent;
  return Math.min(0.95, Math.max(0.05, chance));
}

/**
 * Sobe um degrau depois da entrevista aprovada. Na efetivação para Júnior o jogador escolhe front ou
 * back; ao virar Full Stack, a trilha passa a ser as duas.
 */
export function promote(career: Career, chosenPath?: 'front' | 'back'): Career {
  const next = nextSeniority(career.seniority);
  if (next === null) throw new Error('Full Stack já é o topo da carreira.');
  let path: CareerPath = career.path;
  if (next === 'junior') {
    if (!chosenPath) throw new Error('Na efetivação para Júnior é preciso escolher front ou back.');
    path = chosenPath;
  } else if (next === 'fullstack') {
    path = 'fullstack';
  }
  return { ...career, seniority: next, path, jobsDone: 0, slaHistory: [] };
}
