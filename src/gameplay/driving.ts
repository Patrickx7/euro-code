/**
 * Física "arcade" do carro (modelo de bicicleta): potência, arrasto, freio, ré e esterçamento que
 * diminui com a velocidade. Funções puras: o jogo chama `stepCar` a cada passo fixo do loop.
 * A Fase 3 pode trocar por um veículo do Rapier mantendo esta interface.
 */
import type { CarModel } from '../shared/vehicle';

export interface DriveInput {
  /** 0 a 1. */
  throttle: number;
  /** 0 a 1. Parado (ou quase), o freio vira ré. */
  brake: number;
  /** -1 (esquerda) a 1 (direita). */
  steer: number;
}

export interface DriveState {
  x: number;
  z: number;
  /** Direção em radianos: a frente do carro é (cos, sen) no plano XZ; aumentar vira para a direita. */
  heading: number;
  /** m/s; negativo = de ré. */
  speed: number;
  /** Ângulo atual das rodas da frente, em radianos. */
  steer: number;
}

export interface CarPhysics {
  powerW: number;
  massKg: number;
  wheelbaseM: number;
}

export interface Surface {
  /** Fora do asfalto: terra e capim seguram o carro. */
  offRoad: boolean;
}

const AIR = 0.5 * 1.2 * 0.34 * 1.9; // ½ ρ Cd A de um popular
const ROLLING = 0.12; // m/s²
const OFF_ROAD_ROLLING = 1.6; // m/s²
const TRACTION_LIMIT = 3.5; // m/s², aceleração máxima que os pneus aguentam
const BRAKE = 8; // m/s²
const MAX_REVERSE = 5; // m/s
const MAX_STEER = 0.6; // rad
const STEER_RATE = 2.5; // rad/s
const DRIVETRAIN = 0.7;
const ENGINE_BRAKE = 0.6; // m/s², tirando o pé do acelerador

/**
 * Potência e peso do carro. O motor gasto rende menos: com 55% de saúde (o Quadradinho do
 * estagiário), sobra ~82% da potência.
 */
export function carPhysics(model: CarModel, engineHealth = 1): CarPhysics {
  const health = Math.min(1, Math.max(0, engineHealth));
  return {
    powerW: model.powerHp * 745.7 * DRIVETRAIN * (0.6 + 0.4 * health),
    massKg: model.massKg,
    wheelbaseM: model.wheelbaseM,
  };
}

function approach(value: number, target: number, maxDelta: number): number {
  if (value < target) return Math.min(target, value + maxDelta);
  return Math.max(target, value - maxDelta);
}

export function stepCar(
  state: DriveState,
  input: DriveInput,
  dt: number,
  car: CarPhysics,
  surface: Surface,
): DriveState {
  const throttle = Math.min(1, Math.max(0, input.throttle));
  const brake = Math.min(1, Math.max(0, input.brake));
  let { speed } = state;

  // Motor: potência / velocidade, limitado pela aderência dos pneus.
  const engine = Math.min(TRACTION_LIMIT, car.powerW / (car.massKg * Math.max(Math.abs(speed), 4)));
  const drag = (AIR / car.massKg) * speed * speed + (surface.offRoad ? OFF_ROAD_ROLLING : ROLLING);

  if (speed >= 0) {
    if (brake > 0 && speed < 0.5 && throttle === 0) {
      // Parado e pisando no freio: engata a ré.
      speed = Math.max(-MAX_REVERSE, speed - engine * 0.6 * brake * dt);
    } else {
      speed += (engine * throttle - BRAKE * brake - ENGINE_BRAKE * (1 - throttle)) * dt;
      speed = Math.max(0, speed - drag * dt);
    }
  } else {
    // De ré: o "freio" acelera para trás e o acelerador freia.
    speed -= (engine * 0.6 * brake - BRAKE * throttle) * dt;
    speed = Math.min(0, speed + drag * dt);
    speed = Math.max(-MAX_REVERSE, speed);
  }

  // Esterçamento: as rodas viram aos poucos e menos em alta velocidade.
  const maxSteer = MAX_STEER / (1 + Math.abs(speed) / 12);
  const steer = approach(state.steer, Math.min(1, Math.max(-1, input.steer)) * maxSteer, STEER_RATE * dt);

  const heading = state.heading + (speed / car.wheelbaseM) * Math.tan(steer) * dt;
  return {
    x: state.x + Math.cos(heading) * speed * dt,
    z: state.z + Math.sin(heading) * speed * dt,
    heading,
    speed,
    steer,
  };
}

/** Litros gastos num trecho. Acelerar fundo gasta mais; carro elétrico (`kmPerLiter` 0) não gasta. */
export function fuelUsed(distanceM: number, throttle: number, kmPerLiter: number): number {
  if (kmPerLiter <= 0) return 0;
  return (Math.abs(distanceM) / 1000 / kmPerLiter) * (0.7 + 0.6 * Math.min(1, Math.max(0, throttle)));
}

/**
 * Piloto automático (enquanto o jogador não pega no volante): mira um ponto à frente na faixa e
 * segura a velocidade de cruzeiro.
 */
export function autopilot(state: DriveState, target: { x: number; z: number }, cruise: number): DriveInput {
  const desired = Math.atan2(target.z - state.z, target.x - state.x);
  let error = desired - state.heading;
  error = Math.atan2(Math.sin(error), Math.cos(error));
  return {
    throttle: state.speed < cruise ? Math.min(1, (cruise - state.speed) * 0.5 + 0.3) : 0,
    // Freia na medida do excesso (sem chegar a engatar a ré: abaixo de cruise + 0,5 não freia).
    brake: state.speed > cruise + 0.5 ? Math.min(1, (state.speed - cruise) * 0.3) : 0,
    steer: Math.max(-1, Math.min(1, error * 2.5)),
  };
}
