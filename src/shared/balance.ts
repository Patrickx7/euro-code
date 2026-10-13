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
    startingMoney: 5_000,
    hintCost: 50,
    towBaseFee: 400,
    taxiBaseFee: 80,
    hotelNight: 150,
    hotelExtraPerWrongAnswer: 50,
    tollWrongAnswerSurcharge: 1,
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
  education: {
    /** Quantos exercícios recentes alimentam as perguntas da blitz. */
    recentExercisesTracked: 5,
    /** Tempo máximo de execução do código do jogador. */
    runTimeoutMs: 2_000,
  },
} as const;
