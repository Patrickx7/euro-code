/**
 * Cena provisória: estrada sem fim, o carro do estagiário e câmera de perseguição.
 * Será substituída pelo mapa real (Fase 1), pelo visual da Fase 2 e pelo carro com física (Fase 3).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const ROAD_WIDTH = 12;
const TILE_LENGTH = 40;
const TILE_COUNT = 12;
const DASH_SPACING = 10;

export interface PlaceholderScene {
  /** Avança a simulação. `speed` em m/s. */
  update(dtSeconds: number, speed: number): void;
  render(): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

interface Car {
  group: THREE.Group;
  /** Rodas que giram (o eixo de cada uma é o Z local). */
  wheels: THREE.Object3D[];
  wheelRadius: number;
}

/**
 * O carro do estagiário (Quadradinho, `public/models/carros/quadradinho.glb`). Enquanto o modelo
 * carrega, aparece uma silhueta simples. No glTF a frente do carro aponta para +X.
 */
function createCar(paint: string): Car {
  const group = new THREE.Group();
  // Gira o carro para a frente apontar para -Z, o sentido da estrada.
  group.rotation.y = Math.PI / 2;
  const car: Car = { group, wheels: [], wheelRadius: 0.29 };

  const standIn = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.2, 1.6),
    new THREE.MeshStandardMaterial({ color: `#${paint}`, roughness: 0.6 }),
  );
  standIn.position.y = 0.75;
  standIn.castShadow = true;
  group.add(standIn);

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    `${import.meta.env.BASE_URL}models/carros/quadradinho.glb`,
    (gltf) => {
      gltf.scene.traverse((object) => {
        if (/^Wheel_(FL|FR|RL|RR)$/.test(object.name)) car.wheels.push(object);
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = true;
        object.receiveShadow = true;
        const materials = (
          Array.isArray(object.material) ? object.material : [object.material]
        ) as THREE.MeshStandardMaterial[];
        for (const m of materials) {
          if (m.name === 'Paint') m.color.set(`#${paint}`);
          if (m.name === 'Glass' || m.name === 'Lens') {
            m.transparent = true;
            m.opacity = m.name === 'Lens' ? 0.25 : 0.4;
            m.depthWrite = false;
          }
        }
      });
      const firstWheel = car.wheels[0];
      if (firstWheel) {
        const size = new THREE.Box3().setFromObject(firstWheel).getSize(new THREE.Vector3());
        car.wheelRadius = size.y / 2;
      }
      group.remove(standIn);
      group.add(gltf.scene);
      document.body.dataset.carLoaded = 'true';
    },
    undefined,
    (err) => console.warn('Não foi possível carregar o modelo do carro.', err),
  );
  return car;
}

function createRoadTile(): THREE.Group {
  const tile = new THREE.Group();
  const asphalt = new THREE.Mesh(
    new THREE.PlaneGeometry(ROAD_WIDTH, TILE_LENGTH),
    new THREE.MeshStandardMaterial({ color: 0x3a3a3c, roughness: 0.95 }),
  );
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.receiveShadow = true;
  tile.add(asphalt);

  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xf2f2f2 });
  const dashMaterial = new THREE.MeshBasicMaterial({ color: 0xf5c518 });
  for (const x of [-ROAD_WIDTH / 2 + 0.3, ROAD_WIDTH / 2 - 0.3]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.2, TILE_LENGTH), lineMaterial);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, 0.01, 0);
    tile.add(edge);
  }
  for (let z = -TILE_LENGTH / 2; z < TILE_LENGTH / 2; z += DASH_SPACING) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 4), dashMaterial);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.01, z + 2);
    tile.add(dash);
  }
  return tile;
}

function createScenery(): THREE.Group {
  const scenery = new THREE.Group();
  const trunk = new THREE.MeshStandardMaterial({ color: 0x6b4423 });
  const leaves = new THREE.MeshStandardMaterial({ color: 0x2f7d32, roughness: 1 });
  const building = new THREE.MeshStandardMaterial({ color: 0xc9b79c, roughness: 0.9 });
  const random = mulberry32(42);
  for (let i = 0; i < 60; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (ROAD_WIDTH / 2 + 6 + random() * 40);
    const z = -((TILE_LENGTH * TILE_COUNT) / 2) + random() * TILE_LENGTH * TILE_COUNT;
    if (random() < 0.25) {
      const h = 6 + random() * 18;
      const block = new THREE.Mesh(new THREE.BoxGeometry(8 + random() * 8, h, 8 + random() * 8), building);
      block.position.set(x + side * 15, h / 2, z);
      block.castShadow = true;
      scenery.add(block);
    } else {
      const tree = new THREE.Group();
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2), trunk);
      t.position.y = 1;
      const crown = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4, 8), leaves);
      crown.position.y = 3.8;
      tree.add(t, crown);
      tree.position.set(x, 0, z);
      tree.children.forEach((c) => (c.castShadow = true));
      scenery.add(tree);
    }
  }
  return scenery;
}

/** Gerador pseudoaleatório com semente, para a cena ser sempre igual. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PlaceholderSceneOptions {
  /** Cor da pintura do carro, em hexadecimal sem "#" (`CarCustomization.paint`). */
  paint: string;
}

export function createPlaceholderScene(
  canvas: HTMLCanvasElement,
  options: PlaceholderSceneOptions,
): PlaceholderScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const sky = new THREE.Color(0xa8d4f0);
  scene.background = sky;
  scene.fog = new THREE.Fog(sky, 80, 380);

  scene.add(new THREE.HemisphereLight(0xdff1ff, 0x5a7a3a, 1.2));
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
  sun.position.set(-30, 60, -20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 150 });
  scene.add(sun, sun.target);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({ color: 0x6f9a4a, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  const tiles: THREE.Group[] = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    const tile = createRoadTile();
    tile.position.z = -TILE_LENGTH * (i - 2);
    tiles.push(tile);
    scene.add(tile);
  }
  const scenery = createScenery();
  scene.add(scenery);

  const car = createCar(options.paint);
  car.group.position.x = ROAD_WIDTH / 4;
  scene.add(car.group);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
  camera.position.set(ROAD_WIDTH / 4 + 2.2, 2.6, 7.5);
  camera.lookAt(car.group.position.x, 0.9, -3);

  const wrapLength = TILE_LENGTH * TILE_COUNT;
  let elapsed = 0;

  return {
    update(dt, speed) {
      elapsed += dt;
      const distance = speed * dt;
      // O carro fica parado na origem e o mundo se move para trás.
      for (const tile of tiles) {
        tile.position.z += distance;
        if (tile.position.z > TILE_LENGTH * 2) tile.position.z -= wrapLength;
      }
      for (const item of scenery.children) {
        item.position.z += distance;
        if (item.position.z > TILE_LENGTH * 2) item.position.z -= wrapLength;
      }
      for (const wheel of car.wheels) wheel.rotation.z -= distance / car.wheelRadius;
      // Suspensão cansada de carro de estagiário.
      car.group.position.y = Math.sin(elapsed * 9) * 0.012;
    },
    render() {
      renderer.render(scene, camera);
    },
    resize(width, height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    },
    dispose() {
      renderer.dispose();
    },
  };
}
