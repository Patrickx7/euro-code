/**
 * Liga o app de jobs, o marcador do cliente, a chegada e o notebook ao loop do jogo.
 * Fluxo: celular (J) → aceitar → dirigir até o feixe de luz → parar → notebook → entregar.
 */
import type { EventBus } from '../core/event-bus';
import type { SaveManager } from '../core/save-manager';
import { loadCatalog } from '../edu/catalog';
import { availableJobs, dailyOffers, deliverJob, gameDay, type JobOffer } from '../gameplay/jobs';
import { arrive, completeTask, startJob, type JobSession } from '../gameplay/job-session';
import type { DrivingWorld, GameScene } from '../render/open-road/open-road-scene';
import { ROAD_HALF_WIDTH } from '../render/open-road/road';
import { BALANCE } from '../shared/balance';
import type { GameEvents } from '../shared/events';
import type { SaveData } from '../shared/save';
import { mulberry32 } from '../shared/random';
import { h } from './dom';
import { renderJobsApp } from './jobs-app';
import type { NotebookHandle } from './notebook/notebook';

export interface JobControllerDeps {
  save: SaveData;
  saveManager: SaveManager;
  bus: EventBus<GameEvents>;
  scene: GameScene;
  overlay: HTMLElement;
  hud: HTMLElement;
  /** Avisa o jogo que o celular/notebook abriu ou fechou (desliga a direção). */
  onOverlayChange(open: boolean): void;
  /** Dinheiro, senioridade etc. mudaram. */
  onSaveChange(): void;
}

function hashString(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return hash >>> 0;
}

export class JobController {
  private session: JobSession | null = null;
  private client: { distance: number; x: number; z: number } | null = null;
  private notebook: NotebookHandle | null = null;
  private mode: 'none' | 'phone' | 'notebook' = 'none';
  private lastCar: { x: number; z: number; speed: number } | null = null;
  private readonly world: DrivingWorld;
  /** `?perto` na URL: o cliente fica logo ali (para testar). */
  private readonly nearbyClients = new URLSearchParams(location.search).has('perto');

  constructor(private readonly deps: JobControllerDeps) {
    this.world = deps.scene.world;
    window.addEventListener('keydown', (event) => {
      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable || event.target.tagName === 'INPUT')
      )
        return;
      if (event.code === 'KeyJ') this.togglePhone();
      if (event.code === 'KeyE' && this.canOpenNotebook()) void this.openNotebook();
      if (event.code === 'Escape' && this.mode === 'phone') this.closeOverlay();
    });
  }

  get overlayOpen(): boolean {
    return this.mode !== 'none';
  }

  /** Durante o notebook o relógio anda mais devagar. */
  get timeScale(): number {
    return this.mode === 'notebook' ? BALANCE.clock.codingTimeScale : 1;
  }

  /** Metros, pela estrada, até o cliente (ou `null` sem job a caminho). */
  clientAhead(x: number, z: number): number | null {
    if (!this.client || this.session?.phase !== 'driving') return null;
    const here = this.world.roadDistance(x, z);
    const length = this.world.roadLength;
    const ahead = (((this.client.distance - here) % length) + length) % length;
    // Passou um pouquinho do cliente: conta como "chegou" (senão seria a volta inteira).
    return ahead > length - 40 ? 0 : ahead;
  }

  togglePhone(): void {
    if (this.mode === 'phone') this.closeOverlay();
    else if (this.mode === 'none') void this.openPhone();
  }

  private setMode(mode: typeof this.mode): void {
    this.mode = mode;
    this.deps.onOverlayChange(mode !== 'none');
  }

  private closeOverlay(): void {
    this.notebook?.close();
    this.notebook = null;
    this.deps.overlay.replaceChildren();
    this.setMode('none');
  }

  private async openPhone(): Promise<void> {
    this.setMode('phone');
    this.deps.overlay.replaceChildren(h('div', { class: 'phone' }, h('p', {}, 'Carregando os jobs...')));
    const catalog = await loadCatalog();
    if (this.mode !== 'phone') return;
    const { save } = this.deps;
    const offers = dailyOffers(availableJobs(catalog.modules, save), gameDay(save.gameMinutes), save.career);
    // `?job=<id>` na URL: põe um job específico no topo (para testar qualquer exercício).
    const forced = new URLSearchParams(location.search).get('job');
    const forcedModule = forced
      ? catalog.modules.find((m) => m.jobs.some((j) => j.id === forced))
      : undefined;
    const forcedJob = forcedModule?.jobs.find((j) => j.id === forced);
    if (forcedModule && forcedJob) offers.unshift({ job: forcedJob, module: forcedModule });
    renderJobsApp(this.deps.overlay, {
      offers,
      seniority: save.career.seniority,
      activeJobId: this.session?.job.id ?? null,
      onAccept: (offer) => this.accept(offer),
      onClose: () => this.closeOverlay(),
    });
  }

  private accept(offer: JobOffer): void {
    const { save, bus, scene } = this.deps;
    const { job } = offer;
    this.session = startJob(job, save.gameMinutes);
    const [min, max] = BALANCE.jobs.clientDistanceM;
    const random = mulberry32(hashString(`${job.id}:${gameDay(save.gameMinutes)}`));
    const ahead = this.nearbyClients ? 60 : min + random() * (max - min);
    const here = this.lastCar ? this.world.roadDistance(this.lastCar.x, this.lastCar.z) : 0;
    const distance = (here + ahead) % this.world.roadLength;
    const point = this.world.pointOnRoad(distance, ROAD_HALF_WIDTH + 3);
    this.client = { distance, ...point };
    scene.setClientMarker({ ...point, name: job.client.name });
    bus.emit('job:accepted', { jobId: job.id });
    this.closeOverlay();
  }

  private canOpenNotebook(): boolean {
    return this.mode === 'none' && this.session?.phase === 'working';
  }

  /** Chamado a cada passo do loop com a posição do carro. */
  update(car: { x: number; z: number; speed: number }): void {
    this.lastCar = car;
    const { session, client } = this;
    if (session?.phase === 'driving' && client) {
      const near = Math.hypot(car.x - client.x, car.z - client.z) < BALANCE.jobs.arrivalRadiusM;
      if (near && Math.abs(car.speed) < 1) {
        arrive(session, this.deps.save.gameMinutes);
        this.deps.bus.emit('job:arrived', { jobId: session.job.id, gameMinutes: this.deps.save.gameMinutes });
        void this.openNotebook();
      }
    }
    this.notebook?.tick();
    this.renderHud(car);
  }

  private renderHud(car: { x: number; z: number }): void {
    const { hud } = this.deps;
    const { session } = this;
    if (!session) {
      hud.hidden = this.mode !== 'none';
      hud.replaceChildren('Sem job. Abra o app de freelas no celular: ', h('strong', {}, 'J'));
      return;
    }
    hud.hidden = this.mode !== 'none';
    const ahead = this.clientAhead(car.x, car.z);
    if (session.phase === 'driving' && ahead !== null) {
      const distance =
        ahead >= 1000 ? `${(ahead / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(ahead)} m`;
      hud.replaceChildren(
        h('strong', {}, session.job.client.name),
        ` a ${distance} pela estrada. Pare no feixe de luz para atender.`,
      );
    } else if (session.phase === 'working') {
      hud.replaceChildren(h('strong', {}, 'E'), ': voltar ao notebook e terminar o job.');
    }
  }

  private async openNotebook(): Promise<void> {
    const session = this.session;
    if (!session || this.mode === 'notebook') return;
    this.setMode('notebook');
    this.deps.overlay.replaceChildren(h('div', { class: 'phone' }, h('p', {}, 'Abrindo o notebook...')));
    const [{ openNotebook }, catalog] = await Promise.all([import('./notebook/notebook'), loadCatalog()]);
    const { save, bus } = this.deps;
    this.notebook = openNotebook({
      root: this.deps.overlay,
      session,
      catalog,
      now: () => save.gameMinutes,
      money: () => save.money,
      payForHint: () => {
        if (save.money < BALANCE.economy.hintCost) return false;
        save.money -= BALANCE.economy.hintCost;
        this.deps.onSaveChange();
        return true;
      },
      onTaskSolved: (exerciseId) => {
        bus.emit('job:task-done', { jobId: session.job.id, exerciseId });
        const twists = completeTask(session, exerciseId);
        for (const twist of twists) {
          bus.emit('job:scope-change', { jobId: session.job.id, extraExerciseId: twist.extraExerciseId });
        }
        return twists;
      },
      onDeliver: () => {
        const result = deliverJob(
          save,
          session.job,
          { arrivedAt: session.arrivedAt ?? save.gameMinutes, deliveredAt: save.gameMinutes },
          session.twistsApplied,
          session.done,
        );
        session.phase = 'delivered';
        bus.emit('job:delivered', { jobId: session.job.id, ...result });
        this.deps.saveManager.write(save);
        this.deps.onSaveChange();
        return result;
      },
      onClose: () => {
        if (session.phase === 'delivered') {
          this.session = null;
          this.client = null;
          this.deps.scene.setClientMarker(null);
        }
        this.closeOverlay();
      },
    });
  }
}
