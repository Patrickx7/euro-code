/** Aleatoriedade com semente e ruído suave (value noise + fBm) para o relevo e a vegetação. */

/** Gerador pseudoaleatório com semente: a mesma semente sempre gera o mesmo mundo. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const smoothstep01 = (t: number) => t * t * (3 - 2 * t);

export interface Noise {
  /** Ruído suave em [0, 1). */
  value(x: number, z: number): number;
  /** Soma de oitavas (fBm) em [0, 1). */
  fbm(x: number, z: number, octaves?: number): number;
}

export function createNoise(seed: number): Noise {
  const random = mulberry32(seed);
  const perm = Array.from({ length: 1024 }, () => random());
  const hash = (ix: number, iz: number) => perm[(((ix * 73856093) ^ (iz * 19349663)) >>> 0) % 1024] ?? 0;
  const value = (x: number, z: number) => {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = smoothstep01(x - ix);
    const fz = smoothstep01(z - iz);
    const a = hash(ix, iz);
    const b = hash(ix + 1, iz);
    const c = hash(ix, iz + 1);
    const d = hash(ix + 1, iz + 1);
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  };
  const fbm = (x: number, z: number, octaves = 5) => {
    let sum = 0;
    let amplitude = 0.5;
    let frequency = 1;
    for (let i = 0; i < octaves; i++) {
      sum += amplitude * value(x * frequency, z * frequency);
      frequency *= 2.03;
      amplitude *= 0.5;
    }
    return sum;
  };
  return { value, fbm };
}
