/** Utilidades compartilhadas pelas prévias visuais (texturas procedurais e aleatoriedade com semente). */
import * as THREE from 'three';

export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const rand = mulberry32(7);
export const pick = <T>(list: readonly T[]): T => list[Math.floor(rand() * list.length)] as T;

export function context2d(size: number, height = size): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponível');
  return [canvas, ctx];
}

export function toTexture(canvas: HTMLCanvasElement, repeat: [number, number] = [1, 1], color = true) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = 8;
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function speckle(
  ctx: CanvasRenderingContext2D,
  size: number,
  count: number,
  light: number,
  dark: number,
) {
  for (let i = 0; i < count; i++) {
    const v = Math.floor(dark + rand() * (light - dark));
    ctx.fillStyle = `rgba(${v},${v},${v},${0.25 + rand() * 0.5})`;
    const s = 0.6 + rand() * 2.2;
    ctx.fillRect(rand() * size, rand() * size, s, s);
  }
}

export function plateTexture(text: string) {
  const [canvas, c] = context2d(512, 160);
  c.fillStyle = '#f5f5f2';
  c.fillRect(0, 0, 512, 160);
  c.fillStyle = '#1b3f94';
  c.fillRect(0, 0, 512, 38);
  c.fillStyle = '#fff';
  c.font = 'bold 26px sans-serif';
  c.textAlign = 'center';
  c.fillText('BRASIL', 256, 29);
  c.fillStyle = '#111';
  c.font = 'bold 92px monospace';
  c.fillText(text, 256, 138);
  c.strokeStyle = '#111';
  c.lineWidth = 8;
  c.strokeRect(4, 4, 504, 152);
  return toTexture(canvas);
}

export function stickerTexture() {
  const [canvas, c] = context2d(256, 128);
  c.clearRect(0, 0, 256, 128);
  c.fillStyle = '#f5c518';
  c.beginPath();
  c.roundRect(4, 4, 248, 120, 24);
  c.fill();
  c.fillStyle = '#111';
  c.font = 'bold 64px monospace';
  c.textAlign = 'center';
  c.fillText('</>', 128, 76);
  c.font = 'bold 22px sans-serif';
  c.fillText('DEV EM FORMAÇÃO', 128, 110);
  return toTexture(canvas);
}

export function contactShadowTexture() {
  const [canvas, c] = context2d(256);
  const g = c.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, 'rgba(0,0,0,0.85)');
  g.addColorStop(0.6, 'rgba(0,0,0,0.35)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, 256, 256);
  return toTexture(canvas, [1, 1], false);
}
