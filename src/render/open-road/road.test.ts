import { describe, expect, it } from 'vitest';
import { baseHeight } from './landscape';
import { LANE_OFFSET, RoadLoop } from './road';

describe('RoadLoop', () => {
  const road = new RoadLoop(baseHeight);

  it('forma um circuito fechado com o comprimento esperado', () => {
    // Um círculo de raio ~520 m tem ~3,3 km; as curvas deixam um pouco mais longo.
    expect(road.length).toBeGreaterThan(2800);
    expect(road.length).toBeLessThan(4500);
    const first = road.point(0);
    const last = road.point(road.points.length - 1);
    expect(first.distanceTo(last)).toBeLessThan(5);
  });

  it('frameAt dá a volta e devolve vetores unitários', () => {
    const a = road.frameAt(100);
    const b = road.frameAt(100 + road.length);
    expect(a.position.distanceTo(b.position)).toBeLessThan(1e-6);
    expect(a.forward.length()).toBeCloseTo(1);
    expect(a.right.length()).toBeCloseTo(1);
    expect(a.right.y).toBe(0);
    expect(a.right.dot(a.forward)).toBeCloseTo(0);
    expect(a.up.y).toBeGreaterThan(0.9);
  });

  it('andar 10 m ao longo da pista muda a posição em ~10 m', () => {
    const a = road.frameAt(500).position.clone();
    const b = road.frameAt(510).position;
    expect(a.distanceTo(b)).toBeCloseTo(10, 0);
  });

  it('acha o ponto mais próximo da pista e mede a distância', () => {
    const frame = road.frameAt(1234);
    const beside = frame.position.clone().addScaledVector(frame.right, LANE_OFFSET + 10);
    const { dist, y } = road.nearest(beside.x, beside.z);
    expect(dist).toBeCloseTo(LANE_OFFSET + 10, 0);
    expect(y).toBeCloseTo(frame.position.y, 0);
  });

  it('suaviza as subidas do relevo', () => {
    let steepest = 0;
    for (let d = 0; d < road.length; d += 5) {
      steepest = Math.max(steepest, Math.abs(road.frameAt(d).forward.y));
    }
    // Menos de ~12% de inclinação em qualquer ponto.
    expect(steepest).toBeLessThan(0.12);
  });
});
