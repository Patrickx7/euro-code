/** Contrato do caminhão: especificação dos modelos e condição mecânica. */

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

export interface TruckModel {
  id: string;
  /** Modelo fictício. Nada de marcas reais. */
  name: string;
  price: number;
  /** Nível mínimo do jogador para comprar. */
  requiredLevel: number;
  powerHp: number;
  tankLiters: number;
  litersPer100Km: number;
  maxTrailerKg: number;
  axles: number;
}

export interface OwnedTruck {
  modelId: string;
  fuelLiters: number;
  condition: VehicleCondition;
}

export function createNewCondition(axles: number): VehicleCondition {
  return {
    tires: Array.from({ length: axles }, (_, axle) => ({ axle, wear: 0, punctured: false })),
    components: { engine: 1, transmission: 1, brakes: 1, electrical: 1 },
    activeFault: null,
    odometerKm: 0,
  };
}
