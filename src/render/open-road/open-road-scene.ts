/**
 * Cena do protótipo no estilo "estrada aberta" (referência: Slow Roads): relevo com morros em camadas,
 * estrada em circuito acompanhando o terreno, mata, talhões de pinus e eucalipto, capim seco, névoa
 * colorida e gradação de cor. A física do carro fica fora (`src/gameplay/driving.ts`); aqui ele só é
 * apoiado no chão, com a câmera atrás.
 * O mapa real de Osasco e Cotia substitui o circuito na Fase 1.
 */
import * as THREE from 'three';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import type { GraphicsQuality } from '../../shared/save';
import { loadCar } from '../car';
import { createAtmosphere, GOLDEN_HOUR } from './atmosphere';
import { asphaltTexture } from './canvas-textures';
import { baseHeight, ridgeHeight, surfaceAt, terrainHeight } from './landscape';
import { mulberry32 } from './noise';
import { createComposer } from './post';
import { QUALITY_PRESETS } from './quality';
import { LANE_OFFSET, RoadLoop, type RoadFrame } from './road';
import { buildRoadMesh } from './road-mesh';
import { ClientMarker } from './client-marker';
import { buildGasStation, buildTollPlaza } from './landmarks';
import { BALANCE } from '../../shared/balance';
import { buildPowerLine } from './roadside';
import { buildTerrain, createTerrainMaterial } from './terrain';
import { DistanceCuller } from './tiles';
import { plantGrass, plantPhotoTrees, plantSimpleTrees } from './vegetation';

/** O que a física do carro precisa saber do mundo. */
export interface DrivingWorld {
  /** Onde o carro começa: na faixa da direita, apontando no sentido da pista. */
  startPose(): { x: number; z: number; heading: number };
  surfaceAt(x: number, z: number): { y: number; offRoad: boolean };
  /** Ponto na faixa da direita, `ahead` metros à frente do trecho mais próximo de (x, z). */
  laneTarget(x: number, z: number, ahead: number): { x: number; z: number };
  /** Metade do lado do terreno: o carro não sai daí. */
  halfSize: number;
  /** Comprimento do circuito, em metros. */
  roadLength: number;
  /** Quantos metros, pela estrada, desde o início do circuito até o trecho mais próximo de (x, z). */
  roadDistance(x: number, z: number): number;
  /** Ponto ao lado da estrada: `lateral` metros à direita do centro, a `distance` metros do início. */
  pointOnRoad(distance: number, lateral: number): { x: number; z: number };
  /** Posto (onde parar para abastecer) e pedágio (onde fica a cancela), pela distância na estrada. */
  stops: { fuel: { distance: number; x: number; z: number }; toll: { distance: number } };
}

export interface CarPose {
  x: number;
  z: number;
  /** Frente em (cos, sen) no plano XZ. */
  heading: number;
  /** Quanto o carro andou neste passo (gira as rodas). */
  moved: number;
}

export interface GameScene {
  world: DrivingWorld;
  /** Abre ou fecha a cancela do pedágio. */
  setTollOpen(open: boolean): void;
  /** Mostra (ou esconde, com `null`) o marcador do cliente. */
  setClientMarker(marker: { x: number; z: number; name: string } | null): void;
  /** Posiciona o carro e a câmera. */
  update(dtSeconds: number, pose: CarPose): void;
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
  const marker = new ClientMarker();
  scene.add(marker.group);
  const fuelDistance = road.length * 0.3;
  const tollDistance = road.length * 0.7;
  const gasStation = buildGasStation(road, fuelDistance, BALANCE.economy.fuelPricePerLiter);
  const tollPlaza = buildTollPlaza(road, tollDistance);
  scene.add(gasStation.group, tollPlaza.group);

  const composer: EffectComposer | null = preset.post
    ? createComposer(renderer, scene, camera, { bloom: preset.bloom, tint: GOLDEN_HOUR.tint })
    : null;

  const world: DrivingWorld = {
    startPose() {
      const frame = road.frameAt(0);
      const p = frame.position.clone().addScaledVector(frame.right, LANE_OFFSET);
      return { x: p.x, z: p.z, heading: Math.atan2(frame.forward.z, frame.forward.x) };
    },
    surfaceAt: (x, z) => surfaceAt(road, x, z),
    laneTarget(x, z, ahead) {
      const { index } = road.nearest(x, z);
      const spacing = road.length / road.points.length;
      const frame = road.frameAt((index + ahead / spacing) * spacing, laneFrame);
      const p = frame.position.addScaledVector(frame.right, LANE_OFFSET);
      return { x: p.x, z: p.z };
    },
    halfSize: TERRAIN_SIZE / 2 - 60,
    roadLength: road.length,
    roadDistance(x, z) {
      return (road.nearest(x, z).index / road.points.length) * road.length;
    },
    stops: {
      fuel: { distance: fuelDistance, x: gasStation.stopPoint.x, z: gasStation.stopPoint.z },
      toll: { distance: tollDistance },
    },
    pointOnRoad(distance, lateral) {
      const frame = road.frameAt(distance, laneFrame);
      const p = frame.position.addScaledVector(frame.right, lateral);
      return { x: p.x, z: p.z };
    },
  };
  const laneFrame: RoadFrame = road.frameAt(0);

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const basis = new THREE.Matrix4();
  const desiredEye = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const smoothedLook = new THREE.Vector3();
  let firstFrame = true;

  /** Apoia o carro no chão: altura e inclinação vêm de quatro pontos (frente, trás, lados). */
  function placeCar(pose: CarPose): void {
    const fx = Math.cos(pose.heading);
    const fz = Math.sin(pose.heading);
    const h = (dx: number, dz: number) => surfaceAt(road, pose.x + dx, pose.z + dz).y;
    const front = h(fx * 1.2, fz * 1.2);
    const back = h(-fx * 1.2, -fz * 1.2);
    const rightSide = h(-fz * 0.7, fx * 0.7);
    const leftSide = h(fz * 0.7, -fx * 0.7);
    forward.set(fx * 2.4, front - back, fz * 2.4).normalize();
    right.set(-fz * 1.4, rightSide - leftSide, fx * 1.4).normalize();
    up.crossVectors(right, forward).normalize();
    right.crossVectors(forward, up).normalize();
    // Frente do carro (+X do modelo) para `forward`; +Z do modelo é o lado direito.
    basis.makeBasis(forward, up, right);
    car.group.quaternion.setFromRotationMatrix(basis);
    car.group.position.set(pose.x, (front + back + rightSide + leftSide) / 4, pose.z);
  }

  function placeCamera(dt: number): void {
    const flat = new THREE.Vector3(forward.x, 0, forward.z).normalize();
    desiredEye
      .copy(car.group.position)
      .addScaledVector(flat, -9)
      .add(new THREE.Vector3(0, 2.6, 0));
    lookTarget
      .copy(car.group.position)
      .addScaledVector(forward, 24)
      .add(new THREE.Vector3(0, 1.1, 0));
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
    atmosphere.follow(car.group.position, flat);
    culler.update(camera.position);
  }

  const start = world.startPose();
  placeCar({ ...start, moved: 0 });
  placeCamera(0);

  return {
    world,
    setTollOpen(open) {
      tollPlaza.setOpen(open);
    },
    setClientMarker(target) {
      if (!target) {
        marker.hide();
        return;
      }
      const y = surfaceAt(road, target.x, target.z).y;
      marker.show(new THREE.Vector3(target.x, y, target.z), target.name);
    },
    update(dt, pose) {
      marker.update(dt);
      tollPlaza.update(dt);
      car.roll(pose.moved);
      placeCar(pose);
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
