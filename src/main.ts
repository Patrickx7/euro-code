import './style.css';
import './ui/ui.css';
import { EventBus } from './core/event-bus';
import { GameLoop } from './core/game-loop';
import { KeyboardDriveInput } from './core/input';
import { SaveManager } from './core/save-manager';
import { autopilot, carPhysics, fuelUsed, stepCar, type DriveState } from './gameplay/driving';
import { createOpenRoadScene } from './render/open-road/open-road-scene';
import { parseQuality } from './render/open-road/quality';
import { BALANCE } from './shared/balance';
import type { GameEvents } from './shared/events';
import { SENIORITY_LABEL } from './shared/profile';
import { findCarModel } from './shared/vehicle';
import { JobController } from './ui/job-controller';

/** Velocidade do piloto automático, antes de o jogador pegar no volante. */
const AUTOPILOT_KMH = 60;
const LOW_FUEL_FRACTION = 0.15;

function element<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} não encontrado.`);
  return el as T;
}

function formatClock(gameMinutes: number): string {
  const minutesOfDay = Math.floor(gameMinutes) % (24 * 60);
  const hours = Math.floor(minutesOfDay / 60);
  const minutes = minutesOfDay % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

function start() {
  const canvas = element<HTMLCanvasElement>('game');
  const hud = {
    clock: element('hud-clock'),
    speed: element('hud-speed'),
    seniority: element('hud-seniority'),
    car: element('hud-car'),
    fuel: element('hud-fuel'),
    money: element('hud-money'),
    mode: element('controls-mode'),
    fps: element('hud-fps'),
  };

  const saveManager = new SaveManager();
  const save = saveManager.loadOrCreate();
  const activeCar = save.cars[save.activeCarIndex];

  const carModel = findCarModel(activeCar?.modelId ?? '');
  // `?qualidade=baixa|media|alta` na URL tem prioridade sobre a configuração salva.
  const quality =
    parseQuality(new URLSearchParams(location.search).get('qualidade')) ?? save.settings.graphics;

  hud.seniority.textContent = SENIORITY_LABEL[save.career.seniority];
  hud.car.textContent = carModel?.name ?? '—';
  hud.money.textContent = money.format(save.money);

  let scene;
  try {
    scene = createOpenRoadScene(canvas, {
      quality,
      carModelFile: carModel?.modelFile ?? 'quadradinho.glb',
      paint: activeCar?.customization.paint ?? '8fb0c4',
      // Usado pelos testes ponta a ponta.
      onCarLoaded: () => (document.body.dataset.carLoaded = 'true'),
    });
  } catch (err) {
    console.error(err);
    const fatal = element('fatal');
    fatal.textContent = 'Seu navegador não conseguiu iniciar o WebGL, necessário para o jogo.';
    fatal.hidden = false;
    return;
  }

  const bus = new EventBus<GameEvents>();

  const resize = () => scene.resize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', resize);
  resize();

  const physics = carModel ? carPhysics(carModel, activeCar?.condition.components.engine ?? 1) : null;
  const input = new KeyboardDriveInput();
  const { world } = scene;
  let drive: DriveState = { ...world.startPose(), speed: 0, steer: 0 };
  let lowFuelWarned = false;

  const jobs = new JobController({
    save,
    saveManager,
    bus,
    scene,
    overlay: element('overlay'),
    hud: element('job-hud'),
    onOverlayChange: (open) => {
      input.enabled = !open;
    },
    onSaveChange: () => {
      hud.money.textContent = money.format(save.money);
      hud.seniority.textContent = SENIORITY_LABEL[save.career.seniority];
    },
  });
  element('phone-button').addEventListener('click', () => jobs.togglePhone());

  /** Piloto automático: segura a velocidade e, com um cliente à frente, para no feixe de luz. */
  const autopilotSpeed = () => {
    const ahead = jobs.clientAhead(drive.x, drive.z);
    const cruise = AUTOPILOT_KMH / 3.6;
    if (ahead === null) return cruise;
    // Velocidade que ainda dá para parar a tempo, freando a 2,5 m/s².
    return Math.min(cruise, Math.sqrt(2 * 2.5 * Math.max(0, ahead - 4)));
  };

  const showFuel = () => {
    if (!activeCar || !carModel) return;
    if (carModel.tankLiters === 0) {
      hud.fuel.textContent = 'elétrico';
      return;
    }
    const fraction = activeCar.fuelLiters / carModel.tankLiters;
    hud.fuel.textContent = `${activeCar.fuelLiters.toFixed(1)} L`;
    hud.fuel.classList.toggle('is-low', fraction < LOW_FUEL_FRACTION);
  };

  const gameMinutesPerSecond = BALANCE.clock.gameMinutesPerRealMinute / 60;
  let lastMinute = -1;
  let frames = 0;
  let fpsWindowStart = performance.now();

  const loop = new GameLoop({
    update(dt) {
      if (physics && activeCar && carModel) {
        const command =
          input.touched || jobs.overlayOpen
            ? input.read()
            : autopilot(drive, world.laneTarget(drive.x, drive.z, 14), autopilotSpeed());

        // Tanque vazio: o motor não responde (no futuro, o posto exige um exercício).
        if (carModel.tankLiters > 0 && activeCar.fuelLiters <= 0) command.throttle = 0;
        const surface = world.surfaceAt(drive.x, drive.z);
        // Celular ou notebook abertos: o carro fica estacionado.
        const next = jobs.overlayOpen
          ? { ...drive, speed: 0, steer: 0 }
          : stepCar(drive, command, dt, physics, surface);
        // Limite do mundo: o carro para na borda do terreno.
        if (Math.max(Math.abs(next.x), Math.abs(next.z)) > world.halfSize) {
          next.x = drive.x;
          next.z = drive.z;
          next.speed = 0;
        }
        const moved = Math.hypot(next.x - drive.x, next.z - drive.z) * Math.sign(next.speed);
        drive = next;
        activeCar.fuelLiters = Math.max(
          0,
          activeCar.fuelLiters - fuelUsed(moved, command.throttle, carModel.kmPerLiter),
        );
        activeCar.condition.odometerKm += Math.abs(moved) / 1000;
        if (
          !lowFuelWarned &&
          carModel.tankLiters > 0 &&
          activeCar.fuelLiters < carModel.tankLiters * LOW_FUEL_FRACTION
        ) {
          lowFuelWarned = true;
          bus.emit('fuel:low', { liters: activeCar.fuelLiters });
        }
        scene.update(dt, { x: drive.x, z: drive.z, heading: drive.heading, moved });
        jobs.update(drive);
      }
      save.gameMinutes += dt * gameMinutesPerSecond * jobs.timeScale;
      const minute = Math.floor(save.gameMinutes);
      if (minute !== lastMinute) {
        lastMinute = minute;
        bus.emit('clock:tick', { gameMinutes: minute });
      }
    },
    render() {
      scene.render();
      frames++;
      const now = performance.now();
      if (now - fpsWindowStart >= 1000) {
        hud.fps.textContent = String(Math.round((frames * 1000) / (now - fpsWindowStart)));
        // Usado pelos testes ponta a ponta para saber que a cena está desenhando.
        document.body.dataset.frames = String(Number(document.body.dataset.frames ?? 0) + frames);
        frames = 0;
        fpsWindowStart = now;
      }
      hud.speed.textContent = `${Math.round(Math.abs(drive.speed) * 3.6)} km/h`;
      hud.mode.textContent = input.touched ? 'Você dirige' : 'Piloto automático';
      showFuel();
    },
  });

  bus.on('clock:tick', ({ gameMinutes }) => {
    hud.clock.textContent = formatClock(gameMinutes);
  });
  hud.clock.textContent = formatClock(save.gameMinutes);
  showFuel();
  loop.start();
}

start();
