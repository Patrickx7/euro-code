export interface GameLoopCallbacks {
  /** Lógica e física, chamada em passos fixos de `stepSeconds`. */
  update(dtSeconds: number): void;
  /** Desenho, chamado uma vez por quadro. `alpha` (0 a 1) serve para interpolar entre passos. */
  render(alpha: number): void;
}

export interface FrameScheduler {
  request(callback: (timeMs: number) => void): number;
  cancel(handle: number): void;
}

const browserScheduler: FrameScheduler = {
  request: (callback) => requestAnimationFrame(callback),
  cancel: (handle) => cancelAnimationFrame(handle),
};

/** Loop com passo fixo: a física fica estável mesmo com variação de FPS. */
export class GameLoop {
  private accumulator = 0;
  private lastTimeMs: number | null = null;
  private handle: number | null = null;

  constructor(
    private readonly callbacks: GameLoopCallbacks,
    readonly stepSeconds = 1 / 60,
    /** Evita a "espiral da morte" depois de uma aba ficar em segundo plano. */
    private readonly maxFrameSeconds = 0.25,
    private readonly scheduler: FrameScheduler = browserScheduler,
  ) {}

  get running(): boolean {
    return this.handle !== null;
  }

  start(): void {
    if (this.running) return;
    this.lastTimeMs = null;
    this.handle = this.scheduler.request(this.frame);
  }

  stop(): void {
    if (this.handle !== null) this.scheduler.cancel(this.handle);
    this.handle = null;
  }

  /** Avança o loop manualmente. Usado pelo `start` e pelos testes. */
  tick(timeMs: number): void {
    const elapsed = this.lastTimeMs === null ? 0 : (timeMs - this.lastTimeMs) / 1000;
    this.lastTimeMs = timeMs;
    this.accumulator += Math.min(Math.max(elapsed, 0), this.maxFrameSeconds);
    while (this.accumulator >= this.stepSeconds) {
      this.callbacks.update(this.stepSeconds);
      this.accumulator -= this.stepSeconds;
    }
    this.callbacks.render(this.accumulator / this.stepSeconds);
  }

  private readonly frame = (timeMs: number): void => {
    this.tick(timeMs);
    if (this.handle !== null) this.handle = this.scheduler.request(this.frame);
  };
}
