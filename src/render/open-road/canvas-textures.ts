/** Texturas desenhadas em canvas (asfalto, capim, placas). */
import * as THREE from 'three';

export function context2d(width: number, height = width): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponível.');
  return [canvas, ctx];
}

export function toTexture(canvas: HTMLCanvasElement, color = true): THREE.Texture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Granulado do asfalto. */
export function speckle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
  random: () => number,
): void {
  for (let i = 0; i < count; i++) {
    const v = Math.floor(25 + random() * 95);
    ctx.fillStyle = `rgba(${v},${v},${v},${0.25 + random() * 0.5})`;
    const s = 0.6 + random() * 2.2;
    ctx.fillRect(random() * width, random() * height, s, s);
  }
}

/** Asfalto gasto com faixas: bordas brancas e faixa dupla amarela no meio. */
export function asphaltTexture(random: () => number): THREE.Texture {
  const [canvas, c] = context2d(256, 512);
  c.fillStyle = '#3c3e44';
  c.fillRect(0, 0, 256, 512);
  speckle(c, 256, 512, 12_000, random);
  // Trilhas escurecidas pelos pneus.
  c.fillStyle = 'rgba(25,25,28,0.35)';
  c.fillRect(40, 0, 40, 512);
  c.fillRect(176, 0, 40, 512);
  c.fillStyle = '#e9e5da';
  c.fillRect(8, 0, 7, 512);
  c.fillRect(241, 0, 7, 512);
  c.fillStyle = '#e2b12a';
  c.fillRect(119, 0, 6, 512);
  c.fillRect(131, 0, 6, 512);
  return toTexture(canvas);
}

/** Folhas finas de capim seco, em cartões com transparência. */
export function dryGrassTexture(random: () => number): THREE.Texture {
  const [canvas, c] = context2d(256);
  c.clearRect(0, 0, 256, 256);
  for (let i = 0; i < 70; i++) {
    const x = 30 + random() * 196;
    const h = 120 + random() * 130;
    c.strokeStyle = `hsla(${36 + random() * 22}, ${22 + random() * 18}%, ${30 + random() * 18}%, 0.95)`;
    c.lineWidth = 1.5 + random() * 2;
    c.beginPath();
    c.moveTo(x, 256);
    c.quadraticCurveTo(x + (random() - 0.5) * 30, 256 - h * 0.6, x + (random() - 0.5) * 60, 256 - h);
    c.stroke();
  }
  return toTexture(canvas);
}
