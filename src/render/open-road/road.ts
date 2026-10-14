/**
 * Estrada em circuito fechado que acompanha o relevo (protótipo até o mapa real da Fase 1).
 * Só matemática do Three.js, sem WebGL: dá para testar no Node.
 */
import * as THREE from 'three';
import { mulberry32 } from './noise';

/** Meia largura da pista (duas faixas de 3,5 m). */
export const ROAD_HALF_WIDTH = 3.5;
/** Distância do centro da pista até o meio da faixa da direita (mão brasileira). */
export const LANE_OFFSET = 1.75;

export interface RoadFrame {
  position: THREE.Vector3;
  /** Direção da pista (com a inclinação da subida/descida). */
  forward: THREE.Vector3;
  /** Lado direito, na horizontal. */
  right: THREE.Vector3;
  up: THREE.Vector3;
}

export interface RoadLoopOptions {
  seed: number;
  /** Raio médio do circuito, em metros. */
  radius: number;
  /** Quantos pontos de controle definem as curvas. */
  controlPoints: number;
  /** Quanto o raio varia entre os pontos de controle. */
  radiusJitter: number;
  /** Pontos amostrados ao longo da pista (espaçamento ≈ comprimento / samples). */
  samples: number;
  /** Quantos pontos para cada lado entram na média que suaviza as subidas. */
  smoothing: number;
}

export const DEFAULT_ROAD_OPTIONS: RoadLoopOptions = {
  seed: 11,
  radius: 520,
  controlPoints: 14,
  radiusJitter: 160,
  samples: 2400,
  smoothing: 100,
};

export class RoadLoop {
  /** Pontos igualmente espaçados ao longo da pista (o último liga de volta ao primeiro). */
  readonly points: THREE.Vector3[];
  readonly length: number;
  private readonly cumulative: number[];

  constructor(heightAt: (x: number, z: number) => number, options: Partial<RoadLoopOptions> = {}) {
    const o = { ...DEFAULT_ROAD_OPTIONS, ...options };
    const random = mulberry32(o.seed);
    const control: THREE.Vector3[] = [];
    for (let i = 0; i < o.controlPoints; i++) {
      const angle = (i / o.controlPoints) * Math.PI * 2;
      const r = o.radius + (random() - 0.5) * o.radiusJitter;
      control.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
    }
    const curve = new THREE.CatmullRomCurve3(control, true, 'centripetal');
    // getSpacedPoints repete o primeiro ponto no fim; o circuito fecha sozinho.
    this.points = curve.getSpacedPoints(o.samples).slice(0, o.samples);

    // A pista acompanha o relevo, mas suavizado: nada de rampas bruscas.
    const raw = this.points.map((p) => heightAt(p.x, p.z));
    const n = this.points.length;
    this.points.forEach((p, i) => {
      let sum = 0;
      for (let k = -o.smoothing; k <= o.smoothing; k++) sum += raw[(i + k + n) % n] ?? 0;
      p.y = sum / (2 * o.smoothing + 1);
    });

    this.cumulative = [0];
    for (let i = 1; i <= n; i++) {
      const a = this.point(i - 1);
      const b = this.point(i);
      this.cumulative.push((this.cumulative[i - 1] ?? 0) + a.distanceTo(b));
    }
    this.length = this.cumulative[n] ?? 0;
  }

  /** Ponto `i`, dando a volta no circuito. */
  point(i: number): THREE.Vector3 {
    const n = this.points.length;
    return this.points[((i % n) + n) % n] as THREE.Vector3;
  }

  /** Ponto da pista mais próximo de (x, z): distância na horizontal, altura da pista e índice. */
  nearest(x: number, z: number): { dist: number; y: number; index: number } {
    const n = this.points.length;
    const step = 6;
    let best = Infinity;
    let index = 0;
    for (let i = 0; i < n; i += step) {
      const p = this.points[i] as THREE.Vector3;
      const d = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (d < best) {
        best = d;
        index = i;
      }
    }
    const coarse = index;
    for (let k = -step; k <= step; k++) {
      const p = this.point(coarse + k);
      const d = (p.x - x) ** 2 + (p.z - z) ** 2;
      if (d < best) {
        best = d;
        index = (((coarse + k) % n) + n) % n;
      }
    }
    return { dist: Math.sqrt(best), y: this.point(index).y, index };
  }

  /** Posição e orientação da pista a `distance` metros do início (dá a volta no circuito). */
  frameAt(distance: number, target?: RoadFrame): RoadFrame {
    const frame = target ?? {
      position: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
    };
    const d = ((distance % this.length) + this.length) % this.length;
    // Busca binária do segmento.
    let lo = 0;
    let hi = this.cumulative.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if ((this.cumulative[mid] ?? 0) <= d) lo = mid;
      else hi = mid;
    }
    const start = this.cumulative[lo] ?? 0;
    const span = (this.cumulative[lo + 1] ?? start + 1) - start;
    const t = span > 0 ? (d - start) / span : 0;
    frame.position.lerpVectors(this.point(lo), this.point(lo + 1), t);
    // Direção média de alguns metros para frente e para trás: curvas sem tremedeira.
    const tangentA = this.point(lo + 2)
      .clone()
      .sub(this.point(lo - 2));
    const tangentB = this.point(lo + 3)
      .clone()
      .sub(this.point(lo - 1));
    frame.forward.lerpVectors(tangentA, tangentB, t).normalize();
    frame.right.set(-frame.forward.z, 0, frame.forward.x).normalize();
    frame.up.crossVectors(frame.right, frame.forward).normalize();
    return frame;
  }
}
