import { describe, expect, it } from 'vitest';
import { findCarModel, type CarModel } from '../shared/vehicle';
import { autopilot, carPhysics, fuelUsed, stepCar, type DriveInput, type DriveState } from './driving';

const quadradinho = findCarModel('quadradinho') as CarModel;
const onRoad = { offRoad: false };
const still: DriveState = { x: 0, z: 0, heading: 0, speed: 0, steer: 0 };

function drive(
  input: DriveInput,
  seconds: number,
  start = still,
  physics = carPhysics(quadradinho),
  surface = onRoad,
) {
  let state = start;
  for (let t = 0; t < seconds; t += 1 / 60) state = stepCar(state, input, 1 / 60, physics, surface);
  return state;
}

const full: DriveInput = { throttle: 1, brake: 0, steer: 0 };

describe('stepCar', () => {
  it('o Quadradinho chega a 100 km/h em uns 15 s e não passa de ~150 km/h', () => {
    const tenSeconds = drive(full, 10);
    expect(tenSeconds.speed * 3.6).toBeGreaterThan(60);
    expect(tenSeconds.speed * 3.6).toBeLessThan(100);
    const flatOut = drive(full, 120);
    expect(flatOut.speed * 3.6).toBeGreaterThan(130);
    expect(flatOut.speed * 3.6).toBeLessThan(160);
  });

  it('motor gasto acelera menos', () => {
    const worn = drive(full, 10, still, carPhysics(quadradinho, 0));
    const fresh = drive(full, 10, still, carPhysics(quadradinho, 1));
    expect(worn.speed).toBeLessThan(fresh.speed);
  });

  it('anda para frente na direção do heading', () => {
    const state = drive(full, 3);
    expect(state.x).toBeGreaterThan(5);
    expect(Math.abs(state.z)).toBeLessThan(1e-9);
  });

  it('freia até parar e depois dá ré', () => {
    const moving = drive(full, 5);
    const stopped = drive({ throttle: 0, brake: 1, steer: 0 }, 3, moving);
    expect(stopped.speed).toBeLessThanOrEqual(0);
    const reversing = drive({ throttle: 0, brake: 1, steer: 0 }, 4, stopped);
    expect(reversing.speed).toBeLessThan(-1);
    expect(reversing.speed).toBeGreaterThanOrEqual(-5);
  });

  it('virar à direita aumenta o heading e a curva fecha menos em alta velocidade', () => {
    const slow = drive({ throttle: 0.3, brake: 0, steer: 1 }, 2);
    expect(slow.heading).toBeGreaterThan(0);
    const fastStart = drive(full, 20);
    const fast = drive({ throttle: 1, brake: 0, steer: 1 }, 0.5, fastStart);
    expect(Math.abs(fast.steer)).toBeLessThan(0.25);
  });

  it('fora do asfalto o carro perde velocidade', () => {
    const road = drive(full, 20);
    const dirt = drive(full, 20, still, carPhysics(quadradinho), { offRoad: true });
    expect(dirt.speed).toBeLessThan(road.speed);
  });

  it('sem acelerar, o carro vai parando sozinho', () => {
    const coasting = drive({ throttle: 0, brake: 0, steer: 0 }, 60, drive(full, 10));
    expect(coasting.speed).toBe(0);
  });
});

describe('fuelUsed', () => {
  it('gasta conforme o consumo do carro e o pé no acelerador', () => {
    expect(fuelUsed(11_000, 0.5, 11)).toBeCloseTo(1);
    expect(fuelUsed(1000, 1, 11)).toBeGreaterThan(fuelUsed(1000, 0, 11));
    expect(fuelUsed(1000, 1, 0)).toBe(0);
  });
});

describe('autopilot', () => {
  it('vira na direção do alvo e segura a velocidade de cruzeiro', () => {
    let state = still;
    const target = { x: 100, z: 30 };
    for (let t = 0; t < 8; t += 1 / 60) {
      state = stepCar(state, autopilot(state, target, 15), 1 / 60, carPhysics(quadradinho), onRoad);
    }
    expect(state.heading).toBeGreaterThan(0.1);
    expect(state.speed).toBeGreaterThan(12);
    expect(state.speed).toBeLessThan(18);
  });
});

describe('autopilot parando', () => {
  it('freia até parar quando a velocidade-alvo cai para zero, sem engatar a ré', () => {
    let state = drive(full, 8);
    for (let t = 0; t < 20; t += 1 / 60) {
      state = stepCar(
        state,
        autopilot(state, { x: state.x + 100, z: state.z }, 0),
        1 / 60,
        carPhysics(quadradinho),
        onRoad,
      );
    }
    expect(state.speed).toBe(0);
  });
});
