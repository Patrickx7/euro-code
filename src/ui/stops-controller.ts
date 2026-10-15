/**
 * Paradas na estrada que exigem estudo:
 * - pedágio: a cancela só abre com resposta certa (errou, paga a mais e vem outra pergunta);
 * - posto: o frentista só libera a bomba depois que o jogador resolve um exercício no notebook.
 */
import type { EventBus } from '../core/event-bus';
import type { SaveManager } from '../core/save-manager';
import { loadCatalog } from '../edu/catalog';
import { eligibleQuestions, pickQuestion, recordAnswer } from '../edu/spaced';
import { arrive, completeTask, startJob } from '../gameplay/job-session';
import { pickRefuelExercise, refuelQuote } from '../gameplay/refuel';
import type { GameScene } from '../render/open-road/open-road-scene';
import { LANE_OFFSET } from '../render/open-road/road';
import { BALANCE } from '../shared/balance';
import type { GameEvents } from '../shared/events';
import type { JobTemplate } from '../shared/jobs';
import { mulberry32 } from '../shared/random';
import type { SaveData } from '../shared/save';
import type { CarModel, OwnedCar } from '../shared/vehicle';
import { brl, h } from './dom';
import type { NotebookHandle } from './notebook/notebook';
import type { Overlay } from './overlay';
import { renderQuestionDialog } from './question-dialog';

const OWNER = 'stops';
/** Perguntas por passagem no pedágio antes de liberar mesmo assim (para ninguém ficar preso). */
const MAX_TOLL_QUESTIONS = 3;
const random = mulberry32(Date.now() % 100_000);

export interface StopsDeps {
  save: SaveData;
  saveManager: SaveManager;
  bus: EventBus<GameEvents>;
  scene: GameScene;
  overlay: Overlay;
  car: OwnedCar | undefined;
  carModel: CarModel | undefined;
  onSaveChange(): void;
}

export class StopsController {
  private gateOpen = false;
  /** Já recusou o posto nesta parada (só pergunta de novo depois de sair de perto). */
  private fuelDeclined = false;
  private notebook: NotebookHandle | null = null;
  private readonly tollPoint: { x: number; z: number };

  constructor(private readonly deps: StopsDeps) {
    const { world } = deps.scene;
    this.tollPoint = world.pointOnRoad(world.stops.toll.distance, LANE_OFFSET);
  }

  /** Metros, pela estrada, até a cancela (só quando está fechada). */
  private tollAhead(x: number, z: number): number | null {
    if (this.gateOpen) return null;
    const { world } = this.deps.scene;
    const length = world.roadLength;
    const ahead = (((world.stops.toll.distance - world.roadDistance(x, z)) % length) + length) % length;
    return ahead;
  }

  /**
   * Velocidade máxima para o piloto automático: para antes da cancela fechada e, com o tanque na
   * reserva, para no posto.
   */
  autopilotLimit(x: number, z: number): number | null {
    const limits: number[] = [];
    const toll = this.tollAhead(x, z);
    if (toll !== null && toll < 80) limits.push(Math.sqrt(2 * 2.5 * Math.max(0, toll - 6)));
    const { car, carModel } = this.deps;
    if (
      car &&
      carModel &&
      carModel.tankLiters > 0 &&
      car.fuelLiters < carModel.tankLiters * 0.25 &&
      !this.fuelDeclined
    ) {
      const { world } = this.deps.scene;
      const length = world.roadLength;
      const ahead = (((world.stops.fuel.distance - world.roadDistance(x, z)) % length) + length) % length;
      if (ahead < 80) limits.push(Math.sqrt(2 * 2.5 * Math.max(0, ahead - 1)));
    }
    return limits.length > 0 ? Math.min(...limits) : null;
  }

  update(car: { x: number; z: number; speed: number }): void {
    this.notebook?.tick();
    if (this.deps.overlay.isOpen) return;
    const { world } = this.deps.scene;

    // Pedágio: chegando na cancela fechada, na pista, o carro para e vem a pergunta.
    const toll = this.tollAhead(car.x, car.z);
    const onRoad = !world.surfaceAt(car.x, car.z).offRoad;
    if (toll !== null && toll < 7 && onRoad && car.speed >= 0) {
      void this.openToll();
      return;
    }
    if (this.gateOpen && Math.hypot(car.x - this.tollPoint.x, car.z - this.tollPoint.z) > 40) {
      this.gateOpen = false;
      this.deps.scene.setTollOpen(false);
    }

    // Posto: parou nas bombas com o tanque não cheio.
    const { fuel } = world.stops;
    const atPumps = Math.hypot(car.x - fuel.x, car.z - fuel.z) < 9;
    if (!atPumps) this.fuelDeclined = false;
    const { car: owned, carModel } = this.deps;
    if (
      atPumps &&
      Math.abs(car.speed) < 1 &&
      !this.fuelDeclined &&
      owned &&
      carModel &&
      carModel.tankLiters > 0 &&
      owned.fuelLiters < carModel.tankLiters - 0.5
    ) {
      this.openFuel();
    }
  }

  private dialog(
    title: string,
    lines: string[],
    actions: { label: string; primary?: boolean; run(): void }[],
  ) {
    this.deps.overlay.root.replaceChildren(
      h(
        'div',
        { class: 'stop-dialog', role: 'dialog', 'aria-label': title },
        h('h2', {}, title),
        ...lines.map((line) => h('p', {}, line)),
        h(
          'div',
          { class: 'actions' },
          ...actions.map((action) =>
            h(
              'button',
              { type: 'button', class: action.primary ? 'primary' : '', onclick: () => action.run() },
              action.label,
            ),
          ),
        ),
      ),
    );
  }

  private charge(amount: number): number {
    const paid = Math.min(Math.max(0, this.deps.save.money), amount);
    this.deps.save.money -= paid;
    this.deps.onSaveChange();
    return paid;
  }

  private openGate(): void {
    this.gateOpen = true;
    this.deps.scene.setTollOpen(true);
    this.deps.saveManager.write(this.deps.save);
    this.deps.overlay.close(OWNER);
  }

  private async openToll(): Promise<void> {
    if (!this.deps.overlay.open(OWNER, 'dialog')) return;
    this.deps.overlay.root.replaceChildren(
      h('div', { class: 'stop-dialog' }, h('p', {}, 'Chegando na cabine...')),
    );
    const catalog = await loadCatalog();
    const { save, bus } = this.deps;
    const price = BALANCE.economy.tollPrice;
    const questions = eligibleQuestions(catalog.modules, save);
    if (questions.length === 0) {
      this.dialog(
        'Pedágio do Circuito',
        [
          `Tarifa: ${brl.format(price)}. Aqui a cancela só abre com resposta certa sobre o que você já estudou.`,
          'Você ainda não estudou nada (resolva tasks nos jobs). Desta vez passa só pagando.',
        ],
        [
          {
            label: `Pagar ${brl.format(price)} e passar`,
            primary: true,
            run: () => {
              this.charge(price);
              this.openGate();
            },
          },
        ],
      );
      return;
    }
    const asked: string[] = [];
    const ask = () => {
      const question = pickQuestion(questions, save.education.questionStats, save.gameMinutes, random, asked);
      if (!question || asked.length >= MAX_TOLL_QUESTIONS) {
        this.dialog(
          'Pedágio do Circuito',
          ['O cobrador cansou de esperar. Pode passar, mas vá estudar!'],
          [{ label: 'Passar', primary: true, run: () => this.openGate() }],
        );
        return;
      }
      asked.push(question.id);
      renderQuestionDialog(this.deps.overlay.root, {
        title: 'Pedágio do Circuito',
        subtitle: `Tarifa ${brl.format(price)}. Errou, paga mais ${brl.format(price * BALANCE.economy.tollWrongAnswerSurcharge)} e vem outra pergunta.`,
        question,
        onDone: (correct) => {
          recordAnswer(save, question.id, correct, save.gameMinutes);
          bus.emit('question:answered', { questionId: question.id, correct, context: 'toll' });
          if (correct) {
            this.charge(price);
            this.openGate();
          } else {
            this.charge(price * BALANCE.economy.tollWrongAnswerSurcharge);
            ask();
          }
        },
      });
    };
    ask();
  }

  private openFuel(): void {
    const { car, carModel, save } = this.deps;
    if (!car || !carModel || !this.deps.overlay.open(OWNER, 'dialog')) return;
    const quote = refuelQuote(carModel.tankLiters, car.fuelLiters, save.money);
    const lines = [
      `Tanque: ${car.fuelLiters.toFixed(1)} de ${carModel.tankLiters} L. Gasolina a ${brl.format(BALANCE.economy.fuelPricePerLiter)} o litro.`,
      quote.liters > 0
        ? `Para encher: ${quote.liters.toFixed(1)} L por ${brl.format(quote.cost)}.`
        : 'Sem dinheiro para gasolina... mas o frentista é gente boa: resolvendo, ele libera 5 L na faixa.',
      'Só que o sistema da bomba (feito em JavaScript pelo sobrinho do dono) travou. O frentista pede uma ajuda: resolva um exercício e a bomba libera.',
    ];
    this.dialog('Posto Tanque Cheio', lines, [
      { label: 'Resolver e abastecer', primary: true, run: () => void this.openFuelNotebook() },
      {
        label: 'Agora não',
        run: () => {
          this.fuelDeclined = true;
          this.deps.overlay.close(OWNER);
        },
      },
    ]);
  }

  private async openFuelNotebook(): Promise<void> {
    const { save, car, carModel, bus } = this.deps;
    if (!car || !carModel) return;
    const [{ openNotebook }, catalog] = await Promise.all([import('./notebook/notebook'), loadCatalog()]);
    const exercise = pickRefuelExercise(catalog.modules, save, random);
    if (!exercise) {
      this.deps.overlay.close(OWNER);
      return;
    }
    // A "tarefa" do posto usa o mesmo notebook dos jobs.
    const pseudoJob: JobTemplate = {
      id: `posto:${exercise.id}`,
      moduleId: exercise.id.split('.').slice(0, 2).join('.'),
      title: 'Destravar a bomba de gasolina',
      briefMarkdown: '',
      client: {
        name: 'Posto Tanque Cheio',
        contact: 'Juninho (frentista)',
        place: 'client-office',
        area: '',
      },
      seniority: save.career.seniority,
      pay: 0,
      slaMinutes: 60,
      taskExerciseIds: [exercise.id],
      chat: {
        arrival: [
          'Ô, chefe! A bomba travou de novo. Você que é dev, dá uma olhada?',
          'Enquanto não resolver, não sai gasolina.',
        ],
        delivery: ['Voltou! Pode encher que eu seguro aqui.'],
      },
    };
    const session = startJob(pseudoJob, save.gameMinutes);
    arrive(session, save.gameMinutes);
    this.deps.overlay.open(OWNER, 'notebook');
    this.notebook = openNotebook({
      root: this.deps.overlay.root,
      session,
      catalog,
      now: () => save.gameMinutes,
      money: () => save.money,
      payForHint: () => {
        if (save.money < BALANCE.economy.hintCost) return false;
        this.charge(BALANCE.economy.hintCost);
        return true;
      },
      onTaskSolved: (exerciseId) => completeTask(session, exerciseId),
      deliverLabel: 'Liberar a bomba',
      onDeliver: () => {
        const quote = refuelQuote(carModel.tankLiters, car.fuelLiters, save.money);
        const liters = quote.liters > 0 ? quote.liters : Math.min(5, carModel.tankLiters - car.fuelLiters);
        const paid = quote.liters > 0 ? this.charge(quote.cost) : 0;
        car.fuelLiters = Math.min(carModel.tankLiters, car.fuelLiters + liters);
        if (!save.education.completedExerciseIds.includes(exercise.id))
          save.education.completedExerciseIds.push(exercise.id);
        bus.emit('exercise:passed', { exerciseId: exercise.id, hintsUsed: session.hintsUsed, attempts: 1 });
        session.phase = 'delivered';
        this.deps.saveManager.write(save);
        return {
          heading: 'Bomba liberada!',
          lines: [`Abasteceu ${liters.toFixed(1)} L${paid > 0 ? ` por ${brl.format(paid)}` : ' na faixa'}.`],
        };
      },
      onClose: () => {
        this.notebook?.close();
        this.notebook = null;
        // Resolvido ou não, só pergunta de novo depois de sair do posto.
        this.fuelDeclined = true;
        this.deps.overlay.close(OWNER);
      },
    });
  }
}
