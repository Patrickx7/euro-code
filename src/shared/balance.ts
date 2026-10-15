/**
 * Todos os números de balanceamento do jogo num só lugar.
 * Mude aqui para deixar o jogo mais leve ou mais punitivo.
 */
export const BALANCE = {
  clock: {
    /** Minutos de jogo que passam a cada minuto real. */
    gameMinutesPerRealMinute: 10,
    /** Hora em que um jogo novo começa. */
    startHour: 7,
    /** No notebook o relógio anda mais devagar (o SLA fica justo para quem está aprendendo). */
    codingTimeScale: 0.5,
  },
  fatigue: {
    /** Horas de jogo dirigindo até o cansaço chegar a 100%. */
    hoursToExhaustion: 10,
    /** Multiplicador do ganho de cansaço entre 0h e 5h. */
    nightMultiplier: 1.5,
    warnAt: 0.7,
    effectsAt: 0.9,
    /** Velocidade máxima quando o cansaço chega a 100%. */
    exhaustedSpeedLimitKmh: 40,
  },
  license: {
    suspensionPoints: 20,
    /** Horas de jogo sem infração para perder 1 ponto. */
    hoursPerPointExpiry: 24,
  },
  economy: {
    /** O estagiário começa duro. */
    startingMoney: 300,
    /** Uma dica no notebook. Jobs de estagiário pagam R$ 25 a R$ 130. */
    hintCost: 10,
    towBaseFee: 400,
    taxiBaseFee: 80,
    hotelNight: 150,
    hotelExtraPerWrongAnswer: 50,
    tollWrongAnswerSurcharge: 1,
    /** Tarifa do pedágio do circuito. */
    tollPrice: 8,
    /** Preço do litro da gasolina. */
    fuelPricePerLiter: 6,
  },
  police: {
    /** Probabilidade de um ponto de blitz estar ativo (dia / noite). */
    checkpointChanceDay: 0.15,
    checkpointChanceNight: 0.35,
    questionsPerStop: 2,
    wrongAnswerFine: 300,
    wrongAnswerPoints: 4,
  },
  wear: {
    /** Km até um pneu ficar careca em uso normal. */
    tireLifeKm: 600,
    /** Km até um componente chegar a 0% em uso normal. */
    componentLifeKm: 2_500,
    sputterBelow: 0.5,
    stallBelow: 0.3,
    breakdownBelow: 0.1,
  },
  career: {
    /** Multiplica o pagamento-base dos jobs. */
    payMultiplier: { estagiario: 1, junior: 1.8, pleno: 3, senior: 5, fullstack: 8 },
    /** Quantos jobs aparecem por dia no app. */
    jobsPerDay: 5,
    /**
     * Faixas de SLA (tempo gasto / tempo combinado) e as estrelas correspondentes. Acima da última
     * faixa, 1 estrela.
     */
    slaStars: [
      { upTo: 0.75, stars: 5 },
      { upTo: 1, stars: 4 },
      { upTo: 1.25, stars: 3 },
      { upTo: 1.6, stars: 2 },
    ],
    /** Quantos jobs recentes contam para a chance de efetivação/promoção. */
    slaWindow: 10,
    /** Jobs mínimos antes de poder pedir a entrevista para o próximo degrau. */
    jobsForPromotion: { estagiario: 8, junior: 15, pleno: 25, senior: 40, fullstack: Infinity },
    /** Chance de ser chamado para a entrevista quando o SLA médio está no limite (razão = 1). */
    basePromotionChance: 0.6,
    /** A cada 10% de atraso médio, a chance cai este tanto; a cada 10% adiantado, sobe. */
    promotionChancePer10Percent: 0.15,
  },
  jobs: {
    /** Distância (pela estrada) até o cliente, sorteada entre estes valores. */
    clientDistanceM: [500, 1800],
    /** Quão perto do cliente é preciso parar para atender. */
    arrivalRadiusM: 14,
  },
  education: {
    /** Quantos exercícios recentes alimentam as perguntas da blitz. */
    recentExercisesTracked: 5,
    /** Tempo máximo de execução do código do jogador. */
    runTimeoutMs: 2_000,
  },
} as const;
