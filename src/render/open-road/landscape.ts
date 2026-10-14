/** Relevo do protótipo: morros com ruído, e o terreno se acomodando à estrada. Sem WebGL. */
import * as THREE from 'three';
import { createNoise, smoothstep01, type Noise } from './noise';
import { ROAD_HALF_WIDTH, type RoadLoop } from './road';

export const noise: Noise = createNoise(2024);

/** Morros "naturais", antes da estrada. */
export function baseHeight(x: number, z: number): number {
  const hills = noise.fbm(x / 380, z / 380) * 170;
  const detail = noise.fbm(x / 70 + 13, z / 70 - 7, 3) * 8;
  return hills + detail - 85;
}

/** Altura do chão: perto da estrada o terreno desce até o nível da pista (que tem "saia" até o chão). */
export function terrainHeight(road: RoadLoop, x: number, z: number): number {
  const { dist, y } = road.nearest(x, z);
  if (dist < ROAD_HALF_WIDTH + 1) return y - 0.45;
  if (dist < ROAD_HALF_WIDTH + 3.5) return y - 0.2;
  const t = Math.min(1, (dist - ROAD_HALF_WIDTH - 3.5) / 30);
  return THREE.MathUtils.lerp(y - 0.2, baseHeight(x, z), smoothstep01(t));
}

/** Serras ao fundo: morros mais altos em camadas, que a névoa transforma em silhuetas. */
export function ridgeHeight(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const ridge = smoothstep01(Math.min(1, Math.max(0, (r - 900) / 3500)));
  return baseHeight(x, z) - 40 + ridge * noise.fbm(x / 1400 + 5, z / 1400, 4) * 900;
}

/** Altura onde as rodas apoiam: o asfalto (com a "saia" inclinada) ou o terreno. */
export function surfaceAt(road: RoadLoop, x: number, z: number): { y: number; offRoad: boolean } {
  const { dist, y } = road.nearest(x, z);
  if (dist <= ROAD_HALF_WIDTH) return { y: y + 0.06, offRoad: false };
  const ground = terrainHeight(road, x, z);
  if (dist <= ROAD_HALF_WIDTH + 0.6) {
    const skirt = THREE.MathUtils.lerp(y + 0.06, y - 0.5, (dist - ROAD_HALF_WIDTH) / 0.6);
    return { y: Math.max(skirt, ground), offRoad: true };
  }
  return { y: ground, offRoad: true };
}
