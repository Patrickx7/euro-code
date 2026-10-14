/** Teclado → comandos do carro. WASD ou setas; espaço freia. */
import type { DriveInput } from '../gameplay/driving';

const KEYS = {
  throttle: ['KeyW', 'ArrowUp'],
  brake: ['KeyS', 'ArrowDown', 'Space'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
} as const;

const HANDLED = new Set<string>(Object.values(KEYS).flat());

export class KeyboardDriveInput {
  private readonly pressed = new Set<string>();
  /** Se o jogador já tocou no teclado (antes disso, o carro pode ir no piloto automático). */
  touched = false;

  constructor(target: Window = window) {
    target.addEventListener('keydown', (event) => {
      if (!HANDLED.has(event.code)) return;
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
    return {
      throttle: this.any(KEYS.throttle) ? 1 : 0,
      brake: this.any(KEYS.brake) ? 1 : 0,
      steer: (this.any(KEYS.right) ? 1 : 0) - (this.any(KEYS.left) ? 1 : 0),
    };
  }
}
