/** Contrato do carro do dev: catálogo de modelos, personalização e condição mecânica. */
import type { CarCustomization, Seniority } from './profile';

export type ComponentId = 'engine' | 'transmission' | 'brakes' | 'electrical';

export type FaultKind = 'sputter' | 'stall' | 'breakdown';

export interface TireState {
  axle: number;
  /** 0 = novo, 1 = careca. */
  wear: number;
  punctured: boolean;
}

export interface VehicleCondition {
  tires: TireState[];
  /** Saúde de 0 (quebrado) a 1 (novo). */
  components: Record<ComponentId, number>;
  activeFault: null | { kind: FaultKind; component: ComponentId };
  odometerKm: number;
}

export interface CarModel {
  id: string;
  /** Nome fictício, sem marcas reais. */
  name: string;
  /** Em quem o modelo se inspira (só para a equipe; nunca aparece no jogo). */
  inspiredBy: string;
  /** Arquivo em public/models/carros (null enquanto o modelo 3D não existe). */
  modelFile: string | null;
  price: number;
  /** Senioridade mínima para comprar. */
  requiredSeniority: Seniority;
  powerHp: number;
  tankLiters: number;
  kmPerLiter: number;
  /** Conservação inicial (0 a 1): o carro do estagiário já vem cansado. */
  initialCondition: number;
}

export const CAR_MODELS: readonly CarModel[] = [
  {
    id: 'quadradinho',
    name: 'Quadradinho 1.0',
    inspiredBy: 'Uno',
    modelFile: 'quadradinho.glb',
    price: 0,
    requiredSeniority: 'estagiario',
    powerHp: 58,
    tankLiters: 42,
    kmPerLiter: 11,
    initialCondition: 0.55,
  },
  {
    id: 'quadradao',
    name: 'Quadradão 1.6',
    inspiredBy: 'Gol quadrado',
    modelFile: 'quadradao.glb',
    price: 9_000,
    requiredSeniority: 'junior',
    powerHp: 82,
    tankLiters: 47,
    kmPerLiter: 10,
    initialCondition: 0.7,
  },
  {
    id: 'safira',
    name: 'Safira 4.1',
    inspiredBy: 'Opala',
    modelFile: 'safira.glb',
    price: 28_000,
    requiredSeniority: 'pleno',
    powerHp: 140,
    tankLiters: 84,
    kmPerLiter: 6,
    initialCondition: 0.8,
  },
  {
    id: 'vetor',
    name: 'Vetor 2.0',
    inspiredBy: 'Vectra',
    modelFile: null,
    price: 35_000,
    requiredSeniority: 'pleno',
    powerHp: 120,
    tankLiters: 60,
    kmPerLiter: 10,
    initialCondition: 0.85,
  },
  {
    id: 'verso',
    name: 'Verso 1.6',
    inspiredBy: 'Versa',
    modelFile: null,
    price: 62_000,
    requiredSeniority: 'senior',
    powerHp: 114,
    tankLiters: 41,
    kmPerLiter: 13,
    initialCondition: 1,
  },
  {
    id: 'golfinho-mini',
    name: 'Golfinho Mini',
    inspiredBy: 'BYD Dolphin Mini',
    modelFile: null,
    price: 99_000,
    requiredSeniority: 'senior',
    powerHp: 75,
    tankLiters: 0,
    kmPerLiter: 0,
    initialCondition: 1,
  },
  {
    id: 'cancao',
    name: 'Canção Híbrido',
    inspiredBy: 'BYD Song',
    modelFile: null,
    price: 230_000,
    requiredSeniority: 'fullstack',
    powerHp: 235,
    tankLiters: 52,
    kmPerLiter: 18,
    initialCondition: 1,
  },
];

export const STARTER_CAR_MODEL_ID = 'quadradinho';

export function findCarModel(id: string): CarModel | undefined {
  return CAR_MODELS.find((model) => model.id === id);
}

export interface OwnedCar {
  modelId: string;
  fuelLiters: number;
  condition: VehicleCondition;
  customization: CarCustomization;
}

export function createNewCondition(axles: number, health = 1): VehicleCondition {
  return {
    tires: Array.from({ length: axles }, (_, axle) => ({ axle, wear: 1 - health, punctured: false })),
    components: { engine: health, transmission: health, brakes: health, electrical: health },
    activeFault: null,
    odometerKm: 0,
  };
}
