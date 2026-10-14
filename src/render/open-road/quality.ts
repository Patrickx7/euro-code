import type { GraphicsQuality } from '../../shared/save';

/** O que cada nível de qualidade liga. Quantidades são o total no circuito inteiro. */
export interface QualityPreset {
  maxPixelRatio: number;
  /** Tamanho do mapa de sombras do sol (0 = sem sombras). */
  shadowMapSize: number;
  terrainSegments: number;
  ridgeSegments: number;
  /** Árvores simples (copas lisas), espalhadas pelo terreno todo. */
  simpleTrees: number;
  /** Árvores com casca e folhas fotográficas (EZ-Tree) na beira da estrada. */
  photoTrees: number;
  /** Tufos de capim seco na beira da estrada. */
  grassTufts: number;
  /** Pós-processamento: gradação de cor + SMAA; `bloom` só no alto. */
  post: boolean;
  bloom: boolean;
}

export const QUALITY_PRESETS: Record<GraphicsQuality, QualityPreset> = {
  low: {
    maxPixelRatio: 1,
    shadowMapSize: 0,
    terrainSegments: 170,
    ridgeSegments: 90,
    simpleTrees: 3500,
    photoTrees: 0,
    grassTufts: 0,
    post: false,
    bloom: false,
  },
  medium: {
    maxPixelRatio: 1,
    shadowMapSize: 2048,
    terrainSegments: 300,
    ridgeSegments: 160,
    simpleTrees: 8000,
    photoTrees: 900,
    grassTufts: 20_000,
    post: true,
    bloom: false,
  },
  high: {
    maxPixelRatio: 1.5,
    shadowMapSize: 4096,
    terrainSegments: 425,
    ridgeSegments: 220,
    simpleTrees: 12_000,
    photoTrees: 2200,
    grassTufts: 50_000,
    post: true,
    bloom: true,
  },
};

const ALIASES: Record<string, GraphicsQuality> = {
  low: 'low',
  baixa: 'low',
  medium: 'medium',
  media: 'medium',
  média: 'medium',
  high: 'high',
  alta: 'high',
};

/** Lê a qualidade de um parâmetro de URL (`?qualidade=baixa|media|alta`). */
export function parseQuality(value: string | null): GraphicsQuality | null {
  return value ? (ALIASES[value.toLowerCase()] ?? null) : null;
}
