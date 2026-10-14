import { describe, expect, it } from 'vitest';
import { BALANCE } from '../shared/balance';
import { createCareer, type Career } from '../shared/profile';
import {
  averageSla,
  jobPay,
  nextSeniority,
  promote,
  promotionChance,
  recordDelivery,
  slaRatio,
  starsForSla,
} from './career';

function careerWith(jobsDone: number, slaHistory: number[]): Career {
  return { ...createCareer(), jobsDone, slaHistory };
}

describe('SLA e estrelas', () => {
  it('calcula a razão do SLA', () => {
    expect(slaRatio(30, 60)).toBe(0.5);
    expect(slaRatio(-5, 60)).toBe(0);
    expect(() => slaRatio(10, 0)).toThrow(RangeError);
  });

  it('dá estrelas conforme o atraso', () => {
    expect(starsForSla(0.5)).toBe(5);
    expect(starsForSla(1)).toBe(4);
    expect(starsForSla(1.2)).toBe(3);
    expect(starsForSla(1.6)).toBe(2);
    expect(starsForSla(3)).toBe(1);
  });

  it('paga mais conforme a senioridade', () => {
    expect(jobPay(100, 'estagiario')).toBe(100);
    expect(jobPay(100, 'pleno')).toBe(300);
  });
});

describe('carreira', () => {
  it('registra entregas, média de estrelas e só os SLAs recentes', () => {
    let career = createCareer();
    career = recordDelivery(career, 0.5, 5);
    career = recordDelivery(career, 1.5, 2);
    expect(career.jobsDone).toBe(2);
    expect(career.rating).toBe(3.5);
    for (let i = 0; i < BALANCE.career.slaWindow; i++) career = recordDelivery(career, 1, 4);
    expect(career.slaHistory).toHaveLength(BALANCE.career.slaWindow);
    expect(averageSla(career)).toBe(1);
  });

  it('não chama para entrevista antes do mínimo de jobs', () => {
    expect(promotionChance(careerWith(BALANCE.career.jobsForPromotion.estagiario - 1, [0.5]))).toBe(0);
  });

  it('a chance de efetivar cai quando o SLA fica muito atrasado', () => {
    const jobs = BALANCE.career.jobsForPromotion.estagiario;
    const onTime = promotionChance(careerWith(jobs, [1, 1]));
    const early = promotionChance(careerWith(jobs, [0.8, 0.8]));
    const late = promotionChance(careerWith(jobs, [1.5, 1.5]));
    expect(onTime).toBeCloseTo(BALANCE.career.basePromotionChance);
    expect(early).toBeGreaterThan(onTime);
    expect(late).toBeLessThan(onTime);
    expect(promotionChance(careerWith(jobs, [9]))).toBe(0.05);
    expect(promotionChance(careerWith(jobs, [0]))).toBe(0.95);
  });

  it('promove escolhendo a trilha no Júnior e vira full stack no fim', () => {
    expect(() => promote(createCareer())).toThrow(/front ou back/);
    let career = promote(careerWith(10, [1]), 'back');
    expect(career).toMatchObject({ seniority: 'junior', path: 'back', jobsDone: 0, slaHistory: [] });
    career = promote(promote(career));
    expect(career).toMatchObject({ seniority: 'senior', path: 'back' });
    career = promote(career);
    expect(career).toMatchObject({ seniority: 'fullstack', path: 'fullstack' });
    expect(nextSeniority('fullstack')).toBeNull();
    expect(promotionChance({ ...career, jobsDone: 999 })).toBe(0);
    expect(() => promote(career)).toThrow(/topo/);
  });
});
