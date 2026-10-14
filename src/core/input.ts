/** Teclado → comandos do carro. WASD ou setas; espaço freia. */
import type { DriveInput } from '../gameplay/driving';

const KEYS = {
  throttle: ['KeyW', 'ArrowUp'],
  brake: ['KeyS', 'ArrowDown', 'Space'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
} as const;

const HANDLED = new Set<string>(Object.values(KEYS).flat());

/** Digitando num campo ou no editor do notebook, as teclas não dirigem o carro. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export class KeyboardDriveInput {
  private readonly pressed = new Set<string>();
  /** Se o jogador já tocou no teclado (antes disso, o carro pode ir no piloto automático). */
  touched = false;
  private active = true;

  /** Desligado enquanto o celular ou o notebook estão abertos. */
  get enabled(): boolean {
    return this.active;
  }

  set enabled(value: boolean) {
    this.active = value;
    if (!value) this.pressed.clear();
  }

  constructor(target: Window = window) {
    target.addEventListener('keydown', (event) => {
      if (!this.enabled || !HANDLED.has(event.code) || isTyping(event.target)) return;
      event.preventDefault();
      this.pressed.add(event.code);
      this.touched = true;
    });
    target.addEventListener('keyup', (event) => this.pressed.delete(event.code));
    // Trocar de aba com uma tecla apertada não pode deixar o carro acelerando para sempre.
    target.addEventListener('blur', () => this.pressed.clear());
  }

  private any(codes: readonly string[]): boolean {
    return codes.some((code) => this.pressed.has(code));
  }

  read(): DriveInput {
    if (!this.enabled) return { throttle: 0, brake: 0, steer: 0 };
    return {
      throttle: this.any(KEYS.throttle) ? 1 : 0,
      brake: this.any(KEYS.brake) ? 1 : 0,
      steer: (this.any(KEYS.right) ? 1 : 0) - (this.any(KEYS.left) ? 1 : 0),
    };
  }
}
