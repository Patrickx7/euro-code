/** Contrato dos dados do mapa gerados a partir do OpenStreetMap (`public/map/*.json`). */

export type RoadKind =
  'motorway' | 'trunk' | 'primary' | 'secondary' | 'tertiary' | 'residential' | 'service';

export type PoiKind =
  | 'fuel'
  | 'client-office'
  | 'coworking'
  | 'home'
  | 'car-dealer'
  | 'interview-center'
  | 'hotel'
  | 'mechanic'
  | 'tire-shop'
  | 'police-checkpoint';

/** Coordenadas em metros no espaço do jogo (já com a escala aplicada). Y é a altura. */
export interface MapNode {
  id: string;
  x: number;
  y: number;
  z: number;
}

export interface Road {
  id: string;
  nodeIds: string[];
  kind: RoadKind;
  name?: string;
  /** Ex.: "SP-280". */
  ref?: string;
  lanes: number;
  oneway: boolean;
  maxSpeedKmh: number;
}

export interface TollBooth {
  id: string;
  roadId: string;
  nodeId: string;
  name: string;
  price: number;
}

export interface Poi {
  id: string;
  kind: PoiKind;
  name: string;
  nodeId: string;
}

export interface TrafficSignal {
  id: string;
  nodeId: string;
}

export interface MapData {
  meta: {
    /** [sul, oeste, norte, leste] em graus. */
    bbox: [number, number, number, number];
    scale: number;
    attribution: string;
  };
  nodes: MapNode[];
  roads: Road[];
  tolls: TollBooth[];
  pois: Poi[];
  trafficSignals: TrafficSignal[];
  /** Arquivos de prédios por bloco, carregados sob demanda. */
  buildingChunks: string[];
}

export const OSM_ATTRIBUTION = '© colaboradores do OpenStreetMap';
