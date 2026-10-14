import './style.css';
import { EventBus } from './core/event-bus';
import { GameLoop } from './core/game-loop';
import { SaveManager } from './core/save-manager';
import { createPlaceholderScene } from './render/placeholder-scene';
import { BALANCE } from './shared/balance';
import type { GameEvents } from './shared/events';
import { SENIORITY_LABEL } from './shared/profile';
import { findCarModel } from './shared/vehicle';

const CRUISE_SPEED_KMH = 60;

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
    money: element('hud-money'),
    fps: element('hud-fps'),
  };

  const save = new SaveManager().loadOrCreate();
  const activeCar = save.cars[save.activeCarIndex];

  let scene;
  try {
    scene = createPlaceholderScene(canvas, { paint: activeCar?.customization.paint ?? '8fb0c4' });
  } catch {
    const fatal = element('fatal');
    fatal.textContent = 'Seu navegador não conseguiu iniciar o WebGL, necessário para o jogo.';
    fatal.hidden = false;
    return;
  }

  const bus = new EventBus<GameEvents>();
  hud.seniority.textContent = SENIORITY_LABEL[save.career.seniority];
  hud.car.textContent = (activeCar && findCarModel(activeCar.modelId)?.name) ?? '—';
  hud.money.textContent = money.format(save.money);

  const resize = () => scene.resize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', resize);
  resize();

  const speed = CRUISE_SPEED_KMH / 3.6;
  const gameMinutesPerSecond = BALANCE.clock.gameMinutesPerRealMinute / 60;
  let lastMinute = -1;
  let frames = 0;
  let fpsWindowStart = performance.now();

  const loop = new GameLoop({
    update(dt) {
      scene.update(dt, speed);
      save.gameMinutes += dt * gameMinutesPerSecond;
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
    },
  });

  bus.on('clock:tick', ({ gameMinutes }) => {
    hud.clock.textContent = formatClock(gameMinutes);
  });
  hud.speed.textContent = `${CRUISE_SPEED_KMH} km/h`;
  hud.clock.textContent = formatClock(save.gameMinutes);
  loop.start();
}

start();
