/**
 * Cena do protótipo no estilo "estrada aberta" (referência: Slow Roads): relevo com morros em camadas,
 * estrada em circuito acompanhando o terreno, mata, talhões de pinus e eucalipto, capim seco, névoa
 * colorida e gradação de cor. O carro anda sozinho pela faixa da direita com a câmera atrás.
 * O mapa real de Osasco e Cotia substitui o circuito na Fase 1.
 */
import * as THREE from 'three';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import type { GraphicsQuality } from '../../shared/save';
import { loadCar } from '../car';
import { createAtmosphere, GOLDEN_HOUR } from './atmosphere';
import { asphaltTexture } from './canvas-textures';
import { baseHeight, ridgeHeight, terrainHeight } from './landscape';
import { mulberry32 } from './noise';
import { createComposer } from './post';
import { QUALITY_PRESETS } from './quality';
import { LANE_OFFSET, RoadLoop, type RoadFrame } from './road';
import { buildRoadMesh } from './road-mesh';
import { buildPowerLine } from './roadside';
import { buildTerrain, createTerrainMaterial } from './terrain';
import { DistanceCuller } from './tiles';
import { plantGrass, plantPhotoTrees, plantSimpleTrees } from './vegetation';

export interface GameScene {
  /** Avança a simulação. `speed` em m/s. */
  update(dtSeconds: number, speed: number): void;
  render(): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

export interface OpenRoadOptions {
  quality: GraphicsQuality;
  carModelFile: string;
  /** Cor da pintura do carro, em hexadecimal sem "#". */
  paint: string;
  onCarLoaded?: () => void;
}

const TERRAIN_SIZE = 1700;

function groundTexture(file: string): THREE.Texture {
  const texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}textures/${file}`);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createOpenRoadScene(canvas: HTMLCanvasElement, options: OpenRoadOptions): GameScene {
  const preset = QUALITY_PRESETS[options.quality];
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !preset.post });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, preset.maxPixelRatio));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.3, 20000);
  const atmosphere = createAtmosphere(renderer, scene, GOLDEN_HOUR, preset.shadowMapSize);

  const road = new RoadLoop(baseHeight);
  const random = mulberry32(7);
  const terrainMaterial = createTerrainMaterial({
    grass: groundTexture('grass.jpg'),
    dirt: groundTexture('dirt_color.jpg'),
  });
  scene.add(
    buildTerrain(
      TERRAIN_SIZE,
      preset.terrainSegments,
      (x, z) => terrainHeight(road, x, z),
      terrainMaterial,
      road,
    ),
    buildTerrain(16000, preset.ridgeSegments, ridgeHeight, terrainMaterial, null),
    buildRoadMesh(road, asphaltTexture(random)),
    buildPowerLine(road),
  );

  const culler = new DistanceCuller();
  const placement = { road, random, scene, culler };
  plantSimpleTrees(placement, preset.simpleTrees, TERRAIN_SIZE, preset.photoTrees === 0);
  if (preset.photoTrees > 0) {
    plantPhotoTrees(placement, preset.photoTrees).catch((err: unknown) =>
      console.warn('Não foi possível carregar as árvores fotográficas.', err),
    );
  }
  if (preset.grassTufts > 0) plantGrass(placement, preset.grassTufts);

  const car = loadCar(options.carModelFile, options.paint, options.onCarLoaded);
  scene.add(car.group);

  const composer: EffectComposer | null = preset.post
    ? createComposer(renderer, scene, camera, { bloom: preset.bloom, tint: GOLDEN_HOUR.tint })
    : null;

  const frame: RoadFrame = road.frameAt(0);
  const basis = new THREE.Matrix4();
  const desiredEye = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const smoothedLook = new THREE.Vector3();
  let travelled = 0;
  let firstFrame = true;

  function placeCar(): void {
    road.frameAt(travelled, frame);
    // Frente do carro (+X do modelo) na direção da pista; +Z do modelo é o lado direito.
    basis.makeBasis(frame.forward, frame.up, frame.right);
    car.group.quaternion.setFromRotationMatrix(basis);
    car.group.position.copy(frame.position).addScaledVector(frame.right, LANE_OFFSET);
    car.group.position.y += 0.06;
  }

  function placeCamera(dt: number): void {
    desiredEye.copy(car.group.position).addScaledVector(frame.forward, -9).addScaledVector(frame.up, 2.6);
    lookTarget.copy(car.group.position).addScaledVector(frame.forward, 24).addScaledVector(frame.up, 1.1);
    // A câmera não pode entrar no morro.
    desiredEye.y = Math.max(desiredEye.y, terrainHeight(road, desiredEye.x, desiredEye.z) + 1.2);
    if (firstFrame) {
      camera.position.copy(desiredEye);
      smoothedLook.copy(lookTarget);
      firstFrame = false;
    } else {
      // Segue o carro com um leve atraso, como uma câmera de perseguição.
      const k = 1 - Math.exp(-dt * 4);
      camera.position.lerp(desiredEye, k);
      smoothedLook.lerp(lookTarget, k);
    }
    camera.lookAt(smoothedLook);
    atmosphere.follow(car.group.position, frame.forward);
    culler.update(camera.position);
  }

  placeCar();
  placeCamera(0);

  return {
    update(dt, speed) {
      const distance = speed * dt;
      travelled = (travelled + distance) % road.length;
      car.roll(distance);
      placeCar();
      placeCamera(dt);
    },
    render() {
      if (composer) composer.render();
      else renderer.render(scene, camera);
    },
    resize(width, height) {
      renderer.setSize(width, height, false);
      composer?.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    },
    dispose() {
      composer?.dispose();
      renderer.dispose();
    },
  };
}
